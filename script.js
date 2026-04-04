/* ═══════════════════════════════════════════════
   STEMPIA — script.js
   Handles: sticky header · mobile nav · scroll
            reveal · active nav link · stat
            counters · success carousel · alumni & achievements accordions · form validation
═══════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Helpers ── */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];


  /* ─────────────────────────────────────────
     STICKY HEADER
  ───────────────────────────────────────── */
  const header = $('#header');

  function tickHeader () {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }
  window.addEventListener('scroll', tickHeader, { passive: true });
  tickHeader();


  /* ─────────────────────────────────────────
     MOBILE NAV
  ───────────────────────────────────────── */
  const burger  = $('#hamburger');
  const nav     = $('#main-nav');

  function openNav () {
    nav.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeNav () {
    nav.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function toggleNav () {
    nav.classList.contains('open') ? closeNav() : openNav();
  }

  if (burger && nav) {
    burger.addEventListener('click', toggleNav);

    // Close when any nav link is tapped
    $$('a', nav).forEach(link => link.addEventListener('click', closeNav));

    // Close on outside click
    document.addEventListener('click', e => {
      if (nav.classList.contains('open') && !nav.contains(e.target) && !burger.contains(e.target)) {
        closeNav();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && nav.classList.contains('open')) closeNav();
    });
  }


  /* ─────────────────────────────────────────
     SCROLL REVEAL  (fade-up)
  ───────────────────────────────────────── */
  const revealEls = $$('.reveal');

  if ('IntersectionObserver' in window && revealEls.length) {
    const revealIO = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
    );
    revealEls.forEach(el => revealIO.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }


  /* ─────────────────────────────────────────
     ACTIVE NAV LINK  (highlight on scroll)
  ───────────────────────────────────────── */
  const sections  = $$('section[id]');
  const navLinks  = $$('.nav a');

  function updateActiveLink () {
    let current = '';
    sections.forEach(sec => {
      if (sec.getBoundingClientRect().top <= 90) current = sec.id;
    });
    navLinks.forEach(link => {
      const active = link.getAttribute('href') === '#' + current;
      link.classList.toggle('active', active);
    });
  }
  window.addEventListener('scroll', updateActiveLink, { passive: true });


  /* ─────────────────────────────────────────
     SMOOTH SCROLL  (account for fixed header)
  ───────────────────────────────────────── */
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href');
      if (id === '#' || id === '#!') return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      const offset = (header?.offsetHeight ?? 68) + 8;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: 'smooth'
      });
    });
  });


  /* ─────────────────────────────────────────
     STAT COUNTER ANIMATION
  ───────────────────────────────────────── */
  const statEls = $$('.stat-n[data-count]');

  function animateStat (el) {
    const target   = parseInt(el.dataset.count,  10);
    const suffix   = el.dataset.suffix ?? '';
    const duration = 1400;
    const start    = performance.now();

    function step (now) {
      const t = Math.min((now - start) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window && statEls.length) {
    const counterIO = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateStat(entry.target);
            counterIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    statEls.forEach(el => counterIO.observe(el));
  }


  /* ─────────────────────────────────────────
     CONTACT FORM
  ───────────────────────────────────────── */
  const form = $('#contact-form');

  if (form) {
    const requiredFields = $$('[required]', form);

    function markError (field) {
      field.style.borderColor = '#EF4444';
      field.style.boxShadow   = '0 0 0 3px rgba(239,68,68,0.12)';
    }
    function clearError (field) {
      field.style.borderColor = '';
      field.style.boxShadow   = '';
    }

    // Clear error styling on any input
    form.addEventListener('input',  e => clearError(e.target));
    form.addEventListener('change', e => clearError(e.target));

    form.addEventListener('submit', e => {
      e.preventDefault();

      let firstError = null;

      // Required field check
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          markError(field);
          if (!firstError) firstError = field;
        }
      });

      // Email format check
      const emailEl = $('#email', form);
      if (emailEl && emailEl.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim())) {
        markError(emailEl);
        if (!firstError) firstError = emailEl;
      }

      if (firstError) {
        firstError.focus();
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      /* ─ REPLACE: Wire up your form backend here ─
         Options: Formspree, Netlify Forms, EmailJS, your own API

         Example (Formspree):
         fetch('https://formspree.io/f/YOUR_ID', {
           method: 'POST',
           body: new FormData(form),
           headers: { Accept: 'application/json' }
         }).then(r => r.ok && showSuccess());
      ─────────────────────────────────────────── */

      // Placeholder success (remove once real backend is wired)
      showSuccess();
    });

    function showSuccess () {
      const submitBtn = $('[type="submit"]', form);
      submitBtn.textContent = 'Request Sent ✓';
      submitBtn.disabled    = true;
      submitBtn.style.background = '#16A34A';
      submitBtn.style.boxShadow  = '0 8px 28px rgba(22,163,74,0.28)';

      let msg = $('.form-success', form);
      if (!msg) {
        msg = document.createElement('p');
        msg.className = 'form-success';
        msg.textContent = "Thank you — we'll be in touch within one business day.";
        form.appendChild(msg);
      }
      msg.style.display = 'block';
      msg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }


  /* ─────────────────────────────────────────
     SUCCESS STORIES CAROUSEL
  ───────────────────────────────────────── */
  function initCarousel (carousel) {
    const wrap    = $('.sc-track-wrap', carousel);
    const track   = $('.sc-track',      carousel);
    const cards   = $$('.sc',           track);
    const prevBtn = $('.sc-btn-prev',   carousel);
    const nextBtn = $('.sc-btn-next',   carousel);
    const dotsWrap = $('.sc-dots',      carousel);
    const currEl  = $('.sc-curr',       carousel);
    const totalEl = $('.sc-total',      carousel);

    const GAP_PX = 24;   // keep in sync with CSS .sc-track gap
    let current  = 0;

    /* How many cards to show at once */
    function visible () {
      return window.innerWidth >= 1024 ? 3
           : window.innerWidth >= 600  ? 2
           : 1;
    }

    /* Width each card should occupy */
    function calcCardW () {
      const n = visible();
      return (wrap.offsetWidth - GAP_PX * (n - 1)) / n;
    }

    /* Furthest index we can slide to */
    function maxIdx () { return Math.max(0, cards.length - visible()); }

    /* Apply widths to every card */
    function applyWidths () {
      const w = calcCardW();
      cards.forEach(c => (c.style.width = w + 'px'));
    }

    /* Regenerate dot buttons */
    function buildDots () {
      const stops = maxIdx() + 1;
      if (totalEl) totalEl.textContent = cards.length;
      dotsWrap.innerHTML = '';
      for (let i = 0; i < stops; i++) {
        const d = document.createElement('button');
        d.className   = 'sc-dot' + (i === current ? ' active' : '');
        d.setAttribute('aria-label', `Go to slide ${i + 1}`);
        d.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(d);
      }
    }

    /* Sync all interactive elements to current index */
    function syncUI () {
      /* Slide the track */
      const offset = current * (calcCardW() + GAP_PX);
      track.style.transform = `translateX(-${offset}px)`;

      /* Counter */
      if (currEl) currEl.textContent = current + 1;

      /* Dots */
      $$('.sc-dot', dotsWrap).forEach((d, i) =>
        d.classList.toggle('active', i === current)
      );

      /* Buttons */
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current >= maxIdx();
    }

    /* Navigate to a specific index */
    function goTo (idx) {
      current = Math.max(0, Math.min(idx, maxIdx()));
      syncUI();
    }

    /* Button clicks */
    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    /* Keyboard (left/right arrows when carousel is focused) */
    carousel.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(current - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
    });

    /* Touch / swipe */
    let touchX = 0;
    wrap.addEventListener('touchstart', e => {
      touchX = e.touches[0].clientX;
    }, { passive: true });
    wrap.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 48) goTo(current + (dx < 0 ? 1 : -1));
    });

    /* Recalculate on resize (debounced) */
    let resizeT;
    window.addEventListener('resize', () => {
      clearTimeout(resizeT);
      resizeT = setTimeout(() => {
        applyWidths();
        buildDots();
        goTo(Math.min(current, maxIdx()));
      }, 140);
    });

    /* Boot */
    applyWidths();
    buildDots();
    syncUI();
  }

  $$('.sc-carousel').forEach(initCarousel);


  /* ─────────────────────────────────────────
     DISCLOSURE TOGGLES  (alumni · achievements by competition)
  ───────────────────────────────────────── */
  function bindDisclosureToggle (toggleSel, groupSel) {
    $$(toggleSel).forEach(toggle => {
      toggle.addEventListener('click', () => {
        const panelId = toggle.getAttribute('aria-controls');
        const panel   = document.getElementById(panelId);
        const group   = toggle.closest(groupSel);
        if (!panel || !group) return;

        const isOpen = toggle.getAttribute('aria-expanded') === 'true';

        toggle.setAttribute('aria-expanded', String(!isOpen));
        panel.classList.toggle('open', !isOpen);
        group.classList.toggle('is-open', !isOpen);
      });
    });
  }

  bindDisclosureToggle('.alm-toggle', '.alm-group');
  bindDisclosureToggle('.ach-comp-toggle', '.ach-comp-group');


  /* ─────────────────────────────────────────
     AUTO-UPDATE FOOTER COPYRIGHT YEAR
  ───────────────────────────────────────── */
  const yr = document.querySelector('.footer-bar p');
  if (yr) {
    yr.innerHTML = yr.innerHTML.replace(/\d{4}/, new Date().getFullYear());
  }

})();
