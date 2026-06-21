/**
 * receptionist_staff.js
 * Salon ERP · Receptionist → Staff Management
 *
 * Responsibilities:
 *  - Live search / filter debounce on name + ID inputs
 *  - Auto-submit form on Enter key
 *  - Preserve search params across pagination links
 *  - Stat card count-up animation on page load
 */

(function () {
  'use strict';

  /* ── DOM refs ─────────────────────────────────────────── */
  const searchForm    = document.querySelector('.sm-search-form');
  const nameInput     = document.getElementById('search_name');
  const idInput       = document.getElementById('search_staff_id');
  const statValues    = document.querySelectorAll('.sm-stat-card__value');

  /* ── Utility: debounce ────────────────────────────────── */
  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  /* ── Count-up animation for stat numbers ─────────────── */
  function animateCountUp(el) {
    const target = parseInt(el.textContent.trim(), 10);
    if (isNaN(target) || target === 0) return;

    const duration   = 700;
    const frameRate  = 30;
    const totalSteps = Math.ceil((duration / 1000) * frameRate);
    let   step       = 0;

    el.textContent = '0';

    const interval = setInterval(() => {
      step++;
      const progress = step / totalSteps;
      // ease-out quad
      const eased    = 1 - Math.pow(1 - progress, 2);
      el.textContent = Math.round(target * eased).toString();

      if (step >= totalSteps) {
        clearInterval(interval);
        el.textContent = target.toString();
      }
    }, 1000 / frameRate);
  }

  function initCountUpAnimations() {
    if (!statValues.length) return;

    // Use IntersectionObserver so animation fires when visible
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCountUp(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    statValues.forEach(el => observer.observe(el));
  }

  /* ── Preserve current search params in pagination ──────── */
  function bindPaginationParams() {
    const paginationLinks = document.querySelectorAll(
      '.sm-pagination__btn:not(.sm-pagination__btn--disabled), .sm-pagination__page:not(.sm-pagination__page--active)'
    );

    const currentParams = new URLSearchParams(window.location.search);
    const searchName    = currentParams.get('search_name')    || '';
    const searchStaffId = currentParams.get('search_staff_id') || '';

    paginationLinks.forEach(link => {
      if (link.tagName.toLowerCase() !== 'a') return;
      const url    = new URL(link.href, window.location.origin);
      const params = url.searchParams;

      if (searchName)    params.set('search_name',     searchName);
      if (searchStaffId) params.set('search_staff_id', searchStaffId);

      link.href = url.toString();
    });
  }

  /* ── Submit form on Enter in any input ──────────────────── */
  function bindEnterSubmit() {
    [nameInput, idInput].forEach(input => {
      if (!input) return;
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (searchForm) searchForm.submit();
        }
      });
    });
  }

  /* ── Trim whitespace before form submit ─────────────────── */
  function bindFormTrim() {
    if (!searchForm) return;
    searchForm.addEventListener('submit', function () {
      [nameInput, idInput].forEach(input => {
        if (input) input.value = input.value.trim();
      });
    });
  }

  /* ── Focus: highlight search icon colour ────────────────── */
  function bindFieldFocusEffects() {
    document.querySelectorAll('.sm-field-group__input').forEach(input => {
      const icon = input.closest('.sm-field-group__input-wrap')
                        ?.querySelector('.sm-field-group__icon');
      if (!icon) return;

      input.addEventListener('focus', () => {
        icon.style.color = 'var(--sm-accent-slate)';
        icon.style.transition = 'color 0.2s';
      });
      input.addEventListener('blur', () => {
        icon.style.color = '';
      });
    });
  }

  /* ── Init ─────────────────────────────────────────────── */
  function init() {
    initCountUpAnimations();
    bindPaginationParams();
    bindEnterSubmit();
    bindFormTrim();
    bindFieldFocusEffects();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();