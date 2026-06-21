
(function () {
    "use strict";

    /*  DOM REFERENCES */

    const searchInput =
        document.getElementById("searchInput");

    const specializationFilter =
        document.getElementById("specializationFilter");

    const statusFilter =
        document.getElementById("statusFilter");

    const staffTableBody =
        document.getElementById("staffTableBody");

    const resultCount =
        document.getElementById("resultCount");

    const emptyState =
        document.getElementById("emptyState");

    const tableRows = Array.from(
        staffTableBody.querySelectorAll("tr")
    );

    /* SEARCH + FILTER */

    function filterStaff() {

        const searchValue =
            searchInput.value
                .trim()
                .toLowerCase();

        const specializationValue =
            specializationFilter.value.toLowerCase();

        const statusValue =
            statusFilter.value.toLowerCase();

        let visibleCount = 0;

        tableRows.forEach((row) => {

            const name =
                row.dataset.name?.toLowerCase() || "";

            const email =
                row.dataset.email?.toLowerCase() || "";

            const specialization =
                row.dataset.specialization?.toLowerCase() || "";

            const status =
                row.dataset.status?.toLowerCase() || "";

            const matchesSearch =
                !searchValue ||
                name.includes(searchValue) ||
                email.includes(searchValue) ||
                specialization.includes(searchValue);

            const matchesSpecialization =
                specializationValue === "all" ||
                specialization.includes(
                    specializationValue
                );

            const matchesStatus =
                statusValue === "all" ||
                status === statusValue;

            const shouldShow =
                matchesSearch &&
                matchesSpecialization &&
                matchesStatus;

            row.classList.toggle(
                "row--filtered-out",
                !shouldShow
            );

            if (shouldShow) {
                visibleCount++;
            }
        });

        updateUI(visibleCount);
    }

    function updateUI(count) {

        resultCount.textContent =
            `Showing ${count} staff member${count !== 1 ? "s" : ""}`;

        emptyState.classList.toggle(
            "hidden",
            count > 0
        );
    }

    /* EVENTS*/

    searchInput?.addEventListener(
        "input",
        filterStaff
    );

    specializationFilter?.addEventListener(
        "change",
        filterStaff
    );

    statusFilter?.addEventListener(
        "change",
        filterStaff
    );

    /* SPECIALIZATION EDIT*/

    function initializeSpecializationEditor() {

        const specCells =
            document.querySelectorAll(".spec-cell");

        specCells.forEach((cell) => {

            const display =
                cell.querySelector(".spec-display");

            const editButton =
                cell.querySelector(".spec-edit-btn");

            const editor =
                cell.querySelector(".spec-editor");

            const select =
                cell.querySelector(".spec-select");

            const specTag =
                cell.querySelector(".spec-tag");

            const confirmButton =
                cell.querySelector(".btn-spec-confirm");

            const discardButton =
                cell.querySelector(".btn-spec-discard");

            let selectedSpecialization =
                specTag.textContent.trim();

            editButton?.addEventListener(
                "click",
                () => {

                    display.classList.add("hidden");
                    editor.classList.remove("hidden");
                }
            );

            confirmButton?.addEventListener(
                "click",
                async () => {

                    selectedSpecialization =
                        select.value;

                    const staffId =
                        cell.dataset.id;

                    try {

                        const response =
                            await fetch(
                                "/admin/staff/update-specialization",
                                {
                                    method: "POST",

                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },

                                    body: JSON.stringify({
                                        staff_id:
                                            staffId,

                                        specialization:
                                            selectedSpecialization
                                    })
                                }
                            );

                        const result =
                            await response.json();

                        if (result.success) {

                            specTag.textContent =
                                selectedSpecialization;

                            display.classList.remove(
                                "hidden"
                            );

                            editor.classList.add(
                                "hidden"
                            );

                        } else {

                            alert(
                                result.message
                            );
                        }

                    } catch (error) {

                        console.error(error);

                        alert(
                            "Failed to update specialization"
                        );
                    }
                }
            );

            discardButton?.addEventListener(
                "click",
                () => {

                    select.value =
                        selectedSpecialization;

                    display.classList.remove(
                        "hidden"
                    );

                    editor.classList.add(
                        "hidden"
                    );
                }
            );
        });
    }

    /* 
       MORE MENU
  */

    function initializeMoreMenu() {

        const wrappers =
            document.querySelectorAll(
                ".more-menu-wrapper"
            );

        wrappers.forEach((wrapper) => {

            const button =
                wrapper.querySelector(
                    ".action-btn--more"
                );

            const menu =
                wrapper.querySelector(
                    ".more-menu"
                );

            button?.addEventListener(
                "click",
                (e) => {

                    e.stopPropagation();

                    document
                        .querySelectorAll(
                            ".more-menu.open"
                        )
                        .forEach((m) =>
                            m.classList.remove(
                                "open"
                            )
                        );

                    menu.classList.toggle(
                        "open"
                    );
                }
            );
        });

        document.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".more-menu.open"
                    )
                    .forEach((menu) =>
                        menu.classList.remove(
                            "open"
                        )
                    );
            }
        );
    }

    /* 
       STAFF ACTIONS
  */

    function initializeStaffActions() {

        document
            .querySelectorAll(
                ".toggle-status-btn"
            )
            .forEach((button) => {

                button.addEventListener(
                    "click",
                    async () => {

                        try {

                            const response =
                                await fetch(
                                    "/admin/staff/update-status",
                                    {
                                        method: "POST",

                                        headers: {
                                            "Content-Type":
                                                "application/json"
                                        },

                                        body: JSON.stringify({
                                            staff_id:
                                                button.dataset.id,

                                            status:
                                                button.dataset.status
                                        })
                                    }
                                );

                            const result =
                                await response.json();

                            if (
                                result.success
                            ) {
                                location.reload();
                            }

                        } catch (error) {

                            console.error(error);
                        }
                    }
                );
            });

        document
            .querySelectorAll(
                ".remove-staff-btn"
            )
            .forEach((button) => {

                button.addEventListener(
                    "click",
                    async () => {

                        const confirmed =
                            confirm(
                                "Remove this staff member?"
                            );

                        if (!confirmed) return;

                        try {

                            const response =
                                await fetch(
                                    "/admin/staff/remove",
                                    {
                                        method: "POST",

                                        headers: {
                                            "Content-Type":
                                                "application/json"
                                        },

                                        body: JSON.stringify({
                                            staff_id:
                                                button.dataset.id
                                        })
                                    }
                                );

                            const result =
                                await response.json();

                            if (
                                result.success
                            ) {
                                location.reload();
                            }

                        } catch (error) {

                            console.error(error);
                        }
                    }
                );
            });
    }

    /* 
       VIEW MODAL
  */

    function initializeViewModal() {

        const modal =
            document.getElementById(
                "staffViewModal"
            );

        if (!modal) return;

        const closeButton =
            document.getElementById(
                "closeStaffModal"
            );

        const overlay =
            modal.querySelector(
                ".staff-modal__overlay"
            );

        document
            .querySelectorAll(
                ".view-staff-btn"
            )
            .forEach((button) => {

                button.addEventListener(
                    "click",
                    () => {

                        document.getElementById("modalStaffId").textContent =
                            "#STF-" +
                            String(button.dataset.id).padStart(3, "0");

                        document.getElementById("modalName").textContent =
                            button.dataset.name;

                        document.getElementById("modalEmail").textContent =
                            button.dataset.email;

                        document.getElementById("modalPhone").textContent =
                            button.dataset.phone;

                        document.getElementById("modalGender").textContent =
                            button.dataset.gender;

                        document.getElementById("modalSalary").textContent =
                            "₹" +
                            Number(button.dataset.salary || 0)
                                .toLocaleString("en-IN");

                        document.getElementById("modalRole").textContent =
                            button.dataset.role;

                        document.getElementById("modalSpecialization").textContent =
                            button.dataset.specialization;

                        document.getElementById("modalStatus").textContent =
                            button.dataset.status;

                        modal.classList.remove(
                            "hidden"
                        );
                    }
                );
            });

        function closeModal() {
            modal.classList.add("hidden");
        }

        closeButton?.addEventListener(
            "click",
            closeModal
        );

        overlay?.addEventListener(
            "click",
            closeModal
        );
    }

    /* 
       EDIT MODAL
  */

    function initializeEditModal() {

        const modal =
            document.getElementById(
                "editStaffModal"
            );

        if (!modal) return;

        const closeButton =
            document.getElementById(
                "closeEditModal"
            );

        const cancelButton =
            document.getElementById(
                "cancelEditBtn"
            );

        const overlay =
            modal.querySelector(
                ".staff-modal__overlay"
            );

        const saveButton =
            document.getElementById(
                "saveStaffBtn"
            );

        document
            .querySelectorAll(
                ".edit-staff-btn"
            )
            .forEach((button) => {

                button.addEventListener(
                    "click",
                    () => {

                        document.getElementById("editStaffId").value =
                            button.dataset.id;

                        document.getElementById("editName").value =
                            button.dataset.name;

                        document.getElementById("editEmail").value =
                            button.dataset.email;

                        document.getElementById("editPhone").value =
                            button.dataset.phone;

                        document.getElementById("editSalary").value =
                            button.dataset.salary;

                        document.getElementById("editGender").value =
                            (button.dataset.gender || "").toUpperCase();

                        document.getElementById("editSpecialization").value =
                            button.dataset.specialization;

                        document.getElementById("editStatus").value =
                            (button.dataset.status || "").toUpperCase();

                        modal.classList.remove(
                            "hidden"
                        );
                    }
                );
            });

        function closeModal() {
            modal.classList.add("hidden");
        }

        closeButton?.addEventListener("click", closeModal);
        cancelButton?.addEventListener("click", closeModal);
        overlay?.addEventListener("click", closeModal);

        saveButton?.addEventListener(
            "click",
            async () => {

                try {

                    const response =
                        await fetch(
                            "/admin/staff/update",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({
                                    staff_id:
                                        document.getElementById("editStaffId").value,

                                    full_name:
                                        document.getElementById("editName").value,

                                    email:
                                        document.getElementById("editEmail").value,

                                    phone:
                                        document.getElementById("editPhone").value,

                                    salary:
                                        document.getElementById("editSalary").value,

                                    gender:
                                        document.getElementById("editGender").value,

                                    specialization:
                                        document.getElementById("editSpecialization").value,

                                    employment_status:
                                        document.getElementById("editStatus").value
                                })
                            }
                        );

                    const result =
                        await response.json();

                    if (result.success) {

                        alert(
                            "Staff updated successfully"
                        );

                        location.reload();

                    } else {

                        alert(
                            result.message
                        );
                    }

                } catch (error) {

                    console.error(error);

                    alert(
                        "Something went wrong"
                    );
                }
            }
        );
    }

    /* Add Staff*/

