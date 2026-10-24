/* ============================================================
   FURTIVO BARBERÍA — Script Principal
   Animaciones GSAP, Smart Navbar, Smooth Scroll, Swiper
   ============================================================ */

const firebaseConfig = {
  apiKey: "AIzaSyAvm6chWOWkHQw08jvvwkVlrrKbaEVVxxc",
  authDomain: "furtivo1509.firebaseapp.com",
  projectId: "furtivo1509",
  storageBucket: "furtivo1509.firebasestorage.app",
  messagingSenderId: "696900722395",
  appId: "1:696900722395:web:3a54e9280f1f94fa0276fe",
  measurementId: "G-BJPEX2H1K1"
};

let db = null;
let addDoc, collection, getDocs, query, where;

import('https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js').then((appModule) => {
  const app = appModule.initializeApp(firebaseConfig);
  import('https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js').then((fsModule) => {
    db = fsModule.getFirestore(app);
    addDoc = fsModule.addDoc;
    collection = fsModule.collection;
    getDocs = fsModule.getDocs;
    query = fsModule.query;
    where = fsModule.where;
  });
});

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

  // ── Testimonials Social Proof: Swiper Carousel (Mobile) & Filtering ──
  const filterBtns = document.querySelectorAll('.testimonial-filter-btn');
  const testimonialCards = document.querySelectorAll('.testimonial-shot-card');
  const lightbox = document.getElementById('testimonialLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const closeLightbox = document.getElementById('closeLightbox');
  const testimonialsCounter = document.getElementById('testimonialsCounter');

  let currentFilter = 'all';
  let testimonialsSwiper = null;

  function initTestimonialsSwiper() {
    if (typeof Swiper === 'undefined') return;
    const isMobile = window.innerWidth <= 768;

    if (isMobile && document.querySelector('.testimonials-swiper')) {
      if (testimonialsSwiper) {
        testimonialsSwiper.destroy(true, true);
        testimonialsSwiper = null;
      }

      // Añadir swiper-slide a las tarjetas que NO están ocultas
      testimonialCards.forEach(card => {
        if (!card.classList.contains('is-hidden')) {
          card.classList.add('swiper-slide');
        } else {
          card.classList.remove('swiper-slide');
        }
      });

      testimonialsSwiper = new Swiper('.testimonials-swiper', {
        slidesPerView: 1.15,
        spaceBetween: 16,
        centeredSlides: false,
        grabCursor: true,
        navigation: {
          nextEl: '.testimonials-nav-btn--next',
          prevEl: '.testimonials-nav-btn--prev',
        },
        pagination: {
          el: '.testimonials-swiper-pagination',
          clickable: true,
        },
        breakpoints: {
          480: {
            slidesPerView: 1.25,
            spaceBetween: 18,
          },
          600: {
            slidesPerView: 1.5,
            spaceBetween: 20,
          }
        },
        on: {
          init: function() {
            updateTestimonialCounter(this);
          },
          slideChange: function() {
            updateTestimonialCounter(this);
          }
        }
      });
    } else if (!isMobile && testimonialsSwiper) {
      testimonialsSwiper.destroy(true, true);
      testimonialsSwiper = null;
      testimonialCards.forEach(card => {
        card.classList.remove('swiper-slide');
        card.style.transform = '';
        card.style.marginRight = '';
        card.style.width = '';
      });
    }
  }

  function updateTestimonialCounter(swiperInstance) {
    if (!testimonialsCounter) return;
    const visibleCards = Array.from(testimonialCards).filter(c => !c.classList.contains('is-hidden'));
    const total = visibleCards.length;
    if (total === 0) {
      testimonialsCounter.textContent = '0 / 0';
      return;
    }
    const current = swiperInstance ? Math.min((swiperInstance.realIndex || 0) + 1, total) : 1;
    testimonialsCounter.textContent = `${current} / ${total}`;
  }

  function applyTestimonialFilter(filter) {
    currentFilter = filter;
    testimonialCards.forEach(card => {
      const category = card.dataset.category;
      if (filter === 'all' || category === filter) {
        card.classList.remove('is-hidden');
      } else {
        card.classList.add('is-hidden');
      }
    });

    // En móvil, reinicializar Swiper con sólo los slides activos
    if (window.innerWidth <= 768) {
      initTestimonialsSwiper();
    } else {
      updateTestimonialCounter(null);
    }
  }

  // Inicializar al cargar y escuchar resize
  initTestimonialsSwiper();
  window.addEventListener('resize', () => {
    initTestimonialsSwiper();
  });

  if (filterBtns.length && testimonialCards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');

        const filter = btn.dataset.filter;
        applyTestimonialFilter(filter);
      });
    });
  }

  // Lightbox handlers
  if (lightbox && lightboxImg) {
    function openTestimonialLightbox(src, caption) {
      lightboxImg.src = src;
      lightboxCaption.textContent = caption || '';
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeTestimonialLightbox() {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      setTimeout(() => {
        lightboxImg.src = '';
      }, 300);
    }

    testimonialCards.forEach(card => {
      const media = card.querySelector('.testimonial-shot-card__media');
      const zoomBtn = card.querySelector('.testimonial-zoom-btn');
      
      const triggerOpen = () => {
        const src = media ? media.dataset.lightboxSrc : card.querySelector('img')?.src;
        const caption = media ? media.dataset.lightboxCaption : '';
        if (src) openTestimonialLightbox(src, caption);
      };

      if (media) media.addEventListener('click', triggerOpen);
      if (zoomBtn) zoomBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerOpen();
      });
    });

    if (closeLightbox) {
      closeLightbox.addEventListener('click', closeTestimonialLightbox);
    }

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('testimonial-lightbox__dialog')) {
        closeTestimonialLightbox();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('is-open')) {
        closeTestimonialLightbox();
      }
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
      noSwiping: true,
      noSwipingSelector: '.ba-comparison, .ba-handle',
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
        try {
          comparison.setPointerCapture(e.pointerId);
        } catch (err) {}
        // Disable swiper touch while dragging handle
        if (baSwiper) baSwiper.allowTouchMove = false;
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
        try {
          comparison.releasePointerCapture(e.pointerId);
        } catch (err) {}
        // Re-enable swiper touch
        if (baSwiper) baSwiper.allowTouchMove = true;
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
                <h4>Corte de Cabello</h4>
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
                  <p>Disponible 10:00 AM – 10:00 PM</p>
                </div>
                <div class="barber-radio"></div>
              </div>
              <div class="barber-card-premium" data-barber="fernando">
                <div class="barber-avatar"><img src="assets/images/barber-2.jpg?v=FINAL" alt="Fernando Carmona"></div>
                <div class="barber-info">
                  <h4>Fernando Carmona</h4>
                  <p>Disponible 1:00 PM – 10:00 PM</p>
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

          <!-- PASO 4: CONFIRMACIÓN Y DATOS DE CONTACTO (ALTA VISIBILIDAD) -->
          <div class="wizard-step" id="step-4">
            <p class="wizard-step__title" style="color: #C9A96E; font-size: 0.8rem; letter-spacing: 0.08em; margin-bottom: 0.35rem;">Paso final</p>
            <h3 style="font-family: 'Playfair Display', serif; font-size: 1.4rem; color: #fff; margin-bottom: 0.35rem; font-weight: 600;">Confirma tus Datos</h3>
            <p style="font-size: 0.84rem; color: #aaa; margin-bottom: 1.15rem; line-height: 1.4;">
              Ingresa tu nombre y celular para enviarte la confirmación oficial y recordatorio por WhatsApp.
            </p>

            <!-- Card de Datos de Contacto - Máxima Claridad y Accesibilidad -->
            <div class="contact-inputs-card">
              <div class="form-group-premium">
                <label for="user-name" class="premium-label">
                  <span class="label-icon">👤</span> Nombre completo <span class="required-star">*</span>
                </label>
                <input type="text" id="user-name" class="premium-input-v2" placeholder="Ej: Alonso Herrera" autocomplete="name" required>
              </div>

              <div class="form-group-premium">
                <label for="user-phone" class="premium-label">
                  <span class="label-icon">📱</span> Celular para WhatsApp <span class="required-star">*</span>
                </label>
                <div class="phone-input-wrapper">
                  <span class="country-prefix">🇨🇴 +57</span>
                  <input type="tel" id="user-phone" class="premium-input-v2 phone-input" placeholder="312 884 6263" autocomplete="tel" required>
                </div>
                <p class="input-helper-text">🔒 Te enviaremos el mensaje de confirmación y recordatorio a este número.</p>
              </div>
            </div>

            <!-- Resumen de Cita Compacto -->
            <div class="booking-receipt-compact">
              <div class="receipt-header-compact">
                <span>📋 Resumen de tu reserva</span>
              </div>
              <div class="receipt-grid-compact">
                <div class="receipt-item-compact">
                  <span class="label">Servicio</span>
                  <span class="value" id="summary-service">—</span>
                </div>
                <div class="receipt-item-compact">
                  <span class="label">Barbero</span>
                  <span class="value" id="summary-barber">—</span>
                </div>
                <div class="receipt-item-compact">
                  <span class="label">Fecha</span>
                  <span class="value" id="summary-date">—</span>
                </div>
                <div class="receipt-item-compact">
                  <span class="label">Hora</span>
                  <span class="value" id="summary-time">—</span>
                </div>
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
  juan:     { name: 'Juan Quintero',   startH: 10, endH: 22 },  // 10AM–10PM (última cita 9PM)
  fernando: { name: 'Fernando Carmona', startH: 13, endH: 22 }, // 1PM–10PM (última cita 9PM)
};

