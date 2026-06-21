(function () {
  "use strict";

  /* ==========================================================
     DOM REFERENCES
  ========================================================== */
  const DOM = {
    btnToday: document.getElementById("btnTodayAppointments"),
    btnUpcoming: document.getElementById("btnUpcomingAppointments"),
    btnRefresh: document.getElementById("btnRefresh"),

    searchInput: document.getElementById("raSearchInput"),
    searchClear: document.getElementById("raSearchClear"),

    filterStatus: document.getElementById("filterStatus"),
    filterDate: document.getElementById("filterDate"),
    filterCustomDate: document.getElementById("filterCustomDate"),
    customDateWrap: document.getElementById("customDateWrap"),
    filterStaff: document.getElementById("filterStaff"),

    btnResetFilters: document.getElementById("btnResetFilters"),
    btnEmptyReset: document.getElementById("btnEmptyReset"),

    filterTags: document.getElementById("raFilterTags"),

    resultsCount: document.getElementById("raResultsCount"),
    appointmentsGrid: document.getElementById("raAppointmentsGrid"),
    emptyState: document.getElementById("raEmptyState"),

    btnCardView: document.getElementById("btnCardView"),
    btnListView: document.getElementById("btnListView"),

    viewModal: document.getElementById("raViewModal"),
    modalClose: document.getElementById("raModalClose"),
    modalCloseFoot: document.getElementById("raModalCloseFoot"),
    modalBody: document.getElementById("raModalBody"),
  };

  /* ==========================================================
     INIT
  ========================================================== */
  function init() {
    bindHeaderButtons();
    bindSearch();
    bindFilters();
    bindViewToggle();
    bindCardActions();
    bindModal();

    filterAppointments();
  }

  /* ==========================================================
     HEADER BUTTONS
  ========================================================== */
  function bindHeaderButtons() {
    DOM.btnToday?.addEventListener("click", () => {
      DOM.filterDate.value = "today";
      filterAppointments();
    });

    DOM.btnUpcoming?.addEventListener("click", () => {
      DOM.filterDate.value = "this_week";
      filterAppointments();
    });

    DOM.btnRefresh?.addEventListener("click", () => {
      location.reload();
    });
  }

  /* ==========================================================
     SEARCH
  ========================================================== */
  function bindSearch() {
    DOM.searchInput?.addEventListener("input", () => {
      updateFilterTags();
      filterAppointments();
    });

    DOM.searchClear?.addEventListener("click", () => {
      DOM.searchInput.value = "";
      updateFilterTags();
      filterAppointments();
    });
  }

  /* ==========================================================
     FILTERS
  ========================================================== */
  function bindFilters() {

    DOM.filterStatus?.addEventListener("change", () => {
      updateFilterTags();
      filterAppointments();
    });

    DOM.filterStaff?.addEventListener("change", () => {
      updateFilterTags();
      filterAppointments();
    });

    DOM.filterDate?.addEventListener("change", function () {

      toggleCustomDatePicker(
        this.value === "custom"
      );

      updateFilterTags();
      filterAppointments();
    });

    DOM.filterCustomDate?.addEventListener(
      "change",
      () => {
        filterAppointments();
      }
    );

    [DOM.btnResetFilters, DOM.btnEmptyReset]
      .forEach(btn => {
        btn?.addEventListener(
          "click",
          resetAllFilters
        );
      });
  }

  function toggleCustomDatePicker(show) {
    if (!DOM.customDateWrap) return;

    DOM.customDateWrap.style.display =
      show ? "flex" : "none";
  }

  function resetAllFilters() {

    DOM.searchInput.value = "";
    DOM.filterStatus.value = "";
    DOM.filterDate.value = "";
    DOM.filterCustomDate.value = "";
    DOM.filterStaff.value = "";

    toggleCustomDatePicker(false);

    updateFilterTags();
    filterAppointments();
  }

  /* ==========================================================
     FILTER TAGS
  ========================================================== */
  function updateFilterTags() {

    if (!DOM.filterTags) return;

    const tags = [];

    if (DOM.searchInput.value.trim()) {
      tags.push(
        `Search: ${DOM.searchInput.value}`
      );
    }

    if (DOM.filterStatus.value) {
      tags.push(
        `Status: ${
          DOM.filterStatus.options[
            DOM.filterStatus.selectedIndex
          ].text
        }`
      );
    }

    if (DOM.filterStaff.value) {
      tags.push(
        `Staff: ${
          DOM.filterStaff.options[
            DOM.filterStaff.selectedIndex
          ].text
        }`
      );
    }

    if (DOM.filterDate.value) {
      tags.push(
        `Date: ${
          DOM.filterDate.options[
            DOM.filterDate.selectedIndex
          ].text
        }`
      );
    }

    DOM.filterTags.innerHTML =
      tags
        .map(tag =>
          `<span class="ra-filter-tag">${tag}</span>`
        )
        .join("");
  }

  /* ==========================================================
     FILTER APPOINTMENTS
  ========================================================== */
  function filterAppointments() {

    const searchValue =
      DOM.searchInput.value
        .trim()
        .toLowerCase();

    const statusValue =
      DOM.filterStatus.value
        .trim()
        .toLowerCase();

    const staffValue =
      DOM.filterStaff.value
        .trim()
        .toLowerCase();

    const dateValue =
      DOM.filterDate.value;

    const customDate =
      DOM.filterCustomDate.value;

    const cards =
      document.querySelectorAll(
        ".ra-appt-card"
      );

    let visibleCount = 0;

    const today = new Date();
    today.setHours(0,0,0,0);

    cards.forEach(card => {

      const name =
        card.dataset.name || "";

      const phone =
        card.dataset.phone || "";

      const service =
        card.dataset.service || "";

      const status =
        card.dataset.status || "";

      const staff =
        card.dataset.staff || "";

      const cardDate =
        card.dataset.date || "";

      const id =
        card.dataset.id || "";

      /* SEARCH */
      const matchesSearch =
        !searchValue ||
        name.includes(searchValue) ||
        phone.includes(searchValue) ||
        service.includes(searchValue) ||
        id.includes(searchValue);

      /* STATUS */
      const matchesStatus =
        !statusValue ||
        status === statusValue;

      /* STAFF */
      const matchesStaff =
        !staffValue ||
        staff === staffValue;

      /* DATE */
      let matchesDate = true;

      const appointmentDate =
        new Date(cardDate);

      appointmentDate.setHours(0,0,0,0);

      if (dateValue === "today") {

        matchesDate =
          appointmentDate.getTime() ===
          today.getTime();
      }

      else if (
        dateValue === "tomorrow"
      ) {

        const tomorrow =
          new Date(today);

        tomorrow.setDate(
          tomorrow.getDate() + 1
        );

        matchesDate =
          appointmentDate.getTime() ===
          tomorrow.getTime();
      }

      else if (
        dateValue === "this_week"
      ) {

        const diff =
          (
            appointmentDate -
            today
          ) /
          (1000 * 60 * 60 * 24);

        matchesDate =
          diff >= 0 &&
          diff <= 7;
      }

      else if (
        dateValue === "custom"
      ) {

        matchesDate =
          !customDate ||
          cardDate === customDate;
      }

      const shouldShow =
        matchesSearch &&
        matchesStatus &&
        matchesStaff &&
        matchesDate;

      card.style.display =
        shouldShow
          ? ""
          : "none";

      if (shouldShow) {
        visibleCount++;
      }
    });

    DOM.resultsCount.innerHTML =
      `Showing <strong>${visibleCount}</strong> appointments`;

    showEmptyState(
      visibleCount === 0
    );
  }

  /* ==========================================================
     VIEW TOGGLE
  ========================================================== */
  function bindViewToggle() {

    DOM.btnCardView?.addEventListener(
      "click",
      () => {
        DOM.appointmentsGrid.classList.remove(
          "ra-list-view"
        );
      }
    );

    DOM.btnListView?.addEventListener(
      "click",
      () => {
        DOM.appointmentsGrid.classList.add(
          "ra-list-view"
        );
      }
    );
  }

  /* ==========================================================
     CARD ACTIONS
  ========================================================== */
  function bindCardActions() {

    DOM.appointmentsGrid?.addEventListener(
      "click",
      function (e) {

        const btn =
          e.target.closest(
            ".ra-action-btn"
          );

        if (!btn || btn.disabled)
          return;

        const apptId =
          btn.dataset.id;

        if (
          btn.classList.contains(
            "ra-action-view"
          )
        ) {
          onViewDetails(apptId);
        }

        else if (
          btn.classList.contains(
            "ra-action-confirm"
          )
        ) {
          updateStatus(
            apptId,
            "IN_PROGRESS",
            "Appointment confirmed"
          );
        }

        else if (
          btn.classList.contains(
            "ra-action-complete"
          )
        ) {
          updateStatus(
            apptId,
            "COMPLETED",
            "Appointment completed"
          );
        }

        else if (
          btn.classList.contains(
            "ra-action-cancel"
          )
        ) {
          updateStatus(
            apptId,
            "CANCELLED",
            "Appointment cancelled"
          );
        }
      }
    );
  }

  /* ==========================================================
     VIEW DETAILS
  ========================================================== */
  async function onViewDetails(apptId) {

    try {

      const response =
        await fetch(
          `/receptionist/appointment/${apptId}`
        );

      const data =
        await response.json();

      if (!data.success) {
        alert(data.message);
        return;
      }

      const appointment =
        data.appointment;

      DOM.modalBody.innerHTML = `
        <p><strong>Name:</strong> ${appointment.customer_name}</p>
        <p><strong>Phone:</strong> ${appointment.phone_number}</p>
        <p><strong>Service:</strong> ${appointment.service_name}</p>
        <p><strong>Staff:</strong> ${appointment.staff_name}</p>
        <p><strong>Date:</strong> ${appointment.appointment_date}</p>
        <p><strong>Time:</strong> ${appointment.start_time}</p>
        <p><strong>Status:</strong> ${appointment.appointment_status}</p>
        <p><strong>Payment:</strong> ${appointment.payment_status}</p>
      `;

      openModal();

    } catch (error) {
      console.error(error);
      alert("Error loading details");
    }
  }

  /* ==========================================================
     UPDATE STATUS
  ========================================================== */
  async function updateStatus(
    apptId,
    status,
    message
  ) {

    try {

      const response =
        await fetch(
          "/receptionist/appointment/update-status",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body: JSON.stringify({
              appointment_id:
                apptId,
              appointment_status:
                status
            })
          }
        );

      const data =
        await response.json();

      if (data.success) {
        alert(message);
        location.reload();
      } else {
        alert(data.message);
      }

    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  }

  /* ==========================================================
     MODAL
  ========================================================== */
  function bindModal() {

    DOM.modalClose?.addEventListener(
      "click",
      closeModal
    );

    DOM.modalCloseFoot?.addEventListener(
      "click",
      closeModal
    );
  }

  function openModal() {
    DOM.viewModal.style.display =
      "flex";
  }

  function closeModal() {
    DOM.viewModal.style.display =
      "none";
  }

  /* ==========================================================
     EMPTY STATE
  ========================================================== */
  function showEmptyState(show) {

    DOM.emptyState.style.display =
      show ? "flex" : "none";
  }

  document.addEventListener(
    "DOMContentLoaded",
    init
  );

})();