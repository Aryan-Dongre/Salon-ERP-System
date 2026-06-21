document.addEventListener("DOMContentLoaded", function () {

    const options =
        document.querySelectorAll(".payment-option");

    const buttonText =
        document.getElementById("payButtonText");

    options.forEach(option => {

        option.addEventListener("click", function () {

            options.forEach(item => {

                item.classList.remove(
                    "payment-option--selected"
                );

                const radio =
                    item.querySelector(
                        ".payment-option__radio"
                    );

                if (radio) {
                    radio.checked = false;
                }

            });

            this.classList.add(
                "payment-option--selected"
            );

            const radio =
                this.querySelector(
                    ".payment-option__radio"
                );

            radio.checked = true;

            if (radio.value === "ONLINE") {

                buttonText.textContent =
                    "Pay Securely Now";

            } else {

                buttonText.textContent =
                    "Confirm Appointment";

            }

            console.log(
                "Selected:",
                radio.value
            );

        });

    });

});