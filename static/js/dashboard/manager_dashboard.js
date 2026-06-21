/**
 * manager-dashboard.js
 * Salon ERP System — Manager Dashboard
 * Handles: refresh, live clock, table filter, stat counter animation
 */

(function () {
  "use strict";

  /* ─────────────────────────────────────────
     1. LIVE DATE/TIME in page subtitle
  ───────────────────────────────────────── */
  function updateClock() {
    const el = document.querySelector(".page-subtitle");
    if (!el) return;

    const now = new Date();
    const opts = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const dateStr = now.toLocaleDateString("en-IN", opts);
    const timeStr = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    el.innerHTML = `<i class="bi bi-calendar3 me-1"></i>${dateStr} &bull; ${timeStr}`;
  }

  updateClock();
  setInterval(updateClock, 60 * 1000); // refresh every minute

  /* ─────────────────────────────────────────
     2. STAT CARD COUNTER ANIMATION
  ───────────────────────────────────────── */
  function animateCounter(el) {
    const rawText = el.textContent.trim();

    // Extract numeric part (handles "₹18,450", "9", etc.)
    const prefix = rawText.startsWith("₹") ? "₹" : "";
    const numericStr = rawText.replace(/[^0-9]/g, "");
    const target = parseInt(numericStr, 10);

    if (isNaN(target) || target === 0) return;

    const duration = 900;       // ms
    const steps = 40;
    const stepDuration = duration / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.round(target * (step / steps));
      if (step >= steps) {
        current = target;
        clearInterval(timer);
      }
      // Re-format with commas if original had them
      const formatted = rawText.includes(",")
        ? current.toLocaleString("en-IN")
        : current;
      el.textContent = prefix + formatted;
    }, stepDuration);
  }

  // Trigger counters when stat cards enter viewport
  const statValues = document.querySelectorAll(".stat-card__value");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    statValues.forEach((el) => observer.observe(el));
  } else {
    // Fallback: animate immediately
    statValues.forEach(animateCounter);
  }

  /* ─────────────────────────────────────────
     3. REFRESH SCHEDULE BUTTON
  ───────────────────────────────────────── */
  const refreshBtn = document.getElementById("refreshSchedule");

  if (refreshBtn) {
    refreshBtn.addEventListener("click", function () {
      const icon = this.querySelector("i");

      // Visual spin
      icon.style.transition = "transform 0.5s ease";
      icon.style.transform = "rotate(360deg)";

      this.disabled = true;

      setTimeout(() => {
        icon.style.transform = "rotate(0deg)";
        icon.style.transition = "none";
        this.disabled = false;

        // In a real app you would fetch updated rows via AJAX here.
        // Example skeleton:
        // fetch("/manager/api/schedule-today")
        //   .then(r => r.json())
        //   .then(data => renderSchedule(data))
        //   .catch(err => console.error("Schedule refresh failed:", err));

        showToast("Schedule refreshed", "success");
      }, 700);
    });
  }

  /* ─────────────────────────────────────────
     4. STATUS BADGE CLICK  — toggle filter
  ───────────────────────────────────────── */
  let activeFilter = null;

  document.addEventListener("click", function (e) {
    const badge = e.target.closest(".status-badge");
    if (!badge) return;

    const rows = document.querySelectorAll("#scheduleTable tbody tr");
    if (!rows.length) return;

    // Detect which status was clicked
    const status = [...badge.classList]
      .find((c) => c.startsWith("status-") && c !== "status-badge")
      ?.replace("status-", "");

    if (!status) return;

    if (activeFilter === status) {
      // Clear filter
      activeFilter = null;
      rows.forEach((r) => (r.style.display = ""));
      showToast("Filter cleared", "info");
    } else {
      activeFilter = status;
      rows.forEach((r) => {
        const rowBadge = r.querySelector(".status-badge");
        const rowStatus = rowBadge
          ? [...rowBadge.classList]
              .find((c) => c.startsWith("status-") && c !== "status-badge")
              ?.replace("status-", "")
          : null;
        r.style.display = rowStatus === status ? "" : "none";
      });
      showToast(`Showing: ${status}`, "info");
    }
  });

  /* ─────────────────────────────────────────
     5. MINI TOAST NOTIFICATION
  ───────────────────────────────────────── */
  function showToast(message, type) {
    type = type || "info";

    // Colour map
    const colours = {
      success: "#16a34a",
      info:    "#2563eb",
      warning: "#d97706",
      error:   "#dc2626",
    };

    // Remove existing toast
    const existing = document.getElementById("mgrToast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "mgrToast";
    toast.style.cssText = `
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      background: ${colours[type] || colours.info};
      color: #fff;
      font-size: .82rem;
      font-weight: 600;
      padding: .6rem 1.1rem;
      border-radius: .65rem;
      box-shadow: 0 4px 20px rgba(0,0,0,.18);
      z-index: 9999;
      opacity: 0;
      transform: translateY(8px);
      transition: opacity .22s ease, transform .22s ease;
      pointer-events: none;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger entrance
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    });

    // Auto-dismiss
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(8px)";
      setTimeout(() => toast.remove(), 300);
    }, 2400);
  }

  /* ─────────────────────────────────────────
     6. QUICK ACTION BUTTONS — keyboard nav
  ───────────────────────────────────────── */
  document.querySelectorAll(".quick-action-btn").forEach((btn) => {
    btn.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.click();
      }
    });
    // Add tabindex if not an anchor
    if (!btn.hasAttribute("href")) {
      btn.setAttribute("tabindex", "0");
      btn.setAttribute("role", "button");
    }
  });

  /* ─────────────────────────────────────────
     7. WINDOW RESIZE — reflow guard
     (keeps table scroll tidy on orientation change)
  ───────────────────────────────────────── */
  let resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      const tableWrap = document.querySelector(".table-responsive");
      if (!tableWrap) return;
      // Force repaint to fix occasional scroll-width glitch on mobile
      tableWrap.style.overflow = "hidden";
      requestAnimationFrame(() => {
        tableWrap.style.overflow = "";
      });
    }, 150);
  });

})();