/* ==========================================
   ADD STAFF MODAL
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const addStaffModal =
            document.getElementById(
                "addStaffModal"
            );

        const addStaffBtn =
            document.getElementById(
                "addStaffBtn"
            );

        const closeAddStaffBtn =
            document.getElementById(
                "closeAddStaffModal"
            );

        const cancelAddStaffBtn =
            document.getElementById(
                "cancelAddStaff"
            );

        const addStaffForm =
            document.getElementById(
                "addStaffForm"
            );


        /* ==========================================
           OPEN MODAL
        ========================================== */

        function openAddStaffModal() {

            if (!addStaffModal)
                return;

            addStaffModal
                .classList
                .remove("hidden");

            document.body.style.overflow =
                "hidden";
        }


        /* ==========================================
           CLOSE MODAL
        ========================================== */

        function closeAddStaffModal() {

            if (!addStaffModal)
                return;

            addStaffModal
                .classList
                .add("hidden");

            document.body.style.overflow =
                "auto";

            addStaffForm?.reset();
        }


        /* ==========================================
           BUTTON EVENTS
        ========================================== */

        addStaffBtn?.addEventListener(
            "click",
            openAddStaffModal
        );

        closeAddStaffBtn?.addEventListener(
            "click",
            closeAddStaffModal
        );

        cancelAddStaffBtn?.addEventListener(
            "click",
            closeAddStaffModal
        );


        /* ==========================================
           OVERLAY CLOSE
        ========================================== */

        addStaffModal
            ?.querySelector(
                ".staff-modal__overlay"
            )
            ?.addEventListener(
                "click",
                closeAddStaffModal
            );


        /* ==========================================
           FORM SUBMIT
        ========================================== */

        addStaffForm?.addEventListener(
            "submit",

            async function (e) {

                e.preventDefault();

                const submitBtn =
                    this.querySelector(
                        'button[type="submit"]'
                    );

                try {

                    submitBtn.disabled = true;
                    submitBtn.textContent =
                        "Adding...";

                    const formData =
                        new FormData(this);

                    const payload = {

                        first_name:
                            formData.get(
                                "first_name"
                            )?.trim(),

                        last_name:
                            formData.get(
                                "last_name"
                            )?.trim(),

                        email:
                            formData.get(
                                "email"
                            )?.trim(),

                        phone:
                            formData.get(
                                "phone"
                            )?.trim(),

                        salary:
                            formData.get(
                                "salary"
                            ),

                        gender:
                            formData.get(
                                "gender"
                            ),

                        role_id:
                            parseInt(
                                formData.get(
                                    "role_id"
                                )
                            ),

                        user_code:
                            formData.get(
                                "user_code"
                            )?.trim(),

                        password:
                            formData.get(
                                "password"
                            ),

                        joining_date:
                            formData.get(
                                "joining_date"
                            ),

                        specialization:
                            formData.get(
                                "specialization"
                            )?.trim(),

                        employment_status:
                            formData.get(
                                "employment_status"
                            )
                    };


                    const response =
                        await fetch(
                            "/admin/staff/add",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(
                                        payload
                                    )
                            }
                        );


                    const result =
                        await response.json();


                    if (
                        response.ok &&
                        result.success
                    ) {

                        alert(
                            "Staff added successfully"
                        );

                        closeAddStaffModal();

                        window.location.reload();

                    } else {

                        alert(
                            result.message ||
                            "Failed to add staff"
                        );
                    }

                } catch (error) {

                    console.error(
                        "ADD STAFF ERROR:",
                        error
                    );

                    alert(
                        "Something went wrong"
                    );

                } finally {

                    submitBtn.disabled =
                        false;

                    submitBtn.textContent =
                        "Add Staff";
                }
            }
        );
    }
);



    /* 
       INIT
  */

    function init() {

        filterStaff();

        initializeSpecializationEditor();

        initializeMoreMenu();

        initializeStaffActions();

        initializeViewModal();

        initializeEditModal();
    }

    document.addEventListener(
        "DOMContentLoaded",
        init
    );

})();