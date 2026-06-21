(function () {
  'use strict';

  /* ─ State ─ */
  let currentRow = null;

  /* ─── Filter Logic ─── */
  const searchEl = document.getElementById('apptSearch');
  const statusEl = document.getElementById('apptStatusFilter');
  const dateEl = document.getElementById('apptDateFilter');
  const resetBtn = document.getElementById('apptResetBtn');
  const countEl = document.getElementById('apptCount');
  const emptyEl = document.getElementById('apptEmpty');
  const paginEl = document.getElementById('apptPagination');
  const paginInfo = document.getElementById('apptPaginationInfo');

  function applyFilters() {
    const q = (searchEl.value || '').toLowerCase().trim();
    const status = (statusEl.value || '');
    const date = (dateEl.value || '');

    const rows = document.querySelectorAll('#apptTableBody .appt-row');
    let visible = 0;

    rows.forEach(row => {
      const customer = (row.dataset.customer || '').toLowerCase();
      const phone = (row.dataset.phone || '').toLowerCase();
      const id = (row.dataset.id || '').toLowerCase();
      const rowStatus = (row.dataset.status || '');
      const rowDate = (row.dataset.date || '').toLowerCase();

      const matchQ = !q || customer.includes(q) || phone.includes(q) || id.includes(q);
      const matchStatus = !status || rowStatus === status;
      const matchDate = !date || rowDate.includes(date);

      const show = matchQ && matchStatus && matchDate;
      row.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    const total = rows.length;
    countEl.textContent = visible + ' record' + (visible !== 1 ? 's' : '');
    paginInfo.textContent = 'Showing 1–' + visible + ' of ' + total + ' appointments';

    if (visible === 0) {
      emptyEl.classList.add('is-visible');
      paginEl.style.display = 'none';
    } else {
      emptyEl.classList.remove('is-visible');
      paginEl.style.display = '';
    }

    syncMobileCards();
  }

  searchEl.addEventListener('input', applyFilters);
  statusEl.addEventListener('change', applyFilters);
  dateEl.addEventListener('change', applyFilters);

  resetBtn.addEventListener('click', function () {
    searchEl.value = '';
    statusEl.value = '';
    dateEl.value = '';
    applyFilters();
  });

  /* ─── Mobile Cards Sync ─── */
  function syncMobileCards() {
    const cardList = document.getElementById('apptCardList');
    if (!cardList) return;
    cardList.innerHTML = '';

    const rows = document.querySelectorAll('#apptTableBody .appt-row');
    rows.forEach(row => {
      if (row.style.display === 'none') return;
      const card = document.createElement('div');
      card.className = 'appt-appt-card';

      const statusMap = {
        SCHEDULED: 'Pending',
        CONFIRMED: 'Confirmed',
        IN_PROGRESS: 'In Progress',
        COMPLETED: 'Completed',
        CANCELLED: 'Cancelled'
      };

      const statusLabel = {
        SCHEDULED: 'Scheduled',
        CONFIRMED: 'Confirmed',
        IN_PROGRESS: 'In Progress',
        COMPLETED: 'Completed',
        CANCELLED: 'Cancelled'
      };

      const s = row.dataset.status || '';
      card.innerHTML = `
        <div class="appt-appt-card__top">
          <div class="appt-customer">
            <div class="appt-avatar">${(row.dataset.customer || '??').slice(0, 2).toUpperCase()}</div>
            <div>
              <div class="appt-customer__name">${row.dataset.customer || '—'}</div>
              <div class="appt-customer__phone">${row.dataset.phone || '—'}</div>
            </div>
          </div>
          <span class="appt-badge ${statusMap[s] || ''}">${statusLabel[s] || s}</span>
        </div>
        <div class="appt-appt-card__meta">
          <div class="appt-appt-card__meta-item"><span class="appt-appt-card__meta-key">ID</span><span class="appt-appt-card__meta-val">#${row.dataset.id}</span></div>
          <div class="appt-appt-card__meta-item"><span class="appt-appt-card__meta-key">Service</span><span class="appt-appt-card__meta-val">${row.dataset.service}</span></div>
          <div class="appt-appt-card__meta-item"><span class="appt-appt-card__meta-key">Staff</span><span class="appt-appt-card__meta-val">${row.dataset.staff}</span></div>
          <div class="appt-appt-card__meta-item"><span class="appt-appt-card__meta-key">Date & Time</span><span class="appt-appt-card__meta-val">${row.dataset.date}, ${row.dataset.time}</span></div>
        </div>
        <div class="appt-actions">
          <button class="appt-btn-action appt-btn-view" type="button" onclick="apptOpenView(document.querySelector('[data-id=\\'${row.dataset.id}\\']'))">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            View
          </button>
          <button class="appt-btn-action appt-btn-edit" type="button" onclick="apptOpenEdit(document.querySelector('[data-id=\\'${row.dataset.id}\\']'))">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"/></svg>
            Edit
          </button>
        </div>
      `;
      cardList.appendChild(card);
    });
  }

  /* ─── Modal Helpers ─── */
  window.apptOpenView = function (row) {
    if (!row) return;
    currentRow = row;
    const d = row.dataset;

    document.getElementById('viewModalId').textContent = '#' + (d.id || '—');
    document.getElementById('view-customer').textContent = d.customer || '—';
    document.getElementById('view-phone').textContent = d.phone || '—';
    document.getElementById('view-service').textContent = d.service || '—';
    document.getElementById('view-staff').textContent = d.staff || '—';
    document.getElementById('view-date').textContent = d.date || '—';
    document.getElementById('view-time').textContent = d.time || '—';
    document.getElementById('view-notes').textContent = d.notes || 'No notes added.';

    const statusLabels = {
      SCHEDULED: 'Scheduled',
      CONFIRMED: 'Confirmed',
      IN_PROGRESS: 'In Progress',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled'
    };
    const statusEl2 = document.getElementById('view-status');
    statusEl2.innerHTML = '';
    const badge = document.createElement('span');
    badge.className = 'appt-badge appt-badge--' + (d.status || '');
    badge.textContent = statusLabels[d.status] || d.status || '—';
    statusEl2.appendChild(badge);

    openModal('apptViewModal');
  };

  window.apptOpenEdit = function (row) {
    if (!row) return;
    currentRow = row;
    const d = row.dataset;

    document.getElementById('editModalId').textContent = '#' + (d.id || '—');
    document.getElementById('edit-customer').value = d.customer || '';
    document.getElementById('edit-phone').value = d.phone || '';
    document.getElementById('edit-status').value = d.status || 'pending';
    document.getElementById('edit-notes').value = d.notes || '';

    // Try to match staff select value
    const staffSel = document.getElementById('edit-staff');
    const staffVal = (d.staff || '').toLowerCase().replace(/\s/g, '');
    Array.from(staffSel.options).forEach(o => {
      if (o.text.toLowerCase().replace(/\s/g, '') === staffVal || o.value === staffVal) {
        staffSel.value = o.value;
      }
    });

    openModal('apptEditModal');
  };

  window.apptSwitchToEdit = function () {
    closeModal('apptViewModal');
    setTimeout(() => apptOpenEdit(currentRow), 200);
  };

  window.apptSaveEdit = function () {
    if (!currentRow) return;
    const newStatus = document.getElementById('edit-status').value;
    const newStaff = document.getElementById('edit-staff');
    const newNotes = document.getElementById('edit-notes').value;
    const staffText = newStaff.options[newStaff.selectedIndex].text;

    const appointmentID = currentRow.dataset.id;

    fetch('/manager/appointment/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        appointment_id: appointmentID,
        appointment_status: newStatus,
        staff_id: newStaff.value,
        notes: newNotes
      })
    })

      .then(response => response.json())
      .then(data => {

        if (data.success) {

          // Update row data
          currentRow.dataset.status = newStatus;
          currentRow.dataset.staff = staffText;
          currentRow.dataset.notes = newNotes;

          // Update badge
          const badge =
            currentRow.querySelector('.appt-badge');

          if (badge) {

            const labels = {
              SCHEDULED: 'Scheduled',
              CONFIRMED: 'Confirmed',
              IN_PROGRESS: 'In Progress',
              COMPLETED: 'Completed',
              CANCELLED: 'Cancelled'
            };

            badge.className =
              'appt-badge appt-badge--' +
              newStatus;

            badge.textContent =
              labels[newStatus] ||
              newStatus;
          }

          // Update staff cell
          const cells =
            currentRow.querySelectorAll('td');

          if (cells[3]) {
            cells[3].textContent =
              staffText;
          }

          syncMobileCards();
          closeModal('apptEditModal');

          alert('Appointment updated successfully!');
        }

        else {

          alert(
            data.message ||
            'Failed to update appointment.'
          );
        }
      })
      .catch(error => {

        console.error(error);

        alert(
          'Something went wrong.'
        );
      });

  };

  window.apptCloseModal = function (id) { closeModal(id); };

  function openModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    el.addEventListener('click', overlayClickClose);
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.opacity = '0';
    setTimeout(() => {
      el.classList.remove('is-open');
      el.style.opacity = '';
      document.body.style.overflow = '';
    }, 200);
    el.removeEventListener('click', overlayClickClose);
  }

  function overlayClickClose(e) {
    if (e.target === e.currentTarget) {
      closeModal(e.currentTarget.id);
    }
  }

  /* ─── Keyboard close ─── */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      ['apptViewModal', 'apptEditModal'].forEach(id => {
        const el = document.getElementById(id);
        if (el && el.classList.contains('is-open')) closeModal(id);
      });
    }
  });

  /* ─── Export button ─── */
  document.getElementById('apptExportBtn').addEventListener('click', function () {
    const rows = document.querySelectorAll('#apptTableBody .appt-row');
    let csv = 'ID,Customer,Phone,Service,Staff,Date,Time,Status\n';
    rows.forEach(row => {
      if (row.style.display !== 'none') {
        const d = row.dataset;
        csv += `"${d.id}","${d.customer}","${d.phone}","${d.service}","${d.staff}","${d.date}","${d.time}","${d.status}"\n`;
      }
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'appointments.csv'; a.click();
    URL.revokeObjectURL(url);
  });

  /* ─── Init mobile cards ─── */
  syncMobileCards();
  applyFilters();

})();