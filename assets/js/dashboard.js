/* =========================================================
   ELARA — PATIENT DASHBOARD
   Vanilla JavaScript only.
   RTL and dark mode are managed by global.js.
========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    /* =====================================================
       ELEMENTS
    ====================================================== */

    const sidebar = document.getElementById("dashboardSidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const menuToggle = document.getElementById("dashboardMenuToggle");
    const topbarTitle = document.getElementById("topbarTitle");
    const toast = document.getElementById("dashboardToast");

    const appointmentForm = document.getElementById("appointmentForm");
    const appointmentList = document.getElementById("appointmentList");
    const appointmentListEmpty = document.getElementById("appointmentListEmpty");

    const progressForm = document.getElementById("progressForm");
    const progressGallery = document.getElementById("progressGallery");
    const progressGalleryEmpty = document.getElementById("progressGalleryEmpty");

    const historyForm = document.getElementById("historyForm");
    const historyList = document.getElementById("historyList");
    const historyEmptyState = document.getElementById("historyEmptyState");

    const profileForm = document.getElementById("profileForm");

    /* =====================================================
       IN-MEMORY DEMO DATA
       This data is not saved to a server or database.
    ====================================================== */

    const appointments = [];
    const progressEntries = [];
    const historyEntries = [];

    let nextAppointmentId = 1;
    let nextProgressId = 1;
    let nextHistoryId = 1;
    let toastTimeout = null;

    const selectedPhotos = {
        before: null,
        after: null
    };

    /* =====================================================
       GENERAL HELPERS
    ====================================================== */

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (character) {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            };

            return entities[character];
        });
    }

    function formatDate(dateString) {
        if (!dateString) {
            return "Date not specified";
        }

        const date = new Date(dateString + "T00:00:00");

        if (Number.isNaN(date.getTime())) {
            return dateString;
        }

        return new Intl.DateTimeFormat(undefined, {
            day: "numeric",
            month: "short",
            year: "numeric"
        }).format(date);
    }

    function showToast(message) {
        if (!toast) {
            return;
        }

        toast.textContent = message;
        toast.classList.add("show");

        if (toastTimeout) {
            clearTimeout(toastTimeout);
        }

        toastTimeout = setTimeout(function () {
            toast.classList.remove("show");
        }, 3000);
    }

    function refreshIcons() {
        if (window.lucide && typeof window.lucide.createIcons === "function") {
            window.lucide.createIcons();
        }
    }

    function getInitial(name) {
        const cleanName = String(name || "").trim();

        return cleanName ? cleanName.charAt(0).toUpperCase() : "P";
    }

    function getTodayString() {
        const now = new Date();
        const localDate = new Date(
            now.getTime() - now.getTimezoneOffset() * 60000
        );

        return localDate.toISOString().slice(0, 10);
    }

    function setDateMinimums() {
        const today = getTodayString();

        [
            "appointmentDate",
            "progressDate",
            "historyDate"
        ].forEach(function (id) {
            const input = document.getElementById(id);

            if (input) {
                input.min = today;
            }
        });

        const appointmentDate = document.getElementById("appointmentDate");
        const progressDate = document.getElementById("progressDate");
        const historyDate = document.getElementById("historyDate");

        if (appointmentDate) appointmentDate.value = today;
        if (progressDate) progressDate.value = today;
        if (historyDate) historyDate.value = today;
    }

    /* =====================================================
       SECTION NAVIGATION
    ====================================================== */

    const navButtons = document.querySelectorAll("[data-section]");
    const dashboardSections = document.querySelectorAll(".dashboard-section");
    const sectionShortcuts = document.querySelectorAll("[data-open-section]");

    const sectionTitles = {
        overview: "Overview",
        appointments: "Appointments",
        treatments: "My Treatments",
        progress: "Skin Progress",
        history: "Treatment History",
        profile: "My Profile"
    };

    function closeSidebar() {
        if (sidebar) {
            sidebar.classList.remove("sidebar-open");
        }

        if (sidebarOverlay) {
            sidebarOverlay.classList.remove("overlay-visible");
        }

        if (menuToggle) {
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Open dashboard menu");
        }

        document.body.style.overflow = "";
    }

    function openSidebar() {
        if (!sidebar) {
            return;
        }

        sidebar.classList.add("sidebar-open");

        if (sidebarOverlay) {
            sidebarOverlay.classList.add("overlay-visible");
        }

        if (menuToggle) {
            menuToggle.setAttribute("aria-expanded", "true");
            menuToggle.setAttribute("aria-label", "Close dashboard menu");
        }

        document.body.style.overflow = "hidden";
    }

    function showSection(sectionName) {
        if (!sectionTitles[sectionName]) {
            return;
        }

        dashboardSections.forEach(function (section) {
            const isActive = section.id === "section-" + sectionName;

            section.classList.toggle("active", isActive);
            section.hidden = !isActive;
        });

        navButtons.forEach(function (button) {
            const isActive = button.dataset.section === sectionName;

            button.classList.toggle("active", isActive);

            if (isActive) {
                button.setAttribute("aria-current", "page");
            } else {
                button.removeAttribute("aria-current");
            }
        });

        if (topbarTitle) {
            topbarTitle.textContent = sectionTitles[sectionName];
        }

        closeSidebar();

        const mainArea = document.querySelector(".dashboard-main");

        if (mainArea) {
            mainArea.scrollTop = 0;
        }

        refreshIcons();
    }

    navButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            showSection(button.dataset.section);
        });
    });

    sectionShortcuts.forEach(function (button) {
        button.addEventListener("click", function () {
            showSection(button.dataset.openSection);
        });
    });

    if (menuToggle) {
        menuToggle.addEventListener("click", function () {
            if (sidebar && sidebar.classList.contains("sidebar-open")) {
                closeSidebar();
            } else {
                openSidebar();
            }
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener("click", closeSidebar);
    }

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeSidebar();
        }
    });

    window.addEventListener("resize", function () {
        if (window.innerWidth > 768) {
            closeSidebar();
        }
    });

    /* =====================================================
       OVERVIEW COUNTS
    ====================================================== */

    function updateOverviewCounts() {
        const appointmentCount = document.getElementById("appointmentCount");
        const treatmentCount = document.getElementById("treatmentCount");
        const progressCount = document.getElementById("progressCount");
        const historyCount = document.getElementById("historyCount");

        if (appointmentCount) {
            appointmentCount.textContent = appointments.length;
        }

        if (treatmentCount) {
            treatmentCount.textContent = "3";
        }

        if (progressCount) {
            progressCount.textContent = progressEntries.length;
        }

        if (historyCount) {
            historyCount.textContent = historyEntries.length;
        }
    }

    /* =====================================================
       APPOINTMENT REQUESTS
    ====================================================== */

    function renderAppointments() {
        if (!appointmentList || !appointmentListEmpty) {
            return;
        }

        appointmentList.innerHTML = "";

        appointmentListEmpty.hidden = appointments.length > 0;

        appointments.forEach(function (appointment) {
            const item = document.createElement("article");

            item.className = "appointment-list-item";

            item.innerHTML = `
                <span class="appointment-status-pill">Request submitted</span>
                <h4>${escapeHTML(appointment.type)}</h4>
                <p><strong>Preferred date:</strong> ${escapeHTML(formatDate(appointment.date))}</p>
                <p><strong>Preferred time:</strong> ${escapeHTML(appointment.time)}</p>
                <p><strong>Dermatologist:</strong> ${escapeHTML(appointment.doctor)}</p>
                ${
                    appointment.notes
                        ? `<p><strong>Notes:</strong> ${escapeHTML(appointment.notes)}</p>`
                        : ""
                }
            `;

            appointmentList.appendChild(item);
        });

        const nextAppointmentEmpty = document.getElementById("nextAppointmentEmpty");
        const nextAppointmentDetails = document.getElementById("nextAppointmentDetails");

        if (nextAppointmentEmpty && nextAppointmentDetails) {
            const nextAppointment = appointments[appointments.length - 1];

            nextAppointmentEmpty.hidden = Boolean(nextAppointment);
            nextAppointmentDetails.hidden = !nextAppointment;

            if (nextAppointment) {
                document.getElementById("nextAppointmentTreatment").textContent =
                    nextAppointment.type;

                document.getElementById("nextAppointmentDate").textContent =
                    "Preferred date: " + formatDate(nextAppointment.date);

                document.getElementById("nextAppointmentDoctor").textContent =
                    "Preferred dermatologist: " + nextAppointment.doctor;
            }
        }

        updateOverviewCounts();
    }

    if (appointmentForm) {
        appointmentForm.addEventListener("submit", function (event) {
            event.preventDefault();

            if (!appointmentForm.reportValidity()) {
                return;
            }

            const type = document.getElementById("appointmentType").value;
            const date = document.getElementById("appointmentDate").value;
            const time = document.getElementById("appointmentTime").value;
            const doctor = document.getElementById("appointmentDoctor").value;
            const notes = document.getElementById("appointmentNotes").value.trim();

            if (date < getTodayString()) {
                showToast("Please select today or a future date.");
                return;
            }

            appointments.push({
                id: nextAppointmentId++,
                type: type,
                date: date,
                time: time,
                doctor: doctor,
                notes: notes
            });

            renderAppointments();
            appointmentForm.reset();

            document.getElementById("appointmentDate").value = getTodayString();

            showToast("Demo appointment request added.");
        });
    }

    document.querySelectorAll(".treatment-request-button").forEach(function (button) {
        button.addEventListener("click", function () {
            const treatment = button.dataset.treatment;
            const appointmentType = document.getElementById("appointmentType");

            if (appointmentType) {
                appointmentType.value = treatment;
            }

            showSection("appointments");
        });
    });

    /* =====================================================
       BEFORE / AFTER PHOTO PREVIEWS
    ====================================================== */

    function clearPhotoPreview(type) {
        const preview = document.getElementById(
            type === "before" ? "beforePhotoPreview" : "afterPhotoPreview"
        );

        if (selectedPhotos[type] && selectedPhotos[type].url) {
            URL.revokeObjectURL(selectedPhotos[type].url);
        }

        selectedPhotos[type] = null;

        if (preview) {
            preview.innerHTML = "";
        }

        const input = document.getElementById(
            type === "before" ? "beforePhoto" : "afterPhoto"
        );

        if (input) {
            input.value = "";
        }
    }

    function handlePhotoSelection(type, file) {
        const preview = document.getElementById(
            type === "before" ? "beforePhotoPreview" : "afterPhotoPreview"
        );

        if (!preview) {
            return;
        }

        if (!file) {
            clearPhotoPreview(type);
            return;
        }

        const acceptedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!acceptedTypes.includes(file.type)) {
            showToast("Choose a JPG, PNG or WebP image.");
            clearPhotoPreview(type);
            return;
        }

        const maximumFileSize = 8 * 1024 * 1024;

        if (file.size > maximumFileSize) {
            showToast("Please choose an image smaller than 8 MB.");
            clearPhotoPreview(type);
            return;
        }

        clearPhotoPreview(type);

        const objectUrl = URL.createObjectURL(file);

        selectedPhotos[type] = {
            file: file,
            url: objectUrl
        };

        const previewItem = document.createElement("div");
        previewItem.className = "photo-preview-item";

        const image = document.createElement("img");
        image.src = objectUrl;
        image.alt = type === "before" ? "Before photo preview" : "After photo preview";

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.setAttribute("aria-label", "Remove selected photo");
        removeButton.innerHTML = '<i data-lucide="x"></i>';

        removeButton.addEventListener("click", function () {
            clearPhotoPreview(type);
            refreshIcons();
        });

        previewItem.appendChild(image);
        previewItem.appendChild(removeButton);
        preview.appendChild(previewItem);

        refreshIcons();
    }

    const beforePhotoInput = document.getElementById("beforePhoto");
    const afterPhotoInput = document.getElementById("afterPhoto");

    if (beforePhotoInput) {
        beforePhotoInput.addEventListener("change", function () {
            handlePhotoSelection("before", beforePhotoInput.files[0]);
        });
    }

    if (afterPhotoInput) {
        afterPhotoInput.addEventListener("change", function () {
            handlePhotoSelection("after", afterPhotoInput.files[0]);
        });
    }

    /* =====================================================
       SKIN PROGRESS ENTRIES
    ====================================================== */

    function renderProgressEntries() {
        if (!progressGallery || !progressGalleryEmpty) {
            return;
        }

        progressGallery.innerHTML = "";
        progressGalleryEmpty.hidden = progressEntries.length > 0;

        const galleryCount = document.getElementById("galleryCount");

        if (galleryCount) {
            galleryCount.textContent =
                progressEntries.length + (progressEntries.length === 1 ? " entry" : " entries");
        }

        progressEntries.slice().reverse().forEach(function (entry) {
            const card = document.createElement("article");
            card.className = "progress-entry-card";

            const beforeImage = entry.beforeUrl
                ? `<img src="${escapeHTML(entry.beforeUrl)}" alt="Before progress photo">`
                : '<div class="missing-photo">No before photo</div>';

            const afterImage = entry.afterUrl
                ? `<img src="${escapeHTML(entry.afterUrl)}" alt="After progress photo">`
                : '<div class="missing-photo">No after photo</div>';

            card.innerHTML = `
                <div class="progress-entry-heading">
                    <div>
                        <h4>${escapeHTML(entry.treatment)}</h4>
                        <p>${escapeHTML(formatDate(entry.date))}</p>
                    </div>
                    <button class="progress-entry-delete" type="button"
                            data-delete-progress="${entry.id}" aria-label="Delete progress entry">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>

                <div class="progress-entry-images">
                    <div class="progress-entry-image">
                        <span>BEFORE</span>
                        ${beforeImage}
                    </div>
                    <div class="progress-entry-image">
                        <span>AFTER</span>
                        ${afterImage}
                    </div>
                </div>

                ${
                    entry.notes
                        ? `<p class="progress-entry-notes">${escapeHTML(entry.notes)}</p>`
                        : ""
                }
            `;

            progressGallery.appendChild(card);
        });

        updateOverviewCounts();
        refreshIcons();
    }

    if (progressForm) {
        progressForm.addEventListener("submit", function (event) {
            event.preventDefault();

            if (!progressForm.reportValidity()) {
                return;
            }

            const treatment = document.getElementById("progressTreatment").value;
            const date = document.getElementById("progressDate").value;
            const notes = document.getElementById("progressNotes").value.trim();

            if (date < getTodayString()) {
                showToast("Please select today or a future date.");
                return;
            }

            if (!selectedPhotos.before && !selectedPhotos.after) {
                showToast("Please select at least one progress photo.");
                return;
            }

            const entry = {
                id: nextProgressId++,
                treatment: treatment,
                date: date,
                notes: notes,
                beforeUrl: selectedPhotos.before ? selectedPhotos.before.url : null,
                afterUrl: selectedPhotos.after ? selectedPhotos.after.url : null
            };

            progressEntries.push(entry);

            /*
             * The object URLs remain available while this page is open.
             * No photo is uploaded to a server by this demo.
             */
            selectedPhotos.before = null;
            selectedPhotos.after = null;

            progressForm.reset();

            document.getElementById("progressDate").value = getTodayString();

            const beforePreview = document.getElementById("beforePhotoPreview");
            const afterPreview = document.getElementById("afterPhotoPreview");

            if (beforePreview) beforePreview.innerHTML = "";
            if (afterPreview) afterPreview.innerHTML = "";

            renderProgressEntries();
            showToast("Progress entry added for this session.");
        });
    }

    if (progressGallery) {
        progressGallery.addEventListener("click", function (event) {
            const deleteButton = event.target.closest("[data-delete-progress]");

            if (!deleteButton) {
                return;
            }

            const id = Number(deleteButton.dataset.deleteProgress);
            const index = progressEntries.findIndex(function (entry) {
                return entry.id === id;
            });

            if (index === -1) {
                return;
            }

            const removedEntry = progressEntries[index];

            if (removedEntry.beforeUrl) {
                URL.revokeObjectURL(removedEntry.beforeUrl);
            }

            if (removedEntry.afterUrl) {
                URL.revokeObjectURL(removedEntry.afterUrl);
            }

            progressEntries.splice(index, 1);

            renderProgressEntries();
            showToast("Progress entry removed.");
        });
    }

    /* =====================================================
       TREATMENT HISTORY
    ====================================================== */

    function renderHistoryEntries() {
        if (!historyList || !historyEmptyState) {
            return;
        }

        historyList.innerHTML = "";
        historyEmptyState.hidden = historyEntries.length > 0;

        const historyListCount = document.getElementById("historyListCount");

        if (historyListCount) {
            historyListCount.textContent =
                historyEntries.length + (historyEntries.length === 1 ? " entry" : " entries");
        }

        historyEntries.slice().reverse().forEach(function (entry) {
            const card = document.createElement("article");
            card.className = "history-entry";

            card.innerHTML = `
                <div class="history-entry-top">
                    <div>
                        <h4>${escapeHTML(entry.title)}</h4>
                        <div class="history-entry-meta">
                            <span>${escapeHTML(formatDate(entry.date))}</span>
                            <span>${escapeHTML(entry.category)}</span>
                        </div>
                    </div>

                    <button class="history-delete-button" type="button"
                            data-delete-history="${entry.id}" aria-label="Delete history entry">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>

                <p>${escapeHTML(entry.notes)}</p>
            `;

            historyList.appendChild(card);
        });

        updateOverviewCounts();
        refreshIcons();
    }

    if (historyForm) {
        historyForm.addEventListener("submit", function (event) {
            event.preventDefault();

            if (!historyForm.reportValidity()) {
                return;
            }

            const title = document.getElementById("historyTitle").value.trim();
            const date = document.getElementById("historyDate").value;
            const category = document.getElementById("historyCategory").value;
            const notes = document.getElementById("historyNotes").value.trim();

            if (!title || !date || !category || !notes) {
                showToast("Please complete all required history fields.");
                return;
            }

            if (date < getTodayString()) {
                showToast("Please select today or a future date.");
                return;
            }

            historyEntries.push({
                id: nextHistoryId++,
                title: title,
                date: date,
                category: category,
                notes: notes
            });

            historyForm.reset();
            document.getElementById("historyDate").value = getTodayString();

            renderHistoryEntries();
            showToast("History entry added for this session.");
        });
    }

    if (historyList) {
        historyList.addEventListener("click", function (event) {
            const deleteButton = event.target.closest("[data-delete-history]");

            if (!deleteButton) {
                return;
            }

            const id = Number(deleteButton.dataset.deleteHistory);
            const index = historyEntries.findIndex(function (entry) {
                return entry.id === id;
            });

            if (index === -1) {
                return;
            }

            historyEntries.splice(index, 1);

            renderHistoryEntries();
            showToast("History entry removed.");
        });
    }

    /* =====================================================
       PROFILE
    ====================================================== */

    function updateProfileDisplay(name, email) {
        const safeName = name.trim() || "Patient";
        const safeEmail = email.trim() || "Add your email address";

        const welcomeName = document.getElementById("welcomePatientName");
        const topbarName = document.getElementById("topbarPatientName");
        const profileName = document.getElementById("profileDisplayName");
        const profileEmail = document.getElementById("profileDisplayEmail");
        const profileAvatar = document.getElementById("profileAvatar");
        const topbarAvatar = document.querySelector(".dashboard-profile-shortcut .profile-avatar");

        if (welcomeName) welcomeName.textContent = safeName;
        if (topbarName) topbarName.textContent = safeName;
        if (profileName) profileName.textContent = safeName;
        if (profileEmail) profileEmail.textContent = safeEmail;

        const initial = getInitial(safeName);

        if (profileAvatar) profileAvatar.textContent = initial;
        if (topbarAvatar) topbarAvatar.textContent = initial;
    }

    if (profileForm) {
        profileForm.addEventListener("submit", function (event) {
            event.preventDefault();

            if (!profileForm.reportValidity()) {
                return;
            }

            const name = document.getElementById("profileName").value.trim();
            const email = document.getElementById("profileEmail").value.trim();

            updateProfileDisplay(name, email);

            showToast("Profile updated for this session.");
        });
    }

    /* =====================================================
       CURRENT YEAR + INITIAL STATE
    ====================================================== */

    const currentYear = document.getElementById("dashboardCurrentYear");

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    setDateMinimums();
    renderAppointments();
    renderProgressEntries();
    renderHistoryEntries();

    updateProfileDisplay("Patient", "");

    showSection("overview");
    refreshIcons();

    /*
     * Clean up preview URLs when leaving the page.
     */
    window.addEventListener("beforeunload", function () {
        Object.keys(selectedPhotos).forEach(function (type) {
            if (selectedPhotos[type] && selectedPhotos[type].url) {
                URL.revokeObjectURL(selectedPhotos[type].url);
            }
        });

        progressEntries.forEach(function (entry) {
            if (entry.beforeUrl) URL.revokeObjectURL(entry.beforeUrl);
            if (entry.afterUrl) URL.revokeObjectURL(entry.afterUrl);
        });
    });
});

