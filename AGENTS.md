# 🛡️ Guía Canónica y Protocolo de Calidad para Agentes (AGENTS.md)
## Furtivo Barbería Premium

Este documento establece las **reglas de ingeniería, diseño y validación obligatorias** para cualquier agente de IA o desarrollador que intervenga en este repositorio. 

---

## 🚨 REGLA DE ORO: CERO REGRESIONES Y CERO DESPLIEGUES A CIEGAS
> **"No se nos puede caer el sitio cada vez que hacemos un cambio, mucho cuidado. Siempre que subamos una actualización el agente DEBE revisar todo el sitio en el navegador y ver que quedó funcionando."**

Está estrictamente prohibido marcar una tarea como completada o entregar una respuesta al usuario sin antes haber realizado el **Protocolo de Verificación Pre-Entrega (Quality Gate)**.

---

## 🚦 Protocolo de Verificación Obligatoria Pre-Entrega (Quality Gate)

Antes de reportar cualquier cambio al usuario, el agente debe ejecutar las siguientes comprobaciones:

### 1. Smoke Test del Motor de Reservas (`reservar.html` y modal)
- [ ] **Paso 1 (Servicios):** Al hacer clic en cualquier servicio, la tarjeta debe resaltarse en dorado y realizar **auto-avance fluido** al Paso 2 (Barbero) tras 220ms.
- [ ] **Paso 2 (Barberos):** Al hacer clic en Juan Quintero o Fernando Carmona, la tarjeta debe seleccionarse y realizar **auto-avance fluido** al Paso 3 (Horarios).
- [ ] **Paso 3 (Fecha y Hora):**
  - Carga correcta de los chips de fechas (próximos 14 días con huso horario de Colombia GMT-5).
  - Consulta a la Cloud Function de Google Calendar (`getDisponibilidad`) y renderizado de turnos disponibles.
  - Al seleccionar una hora disponible, la tarjeta debe seleccionarse y auto-avanzar al Paso 4.
- [ ] **Paso 4 (Confirmación y Contacto):**
  - Resumen de la cita completo (Servicio, Barbero, Fecha, Hora).
  - Validación del campo Nombre (mínimo 3 caracteres).
  - Validación del Celular de Colombia (mínimo 10 dígitos, formateado con prefijo +57).
  - El botón "Confirmar Cita" debe habilitarse de forma clara e interactiva.
- [ ] **Línea de Tiempo (Timeline):** Los pasos 1, 2 y 3 deben ser **clicables** para permitir al usuario retroceder y modificar cualquier selección en cualquier momento.

### 2. Visibilidad e Integridad en Pantallas de Laptop (13" a 15") y Móviles
- [ ] **Viewport Safe:** El contenedor de reserva (`.booking-standalone-card` o `.booking-modal-container`) debe tener siempre una altura máxima acotada al viewport (`max-height: calc(100svh - 95px)` en desktop, `100svh` en móvil).
- [ ] **Footer Anclado Visible:** El pie de página con los botones `"Atrás"` y `"Siguiente / Confirmar"` debe permanecer **100% visible en el viewport sin quedar cortado por debajo de la pantalla**.
- [ ] **Scroll Interno:** El contenedor `.booking-modal-scroll` debe tener `min-height: 0;` y `overflow-y: auto;` para absorber el scroll sin empujar el footer hacia afuera.

### 3. Integridad de Páginas Satélite
Verificar que los botones principales ("Reservar Cita") funcionen correctamente en todas las páginas:
- `index.html` (Home, servicios, testimonios, CTA)
- `servicios.html` (Grid de servicios con botón o redirección canónica)
- `barberos.html` (Perfiles de barberos con enlace parametrizado `?barber=...`)
- `experiencias.html` (Catálogo de rituales y experiencias)
- `club.html` (Membresías del club)
- `404.html` (Página de error con botón de retorno al home)

### 4. Cero Errores en Consola
- [ ] La consola del navegador (DevTools) debe estar **100% limpia** de excepciones no capturadas (`Uncaught TypeError`, fallos de sintaxis o referencias nulas).

### 5. Control de Caché (Cache Busting)
- [ ] Cada vez que se modifique `styles.css` o `script.js`, **es obligatorio actualizar el parámetro de versión en todos los archivos HTML**:
  ```html
  <link rel="stylesheet" href="styles.css?v=YYYYMMDD-vX">
  <script src="script.js?v=YYYYMMDD-vX"></script>
  ```
  De lo contrario, los clientes y el usuario seguirán cargando versiones cacheadas defectuosas.

---

## 📐 Reglas Arquitectónicas de CSS y JS en Furtivo

1. **PROHIBICIÓN de `overflow: hidden` en contenedores con hijos sticky:**
   Cualquier contenedor padre con `overflow: hidden` desactiva completamente la propiedad `position: sticky; bottom: 0;`. Se debe usar siempre layout flexbox estructurado con `flex-shrink: 0;` en header/footer y `flex: 1 1 auto; min-height: 0; overflow-y: auto;` en el cuerpo de scroll.
2. **Duración Universal de Citas:**
   Todas las citas en Furtivo duran un bloque estándar de **60 minutos** (1 hora) para sincronización con la agenda de Google Calendar.
3. **Horario de Cierre Colombia (GMT-5):**
   El horario de cierre es a las 10:00 PM. Por tanto, el último turno agendable del día es a las **9:00 PM**. Si la hora actual en Colombia ya superó las 9:00 PM, el día "Hoy" se desactiva automáticamente.
4. **Respeto a la Identidad Visual:**
   - Paleta de colores: Fondo profundo (`#0A0A0A`, `#111111`, `#171717`), Acento Dorado Champagne (`#C9A96E` / `var(--accent)`), Blanco puro para títulos principales (`#FFFFFF`), Textos secundarios (`#9E9E9E`).
   - Tipografía: Títulos en *Playfair Display*, textos en *Inter*.
   - Prohibido el uso de emojis en interfaces principales o favicons (usar SVGs bespoke o diseño tipográfico limpio).
