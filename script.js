/* ============================================================
   FURTIVO BARBERÍA — Script Principal
   Animaciones GSAP, Smart Navbar, Smooth Scroll, Swiper
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Register GSAP Plugins ──
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // ── Smart Navbar (hide on scroll down, show on scroll up) ──
  const navbar = document.getElementById('navbar');
  let lastScrollY = window.scrollY;
  let ticking = false;

  function updateNavbar() {
    const currentScrollY = window.scrollY;

    // Add/remove scrolled class for background
    if (currentScrollY > 50) {
      navbar.classList.add('is-scrolled');
    } else {
      navbar.classList.remove('is-scrolled');
    }

    // Hide/show navbar based on scroll direction
    if (currentScrollY > lastScrollY && currentScrollY > 200) {
      navbar.classList.add('is-hidden');
    } else {
      navbar.classList.remove('is-hidden');
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  }, { passive: true });

  // ── Mobile Menu Toggle ──
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('is-active');
    mobileMenu.classList.toggle('is-active');
    document.body.style.overflow = mobileMenu.classList.contains('is-active') ? 'hidden' : '';
  });

  // Close mobile menu on link click
  document.querySelectorAll('.mobile-menu__link, .mobile-menu .btn').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('is-active');
      mobileMenu.classList.remove('is-active');
      document.body.style.overflow = '';
    });
  });

  // ── Smooth Scroll for Anchor Links ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offsetTop = target.offsetTop - 80;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  // ── GSAP Hero Animation ──
  if (typeof gsap !== 'undefined') {
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    heroTl
      .from('.hero__subtitle', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        delay: 0.3
      })
      .from('.hero__title', {
        y: 40,
        opacity: 0,
        duration: 0.9,
      }, '-=0.4')
      .from('.hero__description', {
        y: 30,
        opacity: 0,
        duration: 0.7,
      }, '-=0.5')
      .from('.hero .btn-group', {
        y: 20,
        opacity: 0,
        duration: 0.6,
      }, '-=0.3')
      .from('.hero__scroll-hint', {
        opacity: 0,
        duration: 0.8,
      }, '-=0.2');

    // ── Reveal on Scroll (GSAP ScrollTrigger) ──
    const revealElements = document.querySelectorAll('.reveal');

    revealElements.forEach((el) => {
      gsap.fromTo(el,
        {
          y: 30,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            end: 'top 60%',
            toggleActions: 'play none none none',
          }
        }
      );
    });

    // ── Reveal Left/Right Animations ──
    document.querySelectorAll('.reveal-left').forEach((el) => {
      gsap.fromTo(el,
        { x: -50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          }
        }
      );
    });

    document.querySelectorAll('.reveal-right').forEach((el) => {
      gsap.fromTo(el,
        { x: 50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          }
        }
      );
    });

    // ── Section Labels — Animated Line ──
    if (typeof ScrollTrigger !== 'undefined') {
      document.querySelectorAll('.section-label').forEach((label) => {
        ScrollTrigger.create({
          trigger: label,
          start: 'top 90%',
          onEnter: () => label.classList.add('is-visible'),
        });
      });
    }

    // ── Combo Cards Stagger ──
    gsap.utils.toArray('.combo-card').forEach((card, i) => {
      gsap.fromTo(card,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          delay: i * 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card.parentElement,
            start: 'top 80%',
            toggleActions: 'play none none none',
          }
        }
      );
    });

    // ── Service Items Stagger ──
    gsap.utils.toArray('.service-item').forEach((item, i) => {
      gsap.fromTo(item,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          delay: i * 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: item.parentElement,
            start: 'top 80%',
            toggleActions: 'play none none none',
          }
        }
      );
    });

    // ── Barber Cards Stagger ──
    gsap.utils.toArray('.barber-card').forEach((card, i) => {
      gsap.fromTo(card,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          delay: i * 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card.parentElement,
            start: 'top 80%',
            toggleActions: 'play none none none',
          }
        }
      );
    });

    // ── Membership Cards Stagger ──
    gsap.utils.toArray('.membership-card').forEach((card, i) => {
      gsap.fromTo(card,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          delay: i * 0.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card.parentElement,
            start: 'top 80%',
            toggleActions: 'play none none none',
          }
        }
      );
    });

    // ── Gallery Items Animation ──
    gsap.utils.toArray('.gallery-item').forEach((item, i) => {
      gsap.fromTo(item,
        { scale: 0.9, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          delay: i * 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: item.parentElement,
            start: 'top 85%',
            toggleActions: 'play none none none',
          }
        }
      );
    });

    // ── Manifesto Parallax-like Effect ──
    const manifesto = document.querySelector('.manifesto');
    if (manifesto) {
      gsap.fromTo('.manifesto__quote', 
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: manifesto,
            start: 'top 70%',
            toggleActions: 'play none none none',
          }
        }
      );

      gsap.fromTo('.manifesto__divider',
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.manifesto__divider',
            start: 'top 85%',
            toggleActions: 'play none none none',
          }
        }
      );

      gsap.fromTo('.manifesto__highlight',
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.manifesto__highlight',
            start: 'top 90%',
            toggleActions: 'play none none none',
          }
        }
      );
    }
  }

  // ── Swiper Reviews Carousel ──
  if (typeof Swiper !== 'undefined' && document.querySelector('.reviews-swiper')) {
    const reviewsSwiper = new Swiper('.reviews-swiper', {
      slidesPerView: 1,
      spaceBetween: 24,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      breakpoints: {
        640: {
          slidesPerView: 2,
        },
        1024: {
          slidesPerView: 3,
        },
      },
    });
  }

  // ── Before/After Comparison Swiper ──
  if (typeof Swiper !== 'undefined' && document.querySelector('.ba-swiper')) {
    const baSwiper = new Swiper('.ba-swiper', {
      slidesPerView: 1,
      spaceBetween: 32,
      loop: false,
      grabCursor: false,
      allowTouchMove: true,
      pagination: {
        el: '.ba-swiper-pagination',
        clickable: true,
      },
      navigation: {
        prevEl: '.ba-nav--prev',
        nextEl: '.ba-nav--next',
      },
    });

    // ── Interactive Before/After Handle ──
    document.querySelectorAll('[data-ba-comparison]').forEach(comparison => {
      const beforeImg = comparison.querySelector('.ba-image--before');
      const handle = comparison.querySelector('.ba-handle');
      let isDragging = false;

      function updatePosition(x) {
        const rect = comparison.getBoundingClientRect();
        let pos = (x - rect.left) / rect.width;
        pos = Math.max(0.05, Math.min(0.95, pos));
        const percent = pos * 100;

        beforeImg.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
        handle.style.left = percent + '%';
      }

      function onPointerDown(e) {
        // Only start drag if on the handle area or close to divider
        isDragging = true;
        comparison.classList.add('ba-dragging');
        comparison.setPointerCapture(e.pointerId);
        // Disable swiper touch while dragging handle
        baSwiper.allowTouchMove = false;
        updatePosition(e.clientX);
        e.preventDefault();
      }

      function onPointerMove(e) {
        if (!isDragging) return;
        updatePosition(e.clientX);
        e.preventDefault();
      }

      function onPointerUp(e) {
        if (!isDragging) return;
        isDragging = false;
        comparison.classList.remove('ba-dragging');
        comparison.releasePointerCapture(e.pointerId);
        // Re-enable swiper touch
        baSwiper.allowTouchMove = true;
      }

      comparison.addEventListener('pointerdown', onPointerDown);
      comparison.addEventListener('pointermove', onPointerMove);
      comparison.addEventListener('pointerup', onPointerUp);
      comparison.addEventListener('pointercancel', onPointerUp);

      // Prevent context menu on long press (mobile)
      comparison.addEventListener('contextmenu', e => e.preventDefault());
    });
  }

  // ── Active Nav Link Highlight ──
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar__link');

  function highlightNavLink() {
    const scrollY = window.scrollY + 150;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.style.color = '';
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.style.color = 'var(--accent)';
          }
        });
      }
    });
  }

  window.addEventListener('scroll', highlightNavLink, { passive: true });

  // ── Preloader-like Initial State ──
  // Ensure hero bg image is loaded before animating
  const heroBgImg = document.querySelector('.hero__bg img');
  if (heroBgImg && heroBgImg.complete) {
    document.body.classList.add('loaded');
  } else if (heroBgImg) {
    heroBgImg.addEventListener('load', () => {
      document.body.classList.add('loaded');
    });
  }

});

/* ============================================================
   MODAL DE RESERVAS (Inyectado para evitar CORS local)
   ============================================================ */
