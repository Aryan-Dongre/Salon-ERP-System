/**
 * admin_appointment.js
 * Salon ERP – Admin Appointment Management
 * Vanilla JS – no framework dependency
 */

(function () {
  "use strict";

  /* ── DOM References ─────────────────────────────────────── */
  const searchInput     = document.getElementById("appointmentSearch");
  const searchClear     = document.getElementById("searchClear");
  const filterStatus    = document.getElementById("filterStatus");
  const filterPayment   = document.getElementById("filterPayment");
  const filterStaff     = document.getElementById("filterStaff");
  const clearFiltersBtn = document.getElementById("clearFilters");
  const tableBody       = document.getElementById("tableBody");
  const tableEmpty      = document.getElementById("tableEmpty");

  // View modal
  const viewModalOverlay  = document.getElementById("viewModalOverlay");
  const closeViewModalBtn = document.getElementById("closeViewModal");

  // Edit modal
  const editModalOverlay  = document.getElementById("editModalOverlay");
  const closeEditModalBtn = document.getElementById("closeEditModal");
  const cancelEditBtn     = document.getElementById("cancelEditBtn");
  const saveEditBtn       = document.getElementById("saveEditBtn");

  /* ── Helpers ─────────────────────────────────────────────── */

  /**
   * Read all <tr> rows from the table body.
   */
  function getAllRows() {
    return Array.from(tableBody.querySelectorAll(".apmt-table__row"));
  }

  /**
   * Normalise a string for comparison.
   */
  function norm(str) {
    return (str || "").toLowerCase().trim();
  }

  /* ── Search & Filter ─────────────────────────────────────── */

  function applyFilters() {

    const query = norm(searchInput.value);
    const status = norm(filterStatus.value);
    const payment = norm(filterPayment.value);
    const staff = norm(filterStaff.value);

    let visibleCount = 0;

    getAllRows().forEach((row) => {

        const rCustomer = norm(row.dataset.customer);
        const rService = norm(row.dataset.service);
        const rStaff = norm(row.dataset.staff);
        const rStatus = norm(row.dataset.status);
        const rPayment = norm(row.dataset.payment);
        const rPhone = norm(row.dataset.phone);

        // Search
        const matchesSearch =
            !query ||
            rCustomer.includes(query) ||
            rService.includes(query) ||
            rStaff.includes(query) ||
            rPhone.includes(query);

        // Status filter
        const matchesStatus =
            !status || rStatus === status;

        // Payment filter
        const matchesPayment =
            !payment || rPayment === payment;

        // Staff filter
        const matchesStaff =
            !staff || rStaff.includes(staff);

        const visible =
            matchesSearch &&
            matchesStatus &&
            matchesPayment &&
            matchesStaff;

        row.style.display = visible ? "table-row" : "none";

        if (visible) {
            visibleCount++;
        }

        // Debug
        console.log({
            selectedStaff: staff,
            rowStaff: rStaff,
            visible: visible
        });
    });

    // Empty state
    tableEmpty.style.display =
        visibleCount === 0
            ? "block"
            : "none";

     const appointmentTable =
    document.getElementById("appointmentTable");

    appointmentTable.style.display =
        visibleCount === 0
            ? "none"
            : "table";

    console.log({
        status,
        payment,
        staff,
        visibleCount
    });       
}

  /* ── Search Input Events ─────────────────────────────────── */

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      // Toggle clear button
      if (this.value.length > 0) {
        searchClear.classList.add("visible");
      } else {
        searchClear.classList.remove("visible");
      }
      applyFilters();
    });
  }

  if (searchClear) {
    searchClear.addEventListener("click", function () {
      searchInput.value = "";
      this.classList.remove("visible");
      applyFilters();
    });
  }

  /* ── Dropdown Filter Events ──────────────────────────────── */

  [filterStatus, filterPayment, filterStaff].forEach((el) => {
    if (el) el.addEventListener("change", applyFilters);
  });

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", function () {
      if (searchInput) searchInput.value = "";
      if (searchClear) searchClear.classList.remove("visible");
      if (filterStatus)  filterStatus.value  = "";
      if (filterPayment) filterPayment.value = "";
      if (filterStaff)   filterStaff.value   = "";
      applyFilters();
    });
  }

  /* ── Modal Helpers ───────────────────────────────────────── */

  function openModal(overlay) {
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
    // Focus trap: focus first focusable element
    const first = overlay.querySelector("button, input, select, [tabindex]");
    if (first) setTimeout(() => first.focus(), 50);
  }

  function closeModal(overlay) {
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  // Close modal when clicking on the backdrop
  [viewModalOverlay, editModalOverlay].forEach((overlay) => {
    if (!overlay) return;
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeModal(overlay);
    });
  });

  // Close on Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeModal(viewModalOverlay);
      closeModal(editModalOverlay);
    }
  });

  /* ── View Modal ──────────────────────────────────────────── */

  /**
   * Called from the View button onclick.
   * @param {HTMLElement} btn
   */
  window.openViewModal = function (btn) {
    const row = btn.closest(".apmt-table__row");
    if (!row) return;

    const d = row.dataset;

    // Populate fields
    setText("vm_customer", d.customer);
    setText("vm_phone",    d.phone);
    setText("vm_service",  d.service);
    setText("vm_staff",    d.staff);
    setText("vm_date",     d.date);
    setText("vm_time",     d.time + (d.end ? " – " + d.end : ""));
    setText("vm_amount",   d.amount ? "₹" + Number(d.amount).toLocaleString("en-IN") : "—");
    setText("vm_booking",  d.booking);
    setText("vm_id",       "A-" + (d.id || "—"));

    // Status badge in modal
    const statusEl = document.getElementById("vm_status");
    if (statusEl) {
      statusEl.innerHTML = `<span class="apmt-badge apmt-badge--${d.status}">${cap(d.status)}</span>`;
    }

    // Payment badge in modal
    const payEl = document.getElementById("vm_payment");
    if (payEl) {
      payEl.innerHTML = `<span class="apmt-badge apmt-badge--pay-${d.payment}">${cap(d.payment)}</span>`;
    }

    // Update modal subtitle
    setText("viewModalBookingId", "Booking ID: " + (d.booking || "—"));

    openModal(viewModalOverlay);
  };

  if (closeViewModalBtn) {
    closeViewModalBtn.addEventListener("click", () => closeModal(viewModalOverlay));
  }

  /* ── Edit Modal ──────────────────────────────────────────── */

  /**
   * Called from the Edit button onclick.
   * @param {HTMLElement} btn
   */
  window.openEditModal = function (btn) {
    const row = btn.closest(".apmt-table__row");
    if (!row) return;

    const d = row.dataset;

    // Populate form
    setVal("edit_apmt_id", d.id);
    setVal("edit_status",  d.status);
    setVal("edit_staff",   d.staff);

    // Dates / times need ISO format for input[type=date/time]
    const dateEl = document.getElementById("edit_date");
    if (dateEl && d.date) {
      // If the date comes from backend as YYYY-MM-DD use as-is;
      // demo rows may be "04 Jun 2025" — try to parse
      try {
        const parsed = new Date(d.date);
        if (!isNaN(parsed)) {
          dateEl.value = parsed.toISOString().split("T")[0];
        }
      } catch (_) { /* leave blank */ }
    }

    // Times: convert "10:00 AM" → "10:00"
    setTimeInput("edit_start", d.time);
    setTimeInput("edit_end",   d.end);

    // Update modal subtitle
    setText("editModalBookingId", "Booking ID: " + (d.booking || "—"));

    openModal(editModalOverlay);
  };

  if (closeEditModalBtn) {
    closeEditModalBtn.addEventListener("click", () => closeModal(editModalOverlay));
  }
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener("click", () => closeModal(editModalOverlay));
  }

  if (saveEditBtn) {
    saveEditBtn.addEventListener("click", function () {
      // In a real app, serialize the form and POST to the backend.
      // Here we update the table row in place and close the modal.
      const id       = getVal("edit_apmt_id");
      const newStatus = getVal("edit_status");
      const newStaff  = getVal("edit_staff");
      const newDate   = document.getElementById("edit_date")?.value;
      const newStart  = document.getElementById("edit_start")?.value;
      const newEnd    = document.getElementById("edit_end")?.value;

      // Find the row and update its data attributes + displayed cells
      const row = tableBody.querySelector(`[data-id="${id}"]`);
      if (row) {
        if (newStatus) {
          row.dataset.status = newStatus;
          const badge = row.querySelector(".apmt-badge:not([class*='pay'])");
          if (badge) {
            badge.className = `apmt-badge apmt-badge--${newStatus}`;
            badge.textContent = cap(newStatus);
          }
        }
        if (newStaff) {
          row.dataset.staff = newStaff;
          // Staff cell is the 3rd td
          const staffCell = row.querySelectorAll(".apmt-table__td")[2];
          if (staffCell) staffCell.textContent = newStaff;
        }
        if (newDate) {
          row.dataset.date = newDate;
          const dateSpan = row.querySelector(".apmt-date");
          if (dateSpan) {
            try {
              const d = new Date(newDate);
              dateSpan.textContent = d.toLocaleDateString("en-IN", {
                day: "2-digit", month: "short", year: "numeric"
              });
            } catch (_) { dateSpan.textContent = newDate; }
          }
        }
        if (newStart) {
          row.dataset.time = formatTime12(newStart);
          const timeSpan = row.querySelector(".apmt-time");
          if (timeSpan) timeSpan.textContent = formatTime12(newStart);
        }
        if (newEnd) {
          row.dataset.end = formatTime12(newEnd);
        }
      }

      closeModal(editModalOverlay);
    });
  }

  /* ── Utility Functions ───────────────────────────────────── */

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || "—";
  }

  function setVal(id, value) {
    const el = document.getElementById(id);
    if (!el || !value) return;
    el.value = value;
  }

  function getVal(id) {
    return document.getElementById(id)?.value || "";
  }

  function cap(str) {
    if (!str) return "—";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Set a time input value from a "10:00 AM" string.
   */
  function setTimeInput(id, timeStr) {
    const el = document.getElementById(id);
    if (!el || !timeStr) return;
    // Try parse "10:00 AM" → "10:00"
    try {
      const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (match) {
        let h = parseInt(match[1], 10);
        const m = match[2];
        const meridiem = match[3].toUpperCase();
        if (meridiem === "PM" && h !== 12) h += 12;
        if (meridiem === "AM" && h === 12) h = 0;
        el.value = String(h).padStart(2, "0") + ":" + m;
      } else {
        // Already HH:MM
        el.value = timeStr;
      }
    } catch (_) { /* ignore */ }
  }

  /**
   * Convert "14:30" → "02:30 PM"
   */
  function formatTime12(timeStr) {
    if (!timeStr) return "";
    try {
      const [h, m] = timeStr.split(":").map(Number);
      const meridiem = h >= 12 ? "PM" : "AM";
      const hour12 = h % 12 || 12;
      return String(hour12).padStart(2, "0") + ":" + String(m).padStart(2, "0") + " " + meridiem;
    } catch (_) {
      return timeStr;
    }
  }

  /* ── Export Button (stub) ────────────────────────────────── */

  const exportBtn = document.getElementById("exportBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", function () {
      // Collect visible rows and build CSV
      const rows = getAllRows().filter((r) => r.style.display !== "none");
      const headers = ["Customer", "Phone", "Service", "Staff", "Date", "Time", "Status", "Payment", "Amount"];
      const csvRows = [headers.join(",")];

      rows.forEach((row) => {
        const d = row.dataset;
        const line = [
          quote(d.customer), quote(d.phone), quote(d.service),
          quote(d.staff), quote(d.date), quote(d.time),
          quote(d.status), quote(d.payment), quote("₹" + d.amount),
        ].join(",");
        csvRows.push(line);
      });

      const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = "appointments_export.csv";
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  function quote(val) {
    return `"${(val || "").replace(/"/g, '""')}"`;
  }

  /* ── Init ────────────────────────────────────────────────── */
  applyFilters(); // Run once on load (all visible by default)

})();