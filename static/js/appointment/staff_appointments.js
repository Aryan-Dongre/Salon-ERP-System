
(function () {
  'use strict';

  const grid        = document.getElementById('apptGrid');
  const noResults   = document.getElementById('apptNoResults');
  const filterTabs  = document.getElementById('apptFilterTabs');
  const searchInput = document.getElementById('apptSearch');

  if (!grid) return; // safety guard

  /* -------------------------------------------------------------------------
     State
     ------------------------------------------------------------------------- */
  let activeFilter = 'all';
  let searchQuery  = '';

  /* -------------------------------------------------------------------------
     Helper: get all appointment cards
     ------------------------------------------------------------------------- */
  function getCards() {
    return Array.from(grid.querySelectorAll('.appt-card'));
  }

  /* -------------------------------------------------------------------------
     Filtering Logic
     ------------------------------------------------------------------------- */
  function applyFilters() {
    const cards  = getCards();
    let visible  = 0;

    cards.forEach(function (card) {
      const status     = (card.dataset.status || '').toLowerCase();
      const searchData = (card.dataset.search || '').toLowerCase();

      const matchesFilter = activeFilter === 'all' || status === activeFilter.toLowerCase();
      const matchesSearch = searchQuery === '' || searchData.includes(searchQuery);

      if (matchesFilter && matchesSearch) {
        card.style.display = '';
        visible++;
      } else {
        card.style.display = 'none';
      }
    });

    // Show/hide no-results message
    if (noResults) {
      noResults.style.display = visible === 0 && cards.length > 0 ? 'block' : 'none';
    }
  }

  /* -------------------------------------------------------------------------
     Tab Filter Clicks
     ------------------------------------------------------------------------- */
  if (filterTabs) {
    filterTabs.addEventListener('click', function (e) {
      const tab = e.target.closest('.appt-filter-tab');
      if (!tab) return;

      // Update active class
      filterTabs.querySelectorAll('.appt-filter-tab').forEach(function (t) {
        t.classList.remove('active');
      });
      tab.classList.add('active');

      activeFilter = tab.dataset.filter || 'all';
      applyFilters();
    });
  }

  /* -------------------------------------------------------------------------
     Live Search
     ------------------------------------------------------------------------- */
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        searchQuery = searchInput.value.trim().toLowerCase();
        applyFilters();
      }, 180);
    });
  }

  /* -------------------------------------------------------------------------
     Mark Complete
     Expects Flask endpoint: POST /appointments/<id>/complete
     On success: updates card status badge, strip, and button.
     ------------------------------------------------------------------------- */
  window.markComplete = function (btn) {

    const url = btn.dataset.url;

    if (!url ||
        btn.classList.contains(
        'appt-btn--loading'
    )) return;

    btn.classList.add(
        'appt-btn--loading'
    );

    const originalHTML =
    btn.innerHTML;

    btn.innerHTML =
    'Updating...';

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type':
            'application/json'
        }
    })
    .then(res => res.json())
    .then(data => {

        if (!data.success) {
            throw new Error(
                data.message
            );
        }

        const card =
        btn.closest('.appt-card');

        card.dataset.status =
        'COMPLETED';

        const strip =
        card.querySelector(
            '.appt-card__strip'
        );

        strip.className =
        'appt-card__strip appt-card__strip--completed';

        const statusBadge =
        card.querySelector(
            '.appt-badge--status'
        );

        statusBadge.className =
        'appt-badge appt-badge--status appt-badge--completed';

        statusBadge.textContent =
        'COMPLETED';

        btn.outerHTML = `
        <span class="appt-btn appt-btn--done">
            ✓ Completed
        </span>
        `;

    })
    .catch(err => {

        console.error(err);

        btn.classList.remove(
            'appt-btn--loading'
        );

        btn.innerHTML =
        originalHTML;

        showToast(
            'Could not update appointment. Please try again.',
            'error'
        );
    });
};

  /* -------------------------------------------------------------------------
     Refresh summary chip counts based on current card data-status values
     ------------------------------------------------------------------------- */
  function refreshSummaryChips() {
    const cards    = getCards();
    const totChip  = document.querySelector('.appt-chip--total .appt-chip__count');
    const confChip = document.querySelector('.appt-chip--confirmed .appt-chip__count');
    const pendChip = document.querySelector('.appt-chip--pending .appt-chip__count');

    if (!totChip && !confChip && !pendChip) return;

    let total     = cards.length;
    let confirmed = 0;
    let pending   = 0;

    cards.forEach(function (c) {
      const s = (c.dataset.status || '').toLowerCase();
      if (s === 'confirmed') confirmed++;
      if (s === 'pending')   pending++;
    });

    if (totChip)  totChip.textContent  = total;
    if (confChip) confChip.textContent = confirmed;
    if (pendChip) pendChip.textContent = pending;
  }

  /* -------------------------------------------------------------------------
     CSRF Token helper (works with Flask-WTF)
     ------------------------------------------------------------------------- */
  function getCsrfToken() {
    // Try meta tag first (common Flask pattern)
    const meta = document.querySelector('meta[name="csrf-token"]');
    if (meta) return meta.getAttribute('content');

    // Fallback: try cookie
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const c = cookies[i].trim();
      if (c.startsWith('csrf_token=')) {
        return decodeURIComponent(c.substring('csrf_token='.length));
      }
    }
    return '';
  }

  /* -------------------------------------------------------------------------
     Lightweight toast notification
     (used for AJAX error feedback — no external lib needed)
     ------------------------------------------------------------------------- */
  function showToast(message, type) {
    type = type || 'info';

    // Remove any existing toast
    const existing = document.getElementById('appt-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'appt-toast';
    toast.textContent = message;
    Object.assign(toast.style, {
      position:     'fixed',
      bottom:       '28px',
      right:        '28px',
      padding:      '12px 20px',
      borderRadius: '10px',
      fontSize:     '0.85rem',
      fontWeight:   '500',
      fontFamily:   'inherit',
      boxShadow:    '0 8px 24px rgba(0,0,0,.18)',
      zIndex:       '9999',
      background:   type === 'error' ? '#ef4444' : '#2d2b28',
      color:        '#fff',
      transition:   'opacity 0.3s ease',
      opacity:      '0',
    });

    document.body.appendChild(toast);

    // Fade in
    requestAnimationFrame(function () {
      toast.style.opacity = '1';
    });

    // Fade out and remove
    setTimeout(function () {
      toast.style.opacity = '0';
      setTimeout(function () { toast.remove(); }, 350);
    }, 3200);
  }

  /* -------------------------------------------------------------------------
   Init
------------------------------------------------------------------------- */
applyFilters();

})();


