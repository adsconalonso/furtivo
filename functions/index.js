const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onRequest } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { google } = require("googleapis");
const path = require("path");

// Inicializar Firebase Admin
initializeApp();
const db = getFirestore();

// Credenciales de la cuenta de servicio de Google Calendar
const googleAuth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "google-service-account.json"),
  scopes: ["https://www.googleapis.com/auth/calendar.events"],
});
const calendar = google.calendar({ version: "v3", auth: googleAuth });

// IDs de calendarios de Google Calendar para los barberos
const CALENDARS = {
  juan: process.env.CALENDAR_ID_JUAN || "d30772702fec27a2d148f80ddbc0f9eb24adf1ca4fd38f2efcfc5f7ceb8878df@group.calendar.google.com",
  fernando: process.env.CALENDAR_ID_FERNANDO || "f31d23a072d0ba7e5d30b7b33597fc947d1eb1fc393b7b99cee58af9d28bf54e@group.calendar.google.com",
};

// Horarios de atención de cada barbero
const BARBER_SCHEDULES = {
  juan:     { name: "Juan Quintero",   startH: 10, endH: 22 }, // 10:00 AM a 10:00 PM (última cita 9:00 PM)
  fernando: { name: "Fernando Carmona", startH: 13, endH: 22 }, // 1:00 PM a 10:00 PM (última cita 9:00 PM)
};

// ==========================================
// HELPERS DE FECHA Y HORA (COLOMBIA GMT-5)
// ==========================================

function parseDateStrToDay(dateStr) {
  const clean = (dateStr || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const [y, m, d] = clean.split("-").map(Number);
    return { year: y, monthIndex: m - 1, diaNum: d };
  }

  const partes = clean.split(" ");
  let diaNum = 1;
  let mesStr = "Ene";
  if (partes.length >= 3) {
    diaNum = parseInt(partes[1]);
    mesStr = partes[2];
  } else if (partes.length === 2) {
    diaNum = parseInt(partes[0]);
    mesStr = partes[1];
  }

  const MON_NAMES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  let monthIndex = MON_NAMES.indexOf(mesStr);
  if (monthIndex === -1) monthIndex = new Date().getMonth();

  const now = new Date();
  let year = now.getFullYear();
  if (now.getMonth() > monthIndex) year += 1;

  return { year, monthIndex, diaNum };
}

function getColombiaISO(dateStr, timeStr, durationMinutes = 60) {
  const [horaStr, minutoStrAmPm] = (timeStr || "10:00 AM").split(":");
  const [minutoStr, ampm] = (minutoStrAmPm || "00 AM").split(" ");
  let horas = parseInt(horaStr);
  if (ampm === "PM" && horas < 12) horas += 12;
  if (ampm === "AM" && horas === 12) horas = 0;
  const minutos = parseInt(minutoStr) || 0;

  const { year, monthIndex, diaNum } = parseDateStrToDay(dateStr);

  const startUtc = new Date(Date.UTC(year, monthIndex, diaNum, horas, minutos, 0));
  const endUtc = new Date(startUtc.getTime() + durationMinutes * 60000);
  const pad = (n) => String(n).padStart(2, "0");

  const startISO = `${startUtc.getUTCFullYear()}-${pad(startUtc.getUTCMonth() + 1)}-${pad(startUtc.getUTCDate())}T${pad(startUtc.getUTCHours())}:${pad(startUtc.getUTCMinutes())}:00-05:00`;
  const endISO = `${endUtc.getUTCFullYear()}-${pad(endUtc.getUTCMonth() + 1)}-${pad(endUtc.getUTCDate())}T${pad(endUtc.getUTCHours())}:${pad(endUtc.getUTCMinutes())}:00-05:00`;

  return { startISO, endISO };
}

function parseEventToColombiaMinutes(dateTimeStr, year, monthIndex, diaNum) {
  // 00:00:00 en Bogotá (GMT-5) corresponde a las 05:00:00 UTC
  const dayStartBogotaMs = Date.UTC(year, monthIndex, diaNum, 5, 0, 0);
  const eventMs = new Date(dateTimeStr).getTime();
  const min = Math.round((eventMs - dayStartBogotaMs) / 60000);
  return Math.max(0, Math.min(24 * 60, min));
}

function getColombiaNow() {
  const now = new Date();
  // Colombia siempre está en UTC-5 (sin cambio de horario de verano)
  const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utcMs - (5 * 60 * 60 * 1000));
}

