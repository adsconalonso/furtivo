require('dotenv').config();
const http = require('http');
const admin = require('firebase-admin');
const { google } = require('googleapis');

// ==========================================
// 1. CONFIGURACIONES Y CREDENCIALES
// ==========================================

// Firebase Admin
const serviceAccount = require('./firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// Google Calendar API
const googleAuth = new google.auth.GoogleAuth({
  keyFile: './google-service-account.json',
  scopes: ['https://www.googleapis.com/auth/calendar.events'],
});
const calendar = google.calendar({ version: 'v3', auth: googleAuth });

// Calendarios de los barberos
const CALENDARS = {
  juan: process.env.CALENDAR_ID_JUAN || "juan@example.com",
  fernando: process.env.CALENDAR_ID_FERNANDO || "fernando@example.com"
};

const ADMIN_PHONE = process.env.ADMIN_PHONE || "573186777060";
const PORT = process.env.PORT || 3001;
const ENABLE_WHATSAPP = process.env.ENABLE_WHATSAPP === 'true';

let isWhatsAppReady = false;
let waClient = null;

// ==========================================
// 2. PARSEO DE FECHA Y HORA (COLOMBIA GMT-5)
// ==========================================

function getColombiaISO(dateStr, timeStr, durationMinutes = 60) {
  const [horaStr, minutoStrAmPm] = (timeStr || '10:00 AM').split(':');
  const [minutoStr, ampm] = (minutoStrAmPm || '00 AM').split(' ');
  let horas = parseInt(horaStr);
  if (ampm === 'PM' && horas < 12) horas += 12;
  if (ampm === 'AM' && horas === 12) horas = 0;
  const minutos = parseInt(minutoStr) || 0;

  const partes = (dateStr || '').trim().split(' ');
  let diaNum = 1;
  let mesStr = 'Ene';
  if (partes.length >= 3) {
    diaNum = parseInt(partes[1]);
    mesStr = partes[2];
  } else if (partes.length === 2) {
    diaNum = parseInt(partes[0]);
    mesStr = partes[1];
  }

  const MON_NAMES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  let monthIndex = MON_NAMES.indexOf(mesStr);
  if (monthIndex === -1) monthIndex = new Date().getMonth();

  const now = new Date();
  let year = now.getFullYear();
  if (now.getMonth() > monthIndex) year += 1;

  // Cálculo en UTC puro para evitar desfases del sistema operativo local
  const startUtc = new Date(Date.UTC(year, monthIndex, diaNum, horas, minutos, 0));
  const endUtc = new Date(startUtc.getTime() + durationMinutes * 60000);
  const pad = (n) => String(n).padStart(2, '0');

  const startISO = `${startUtc.getUTCFullYear()}-${pad(startUtc.getUTCMonth() + 1)}-${pad(startUtc.getUTCDate())}T${pad(startUtc.getUTCHours())}:${pad(startUtc.getUTCMinutes())}:00-05:00`;
  const endISO = `${endUtc.getUTCFullYear()}-${pad(endUtc.getUTCMonth() + 1)}-${pad(endUtc.getUTCDate())}T${pad(endUtc.getUTCHours())}:${pad(endUtc.getUTCMinutes())}:00-05:00`;

  return { startISO, endISO };
}

// ==========================================
// 3. ENVÍO A GOOGLE CALENDAR (DELEGADO A CLOUD FUNCTIONS)
// ==========================================

async function scheduleInCalendar(cita) {
  // NOTA CRÍTICA: La sincronización oficial con Google Calendar se realiza
  // de forma centralizada y atómica en la Cloud Function 'onCitaCreada'.
  // Para evitar eventos duplicados en Google Calendar, este método local no inserta.
  console.log(`📅 [Aviso] Google Calendar gestionado centralmente por Cloud Function para cita de ${cita.name}.`);
  return null;
}

// ==========================================
// 4. NOTIFICACIONES WHATSAPP (OPCIONALES)
// ==========================================

async function notifyClient(cita) {
  if (!waClient || !isWhatsAppReady) return;
  let phone = (cita.phone || '').replace(/[^0-9]/g, '');
  if (!phone) return;
  if (!phone.startsWith('57')) phone = `57${phone}`;

  const chatId = `${phone}@c.us`;
  const message = `¡Hola ${cita.name}! 👋\n\nTu reserva en *Furtivo Barbería* está confirmada.\n\n💇‍♂️ *Servicio:* ${cita.serviceName}\n💈 *Barbero:* ${cita.barberName}\n📅 *Día:* ${cita.date}\n⏰ *Hora:* ${cita.time}\n\n¡Te esperamos!`;

  await waClient.sendMessage(chatId, message);
  console.log('📲 WhatsApp enviado al cliente.');
}

async function notifyAdmin(cita) {
  if (!waClient || !isWhatsAppReady) return;
  const adminChatId = `${ADMIN_PHONE.replace(/[^0-9]/g, '')}@c.us`;
  const message = `🚨 *NUEVA RESERVA RECIBIDA* 🚨\n\n👤 *Cliente:* ${cita.name}\n📱 *Teléfono:* ${cita.phone}\n💇‍♂️ *Servicio:* ${cita.serviceName} (${cita.duration} min)\n💈 *Barbero:* ${cita.barberName}\n📅 *Día:* ${cita.date}\n⏰ *Hora:* ${cita.time}`;

  await waClient.sendMessage(adminChatId, message);
  console.log('📲 WhatsApp enviado al administrador.');
}

// ==========================================
// 5. PROCESAMIENTO ATÓMICO DE CITAS
// ==========================================

const processingIds = new Set();

async function processCita(citaId, cita) {
  if (cita.procesada || processingIds.has(citaId)) return;
  processingIds.add(citaId);

  try {
    console.log(`\n📥 Procesando reserva [${citaId}]:`);
    console.log(`   👤 Cliente: ${cita.name} (${cita.phone})`);
    console.log(`   💈 Barbero: ${cita.barberName || cita.barber}`);
    console.log(`   📅 Fecha:   ${cita.date} - ${cita.time}`);
    console.log(`   ✂️ Servicio: ${cita.serviceName || cita.service} (${cita.duration || 60} min)`);

    let calendarEventId = null;

    // 1. Enviar a Google Calendar
    try {
      calendarEventId = await scheduleInCalendar(cita);
    } catch (e) {
      console.error(`❌ Error en Google Calendar:`, e.message || e);
    }

    // 2. WhatsApp al Cliente (si está activo)
    if (isWhatsAppReady && waClient) {
      try { await notifyClient(cita); } catch (e) { console.error(`⚠️ Error WhatsApp Cliente:`, e.message); }
    }

    // 3. WhatsApp al Administrador (si está activo)
    if (isWhatsAppReady && waClient) {
      try { await notifyAdmin(cita); } catch (e) { console.error(`⚠️ Error WhatsApp Admin:`, e.message); }
    }

    // 4. Actualizar Firestore
    await db.collection('citas').doc(citaId).update({
      procesada: true,
      calendarEventId: calendarEventId || null,
      procesadaEn: new Date()
    });
    console.log(`✅ Cita [${citaId}] completada y marcada como procesada.\n`);

  } catch (error) {
    console.error(`❌ Error general procesando cita ${citaId}:`, error.message);
  } finally {
    processingIds.delete(citaId);
  }
}

// Barrido de citas pendientes (Capa de seguridad periódica)
async function sweepPendingCitas() {
  try {
    const snap = await db.collection('citas').get();
    let pendingCount = 0;
    for (const doc of snap.docs) {
      const cita = doc.data();
      if (!cita.procesada) {
        pendingCount++;
        await processCita(doc.id, cita);
      }
    }
    return pendingCount;
  } catch (err) {
    console.error('⚠️ Error en barrido de citas:', err.message);
    return 0;
  }
}

// ==========================================
// 6. ESCUCHA EN TIEMPO REAL CON AUTO-RECONEXIÓN
// ==========================================

let unsubscribeListener = null;
let reconnectTimeout = null;

function startFirebaseListener() {
  if (unsubscribeListener) {
    try { unsubscribeListener(); } catch(e) {}
    unsubscribeListener = null;
  }

  console.log('📡 Conectando listener en tiempo real a Firestore...');

  try {
    unsubscribeListener = db.collection('citas').onSnapshot(snapshot => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const cita = change.doc.data();
          if (!cita.procesada) {
            await processCita(change.doc.id, cita);
          }
        }
      });
    }, err => {
      console.error('⚠️ Desconexión o error en listener Firestore:', err.message);
      // Auto-reconexión programada
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      reconnectTimeout = setTimeout(() => {
        console.log('🔄 Reintentando reconexión a Firestore...');
        startFirebaseListener();
      }, 5000);
    });
    console.log('✅ Listener de Firestore activo.');
  } catch (err) {
    console.error('⚠️ Fallo al iniciar listener:', err.message);
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    reconnectTimeout = setTimeout(startFirebaseListener, 5000);
  }
}

