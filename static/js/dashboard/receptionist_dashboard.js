/**
 * receptionist-dashboard.js
 * Salon ERP System — Receptionist Dashboard
 * Features: live clock, counter animation, table filter,
 *           refresh button, notification bell, toast notifications
 */

(function () {
  "use strict";

  /* ─────────────────────────────────────────────
     1. LIVE DATE / TIME — subtitle
  ───────────────────────────────────────────── */
  function updateClock() {
    const el = document.getElementById("rcp-live-date");
    if (!el) return;

    const now = new Date();
    const date = now.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const time = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    el.innerHTML = `${date} &bull; ${time}`;
  }

  updateClock();
  setInterval(updateClock, 60_000);

  /* ─────────────────────────────────────────────
     2. STAT CARD COUNTER ANIMATION
  ───────────────────────────────────────────── */
  function animateCounter(el) {
    const target   = parseInt(el.getAttribute("data-target") || el.textContent.replace(/[^0-9]/g, ""), 10);
    const prefix   = el.getAttribute("data-prefix") || "";
    const format   = el.getAttribute("data-format");  // "indian" | null
    if (isNaN(target) || target === 0) return;

    const duration = 900;
    const steps    = 45;
    let   step     = 0;

    const interval = setInterval(() => {
      step++;
      const current = Math.round(target * (step / steps));
      el.textContent = prefix + (format === "indian"
        ? current.toLocaleString("en-IN")
        : current);

      if (step >= steps) {
        el.textContent = prefix + (format === "indian"
          ? target.toLocaleString("en-IN")
          : target);
        clearInterval(interval);
      }
    }, duration / steps);
  }

  // Observe stat values entering viewport
  const statValues = document.querySelectorAll(".rcp-stat__value");

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    statValues.forEach((el) => io.observe(el));
  } else {
    statValues.forEach(animateCounter);
  }

  /* ─────────────────────────────────────────────
     3. TABLE FILTER PILLS
  ───────────────────────────────────────────── */
  const pills     = document.querySelectorAll(".rcp-pill");
  const tableRows = document.querySelectorAll("#rcpAppointmentTable tbody tr");
  const emptyAppt = document.getElementById("rcpEmptyAppts");

  pills.forEach((pill) => {
    pill.addEventListener("click", function () {
      // Update active pill
      pills.forEach((p) => p.classList.remove("rcp-pill--active"));
      this.classList.add("rcp-pill--active");

      const filter = this.getAttribute("data-filter");
      let visible  = 0;

      tableRows.forEach((row) => {
        const status = row.getAttribute("data-status");
        const show   = filter === "all" || status === filter;
        row.style.display = show ? "" : "none";
        if (show) visible++;
      });

      // Empty state
      if (emptyAppt) {
        emptyAppt.classList.toggle("d-none", visible > 0);
      }

      if (filter !== "all") {
        showToast(`Filtered: ${capitalise(filter)}`, "info");
      }
    });
  });

  /* ─────────────────────────────────────────────
     4. REFRESH TABLE BUTTON
  ───────────────────────────────────────────── */
  const refreshBtn = document.getElementById("rcpRefreshTable");

  if (refreshBtn) {
    refreshBtn.addEventListener("click", function () {
      const icon  = this.querySelector("i");
      this.disabled = true;

      icon.style.transition = "transform 0.55s ease";
      icon.style.transform  = "rotate(360deg)";

      setTimeout(() => {
        icon.style.transition = "none";
        icon.style.transform  = "";
        this.disabled = false;

        // ── Wire your AJAX call here ──────────────
        // fetch("/receptionist/api/appointments-today")
        //   .then(r => r.json())
        //   .then(data => renderAppointments(data))
        //   .catch(err => console.error(err));
        // ─────────────────────────────────────────

        showToast("Schedule refreshed", "success");
      }, 700);
    });
  }

  /* ─────────────────────────────────────────────
     5. NOTIFICATION BELL
  ───────────────────────────────────────────── */
  const notifBtn = document.getElementById("rcpNotifBtn");
  let   notifOpen = false;

  if (notifBtn) {
    notifBtn.addEventListener("click", function () {
      notifOpen = !notifOpen;
      if (notifOpen) {
        showToast("No new notifications", "info");
        // Remove dot once seen
        const dot = notifBtn.querySelector(".rcp-notif-dot");
        if (dot) dot.style.display = "none";
      }
    });
  }

  /* ─────────────────────────────────────────────
     6. ACTION BUTTONS — view / edit feedback
  ───────────────────────────────────────────── */
  document.addEventListener("click", function (e) {
    const btn = e.target.closest(".rcp-action-btn");
    if (!btn) return;

    // Prevent default only if href is "#" (demo state)
    if (btn.getAttribute("href") === "#") {
      e.preventDefault();
      const isView = btn.classList.contains("rcp-action-btn--view");
      showToast(isView ? "Opening appointment details…" : "Opening edit form…", "info");
    }
  });

  /* ─────────────────────────────────────────────
     7. QUICK ACTION BUTTONS — keyboard nav
  ───────────────────────────────────────────── */
  document.querySelectorAll(".rcp-quick-btn").forEach((btn) => {
    if (btn.getAttribute("href") === "#") {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        showToast("Opening " + (btn.querySelector(".rcp-quick__label")?.textContent || "section") + "…", "info");
      });
    }
  });

  /* ─────────────────────────────────────────────
     8. EMPTY STATE INIT CHECK
  ───────────────────────────────────────────── */
  (function checkEmptyState() {
    if (!tableRows.length && emptyAppt) {
      emptyAppt.classList.remove("d-none");
    }
  })();

  /* ─────────────────────────────────────────────
     9. WINDOW RESIZE — table scroll reflow
  ───────────────────────────────────────────── */
  let resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const wrap = document.querySelector(".table-responsive");
      if (!wrap) return;
      wrap.style.overflow = "hidden";
      requestAnimationFrame(() => { wrap.style.overflow = ""; });
    }, 150);
  });

  /* ─────────────────────────────────────────────
     10. TOAST NOTIFICATION HELPER
  ───────────────────────────────────────────── */
  const TOAST_COLOURS = {
    success: "#16a34a",
    info:    "#2563eb",
    warning: "#d97706",
    error:   "#dc2626",
  };

  function showToast(message, type) {
    type = type || "info";

    const old = document.getElementById("rcpToast");
    if (old) old.remove();

    const toast = document.createElement("div");
    toast.id = "rcpToast";
    Object.assign(toast.style, {
      position:    "fixed",
      bottom:      "1.5rem",
      right:       "1.5rem",
      background:  TOAST_COLOURS[type] || TOAST_COLOURS.info,
      color:       "#fff",
      fontSize:    ".82rem",
      fontWeight:  "600",
      padding:     ".6rem 1.1rem",
      borderRadius:".65rem",
      boxShadow:   "0 4px 20px rgba(0,0,0,.18)",
      zIndex:      "9999",
      opacity:     "0",
      transform:   "translateY(8px)",
      transition:  "opacity .22s ease, transform .22s ease",
      pointerEvents:"none",
      maxWidth:    "280px",
    });
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity   = "1";
      toast.style.transform = "translateY(0)";
    });

    setTimeout(() => {
      toast.style.opacity   = "0";
      toast.style.transform = "translateY(8px)";
      setTimeout(() => toast.remove(), 300);
    }, 2600);
  }

  /* ─────────────────────────────────────────────
     UTILITY
  ───────────────────────────────────────────── */
  function capitalise(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

})();