// Duration in minutes per service (estándar universal: 60 minutos)
const SERVICE_DURATIONS = {
  corte:              60,  // Corte de Cabello
  barba:              60,  // Barba Express
  barba_ritual:       60,  // Barba con Ritual
  facial:             60,  // Limpieza Facial Profunda
  corte_barba:        60,  // Corte + Barba
  corte_barba_ritual: 60,  // Corte + Barba con Ritual
  full_servicio:      60,  // Full servicio Furtivo
  plata:              60,  // Exp. Plata
  oro:                60,  // Exp. Oro
  diamante:           60,  // Exp. Diamante
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
      bookingData.duration    = 60; // Estándar universal: 60 minutos
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

  // ── Step 3: Date chips con filtrado de hora en Colombia (GMT-5) ──
  const dateContainer = document.getElementById('dateChipsContainer');
  const timeContainer = document.getElementById('timeChipsContainer');
  const timeLabel     = document.getElementById('time-label');

  // Hora exacta en Colombia
  const colNow = getColombiaNowDate();
  const currentColombiaMin = colNow.getHours() * 60 + colNow.getMinutes();
  const todayIsClosed = currentColombiaMin >= (21 * 60); // A las 9:00 PM arranca el último turno (cierra 10:00 PM)

  const DAY_NAMES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const MON_NAMES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  if (dateContainer) {
    dateContainer.innerHTML = '';

    for (let i = 0; i < 14; i++) {
      const d = new Date(colNow);
      d.setDate(d.getDate() + i);
      const chip = document.createElement('div');
      const isToday = (i === 0);
      const isClosedToday = isToday && todayIsClosed;

      chip.className = `date-chip ${isClosedToday ? 'date-chip--closed' : ''}`;
      chip.dataset.dateStr = `${DAY_NAMES[d.getDay()]} ${d.getDate()} ${MON_NAMES[d.getMonth()]}`;

      const dayLabel = isToday ? 'Hoy' : DAY_NAMES[d.getDay()];
      const subLabel = isClosedToday ? 'Cerrado' : MON_NAMES[d.getMonth()];

      chip.innerHTML = `
        <span class="date-chip-day">${dayLabel}</span>
        <span class="date-chip-num">${d.getDate()}</span>
        <span class="date-chip-month">${subLabel}</span>
      `;

      if (isClosedToday) {
        chip.setAttribute('title', 'La jornada de hoy ya culminó. Por favor selecciona otro día.');
      } else {
        chip.addEventListener('click', async () => {
          document.querySelectorAll('.date-chip').forEach(c => c.classList.remove('selected'));
          chip.classList.add('selected');
          bookingData.date = chip.dataset.dateStr;
          bookingData.time = null;
          await renderTimeChips(timeContainer, timeLabel);
          setNextBtn(false);
        });
      }

      dateContainer.appendChild(chip);
    }
  }

  // ── Step 4: Name + Phone con validación en tiempo real ──
  const nameInput  = document.getElementById('user-name');
  const phoneInput = document.getElementById('user-phone');

  function checkStep4() {
    const n = nameInput ? nameInput.value.trim() : '';
    const p = phoneInput ? phoneInput.value.trim().replace(/\D/g, '') : '';
    bookingData.name = n;
    bookingData.phone = p;

    const ok = n.length >= 3 && p.length >= 10;
    if (ok) {
      setNextBtn(true, 'Confirmar Cita ✂️');
    } else {
      setNextBtn(false, 'Ingresa tus datos');
    }
  }

  if (nameInput)  nameInput.addEventListener('input', checkStep4);
  if (phoneInput) phoneInput.addEventListener('input', checkStep4);

  // ── Navigation ────────────────────────────────────────────────
  document.getElementById('btn-next').addEventListener('click', () => {
    if (currentStep < 4) goToStep(currentStep + 1);
    else confirmBooking();
  });
  document.getElementById('btn-prev').addEventListener('click', () => {
    if (currentStep > 1) goToStep(currentStep - 1);
  });
}

