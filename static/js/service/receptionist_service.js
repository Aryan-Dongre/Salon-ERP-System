document.addEventListener('DOMContentLoaded', () => {

    // Ensure modals stay closed on load
    document
        .querySelectorAll('.modal-overlay')
        .forEach(modal => {
            modal.classList.remove('is-open');
        });

    document.body.style.overflow = '';

    initSearch();
    initFilters();
});


/* ==========================================
MODAL HELPERS
========================================== */

function openModal(modalId) {

    const modal =
        document.getElementById(modalId);

    if (!modal) return;

    modal.classList.add('is-open');

    document.body.style.overflow =
        'hidden';
}

function closeModal(modalId) {

    const modal =
        document.getElementById(modalId);

    if (!modal) return;

    modal.classList.remove('is-open');

    document.body.style.overflow =
        '';
}


/* ==========================================
ESC CLOSE
========================================== */

document.addEventListener(
    'keydown',
    function (event) {

        if (event.key === 'Escape') {

            document
                .querySelectorAll(
                    '.modal-overlay.is-open'
                )
                .forEach(modal => {
                    modal.classList.remove(
                        'is-open'
                    );
                });

            document.body.style.overflow =
                '';
        }
    }
);


/* ==========================================
GET SERVICE DATA
========================================== */

function getServiceRowData(serviceId) {

    const row =
        document.querySelector(
            `tr[data-service-id="${serviceId}"]`
        );

    if (!row) {

        console.error(
            'Service row not found:',
            serviceId
        );

        return null;
    }

    return {

        id:
            row.dataset.serviceId,

        name:
            row.dataset.serviceName,

        category:
            row.dataset.serviceCategory,

        duration:
            row.dataset.serviceDuration,

        price:
            row.dataset.servicePrice,

        description:
            row.dataset.serviceDescription ||
            'No description available',

        status:
            row.dataset.serviceStatus ===
            'true'
    };
}


/* ==========================================
VIEW MODAL
========================================== */

function openViewModal(serviceId) {

    const service =
        getServiceRowData(serviceId);

    if (!service) return;

    // Hero name
    document.getElementById(
        'viewName'
    ).textContent =
        service.name;

    // Duration
    document.getElementById(
        'viewDuration'
    ).textContent =
        `${service.duration} minutes`;

    // Price
    document.getElementById(
        'viewPrice'
    ).textContent =
        `₹${service.price}`;

    // Category
    document.getElementById(
        'viewCategory'
    ).textContent =
        service.category;

    // Description
    document.getElementById(
        'viewDescription'
    ).textContent =
        service.description;

    // Badge
    const categoryBadge =
        document.getElementById(
            'viewCategoryBadge'
        );

    categoryBadge.textContent =
        service.category;

    // Status badge
    const statusBadge =
        document.getElementById(
            'viewStatusBadge'
        );

    if (service.status) {

        statusBadge.textContent =
            'Active';

        statusBadge.className =
            'status-pill status-pill--active';

    } else {

        statusBadge.textContent =
            'Inactive';

        statusBadge.className =
            'status-pill status-pill--inactive';
    }

    openModal('viewModal');
}


/* ==========================================
EDIT MODAL
========================================== */

let currentEditId = null;

function openEditModal(serviceId) {

    const service =
        getServiceRowData(serviceId);

    if (!service) return;

    currentEditId =
        serviceId;

    document.getElementById(
        'editServiceName'
    ).value =
        service.name;

    document.getElementById(
        'editDuration'
    ).value =
        service.duration;

    document.getElementById(
        'editPrice'
    ).value =
        service.price;

    document.getElementById(
        'editDescription'
    ).value =
        service.description;

    document.getElementById(
        'editStatus'
    ).checked =
        service.status;

    document.getElementById(
        'editStatusLabel'
    ).textContent =
        service.status
            ? 'Active'
            : 'Inactive';

    openModal('editModal');
}


/* ==========================================
EDIT STATUS LABEL
========================================== */

document.addEventListener(
    'change',
    function (event) {

        if (
            event.target.id ===
            'editStatus'
        ) {

            document.getElementById(
                'editStatusLabel'
            ).textContent =
                event.target.checked
                    ? 'Active'
                    : 'Inactive';
        }
    }
);


/* ==========================================
SAVE EDIT
========================================== */

