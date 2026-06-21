/**
 * admin_customer.js
 * Customer Management Module — UI interactions only.
 * No backend calls, no API logic.
 */

(function () {
  'use strict';

  /* ── Element References ─────────────────────────────────── */
  const searchInput    = document.getElementById('js-searchInput');
  const statusFilter   = document.getElementById('js-statusFilter');
  const tableBody      = document.getElementById('js-tableBody');
  const emptyState     = document.getElementById('js-emptyState');
  const modalOverlay   = document.getElementById('js-modalOverlay');
  const closeModalBtn  = document.getElementById('js-closeModal');
  const closeModalFtr  = document.getElementById('js-closeModalFooter');
  const tableWrap      = document.querySelector('.cm-table-wrap');

  /* ── Modal field targets ────────────────────────────────── */
  const modalAvatar    = document.getElementById('js-modalAvatar');
  const modalName      = document.getElementById('js-modalName');
  const modalStatus    = document.getElementById('js-modalStatusBadge');
  const modalPhone     = document.getElementById('js-modalPhone');
  const modalEmail     = document.getElementById('js-modalEmail');
  const modalProvider  = document.getElementById('js-modalProvider');
  const modalLastVisit = document.getElementById('js-modalLastVisit');
  const modalJoined    = document.getElementById('js-modalJoined');

  /* ── Helpers ────────────────────────────────────────────── */

  /**
   * Return initials for the avatar from a full name.
   * @param {string} name
   * @returns {string}
   */
  function getInitials(name) {
    if (!name) return '?';
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(function (word) { return word[0].toUpperCase(); })
      .join('');
  }

  /**
   * Derive a repeatable avatar colour class from initials.
   * @param {string} initials
   * @returns {string}
   */
  function avatarClassFromInitials(initials) {
    var classes = ['a','b','c','d','e','f','g','h'];
    var idx = (initials.charCodeAt(0) + (initials.charCodeAt(1) || 0)) % classes.length;
    return 'cm-customer__avatar--' + classes[idx];
  }

  /**
   * Build a provider badge HTML string.
   * @param {string} provider - 'GOOGLE' | 'EMAIL'
   * @returns {string}
   */
  function providerBadgeHtml(provider) {
    var cls = provider === 'GOOGLE' ? 'cm-badge--google' : 'cm-badge--email';
    return '<span class="cm-badge ' + cls + '">' + provider + '</span>';
  }

  /**
   * Build a status badge HTML string.
   * @param {string} status - 'CLIENT' | 'REGISTERED'
   * @returns {string}
   */
  function statusBadgeHtml(status) {
    var cls = status === 'CLIENT' ? 'cm-badge--client' : 'cm-badge--registered';
    return '<span class="cm-badge ' + cls + '">' + status + '</span>';
  }

  /* ── Filter / Search ────────────────────────────────────── */

  /**
   * Reads current search + filter values and toggles row visibility.
   */
  function applyFilters() {
    if (!tableBody) return;

    var query   = searchInput  ? searchInput.value.trim().toLowerCase()  : '';
    var status  = statusFilter ? statusFilter.value                       : '';
    var rows    = tableBody.querySelectorAll('.cm-table__row');
    var visible = 0;

    rows.forEach(function (row) {
      var name      = (row.dataset.name    || '').toLowerCase();
      var email     = (row.dataset.email   || '').toLowerCase();
      var phone     = (row.dataset.phone   || '').toLowerCase();
      var rowStatus = (row.dataset.status  || '');

      var matchesSearch = !query ||
        name.includes(query)  ||
        email.includes(query) ||
        phone.includes(query);

      var matchesStatus = !status || rowStatus === status;

      if (matchesSearch && matchesStatus) {
        row.style.display = '';
        visible++;
      } else {
        row.style.display = 'none';
      }
    });

    /* Toggle empty state + table visibility */
    if (emptyState && tableWrap) {
      if (visible === 0) {
        emptyState.classList.add('is-visible');
        emptyState.setAttribute('aria-hidden', 'false');
        tableWrap.style.display = 'none';
      } else {
        emptyState.classList.remove('is-visible');
        emptyState.setAttribute('aria-hidden', 'true');
        tableWrap.style.display = '';
      }
    }
  }

  /* ── Modal ──────────────────────────────────────────────── */

  /**
   * Open the view modal and populate it from a table row's data attributes.
   * @param {HTMLElement} row
   */
  function openModal(row) {
    if (!modalOverlay) return;

    var name      = row.dataset.name      || '';
    var email     = row.dataset.email     || '';
    var phone     = row.dataset.phone     || '';
    var provider  = row.dataset.provider  || '';
    var status    = row.dataset.status    || '';
    var lastVisit = row.dataset.lastVisit || '';
    var joined    = row.dataset.joined    || '';
    var initials  = getInitials(name);

    /* Populate modal */
    if (modalAvatar) {
      modalAvatar.textContent = initials;
      /* Reset colour classes */
      modalAvatar.className = 'cm-modal__avatar';
      var colorClass = avatarClassFromInitials(initials)
        .replace('cm-customer__avatar--', '');
      /* Reuse the same gradient via a data attribute — handled in CSS */
      modalAvatar.dataset.color = colorClass;
      modalAvatar.style.background = avatarGradient(colorClass);
    }
    if (modalName)      { modalName.textContent = name; }
    if (modalStatus)    { modalStatus.outerHTML; /* replaced below */ }
    if (modalPhone)     { modalPhone.textContent = phone; }
    if (modalEmail)     { modalEmail.textContent = email; }
    if (modalLastVisit) { modalLastVisit.textContent = lastVisit; }
    if (modalJoined)    { modalJoined.textContent = joined; }

    /* Re-query after potential outerHTML swap */
    var statusEl = document.getElementById('js-modalStatusBadge');
    if (statusEl) {
      statusEl.className = 'cm-badge ' +
        (status === 'CLIENT' ? 'cm-badge--client' : 'cm-badge--registered');
      statusEl.textContent = status;
    }

    var providerEl = document.getElementById('js-modalProvider');
    if (providerEl) {
      providerEl.innerHTML = providerBadgeHtml(provider);
    }

    modalOverlay.classList.add('is-open');
    modalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    /* Focus the close button for accessibility */
    if (closeModalBtn) {
      setTimeout(function () { closeModalBtn.focus(); }, 100);
    }
  }

  /**
   * Returns a gradient string matching the avatar colour classes.
   * @param {string} letter - 'a' through 'h'
   * @returns {string}
   */
  function avatarGradient(letter) {
    var map = {
      a: 'linear-gradient(135deg,#2cb5a0,#1a8a78)',
      b: 'linear-gradient(135deg,#e07b8a,#c85a6a)',
      c: 'linear-gradient(135deg,#7c5cbf,#5b3fa6)',
      d: 'linear-gradient(135deg,#e89c30,#c7821a)',
      e: 'linear-gradient(135deg,#4fa3e0,#2b82c9)',
      f: 'linear-gradient(135deg,#e06b7b,#c44560)',
      g: 'linear-gradient(135deg,#56b87a,#3a9a5c)',
      h: 'linear-gradient(135deg,#a07cd4,#7b52b8)',
    };
    return map[letter] || map.c;
  }

  /**
   * Close the view modal.
   */
  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('is-open');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /* ── Event Binding ──────────────────────────────────────── */

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  if (statusFilter) {
    statusFilter.addEventListener('change', applyFilters);
  }

  /* View buttons — delegated from tbody */
  if (tableBody) {
    tableBody.addEventListener('click', function (e) {
      var btn = e.target.closest('.js-viewBtn');
      if (!btn) return;
      var row = btn.closest('.cm-table__row');
      if (row) openModal(row);
    });
  }

  /* Close modal — overlay click */
  if (modalOverlay) {
    modalOverlay.addEventListener('click', function (e) {
      if (e.target === modalOverlay) closeModal();
    });
  }

  if (closeModalBtn)  { closeModalBtn.addEventListener('click',  closeModal); }
  if (closeModalFtr)  { closeModalFtr.addEventListener('click',  closeModal); }

  /* Escape key closes modal */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

})();