// Generate time slots from barber schedule + Google Calendar live availability
async function renderTimeChips(container, labelEl) {
  container.innerHTML = '<p style="color:#888; font-size:0.85rem;">Consultando agenda en Google Calendar...</p>';
  labelEl.style.display = 'block';

  const schedule = BARBER_SCHEDULES[bookingData.barber];
  const duration = 60; // Todas las citas duran exactamente 1 hora

  if (!schedule) {
    container.innerHTML = '<p style="color:#555; font-size:0.85rem;">Selecciona un barbero primero.</p>';
    return;
  }

  let slotsToRender = [];
  let fetchedFromCalendar = false;

  // 1. Consultar disponibilidad en vivo desde Google Calendar (Cloud Function)
  try {
    const calUrl = `https://us-central1-furtivo1509.cloudfunctions.net/getDisponibilidad?barber=${encodeURIComponent(bookingData.barber)}&date=${encodeURIComponent(bookingData.date)}`;
    const resp = await fetch(calUrl);
    if (resp.ok) {
      const data = await resp.json();
      if (data.success && Array.isArray(data.allSlots) && data.allSlots.length > 0) {
        slotsToRender = data.allSlots;
        fetchedFromCalendar = true;
      } else if (data.success && Array.isArray(data.availableSlots)) {
        // Compatibilidad: construir a partir de availableSlots
        const availLabels = data.availableSlots.map(s => s.label);
        let currentMin = schedule.startH * 60;
        const lastStart = schedule.endH * 60 - duration;
        while (currentMin <= lastStart) {
          const h   = Math.floor(currentMin / 60);
          const m   = currentMin % 60;
          const ampm = h < 12 ? 'AM' : 'PM';
          const h12  = h > 12 ? h - 12 : (h === 0 ? 12 : h);
          const slotLabel = `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
          slotsToRender.push({
            label: slotLabel,
            totalMin: currentMin,
            available: availLabels.includes(slotLabel)
          });
          currentMin += duration;
        }
        fetchedFromCalendar = true;
      }
    }
  } catch (err) {
    console.warn("Fallo al consultar Google Calendar en vivo, usando respaldo Firestore:", err);
  }

  // 2. Si la Cloud Function no respondió, respaldo con Firestore
  if (!fetchedFromCalendar) {
    let bookedTimes = [];
    if (db && getDocs) {
      try {
        const q = query(
          collection(db, "citas"),
          where("barber", "==", bookingData.barber),
          where("date", "==", bookingData.date)
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          const d = doc.data();
          if (!d.cancelada && d.estado !== 'cancelada') {
            bookedTimes.push(d.time);
          }
        });
      } catch (e) {
        console.error("Error obteniendo citas en Firestore: ", e);
      }
    }

    let currentMin = schedule.startH * 60;
    const lastStart = schedule.endH * 60 - duration;
    while (currentMin <= lastStart) {
      const h   = Math.floor(currentMin / 60);
      const m   = currentMin % 60;
      const ampm = h < 12 ? 'AM' : 'PM';
      const h12  = h > 12 ? h - 12 : (h === 0 ? 12 : h);
      const slotLabel = `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
      
      slotsToRender.push({
        label: slotLabel,
        totalMin: currentMin,
        available: !bookedTimes.includes(slotLabel)
      });
      currentMin += duration;
    }
  }

  container.innerHTML = '';

  if (slotsToRender.length === 0) {
    container.innerHTML = '<p style="color:#888; font-size:0.85rem;">No hay horarios configurados para este día.</p>';
    return;
  }

  slotsToRender.forEach(({ label: slotLabel, totalMin, available }) => {
    const chip = document.createElement('div');
    chip.className = `time-chip ${available ? '' : 'disabled is-busy'}`;
    chip.innerText = slotLabel;
    
    if (available) {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.time-chip').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        bookingData.time = slotLabel;
        setNextBtn(true);
      });
    } else {
      chip.setAttribute('title', 'Horario ocupado en Google Calendar');
    }
    container.appendChild(chip);
  });
}