async function saveEdit() {

    try {

        const payload = {

            service_id:
                currentEditId,

            service_name:
                document.getElementById(
                    'editServiceName'
                ).value.trim(),

            duration_minutes:
                document.getElementById(
                    'editDuration'
                ).value,

            price:
                document.getElementById(
                    'editPrice'
                ).value,

            description:
                document.getElementById(
                    'editDescription'
                ).value.trim(),

            is_active:
                document.getElementById(
                    'editStatus'
                ).checked
        };

        const response =
            await fetch(
                '/admin/service/update',
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body: JSON.stringify(
                        payload
                    )
                }
            );

        const data =
            await response.json();

        if (data.success) {

            showToast(
                'Service updated successfully.'
            );

            closeModal(
                'editModal'
            );

            location.reload();

        } else {

            showToast(
                'Failed to update service.'
            );
        }

    } catch (error) {

        console.error(error);

        showToast(
            'Something went wrong.'
        );
    }
}


/* ==========================================
STATUS TOGGLE
========================================== */

document.addEventListener(
    'change',
    async function (event) {

        const toggle =
            event.target;

        if (
            !toggle.matches(
                '.toggle-switch input[data-service-id]'
            )
        ) {
            return;
        }

        const serviceId =
            toggle.dataset.serviceId;

        const isActive =
            toggle.checked;

        const row =
            toggle.closest(
                '.service-row'
            );

        try {

            const response =
                await fetch(
                    '/admin/service/update-status',
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body:
                            JSON.stringify({
                                service_id:
                                    serviceId,

                                is_active:
                                    isActive
                            })
                    }
                );

            const data =
                await response.json();

            if (data.success) {

                row.dataset.serviceStatus =
                    isActive;

                showToast(
                    isActive
                        ? 'Service activated successfully.'
                        : 'Service deactivated successfully.'
                );

                applyFilters();

            } else {

                toggle.checked =
                    !isActive;

                showToast(
                    'Failed to update status'
                );
            }

        } catch (error) {

            console.error(error);

            toggle.checked =
                !isActive;

            showToast(
                'Something went wrong'
            );
        }
    }
);


/* ==========================================
SEARCH
========================================== */

function initSearch() {

    const searchInput =
        document.querySelector(
            '.search-box__input'
        );

    if (!searchInput) return;

    searchInput.addEventListener(
        'input',
        applyFilters
    );
}


/* ==========================================
FILTERS
========================================== */

function initFilters() {

    const filters =
        document.querySelectorAll(
            '.filter-select'
        );

    filters.forEach(select => {

        select.addEventListener(
            'change',
            applyFilters
        );
    });
}

function applyFilters() {

    const searchValue =
        document
            .querySelector(
                '.search-box__input'
            )
            ?.value
            .toLowerCase()
            .trim() || '';

    const filters =
        document.querySelectorAll(
            '.filter-select'
        );

    const categoryFilter =
        filters[0]?.value
            .toLowerCase() || '';

    const statusFilter =
        filters[1]?.value
            .toLowerCase() || '';

    document
        .querySelectorAll(
            '.service-row'
        )
        .forEach(row => {

            const rowText =
                row.textContent
                    .toLowerCase();

            const rowCategory =
                row.dataset
                    .serviceCategory
                    ?.toLowerCase() || '';

            const rowStatus =
                row.querySelector(
                    '.toggle-switch input'
                )?.checked
                    ? 'active'
                    : 'inactive';

            const searchMatch =
                !searchValue ||
                rowText.includes(
                    searchValue
                );

            const categoryMatch =
                !categoryFilter ||
                rowCategory.includes(
                    categoryFilter
                );

            const statusMatch =
                !statusFilter ||
                rowStatus ===
                statusFilter;

            row.style.display =
                (
                    searchMatch &&
                    categoryMatch &&
                    statusMatch
                )
                    ? ''
                    : 'none';
        });
}


/* ==========================================
TOAST
========================================== */

let toastTimeout;

function showToast(message) {

    const toast =
        document.getElementById(
            'toast'
        );

    const toastMessage =
        document.getElementById(
            'toastMessage'
        );

    if (!toast) return;

    toastMessage.textContent =
        message;

    toast.classList.add(
        'is-visible'
    );

    clearTimeout(
        toastTimeout
    );

    toastTimeout =
        setTimeout(() => {

            toast.classList.remove(
                'is-visible'
            );

        }, 3000);
}