const bookingModalHTML = `
  <div class="booking-modal-overlay" id="bookingModalOverlay">
    <div class="booking-modal-container">
      <button class="booking-modal-close" id="bookingModalClose" aria-label="Cerrar">&times;</button>

      <!-- Header with title and timeline -->
      <div class="booking-modal-header">
        <h2 class="booking-modal-title">Reserva tu lugar</h2>

        <div class="wizard-timeline" id="wizardTimeline">
          <div class="timeline-step active" id="timeline-1">
            <div class="timeline-dot">1</div>
            <span class="timeline-label">Servicio</span>
          </div>
          <div class="timeline-line" id="tline-1"></div>
          <div class="timeline-step" id="timeline-2">
            <div class="timeline-dot">2</div>
            <span class="timeline-label">Barbero</span>
          </div>
          <div class="timeline-line" id="tline-2"></div>
          <div class="timeline-step" id="timeline-3">
            <div class="timeline-dot">3</div>
            <span class="timeline-label">Horario</span>
          </div>
          <div class="timeline-line" id="tline-3"></div>
          <div class="timeline-step" id="timeline-4">
            <div class="timeline-dot">4</div>
            <span class="timeline-label">Confirmar</span>
          </div>
        </div>
      </div>

      <!-- Scrollable step content -->
      <div class="booking-modal-scroll">
        <div class="booking-wizard">

          <!-- PASO 1: SERVICIO -->
          <div class="wizard-step active" id="step-1">
            <p class="wizard-step__title">¿Qué servicio quieres?</p>
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
              <div class="service-card" data-service="corte_barba_ritual">
                <h4>Corte + Barba Ritual</h4>
                <p>$60.000</p>
              </div>
              <div class="service-card" data-service="facial">
                <h4>Limpieza Facial</h4>
                <p>$25.000</p>
              </div>
              <div class="service-card" data-service="full_servicio">
                <h4>Full Servicio</h4>
                <p>$79.000</p>
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
                <p>$60.000</p>
              </div>
            </div>
          </div>

          <!-- PASO 2: BARBERO -->
          <div class="wizard-step" id="step-2">
            <p class="wizard-step__title">¿Con quién quieres tu cita?</p>
            <div class="barber-selection-grid">
              <div class="barber-card-premium" data-barber="juan">
                <div class="barber-avatar"><img src="assets/images/barber-1.jpg?v=FINAL" alt="Juan Quintero"></div>
                <div class="barber-info">
                  <h4>Juan Quintero</h4>
                  <p>Disponible 10:00 AM – 7:00 PM</p>
                </div>
                <div class="barber-radio"></div>
              </div>
              <div class="barber-card-premium" data-barber="fernando">
                <div class="barber-avatar"><img src="assets/images/barber-2.jpg?v=FINAL" alt="Fernando Carmona"></div>
                <div class="barber-info">
                  <h4>Fernando Carmona</h4>
                  <p>Disponible 1:00 PM – 7:00 PM</p>
                </div>
                <div class="barber-radio"></div>
              </div>
            </div>
          </div>

          <!-- PASO 3: FECHA Y HORA -->
          <div class="wizard-step" id="step-3">
            <p class="wizard-step__title">Elige el día</p>
            <div class="date-chips-container" id="dateChipsContainer"></div>

            <p class="wizard-step__title" id="time-label" style="display:none;">Elige la hora</p>
            <div class="time-chips-container" id="timeChipsContainer"></div>
          </div>

          <!-- PASO 4: CONFIRMACIÓN -->
          <div class="wizard-step" id="step-4">
            <p class="wizard-step__title">Confirma tu reserva</p>

            <div class="booking-receipt">
              <p class="receipt-header">Resumen de Cita</p>
              <div class="receipt-row">
                <span class="receipt-label">Servicio</span>
                <span class="receipt-value" id="summary-service">—</span>
              </div>
              <div class="receipt-row">
                <span class="receipt-label">Profesional</span>
                <span class="receipt-value" id="summary-barber">—</span>
              </div>
              <div class="receipt-row">
                <span class="receipt-label">Fecha</span>
                <span class="receipt-value" id="summary-date">—</span>
              </div>
              <div class="receipt-row">
                <span class="receipt-label">Hora</span>
                <span class="receipt-value" id="summary-time">—</span>
              </div>
            </div>

            <div style="display: grid; gap: 1rem;">
              <div>
                <label for="user-name" class="wizard-step__title" style="margin-bottom: 0.5rem; display: block;">Tu nombre</label>
                <input type="text" id="user-name" class="premium-input" placeholder="Ej: Juan Pérez">
              </div>
              <div>
                <label for="user-phone" class="wizard-step__title" style="margin-bottom: 0.5rem; display: block;">Tu celular</label>
                <input type="tel" id="user-phone" class="premium-input" placeholder="Ej: 300 123 4567">
                <p style="font-size: 0.75rem; color: #444; margin-top: 0.4rem;">Recibirás la confirmación por WhatsApp.</p>
              </div>
            </div>
          </div>

          <!-- PASO ÉXITO -->
          <div class="wizard-step" id="step-success">
            <div class="step-success-inner">
              <span class="step-success-icon">✅</span>
              <h3 class="heading-md" style="margin-bottom: 0.75rem; color: var(--accent);">¡Cita Confirmada!</h3>
              <p class="body-sm" style="color: #555; margin-bottom: 2rem; line-height: 1.6;">
                Tu reserva ha quedado registrada. Te enviaremos todos los detalles por WhatsApp. ¡Te esperamos en Furtivo!
              </p>
            </div>
          </div>

        </div>
      </div>

      <!-- Fixed footer with nav buttons -->
      <div class="wizard-footer" id="wizardFooter">
        <button class="btn btn--outline" id="btn-prev" style="display: none;">Atrás</button>
        <button class="btn btn--primary" id="btn-next" disabled style="flex: 1;">Siguiente</button>
      </div>

    </div>
  </div>
`;