function getColombiaNowDate() {
  const now = new Date();
  const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utcMs - (5 * 60 * 60 * 1000));
}

function setNextBtn(enabled, label = 'Siguiente') {
  const btn = document.getElementById('btn-next');
  if (!btn) return;
  btn.disabled = !enabled;
  btn.style.opacity = enabled ? '1' : '0.45';
  btn.style.pointerEvents = enabled ? 'auto' : 'none';
  btn.innerText = label;
}

function updateSummary() {
  const sServ = document.getElementById('summary-service');
  const sBarb = document.getElementById('summary-barber');
  const sDate = document.getElementById('summary-date');
  const sTime = document.getElementById('summary-time');

  if (sServ) sServ.innerText = bookingData.serviceName || '—';
  if (sBarb) sBarb.innerText = bookingData.barberName  || '—';
  if (sDate) sDate.innerText = bookingData.date        || '—';
  if (sTime) {
    sTime.innerText = bookingData.time ? `${bookingData.time} (1h)` : '—';
  }
}

async function confirmBooking() {
  const btn = document.getElementById('btn-next');
  btn.innerText = 'Procesando tu cita...';
  btn.disabled  = true;

  try {
    // Limpiar y formatear celular para asegurar Colombia +57
    let cleanPhone = String(bookingData.phone || '').replace(/\D/g, '');
    if (cleanPhone.length === 10 && cleanPhone.startsWith('3')) {
      cleanPhone = '57' + cleanPhone;
    }

    if (db && addDoc) {
      await addDoc(collection(db, "citas"), {
        service: bookingData.service,
        serviceName: bookingData.serviceName,
        duration: 60, // Estándar universal: 1 hora
        barber: bookingData.barber,
        barberName: bookingData.barberName,
        date: bookingData.date,
        time: bookingData.time,
        name: bookingData.name,
        phone: cleanPhone,
        createdAt: new Date().toISOString()
      });
    }
    
    goToStep('success');
  } catch (e) {
    console.error("Error al guardar la cita: ", e);
    alert("Hubo un error al procesar tu cita. Por favor intenta de nuevo.");
    btn.innerText = 'Confirmar Cita ✂️';
    btn.disabled = false;
  }
}

