/* ============================================================
   FURTIVO BARBERÍA — Script Principal
   Animaciones GSAP, Smart Navbar, Smooth Scroll, Swiper
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Register GSAP Plugins ──
  gsap.registerPlugin(ScrollTrigger);

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
  document.querySelectorAll('.section-label').forEach((label) => {
    ScrollTrigger.create({
      trigger: label,
      start: 'top 90%',
      onEnter: () => label.classList.add('is-visible'),
    });
  });

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

  // ── Swiper Reviews Carousel ──
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
