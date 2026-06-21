/**
 * staff_dashboard.js
 * Salon ERP — Staff Dashboard
 * Lightweight UI interactions only. No API calls. No backend logic.
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════
     1. DOM READY GUARD
  ═══════════════════════════════════════════════════ */
  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  onReady(function () {
    initStatCounters();
    initCardTilt();
    initTableRowHighlight();
    initButtonRipple();
    setLiveGreeting();
  });

  /* ═══════════════════════════════════════════════════
     2. STAT COUNTER ANIMATION
     Animates stat card numbers from 0 to their target
  ═══════════════════════════════════════════════════ */
  function initStatCounters() {
    const counters = document.querySelectorAll('.stat-card__value[data-count]');

    if (!counters.length) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(function (el) {
      observer.observe(el);
    });
  }

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const duration = 900;
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(ease * target);
      el.textContent = current;
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(tick);
  }

  /* ═══════════════════════════════════════════════════
     3. SUBTLE CARD TILT ON HOVER
     Adds a very gentle 3D tilt to stat cards
  ═══════════════════════════════════════════════════ */
  function initCardTilt() {
    const cards = document.querySelectorAll('.stat-card');

    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const maxTilt = 6;
        const rotateX = ((y - cy) / cy) * -maxTilt;
        const rotateY = ((x - cx) / cx) * maxTilt;

        card.style.transform =
          'translateY(-4px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
        card.style.transition = 'transform 0.1s ease';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
        card.style.transition = 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)';
      });
    });
  }

  /* ═══════════════════════════════════════════════════
     4. TABLE ROW HIGHLIGHT
     Adds a smooth left-border accent on hover
  ═══════════════════════════════════════════════════ */
  function initTableRowHighlight() {
    const rows = document.querySelectorAll('.table-row');

    rows.forEach(function (row) {
      row.style.borderLeft = '3px solid transparent';
      row.style.transition = 'background 0.25s ease, border-left-color 0.25s ease';

      row.addEventListener('mouseenter', function () {
        row.style.borderLeftColor = '#C8A27A';
      });
      row.addEventListener('mouseleave', function () {
        row.style.borderLeftColor = 'transparent';
      });
    });
  }

  /* ═══════════════════════════════════════════════════
     5. BUTTON RIPPLE EFFECT
     Creates a ripple on quick action button clicks
  ═══════════════════════════════════════════════════ */
  function initButtonRipple() {
    const buttons = document.querySelectorAll('.action-btn');

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        const existing = btn.querySelector('.ripple-circle');
        if (existing) existing.remove();

        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const size = Math.max(rect.width, rect.height) * 2;

        const ripple = document.createElement('span');
        ripple.classList.add('ripple-circle');
        ripple.style.cssText = [
          'position: absolute',
          'width: ' + size + 'px',
          'height: ' + size + 'px',
          'top: ' + (y - size / 2) + 'px',
          'left: ' + (x - size / 2) + 'px',
          'background: rgba(255,255,255,0.25)',
          'border-radius: 50%',
          'transform: scale(0)',
          'animation: rippleAnim 0.55s ease-out forwards',
          'pointer-events: none',
          'z-index: 0'
        ].join(';');

        btn.appendChild(ripple);

        // Inject keyframes once
        if (!document.getElementById('ripple-styles')) {
          const style = document.createElement('style');
          style.id = 'ripple-styles';
          style.textContent =
            '@keyframes rippleAnim { to { transform: scale(1); opacity: 0; } }';
          document.head.appendChild(style);
        }

        setTimeout(function () { ripple.remove(); }, 600);
      });
    });
  }

  /* ═══════════════════════════════════════════════════
     6. LIVE GREETING LABEL
     Adjusts "Good Morning/Afternoon/Evening" by time
  ═══════════════════════════════════════════════════ */
  function setLiveGreeting() {
    const label = document.querySelector('.welcome-label');
    if (!label) return;

    const hour = new Date().getHours();
    let greeting;

    if (hour >= 5 && hour < 12) {
      greeting = 'Good Morning';
    } else if (hour >= 12 && hour < 17) {
      greeting = 'Good Afternoon';
    } else if (hour >= 17 && hour < 21) {
      greeting = 'Good Evening';
    } else {
      greeting = 'Good Night';
    }

    label.textContent = greeting;
  }

})();