function calculateAllSlots(schedule, busyIntervals, slotDurationMinutes = 60, currentColombiaMin = -1) {
  const allSlots = [];
  let currentMin = schedule.startH * 60;
  const lastStart = schedule.endH * 60 - slotDurationMinutes;

  while (currentMin <= lastStart) {
    const slotStartMin = currentMin;
    const slotEndMin = currentMin + slotDurationMinutes;

    // Si la consulta es para el día de hoy en Colombia, descartar turnos pasados
    // o con menos de 30 minutos de anticipación mínima de cortesía.
    const isPastTime = currentColombiaMin >= 0 && slotStartMin < (currentColombiaMin + 30);

    // Colisión de intervalo: [slotStart, slotEnd] se solapa con [busyStart, busyEnd]
    // si slotStart < busyEnd && slotEnd > busyStart
    const conflict = isPastTime ? { summary: "Horario ya transcurrido" } : busyIntervals.find((b) => {
      return slotStartMin < b.endMin && slotEndMin > b.startMin;
    });

    const h = Math.floor(currentMin / 60);
    const m = currentMin % 60;
    const ampm = h < 12 ? "AM" : "PM";
    const h12 = h > 12 ? h - 12 : (h === 0 ? 12 : h);
    const slotLabel = `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;

    allSlots.push({
      label: slotLabel,
      totalMin: currentMin,
      available: !conflict,
      busyReason: conflict ? (conflict.summary || "Ocupado") : null,
    });

    currentMin += slotDurationMinutes;
  }
  return allSlots;
}

// ==========================================
// 1. ENDPOINT HTTPS: CONSULTA DE DISPONIBILIDAD
// ==========================================
// Permite al frontend consultar los horarios disponibles libres de colisiones
// leyendo en tiempo real Google Calendar del barbero + Firestore.
exports.getDisponibilidad = onRequest(
  {
    region: "us-central1",
    cors: true,
  },
  async (req, res) => {
    try {
      res.set("Cache-Control", "no-store, no-cache, must-revalidate");

      const barber = (req.query.barber || "").toLowerCase().trim();
      const dateStr = (req.query.date || "").trim();

      if (!barber || !dateStr) {
        return res.status(400).json({ error: "Parámetros 'barber' y 'date' son requeridos." });
      }

      const calendarId = CALENDARS[barber];
      const schedule = BARBER_SCHEDULES[barber];
      if (!calendarId || !schedule) {
        return res.status(400).json({ error: `Barbero no válido o sin horario: ${barber}` });
      }

      const { year, monthIndex, diaNum } = parseDateStrToDay(dateStr);
      const colombiaNow = getColombiaNow();
      const isTodayInColombia = (
        colombiaNow.getFullYear() === year &&
        colombiaNow.getMonth() === monthIndex &&
        colombiaNow.getDate() === diaNum
      );
      const currentColombiaMin = isTodayInColombia
        ? (colombiaNow.getHours() * 60 + colombiaNow.getMinutes())
        : -1;

      const pad = (n) => String(n).padStart(2, "0");
      const timeMin = `${year}-${pad(monthIndex + 1)}-${pad(diaNum)}T00:00:00-05:00`;
      const timeMax = `${year}-${pad(monthIndex + 1)}-${pad(diaNum)}T23:59:59-05:00`;

      // 1. Consultar eventos en Google Calendar en tiempo real
      const calRes = await calendar.events.list({
        calendarId: calendarId,
        timeMin: timeMin,
        timeMax: timeMax,
        singleEvents: true,
        orderBy: "startTime",
      });

      const busyIntervals = [];

      (calRes.data.items || []).forEach((item) => {
        if (item.status === "cancelled") return;

        // Eventos de día completo
        if (item.start.date) {
          busyIntervals.push({
            startMin: 0,
            endMin: 24 * 60,
            summary: item.summary || "Bloqueo día completo",
          });
          return;
        }

        // Eventos con hora inicio y fin
        if (item.start.dateTime && item.end.dateTime) {
          const startMin = parseEventToColombiaMinutes(item.start.dateTime, year, monthIndex, diaNum);
          const endMin = parseEventToColombiaMinutes(item.end.dateTime, year, monthIndex, diaNum);
          if (endMin > startMin) {
            busyIntervals.push({
              startMin,
              endMin,
              summary: item.summary || "Ocupado",
            });
          }
        }
      });

      // 2. Manejo de citas y sincronización con Firestore:
      // Google Calendar es la fuente única de verdad para citas confirmadas y bloqueos.
      // Si una cita fue eliminada/cancelada en Google Calendar, la hora DEBE quedar libre.
      const activeEventIds = new Set(
        (calRes.data.items || [])
          .filter((i) => i.status !== "cancelled")
          .map((i) => i.id)
      );

      const firestoreSnap = await db.collection("citas")
        .where("barber", "==", barber)
        .where("date", "==", dateStr)
        .get();

      const nowMs = Date.now();
      firestoreSnap.forEach((doc) => {
        const cita = doc.data();
        if (cita.cancelada || cita.estado === "cancelada") return;

        // Si la cita ya fue procesada y tenía evento en Calendar, pero ese evento ya no está activo:
        if (cita.procesada && cita.calendarEventId && !activeEventIds.has(cita.calendarEventId)) {
          // El barbero eliminó la cita en Google Calendar -> marcar como cancelada en Firestore
          doc.ref.update({
            estado: "cancelada",
            cancelada: true,
            canceladaEn: new Date(),
          }).catch((err) => logger.warn("Error actualizando cita cancelada en Firestore:", err));
          return; // No bloquea la hora
        }

        // Si la cita aún está en proceso de creación por la Cloud Function (menos de 2 minutos)
        if (!cita.procesada && cita.time) {
          const createdAtMs = cita.createdAt && cita.createdAt.toMillis
            ? cita.createdAt.toMillis()
            : (cita.createdAt ? new Date(cita.createdAt).getTime() : nowMs);

          if (nowMs - createdAtMs < 2 * 60 * 1000) {
            const [hStr, mAmPm] = cita.time.split(":");
            const [mStr, ampm] = mAmPm.split(" ");
            let h = parseInt(hStr);
            if (ampm === "PM" && h < 12) h += 12;
            if (ampm === "AM" && h === 12) h = 0;
            const startMin = h * 60 + parseInt(mStr);
            const duration = cita.duration || 60;
            const endMin = startMin + duration;
            busyIntervals.push({
              startMin,
              endMin,
              summary: cita.serviceName || "Reserva en proceso",
            });
          }
        }
      });

      // 3. Calcular todos los slots con su estado de disponibilidad (1 hora cada uno)
      const allSlots = calculateAllSlots(schedule, busyIntervals, 60, currentColombiaMin);
      const availableSlots = allSlots.filter((s) => s.available).map((s) => ({ label: s.label, totalMin: s.totalMin }));

      return res.status(200).json({
        success: true,
        barber,
        date: dateStr,
        isToday: isTodayInColombia,
        allPast: isTodayInColombia && availableSlots.length === 0,
        busyIntervals,
        allSlots,
        availableSlots,
      });
    } catch (err) {
      logger.error("Error en getDisponibilidad:", err);
      return res.status(500).json({ error: "Error consultando disponibilidad", message: err.message });
    }
  }
);

// ==========================================
// 2. TRIGGER FIRESTORE: CREACIÓN DE CITAS
// ==========================================
exports.onCitaCreada = onDocumentCreated(
  {
    document: "citas/{citaId}",
    region: "us-central1",
  },
  async (event) => {
    const snap = event.data;
    if (!snap) {
      logger.warn("Documento no encontrado en el evento.");
      return null;
    }

    const cita = snap.data();
    const citaId = event.params.citaId;

    if (cita.procesada || cita.calendarEventId) {
      logger.info(`La cita ${citaId} ya fue procesada anteriormente (calendarEventId: ${cita.calendarEventId}).`);
      return null;
    }

    logger.info(`Nueva cita recibida [${citaId}]: ${cita.name} con ${cita.barberName || cita.barber} para ${cita.date} ${cita.time}`);

    const barberKey = (cita.barber || "").toLowerCase().trim();
    const calendarId = CALENDARS[barberKey];

    if (!calendarId) {
      logger.error(`Barbero "${cita.barber}" no configurado en los calendarios.`);
      return null;
    }

    // Todas las citas duran exactamente 60 minutos (1 hora)
    const durationMinutes = 60;
    const { startISO, endISO } = getColombiaISO(cita.date, cita.time, durationMinutes);

    const calendarEvent = {
      summary: `Cita: ${cita.serviceName || cita.service || "Servicio"} - ${cita.name || "Cliente"}`,
      description: `👤 Cliente: ${cita.name}\n📱 Teléfono: ${cita.phone}\n✂️ Servicio: ${cita.serviceName}\n💈 Barbero: ${cita.barberName || barberKey}\n⏱️ Duración: ${durationMinutes} min (1 hora)`,
      start: { dateTime: startISO, timeZone: "America/Bogota" },
      end: { dateTime: endISO, timeZone: "America/Bogota" },
    };

    try {
      const res = await calendar.events.insert({
        calendarId: calendarId,
        resource: calendarEvent,
      });

      logger.info(`✅ Evento creado en Google Calendar (${res.data.id}) para ${barberKey}`);

      // Actualizar el documento en Firestore
      await snap.ref.update({
        procesada: true,
        calendarEventId: res.data.id,
        duration: 60,
        procesadaEn: new Date(),
      });

      // ── Enviar Notificaciones de WhatsApp (Meta Cloud API) ──
      const barberoNombre = cita.barberName || BARBER_SCHEDULES[barberKey]?.name || barberKey;
      const servicioNombre = cita.serviceName || "Corte de Cabello";
      const adminPhone = process.env.ADMIN_PHONE || "573187511510";

      const templateParams = [
        cita.name || "Cliente",
        servicioNombre,
        barberoNombre,
        cita.date || "",
        cita.time || "",
      ];

      const mensajeAdmin = `🔔 *Nueva Cita Web en Furtivo*\n\n👤 *Cliente:* ${cita.name}\n📱 *Teléfono:* ${cita.phone}\n✂️ *Servicio:* ${servicioNombre}\n💈 *Barbero:* ${barberoNombre}\n📅 *Fecha:* ${cita.date}\n⏰ *Hora:* ${cita.time}\n⏱️ *Duración:* 1 hora`;

      try {
        await Promise.allSettled([
          // 1. Envío de plantilla oficial aprobada al cliente (utilidad garantizada 24/7)
          sendWhatsAppTemplate(cita.phone, "confirmacion", "es_CO", templateParams),
          // 2. Envío de plantilla de confirmación al administrador para asegurar entrega
          sendWhatsAppTemplate(adminPhone, "confirmacion", "es_CO", templateParams),
          // 3. Envío de detalle ampliado al administrador por texto
          sendWhatsApp(adminPhone, mensajeAdmin),
        ]);
      } catch (waErr) {
        logger.warn("Aviso al intentar enviar WhatsApp:", waErr);
      }

      return { success: true, eventId: res.data.id };
    } catch (error) {
      logger.error(`❌ Error al crear evento en Google Calendar para la cita ${citaId}:`, error);
      throw error;
    }
  }
);

// ==========================================
// 3. ENVÍO DE MENSAJES WHATSAPP (META CLOUD API)
// ==========================================

/**
 * Envía una plantilla oficial de WhatsApp Cloud API preaprobada por Meta.
 * Garantiza entrega inmediata 24/7 sin requerir que el cliente haya escrito antes.
 */
async function sendWhatsAppTemplate(toPhone, templateName, languageCode, bodyParams = []) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    logger.info("ℹ️ WhatsApp Cloud API no configurado todavía (WHATSAPP_TOKEN o WHATSAPP_PHONE_NUMBER_ID pendientes).");
    return { skipped: true };
  }

  let cleanPhone = String(toPhone || "").replace(/\D/g, "");
  if (cleanPhone.length === 10 && cleanPhone.startsWith("3")) {
    cleanPhone = "57" + cleanPhone;
  }

  if (!cleanPhone) {
    logger.warn(`Número de teléfono inválido para WhatsApp Template: ${toPhone}`);
    return { error: "Número inválido" };
  }

  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
  const body = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: cleanPhone,
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode },
      components: [
        {
          type: "body",
          parameters: bodyParams.map((val) => ({
            type: "text",
            text: String(val || ""),
          })),
        },
      ],
    },
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      logger.error(`❌ Error respuesta WhatsApp Template '${templateName}' (${res.status}):`, data);
      return { success: false, data };
    }

    logger.info(`✅ Plantilla WhatsApp '${templateName}' enviada con éxito a ${cleanPhone} (ID: ${data.messages?.[0]?.id})`);
    return { success: true, data };
  } catch (err) {
    logger.error(`❌ Error de conexión al enviar plantilla '${templateName}':`, err);
    return { success: false, error: err.message };
  }
}

/**
 * Envío de mensaje de texto libre (requiere ventana de 24h activa)
 */
async function sendWhatsApp(toPhone, messageText) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    return { skipped: true };
  }

  let cleanPhone = String(toPhone || "").replace(/\D/g, "");
  if (cleanPhone.length === 10 && cleanPhone.startsWith("3")) {
    cleanPhone = "57" + cleanPhone;
  }

  if (!cleanPhone) {
    return { error: "Número inválido" };
  }

  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
  const body = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: cleanPhone,
    type: "text",
    text: {
      preview_url: false,
      body: messageText,
    },
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      logger.warn(`⚠️ Aviso WhatsApp texto (${res.status}):`, data);
      return { success: false, data };
    }

    logger.info(`✅ WhatsApp texto enviado con éxito a ${cleanPhone}`);
    return { success: true, data };
  } catch (err) {
    logger.warn("⚠️ Aviso de conexión al enviar WhatsApp texto:", err);
    return { success: false, error: err.message };
  }
}

