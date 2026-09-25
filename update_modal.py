import re

with open('script.js', 'r') as f:
    content = f.read()

new_html = r"""const bookingModalHTML = `
  <div class="booking-modal-overlay" id="bookingModalOverlay">
    <div class="booking-modal-container">
      <button class="booking-modal-close" id="bookingModalClose" aria-label="Cerrar modal">&times;</button>
      
      <!-- Timeline Header -->
      <div class="booking-modal-header">
        <h2 class="heading-lg" style="margin-bottom: 1rem;">Reserva tu lugar</h2>
        
        <div class="wizard-timeline">
          <div class="timeline-step active" id="timeline-1">
            <div class="timeline-dot">1</div>
            <span class="timeline-label">Servicio</span>
          </div>
          <div class="timeline-line"></div>
          <div class="timeline-step" id="timeline-2">
            <div class="timeline-dot">2</div>
            <span class="timeline-label">Barbero</span>
          </div>
          <div class="timeline-line"></div>
          <div class="timeline-step" id="timeline-3">
            <div class="timeline-dot">3</div>
            <span class="timeline-label">Horario</span>
          </div>
          <div class="timeline-line"></div>
          <div class="timeline-step" id="timeline-4">
            <div class="timeline-dot">4</div>
            <span class="timeline-label">Confirmar</span>
          </div>
        </div>
      </div>
      
      <div class="booking-wizard">
        <!-- Paso 1: Servicio -->
        <div class="wizard-step active" id="step-1">
          <h3 class="wizard-step__title">Selecciona el Servicio</h3>
          <div class="service-selection-grid">
            <div class="service-card" data-service="corte">
              <h4>Corte Clásico</h4>
              <p>$30.000</p>
            </div>
            <div class="service-card" data-service="barba">
              <h4>Barba Express</h4>
              <p>$20.000</p>
            </div>
            <div class="service-card" data-service="corte_barba">
              <h4>Corte + Barba</h4>
              <p>$50.000</p>
            </div>
            <div class="service-card" data-service="barba_ritual">
              <h4>Barba con Ritual</h4>
              <p>$30.000</p>
            </div>
            <div class="service-card" data-service="full_servicio">
              <h4>Limpieza Facial</h4>
              <p>$25.000</p>
            </div>
            <div class="service-card" data-service="plata">
              <h4>Exp. Plata</h4>
              <p>$40.000</p>
            </div>
            <div class="service-card" data-service="oro">
              <h4>Exp. Oro</h4>
              <p>$50.000</p>
            </div>
            <div class="service-card" data-service="diamante">
              <h4>Exp. Diamante</h4>
              <p>$80.000</p>
            </div>
          </div>
          <div class="wizard-actions">
            <button class="btn btn--primary" id="btn-next-1" disabled style="width: 100%;">Siguiente Paso</button>
          </div>
        </div>

        <!-- Paso 2: Barbero -->
        <div class="wizard-step" id="step-2">
          <h3 class="wizard-step__title">Selecciona tu Profesional</h3>
          <div class="barber-selection-grid">
            <div class="barber-card-premium" data-barber="cualquiera">
              <div class="barber-avatar" style="background: var(--bg-elevated); display:flex; align-items:center; justify-content:center; font-size: 2rem;">🕒</div>
              <div class="barber-info">
                <h4>Cualquier Disponible</h4>
                <p>El primero libre</p>
              </div>
              <div class="barber-check"></div>
            </div>
            <div class="barber-card-premium" data-barber="carlos">
              <div class="barber-avatar"><img src="assets/images/gallery-1.jpg" alt="Carlos"></div>
              <div class="barber-info">
                <h4>Carlos Restrepo</h4>
                <p>Master Barber</p>
              </div>
              <div class="barber-check"></div>
            </div>
            <div class="barber-card-premium" data-barber="andres">
              <div class="barber-avatar"><img src="assets/images/gallery-2.jpg" alt="Andrés"></div>
              <div class="barber-info">
                <h4>Andrés Muñoz</h4>
                <p>Senior Barber</p>
              </div>
              <div class="barber-check"></div>
            </div>
            <div class="barber-card-premium" data-barber="sebastian">
              <div class="barber-avatar"><img src="assets/images/gallery-3.jpg" alt="Sebastián"></div>
              <div class="barber-info">
                <h4>Sebastián Ríos</h4>
                <p>Barber & Stylist</p>
              </div>
              <div class="barber-check"></div>
            </div>
          </div>
          <div class="wizard-actions" style="display: flex; gap: 1rem;">
            <button class="btn btn--outline" id="btn-prev-2" style="flex: 1;">Atrás</button>
            <button class="btn btn--primary" id="btn-next-2" disabled style="flex: 1;">Siguiente</button>
          </div>
        </div>

        <!-- Paso 3: Fecha y Hora -->
        <div class="wizard-step" id="step-3">
          <h3 class="wizard-step__title">Selecciona Fecha y Hora</h3>
          
          <div style="margin-bottom: 1.5rem;">
            <label class="body-sm" style="display: block; margin-bottom: 0.5rem; color: var(--text-muted);">Días Disponibles</label>
            <div class="date-chips-container" id="dateChipsContainer">
              <!-- JS generates chips here -->
            </div>
          </div>
          
          <div style="margin-bottom: 2rem;">
            <label class="body-sm" style="display: block; margin-bottom: 0.5rem; color: var(--text-muted);">Horarios</label>
            <div class="time-chips-container" id="timeChipsContainer">
              <p style="color: var(--text-muted); font-size: 0.9rem;">Selecciona una fecha primero.</p>
            </div>
          </div>

          <div class="wizard-actions" style="display: flex; gap: 1rem;">
            <button class="btn btn--outline" id="btn-prev-3" style="flex: 1;">Atrás</button>
            <button class="btn btn--primary" id="btn-next-3" disabled style="flex: 1;">Siguiente</button>
          </div>
        </div>

        <!-- Paso 4: Confirmación -->
        <div class="wizard-step" id="step-4">
          <h3 class="wizard-step__title">Confirma tus Datos</h3>
          
          <div class="booking-receipt">
            <h4 style="margin-bottom: 1rem; color: var(--text-light); text-align:center; font-family:var(--font-heading);">Resumen de Reserva</h4>
            <div class="receipt-row">
              <span class="receipt-label">Servicio</span>
              <span class="receipt-value" id="summary-service">-</span>
            </div>
            <div class="receipt-row">
              <span class="receipt-label">Profesional</span>
              <span class="receipt-value" id="summary-barber">-</span>
            </div>
            <div class="receipt-row">
              <span class="receipt-label">Fecha</span>
              <span class="receipt-value" id="summary-date">-</span>
            </div>
            <div class="receipt-row" style="border-bottom:none;">
              <span class="receipt-label">Hora</span>
              <span class="receipt-value" id="summary-time">-</span>
            </div>
          </div>

          <div style="display: grid; gap: 1rem; margin-bottom: 2rem;">
            <div>
              <label for="user-name" class="body-sm" style="display: block; margin-bottom: 0.5rem; color: var(--text-muted);">Nombre Completo</label>
              <input type="text" id="user-name" class="premium-input" placeholder="Ej: Juan Pérez">
            </div>
            <div>
              <label for="user-phone" class="body-sm" style="display: block; margin-bottom: 0.5rem; color: var(--text-muted);">Teléfono Móvil</label>
              <input type="tel" id="user-phone" class="premium-input" placeholder="Ej: 300 123 4567">
              <p style="font-size: 0.75rem; color: var(--text-muted); margin-top:0.25rem;">Te enviaremos los detalles por WhatsApp.</p>
            </div>
          </div>
          
          <div class="wizard-actions" style="display: flex; gap: 1rem;">
            <button class="btn btn--outline" id="btn-prev-4" style="flex: 1;">Atrás</button>
            <button class="btn btn--primary" id="btn-confirm" style="flex: 1; pointer-events: none; opacity: 0.5;">Confirmar Cita</button>
          </div>
        </div>

        <!-- Mensaje Éxito -->
        <div class="wizard-step" id="step-success" style="text-align: center; padding: 3rem 0;">
          <div style="font-size: 4rem; margin-bottom: 1rem; animation: popIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);">✅</div>
          <h3 class="heading-md" style="margin-bottom: 1rem; color: var(--accent);">¡Reserva Confirmada!</h3>
          <p class="body-sm" style="color: var(--text-muted); margin-bottom: 2rem;">
            Tu cita ha sido agendada con éxito. Te hemos enviado un mensaje por WhatsApp con todos los detalles. ¡Te esperamos!
          </p>
          <button class="btn btn--outline" id="btn-finish" style="width: 100%;">Cerrar y Volver</button>
        </div>
      </div>
    </div>
  </div>
`;"""

pattern = r"const bookingModalHTML = `.*?`;"
updated_content = re.sub(pattern, new_html, content, flags=re.DOTALL)

with open('script.js', 'w') as f:
    f.write(updated_content)

print("Modal HTML updated.")
