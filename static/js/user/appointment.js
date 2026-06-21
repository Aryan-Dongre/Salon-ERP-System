(function () {
  'use strict';

  /* DOM REFERENCES */
  const slotGrid = document.getElementById('slotGrid');
  const selectedTimeEl = document.getElementById('selectedTime');

  const totalAmountEl = document.getElementById('totalAmount');
  const breakdownSub = document.getElementById('breakdownSubtotal');
  const breakdownTotal = document.getElementById('breakdownTotal');

  const confirmBtn = document.getElementById('confirmBtn');
  const hintEl = document.getElementById('apptHint');

  const servicesWrapper = document.getElementById('selectedServices');
  const appointmentForm = document.getElementById('appointmentForm');


  /* RECALCULATE TOTAL */
  function recalcTotal() {

    let sum = 0;

    document
      .querySelectorAll(
        '#selectedServices .appt-service'
      )
      .forEach(function (service) {

        sum += parseFloat(
          service.dataset.price
        ) || 0;

      });

    const display = sum.toFixed(0);

    if (totalAmountEl) {
      totalAmountEl.textContent = display;
    }

    if (breakdownSub) {
      breakdownSub.textContent = display;
    }

    if (breakdownTotal) {
      breakdownTotal.textContent = display;
    }

    return sum;
  }


  /* VALIDATE FORM STATE */
  function validateForm() {

    const hasService =
      document.querySelectorAll(
        '#selectedServices .appt-service'
      ).length > 0;

    const hasTime =
      selectedTimeEl &&
      selectedTimeEl.value !== '';

    const isReady =
      hasService && hasTime;

    if (confirmBtn) {
      confirmBtn.disabled = !isReady;
    }

    if (hintEl) {
      hintEl.classList.toggle(
        'hidden',
        isReady
      );
    }
  }


  /* SLOT SELECTION */
  if (slotGrid) {

    slotGrid.addEventListener(
      'click',
      function (e) {

        const btn =
          e.target.closest('.slot-btn');

        if (!btn) return;

        slotGrid
          .querySelectorAll('.slot-btn')
          .forEach(function (button) {

            button.classList.remove(
              'active'
            );

          });

        btn.classList.add('active');

        if (selectedTimeEl) {
          selectedTimeEl.value =
            btn.dataset.time;
        }

        validateForm();
      }
    );
  }


  /* REMOVE SERVICE */
  if (servicesWrapper) {

    servicesWrapper.addEventListener(
      'click',
      function (e) {

        const removeBtn =
          e.target.closest(
            '.remove-service'
          );

        if (!removeBtn) return;

        const serviceEl =
          removeBtn.closest(
            '.appt-service'
          );

        if (!serviceEl) return;

        const serviceId =
          serviceEl.dataset.id;

        serviceEl.remove();

        const hiddenInput =
          document.querySelector(
            'input.service-hidden[value="' +
            serviceId +
            '"]'
          );

        if (hiddenInput) {
          hiddenInput.remove();
        }

        recalcTotal();
        validateForm();

        const remaining =
          servicesWrapper.querySelectorAll(
            '.appt-service'
          ).length;

        let emptyState =
          servicesWrapper.querySelector(
            '.appt-empty'
          );

        if (
          remaining === 0 &&
          !emptyState
        ) {

          emptyState =
            document.createElement(
              'div'
            );

          emptyState.className =
            'appt-empty';

          emptyState.id =
            'emptyState';

          emptyState.innerHTML =
            '<i class="fa-regular fa-folder-open appt-empty__icon"></i>' +
            '<p class="appt-empty__text">No services selected yet.</p>';

          servicesWrapper.appendChild(
            emptyState
          );
        }
      }
    );
  }


  /* SUBMIT VALIDATION */
  if (appointmentForm) {

    appointmentForm.addEventListener(
      'submit',
      function (e) {

        const hasService =
          document.querySelectorAll(
            '#selectedServices .appt-service'
          ).length > 0;

        const hasTime =
          selectedTimeEl &&
          selectedTimeEl.value !== '';

        if (!hasService || !hasTime) {

          e.preventDefault();

          alert(
            'Please select a service and time slot.'
          );
        }
      }
    );
  }

  /*Add more service*/

  const addMoreBtn =
    document.getElementById(
      "addMoreServicesBtn"
    );

  if (addMoreBtn) {

    addMoreBtn.addEventListener(
      "click",
      async function (e) {

        e.preventDefault();

        const formData =
          new FormData();

        formData.append(
          "full_name",
          document.getElementById(
            "full_name"
          ).value
        );

        formData.append(
          "email",
          document.getElementById(
            "email"
          ).value
        );

        formData.append(
          "phone",
          document.getElementById(
            "phone"
          ).value
        );

        formData.append(
          "date",
          document.getElementById(
            "booking_date"
          ).value
        );

        formData.append(
          "time",
          document.getElementById(
            "selectedTime"
          ).value
        );

        await fetch(
          "/save-appointment-draft",
          {
            method: "POST",
            body: formData
          }
        );

        window.location.href =
          "/services";
      }
    );
  }


  /*  INITIALIZE*/
  if (servicesWrapper) {

    const emptyState =
      servicesWrapper.querySelector(
        '.appt-empty'
      );

    const hasServices =
      document.querySelectorAll(
        '#selectedServices .appt-service'
      ).length > 0;

    if (
      emptyState &&
      hasServices
    ) {
      emptyState.remove();
    }
  }

  /* RESTORE SELECTED TIME SLOT */

if (selectedTimeEl && selectedTimeEl.value) {

  const savedTime = selectedTimeEl.value;

  document
    .querySelectorAll(".slot-btn")
    .forEach(function(btn){

      if(btn.dataset.time === savedTime){

        btn.classList.add("active");

      }

    });

}

  recalcTotal();
  validateForm();

})();