function goToStep(stepNum) {
  document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('active'));
  const footer   = document.getElementById('wizardFooter');
  const btnPrev  = document.getElementById('btn-prev');
  const timeline = document.getElementById('wizardTimeline');

  if (stepNum === 'success') {
    document.getElementById('step-success').classList.add('active');
    if (timeline) timeline.style.display = 'none';
    if (footer) footer.innerHTML = `<button class="btn btn--primary" id="btn-finish" style="flex:1;">Finalizar</button>`;
    const bf = document.getElementById('btn-finish');
    if (bf) bf.addEventListener('click', closeBookingModal);
    return;
  }

  currentStep = stepNum;
  const targetStep = document.getElementById(`step-${stepNum}`);
  if (targetStep) targetStep.classList.add('active');
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

  // Paso 3: Horarios
  if (stepNum === 3) {
    bookingData.date = null;
    bookingData.time = null;
    document.querySelectorAll('.date-chip').forEach(c => c.classList.remove('selected'));
    document.querySelectorAll('.time-chip').forEach(c => c.classList.remove('selected'));
    const tc = document.getElementById('timeChipsContainer');
    const tl = document.getElementById('time-label');
    if (tl) tl.style.display = 'none';
    if (tc) tc.innerHTML = '';
    setNextBtn(false);

    // Auto-seleccionar primer día hábil abierto (si hoy ya cerró, selecciona mañana)
    const firstOpenChip = document.querySelector('.date-chip:not(.date-chip--closed)');
    if (firstOpenChip) {
      setTimeout(() => firstOpenChip.click(), 120);
    }
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

    // Scroll al inicio del formulario para máxima visibilidad
    const scrollArea = document.querySelector('.booking-modal-scroll');
    if (scrollArea) scrollArea.scrollTop = 0;

    // Auto-enfoque al campo de nombre
    setTimeout(() => {
      if (ni && !ni.value) ni.focus();
    }, 180);

    const n = ni ? ni.value.trim() : '';
    const p = pi ? pi.value.trim().replace(/\D/g, '') : '';
    const ok = n.length >= 3 && p.length >= 10;
    if (ok) {
      setNextBtn(true, 'Confirmar Cita');
    } else {
      setNextBtn(false, 'Ingresa tus datos');
    }
  }
}