// ==========================================
// 7. SERVIDOR HTTP LOCAL DE CONTROL Y API SYNC
// ==========================================

const server = http.createServer(async (req, res) => {
  // Configurar CORS para permitir llamadas desde el frontend web
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const url = req.url || '/';

  if (url === '/health' || url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      status: 'ok',
      service: 'Furtivo Booking Backend',
      time: new Date().toISOString(),
      whatsAppReady: isWhatsAppReady,
      calendarsConfigured: Object.keys(CALENDARS)
    }));
  }

  if (url === '/api/sync') {
    console.log('⚡ Solicitud manual / frontend de sincronización recibida');
    const processed = await sweepPendingCitas();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      success: true,
      processedCount: processed,
      message: `Sincronización ejecutada. Se procesaron ${processed} citas.`
    }));
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
});

server.listen(PORT, () => {
  console.log(`🌐 Servidor de control Furtivo listo en http://localhost:${PORT}`);
  console.log(`   - Endpoint de salud: http://localhost:${PORT}/health`);
  console.log(`   - Endpoint de sincronización directa: http://localhost:${PORT}/api/sync`);
});

// ==========================================
// 8. INICIAR FLUJOS Y BARRIDO PERIÓDICO
// ==========================================

// 1. Barrido inicial de cualquier cita pendiente
sweepPendingCitas();

