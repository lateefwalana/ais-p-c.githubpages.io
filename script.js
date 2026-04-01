/* ============================================================
   APEX IRISHSTACK — script.js
   All JavaScript: theme, slider, nav, form, animations
============================================================ */

'use strict';

/* ============================================================
   1. THEME MANAGEMENT (Dark / Light)
============================================================ */
(function initTheme() {
  const saved = localStorage.getItem('apexTheme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
})();

document.addEventListener('DOMContentLoaded', function () {

  const themeToggle = document.getElementById('themeToggle');

  themeToggle.addEventListener('click', function () {
    const html    = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('apexTheme', next);
  });


  /* ============================================================
     2. NAVBAR — Scroll blur + active link highlighting
  ============================================================ */
  const navbar   = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', function () {
    // Blur navbar on scroll
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Highlight active nav link
    let current = '';
    sections.forEach(function (section) {
      const top = section.offsetTop - 90;
      if (window.scrollY >= top) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }, { passive: true });


  /* ============================================================
     3. HAMBURGER MENU
  ============================================================ */
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  hamburger.addEventListener('click', function () {
    const isOpen = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.setAttribute('aria-hidden',  String(!isOpen));
  });

  // Close mobile menu when a link is clicked
  document.querySelectorAll('.mobile-link').forEach(function (link) {
    link.addEventListener('click', function () {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    });
  });

  // Close mobile menu on outside click
  document.addEventListener('click', function (e) {
    if (!navbar.contains(e.target)) {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    }
  });


  /* ============================================================
     4. BRAND LOGO SLIDER — Duplicate track for infinite loop
        + pause on hover
  ============================================================ */
  const sliderTrack = document.getElementById('sliderTrack');

  if (sliderTrack) {
    // Clone all slides and append for seamless loop
    const origSlides = Array.from(sliderTrack.children);
    origSlides.forEach(function (slide) {
      const clone = slide.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      sliderTrack.appendChild(clone);
    });

    // Handle logo load errors — replace with monogram
    document.querySelectorAll('.brand-slide img').forEach(function (img) {
      img.addEventListener('error', function () {
        const slide    = img.closest('.brand-slide');
        const brand    = slide.getAttribute('data-brand') || 'X';
        const initial  = brand.charAt(0).toUpperCase();
        img.style.display = 'none';

        // Create monogram div if not already present
        if (!slide.querySelector('.mono-fallback')) {
          const mono    = document.createElement('div');
          mono.className = 'mono-fallback';
          mono.setAttribute('aria-hidden', 'true');
          mono.style.cssText = [
            'width:48px', 'height:48px', 'border-radius:8px',
            'background:rgba(249,115,22,0.15)',
            'border:1px solid rgba(249,115,22,0.3)',
            'display:flex', 'align-items:center', 'justify-content:center',
            'font-family:\'Barlow Condensed\',sans-serif',
            'font-weight:900', 'font-size:22px', 'color:#F97316'
          ].join(';');
          mono.textContent = initial;
          img.parentNode.insertBefore(mono, img.nextSibling);
        }
      });
    });
  }


  /* ============================================================
     5. INTERSECTION OBSERVER — Scroll-triggered fade-in-up
  ============================================================ */
  const animateObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        animateObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.animate-on-scroll').forEach(function (el) {
    animateObserver.observe(el);
  });


  /* ============================================================
     6. STAT COUNTER ANIMATION (count-up)
  ============================================================ */
  const statNumbers = document.querySelectorAll('.stat-number');

  const counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(function (el) {
    counterObserver.observe(el);
  });

  function animateCounter(el) {
    const target   = parseInt(el.getAttribute('data-target'), 10);
    const suffix   = el.getAttribute('data-suffix') || '';
    const duration = 1800;
    const startTime = performance.now();

    function tick(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = Math.floor(eased * target);
      el.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target + suffix;
      }
    }

    requestAnimationFrame(tick);
  }


  /* ============================================================
     7. QUOTE FORM — Dynamic Brand Dropdown
  ============================================================ */
  const categoryBrands = {
    'Air Compressors': [
      'Atlas Copco', 'Ingersoll Rand', 'Sullair', 'Doosan', 'Quincy'
    ],
    'Diesel Engines': [
      'Kubota', 'CAT', 'Deutz', 'Cummins', 'Volvo Penta', 'MTU', 'Perkins'
    ],
    'Electric': [
      'ABB', 'Siemens', 'Schneider Electric', 'Eaton'
    ],
    'Pneumatic, Power & Hand Tools': [
      'Chicago Pneumatic', 'Ingersoll Rand', 'DeWalt', 'Proto',
      'Stanley Tools', 'Facom', 'Atlas Copco (Jack Hammers & Breakers)',
      'Bosch', 'Makita', 'Knipex'
    ],
    'Testing Instruments': [
      'Argus', 'Fluke', 'Kyoritsu', 'Sumitomo'
    ],
    'Kitchen Equipment': [
      'E.G.O', 'Beha Hedo', 'Bertos'
    ],
    'Mining Equipment': [
      'Epiroc', 'Komatsu', 'LiuGong', 'Caterpillar'
    ],
    'Bearings': [
      'Timken', 'SKF'
    ],
    'Hydraulics': [
      'Enerpac', 'Parker'
    ],
    'Pumps': [
      'Sandpiper', 'Graco', 'ARO', 'Worthington',
      'Pacific Pumps', 'Wilo', 'Grundfos'
    ],
    'Power Transmission': [
      'V-Belts (Gates)', 'KTR Couplings', 'Mechanical Seals'
    ]
  };

  const categorySelect = document.getElementById('category');
  const brandSelect    = document.getElementById('brand');

  categorySelect.addEventListener('change', function () {
    const selected = this.value;
    brandSelect.innerHTML = '';
    brandSelect.disabled  = true;

    if (!selected || !categoryBrands[selected]) {
      const opt    = document.createElement('option');
      opt.value    = '';
      opt.textContent = 'Select category first…';
      brandSelect.appendChild(opt);
      return;
    }

    const placeholder     = document.createElement('option');
    placeholder.value     = '';
    placeholder.textContent = 'Select brand…';
    brandSelect.appendChild(placeholder);

    categoryBrands[selected].forEach(function (brand) {
      const opt       = document.createElement('option');
      opt.value       = brand;
      opt.textContent = brand;
      brandSelect.appendChild(opt);
    });

    brandSelect.disabled = false;
  });


  /* ============================================================
     8. QUOTE FORM — Validation & Submission
  ============================================================ */
  const quoteForm    = document.getElementById('quoteForm');
  const formSuccess  = document.getElementById('formSuccess');
  const resetFormBtn = document.getElementById('resetFormBtn');
  const successEmail = document.getElementById('successEmail');

  if (quoteForm) {
    // Blur validation
    quoteForm.querySelectorAll('input[required], select[required], textarea[required]').forEach(function (field) {
      field.addEventListener('blur', function () {
        validateField(field);
      });
    });

    quoteForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Validate all required fields
      let valid = true;
      quoteForm.querySelectorAll('input[required], select[required], textarea[required]').forEach(function (field) {
        if (!validateField(field)) {
          valid = false;
        }
      });

      if (!valid) return;

      // Show loading state
      const submitBtn = document.getElementById('submitBtn');
      submitBtn.disabled  = true;
      submitBtn.textContent = 'Sending…';

      // Submit via FormSubmit
      const formData = new FormData(quoteForm);

      fetch(quoteForm.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      })
      .then(function (res) {
        if (res.ok || res.status === 200 || res.redirected) {
          showSuccess();
        } else {
          // Fallback: submit normally
          quoteForm.submit();
        }
      })
      .catch(function () {
        // Network error: submit normally so formsubmit.co handles it
        quoteForm.submit();
      });
    });

    function validateField(field) {
      const errorEl = field.parentElement.querySelector('.field-error');
      let msg = '';

      if (field.required && !field.value.trim()) {
        msg = 'This field is required.';
      } else if (field.type === 'email' && field.value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.value.trim())) {
          msg = 'Please enter a valid email address.';
        }
      }

      if (msg) {
        field.classList.add('error');
        if (errorEl) errorEl.textContent = msg;
        return false;
      } else {
        field.classList.remove('error');
        if (errorEl) errorEl.textContent = '';
        return true;
      }
    }

    function showSuccess() {
      const emailVal = document.getElementById('email').value;
      if (successEmail) successEmail.textContent = emailVal;
      quoteForm.hidden   = true;
      formSuccess.hidden = false;

      // Scroll success into view
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    if (resetFormBtn) {
      resetFormBtn.addEventListener('click', function () {
        quoteForm.reset();
        brandSelect.innerHTML = '<option value="">Select category first…</option>';
        brandSelect.disabled  = true;
        quoteForm.querySelectorAll('.error').forEach(function (f) {
          f.classList.remove('error');
        });
        quoteForm.querySelectorAll('.field-error').forEach(function (e) {
          e.textContent = '';
        });

        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
          Send Quote Request
        `;

        quoteForm.hidden   = false;
        formSuccess.hidden = true;
      });
    }
  }


  /* ============================================================
     9. SMOOTH SCROLL for all anchor links
  ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 76; // navbar height
        const top    = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });


  /* ============================================================
     10. FLOATING WHATSAPP BUTTON — appear after 3 seconds
  ============================================================ */
  const waFloat = document.getElementById('waFloat');

  setTimeout(function () {
    if (waFloat) waFloat.classList.add('visible');
  }, 3000);

}); // end DOMContentLoaded