// ─── Control Universal de Reservas (Redirección a reservar.html) ───
window.openBookingModal = function(param1 = null, param2 = null) {
  const isReservarPage = window.location.pathname.endsWith('reservar.html') || window.location.pathname.endsWith('reservar');

  // Si estamos en cualquier otra página de la web (index, barberos, servicios, etc.),
  // redirigimos a la página canónica y perfecta reservar.html con los parámetros limpios.
  if (!isReservarPage) {
    let url = 'reservar.html';
    const params = new URLSearchParams();

    let preService = null;
    let preBarber  = null;

    if (typeof param1 === 'object' && param1 !== null) {
      preService = param1.service || null;
      preBarber  = param1.barber  || null;
    } else if (typeof param1 === 'string' && ['fernando', 'juan', 'cualquiera'].includes(param1.toLowerCase())) {
      preBarber  = param1.toLowerCase();
      preService = param2;
    } else {
      preService = param1;
      preBarber  = param2 ? param2.toLowerCase() : null;
    }

    if (preService) params.set('service', preService);
    if (preBarber)  params.set('barber', preBarber);

    const qs = params.toString();
    window.location.href = qs ? `${url}?${qs}` : url;
    return;
  }

  // Si ya estamos en reservar.html, reiniciamos el wizard al paso 1
  currentStep = 1;
  bookingData.service = bookingData.serviceName = bookingData.duration = null;
  bookingData.barber  = bookingData.barberName  = null;
  bookingData.date    = bookingData.time = null;
  bookingData.name    = bookingData.phone = null;
  goToStep(1);
};

window.closeBookingModal = function() {
  window.location.href = 'index.html';
};