// ─── Booking Data & Config ─────────────────────────────────────

const BARBER_SCHEDULES = {
  juan:     { name: 'Juan Quintero',   startH: 10, endH: 19 },  // 10AM–7PM
  fernando: { name: 'Fernando Carmona', startH: 13, endH: 19 }, // 1PM–7PM
};

// Duration in minutes per service
const SERVICE_DURATIONS = {
  corte:              30,  // Corte Clásico
  barba:              30,  // Barba Express
  barba_ritual:       45,  // Barba con Ritual
  facial:             45,  // Limpieza Facial Profunda
  corte_barba:        60,  // Corte + Barba
  corte_barba_ritual: 75,  // Corte + Barba con Ritual
  full_servicio:      90,  // Full servicio Furtivo
  plata:              60,  // Exp. Plata
  oro:                60,  // Exp. Oro
  diamante:           75,  // Exp. Diamante
};

let currentStep = 1;
const bookingData = {
  service:      null,
  serviceName:  null,
  duration:     null,
  barber:       null,
  barberName:   null,
  date:         null,
  time:         null,
  name:         null,
  phone:        null
};

// ─── Inject & Setup ─────────────────────────────────────────────
function injectBookingModal() {
  if (document.getElementById('bookingModalOverlay')) return;
  document.body.insertAdjacentHTML('beforeend', bookingModalHTML);

  const overlay  = document.getElementById('bookingModalOverlay');
  const btnClose = document.getElementById('bookingModalClose');

  btnClose.addEventListener('click', closeBookingModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeBookingModal(); });

  setupWizardLogic();
}

