require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const admin = require('firebase-admin');
const { google } = require('googleapis');

// ==========================================
// CONFIGURACIONES Y CREDENCIALES
// ==========================================

// 1. Firebase Admin
// Asegúrate de descargar el JSON de clave privada desde la consola de Firebase 
// (Configuración del proyecto -> Cuentas de servicio -> Generar nueva clave privada)
// y guardarlo como 'firebase-service-account.json' en esta carpeta.
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// 2. Google Calendar API
// Necesitas descargar las credenciales de la cuenta de servicio de Google Cloud
// y guardarlas como 'google-service-account.json'
const googleAuth = new google.auth.GoogleAuth({
  keyFile: './google-service-account.json',
  scopes: ['https://www.googleapis.com/auth/calendar.events'],
});
const calendar = google.calendar({ version: 'v3', auth: googleAuth });

// IDs de los calendarios de los barberos (se obtienen en la configuración de Google Calendar)
// Debes compartir estos calendarios con el correo de la cuenta de servicio de Google dándole permisos de escritura.
const CALENDARS = {
  juan: process.env.CALENDAR_ID_JUAN || "juan@example.com",
  fernando: process.env.CALENDAR_ID_FERNANDO || "fernando@example.com"
};

// Número de teléfono del administrador que recibirá las notificaciones
const ADMIN_PHONE = process.env.ADMIN_PHONE || "573000000000"; 

// ==========================================
// INICIALIZAR WHATSAPP BOT
// ==========================================
const waClient = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { args: ['--no-sandbox'] }
});

waClient.on('qr', (qr) => {
  console.log('ESCANEA ESTE CÓDIGO QR CON EL WHATSAPP DE LA BARBERÍA:');
  qrcode.generate(qr, { small: true });
});

waClient.on('ready', () => {
  console.log('✅ Bot de WhatsApp conectado y listo.');
  // Empezar a escuchar Firebase solo cuando WhatsApp esté listo
  startFirebaseListener();
});

waClient.initialize();

// ==========================================
// LÓGICA PRINCIPAL (FIREBASE -> CALENDAR -> WHATSAPP)
// ==========================================
function startFirebaseListener() {
  console.log('📡 Escuchando nuevas reservas en Firestore...');
  
  // Escuchar la colección 'citas'
  db.collection('citas').onSnapshot(snapshot => {
    snapshot.docChanges().forEach(async (change) => {
      // Solo nos importan los documentos NUEVOS
      if (change.type === 'added') {
        const cita = change.doc.data();
        const citaId = change.doc.id;
        
        // Evitar procesar citas que ya fueron gestionadas
        if (cita.procesada) return;
        
        console.log(`Nueva cita recibida: ${cita.name} con ${cita.barberName}`);

        try {
          // 1. Programar en Google Calendar
          try {
            await scheduleInCalendar(cita);
          } catch (e) {
            console.error(`⚠️ Error Google Calendar:`, e.message || e);
          }

          // 2. Enviar WhatsApp al Cliente
          try {
            await notifyClient(cita);
          } catch (e) {
            console.error(`⚠️ Error WhatsApp Cliente:`, e.message || e);
          }

          // 3. Enviar WhatsApp al Administrador / Dueño
          try {
            await notifyAdmin(cita);
          } catch (e) {
            console.error(`⚠️ Error WhatsApp Admin:`, e.message || e);
          }

          // Marcar como procesada para no volver a enviar
          await db.collection('citas').doc(citaId).update({ procesada: true });
          console.log(`✅ Cita ${citaId} procesada completamente.`);

        } catch (error) {
          console.error(`❌ Error general procesando cita ${citaId}:`, error);
        }
      }
    });
  });
}

// Función para programar en Google Calendar
async function scheduleInCalendar(cita) {
  const calendarId = CALENDARS[cita.barber];
  if (!calendarId) throw new Error("Barbero no válido o calendario no configurado.");

  // Convertir fecha "Sáb 24 Sep" y "10:00 AM" a formato Date/ISO
  // Nota: Deberás ajustar este parseo según el año actual y formato exacto
  // Aquí usamos un enfoque básico, te sugiero usar moment.js o date-fns en producción
  const [horaStr, minutoStrAmPm] = cita.time.split(':');
  const [minutoStr, ampm] = minutoStrAmPm.split(' ');
  let horas = parseInt(horaStr);
  if (ampm === 'PM' && horas < 12) horas += 12;
  if (ampm === 'AM' && horas === 12) horas = 0;

  // Parsear la fecha "Sáb 24 Sep" a fecha real
  const partes = cita.date.split(' ');
  const diaNum = parseInt(partes[1]);
  const mesStr = partes[2];
  const MON_NAMES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const monthIndex = MON_NAMES.indexOf(mesStr);
  
  let now = new Date();
  let year = now.getFullYear();
  if (now.getMonth() > monthIndex) year += 1; // Si estamos en diciembre y reserva enero
  
  const startDate = new Date(year, monthIndex, diaNum); 
  startDate.setHours(horas, parseInt(minutoStr), 0);
  
  const durationMinutes = cita.duration || 30;
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

  const event = {
    summary: `Cita: ${cita.serviceName} - ${cita.name}`,
    description: `Teléfono: ${cita.phone}\nServicio: ${cita.serviceName}\nDuración: ${durationMinutes} min`,
    start: { dateTime: startDate.toISOString(), timeZone: 'America/Bogota' },
    end: { dateTime: endDate.toISOString(), timeZone: 'America/Bogota' },
  };

  await calendar.events.insert({
    calendarId: calendarId,
    resource: event,
  });
  console.log('📅 Evento creado en Google Calendar');
}

// Función para enviar WhatsApp al Cliente
async function notifyClient(cita) {
  // Limpiar número (remover espacios, +, etc.)
  let phone = cita.phone.replace(/[^0-9]/g, '');
  if (!phone.startsWith('57')) phone = `57${phone}`; // Asumiendo Colombia por defecto
  
  const chatId = `${phone}@c.us`;
  const message = `¡Hola ${cita.name}! 👋\n\nTu reserva en *Furtivo Barbería* está confirmada.\n\n💇‍♂️ *Servicio:* ${cita.serviceName}\n💈 *Barbero:* ${cita.barberName}\n📅 *Día:* ${cita.date}\n⏰ *Hora:* ${cita.time}\n\n¡Te esperamos!`;
  
  await waClient.sendMessage(chatId, message);
  console.log('📲 WhatsApp enviado al cliente.');
}

// Función para enviar WhatsApp al Administrador
async function notifyAdmin(cita) {
  const adminChatId = `${ADMIN_PHONE.replace(/[^0-9]/g, '')}@c.us`;
  const message = `🚨 *NUEVA RESERVA RECIBIDA* 🚨\n\n👤 *Cliente:* ${cita.name}\n📱 *Teléfono:* ${cita.phone}\n💇‍♂️ *Servicio:* ${cita.serviceName} (${cita.duration} min)\n💈 *Barbero:* ${cita.barberName}\n📅 *Día:* ${cita.date}\n⏰ *Hora:* ${cita.time}`;
  
  await waClient.sendMessage(adminChatId, message);
  console.log('📲 WhatsApp enviado al administrador.');
}