/* ==========================
   View Appointment Details
========================== */

const modal =
document.getElementById("appointmentModal");

const closeModal =
document.getElementById("closeAppointmentModal");

document.querySelectorAll(".view-details-btn")
.forEach(button => {

    button.addEventListener("click",
    async function(e){

        e.preventDefault();

        const appointmentId =
        this.dataset.id;

        try {

            const response =
            await fetch(
            `/appointment/${appointmentId}/details`
            );

            const data =
            await response.json();

            if(!data.success){
                alert("Appointment not found");
                return;
            }

            const appointment =
            data.appointment;

            document.getElementById(
                "detailCustomer"
            ).textContent =
            appointment.customer_name;

            document.getElementById(
                "detailPhone"
            ).textContent =
            appointment.phone_number;

            document.getElementById(
                "detailDate"
            ).textContent =
            appointment.appointment_date;

            document.getElementById(
                "detailStartTime"
            ).textContent =
            appointment.start_time;

            document.getElementById(
                "detailEndTime"
            ).textContent =
            appointment.end_time;

            document.getElementById(
                "detailStatus"
            ).textContent =
            appointment.appointment_status;

            document.getElementById(
                "detailPayment"
            ).textContent =
            appointment.payment_status;

            document.getElementById(
                "detailService"
            ).textContent =
            appointment.service_name;

            document.getElementById(
                "detailStaff"
            ).textContent =
            appointment.staff_name;

            modal.classList.add("show");

        } catch(error){
            console.error(error);
        }
    });
});

closeModal.addEventListener(
"click", () => {
    modal.classList.remove("show");
});

modal.addEventListener(
"click", (e) => {

    if(e.target === modal){
        modal.classList.remove("show");
    }
});