// ─── Core Logic ─────────────────────────────────────────────────
function setupWizardLogic() {

  // ── Step 1: Services ──────────────────────────────────────────
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      bookingData.service     = card.dataset.service;
      bookingData.serviceName = card.querySelector('h4').innerText;
      bookingData.duration    = SERVICE_DURATIONS[bookingData.service] || 30;
      setNextBtn(true);
    });
  });

  // ── Step 2: Barbers ───────────────────────────────────────────
  document.querySelectorAll('.barber-card-premium').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.barber-card-premium').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      bookingData.barber     = card.dataset.barber;
      bookingData.barberName = card.querySelector('h4').innerText;
      setNextBtn(true);
    });
  });

  // ── Step 3: Date chips ────────────────────────────────────────
  const dateContainer = document.getElementById('dateChipsContainer');
  const timeContainer = document.getElementById('timeChipsContainer');
  const timeLabel     = document.getElementById('time-label');
  const today         = new Date();
  const DAY_NAMES     = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const MON_NAMES     = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const chip = document.createElement('div');
    chip.className = 'date-chip';
    chip.dataset.dateStr = `${DAY_NAMES[d.getDay()]} ${d.getDate()} ${MON_NAMES[d.getMonth()]}`;
    chip.innerHTML = `
      <span class="date-chip-day">${DAY_NAMES[d.getDay()]}</span>
      <span class="date-chip-num">${d.getDate()}</span>
      <span class="date-chip-month">${MON_NAMES[d.getMonth()]}</span>
    `;
    chip.addEventListener('click', () => {
      document.querySelectorAll('.date-chip').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      bookingData.date = chip.dataset.dateStr;
      bookingData.time = null;
      renderTimeChips(timeContainer, timeLabel);
      setNextBtn(false);
    });
    dateContainer.appendChild(chip);
  }

  // ── Step 4: Name + Phone ──────────────────────────────────────
  const nameInput  = document.getElementById('user-name');
  const phoneInput = document.getElementById('user-phone');
  function checkStep4() {
    const ok = nameInput.value.trim().length > 2 && phoneInput.value.trim().length > 6;
    setNextBtn(ok, 'Confirmar Cita');
  }
  nameInput.addEventListener('input',  (e) => { bookingData.name  = e.target.value; checkStep4(); });
  phoneInput.addEventListener('input', (e) => { bookingData.phone = e.target.value; checkStep4(); });

  // ── Navigation ────────────────────────────────────────────────
  document.getElementById('btn-next').addEventListener('click', () => {
    if (currentStep < 4) goToStep(currentStep + 1);
    else confirmBooking();
  });
  document.getElementById('btn-prev').addEventListener('click', () => {
    if (currentStep > 1) goToStep(currentStep - 1);
  });
}