// 2. Escucha en tiempo real
startFirebaseListener();

// 3. Barrido de seguridad cada 30 segundos (Garantiza 0 citas perdidas)
setInterval(sweepPendingCitas, 30000);

// 4. WhatsApp opcional (solo si ENABLE_WHATSAPP=true en .env)
if (ENABLE_WHATSAPP) {
  const { Client, LocalAuth } = require('whatsapp-web.js');
  const qrcode = require('qrcode-terminal');

  console.log('🤖 Inicializando módulo de WhatsApp...');
  try {
    waClient = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      }
    });

    waClient.on('qr', (qr) => {
      console.log('\n📲 ESCANEA ESTE CÓDIGO QR CON WHATSAPP:');
      qrcode.generate(qr, { small: true });
    });

    waClient.on('ready', () => {
      isWhatsAppReady = true;
      console.log('✅ Bot de WhatsApp conectado y listo.');
    });

    waClient.on('disconnected', () => {
      isWhatsAppReady = false;
      console.log('⚠️ WhatsApp desconectado.');
    });

    waClient.initialize().catch(err => {
      console.warn('⚠️ No se pudo conectar WhatsApp:', err.message);
    });
  } catch (err) {
    console.warn('⚠️ Error configurando WhatsApp:', err.message);
  }
} else {
  console.log('ℹ️ Módulo WhatsApp inactivo (ENABLE_WHATSAPP no está en true).');
  console.log('   Google Calendar opera a máxima velocidad y estabilidad.');
}