// Generate time slots from barber schedule + service duration
function renderTimeChips(container, label) {
  container.innerHTML = '';
  label.style.display = 'block';

  const schedule = BARBER_SCHEDULES[bookingData.barber];
  const duration = bookingData.duration || 30;

  if (!schedule) {
    container.innerHTML = '<p style="color:#555; font-size:0.85rem;">Selecciona un barbero primero.</p>';
    return;
  }

  // Build slots: every `duration` minutes from startH to (endH - duration/60)
  const slots = [];
  let currentMin = schedule.startH * 60; // minutes from midnight
  const lastStart = schedule.endH * 60 - duration; // last slot that fits before closing

  while (currentMin <= lastStart) {
    const h   = Math.floor(currentMin / 60);
    const m   = currentMin % 60;
    const ampm = h < 12 ? 'AM' : 'PM';
    const h12  = h > 12 ? h - 12 : (h === 0 ? 12 : h);
    const label = `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
    slots.push({ label, totalMin: currentMin });
    currentMin += duration;
  }

  if (slots.length === 0) {
    container.innerHTML = '<p style="color:#555; font-size:0.85rem;">No hay horarios disponibles.</p>';
    return;
  }

  slots.forEach(({ label: slotLabel, totalMin }) => {
    const chip = document.createElement('div');
    chip.className = 'time-chip';
    chip.innerText = slotLabel;
    chip.addEventListener('click', () => {
      document.querySelectorAll('.time-chip').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      bookingData.time = slotLabel;
      setNextBtn(true);
    });
    container.appendChild(chip);
  });
}

function setNextBtn(enabled, label = 'Siguiente') {
  const btn = document.getElementById('btn-next');
  if (!btn) return;
  btn.disabled = !enabled;
  btn.style.opacity = enabled ? '1' : '0.4';
  btn.style.pointerEvents = enabled ? 'auto' : 'none';
  btn.innerText = label;
}

function updateSummary() {
  const duration = bookingData.duration || 30;
  const durationLabel = duration === 60 ? '1 hora' : `${duration} min`;

  document.getElementById('summary-service').innerText = bookingData.serviceName || '—';
  document.getElementById('summary-barber').innerText  = bookingData.barberName  || '—';
  document.getElementById('summary-date').innerText    = bookingData.date        || '—';

  const timeEl = document.getElementById('summary-time');
  if (bookingData.time) {
    timeEl.innerText = `${bookingData.time} (${durationLabel})`;
  } else {
    timeEl.innerText = '—';
  }
}

function confirmBooking() {
  const btn = document.getElementById('btn-next');
  btn.innerText = 'Procesando...';
  btn.disabled  = true;
  setTimeout(() => goToStep('success'), 1500);
}

function goToStep(stepNum) {
  document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('active'));
  const footer   = document.getElementById('wizardFooter');
  const btnPrev  = document.getElementById('btn-prev');
  const timeline = document.getElementById('wizardTimeline');

  if (stepNum === 'success') {
    document.getElementById('step-success').classList.add('active');
    if (timeline) timeline.style.display = 'none';
    if (footer) footer.innerHTML = `<button class="btn btn--primary" id="btn-finish" style="flex:1;">Cerrar</button>`;
    const bf = document.getElementById('btn-finish');
    if (bf) bf.addEventListener('click', closeBookingModal);
    return;
  }

  currentStep = stepNum;
  document.getElementById(`step-${stepNum}`).classList.add('active');
  if (timeline) timeline.style.display = 'flex';

  // Timeline visuals
  document.querySelectorAll('.timeline-step').forEach((el, i) => {
    if (i + 1 < stepNum)       el.className = 'timeline-step completed';
    else if (i + 1 === stepNum) el.className = 'timeline-step active';
    else                        el.className = 'timeline-step';
  });
  document.querySelectorAll('.timeline-line').forEach((line, i) => {
    line.classList.toggle('filled', i + 1 < stepNum);
  });

  // Back button
  if (btnPrev) btnPrev.style.display = stepNum > 1 ? 'flex' : 'none';

  // Re-render time chips when entering step 3 — ALWAYS reset date+time so user must pick fresh
  if (stepNum === 3) {
    // Reset previous selections so user MUST select date AND time
    bookingData.date = null;
    bookingData.time = null;
    // Clear any previously selected chips
    document.querySelectorAll('.date-chip').forEach(c => c.classList.remove('selected'));
    document.querySelectorAll('.time-chip').forEach(c => c.classList.remove('selected'));
    // Reset time chips area
    const tc = document.getElementById('timeChipsContainer');
    const tl = document.getElementById('time-label');
    if (tl) tl.style.display = 'none';
    if (tc) tc.innerHTML = '';
    // Button always starts disabled on step 3
    setNextBtn(false);
  } else if (stepNum === 1) {
    setNextBtn(!!bookingData.service);
  } else if (stepNum === 2) {
    if (bookingData.barber) {
      document.querySelectorAll('.barber-card-premium').forEach(c => {
        if (c.dataset.barber === bookingData.barber) {
          c.classList.add('selected');
        } else {
          c.classList.remove('selected');
        }
      });
    }
    setNextBtn(!!bookingData.barber);
  } else if (stepNum === 4) {
    updateSummary();
    const ni = document.getElementById('user-name');
    const pi = document.getElementById('user-phone');
    const ok = ni && pi && ni.value.trim().length > 2 && pi.value.trim().length > 6;
    setNextBtn(ok, 'Confirmar Cita');
  }
}

window.openBookingModal = function(param1 = null, param2 = null) {
  injectBookingModal();
  const overlay = document.getElementById('bookingModalOverlay');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  currentStep = 1;
  bookingData.service = bookingData.serviceName = bookingData.duration = null;
  bookingData.barber  = bookingData.barberName  = null;
  bookingData.date    = bookingData.time = null;
  bookingData.name    = bookingData.phone = null;

  let preselectedService = null;
  let preselectedBarber  = null;

  if (typeof param1 === 'object' && param1 !== null) {
    preselectedService = param1.service || null;
    preselectedBarber  = param1.barber  || null;
  } else if (typeof param1 === 'string' && ['fernando', 'juan', 'cualquiera'].includes(param1.toLowerCase())) {
    preselectedBarber  = param1.toLowerCase();
    preselectedService = param2;
  } else {
    preselectedService = param1;
    preselectedBarber  = param2 ? param2.toLowerCase() : null;
  }

  // Actualizar título del modal si se especificó barbero
  const modalTitle = document.querySelector('.booking-modal-title');
  if (modalTitle) {
    if (preselectedBarber === 'fernando') {
      modalTitle.textContent = 'Reserva con Fernando Carmona';
    } else if (preselectedBarber === 'juan') {
      modalTitle.textContent = 'Reserva con Juan Quintero';
    } else {
      modalTitle.textContent = 'Reserva tu lugar';
    }
  }

  // Preseleccionar barbero
  if (preselectedBarber) {
    const barberCard = document.querySelector(`.barber-card-premium[data-barber="${preselectedBarber}"]`);
    if (barberCard) {
      document.querySelectorAll('.barber-card-premium').forEach(c => c.classList.remove('selected'));
      barberCard.classList.add('selected');
      bookingData.barber = preselectedBarber;
      const h4 = barberCard.querySelector('h4');
      bookingData.barberName = h4 ? h4.innerText : (preselectedBarber === 'fernando' ? 'Fernando Carmona' : 'Juan Quintero');
    }
  } else {
    document.querySelectorAll('.barber-card-premium').forEach(c => c.classList.remove('selected'));
  }

  goToStep(1);

  if (preselectedService) {
    const card = document.querySelector(`.service-card[data-service="${preselectedService}"]`);
    if (card) {
      card.click();
      setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);
    }
  }
};

window.closeBookingModal = function() {
  const overlay = document.getElementById('bookingModalOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
};
