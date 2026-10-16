
document.addEventListener("DOMContentLoaded", async function () {
    const headerSlot = document.getElementById("global-header");
    const footerSlot = document.getElementById("global-footer");

    // Some pages contain the header and footer directly in their HTML.
    // Initialize their controls even when there are no injection slots.
    if (!headerSlot && !footerSlot) {
        initializeGlobalUI();
        return;
    }

    try {
        const response = await fetch("global.html", {
            cache: "no-cache"
        });

        if (!response.ok) {
            throw new Error("Unable to load global.html");
        }

        const html = await response.text();
        const parser = new DOMParser();
        const globalDocument = parser.parseFromString(
            html,
            "text/html"
        );

        if (headerSlot) {
            const header = globalDocument.querySelector(".site-header");

            if (header) {
                headerSlot.replaceChildren(header.cloneNode(true));
            }
        }

        if (footerSlot) {
            const footer = globalDocument.querySelector(".site-footer");

            if (footer) {
                footerSlot.replaceChildren(footer.cloneNode(true));
            }
        }

        initializeGlobalUI();
    } catch (error) {
        console.error("Global layout error:", error);
    }
});


function initializeGlobalUI() {
    const root = document.documentElement;
    const menuToggle = document.getElementById("mobileMenuToggle");
    const navigation = document.getElementById("mainNavigation");
    const homeDropdown = document.querySelector(".home-dropdown");
    const themeToggle = document.getElementById("themeToggle");
    const rtlToggle = document.getElementById("rtlToggle");

    /* ==================== DARK MODE ==================== */

    function applyTheme(theme) {
        root.dataset.theme = theme;

        if (themeToggle) {
            themeToggle.innerHTML =
                theme === "dark"
                    ? '<i data-lucide="sun"></i>'
                    : '<i data-lucide="moon"></i>';

            themeToggle.setAttribute(
                "aria-label",
                theme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
            );
        }

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    let savedTheme = "light";

    try {
        savedTheme = localStorage.getItem("clinic-theme") || "light";
    } catch (error) {
        // Continue with the default theme if storage is unavailable.
    }

    applyTheme(savedTheme);

    themeToggle?.addEventListener("click", function () {
        const nextTheme =
            root.dataset.theme === "dark" ? "light" : "dark";

        applyTheme(nextTheme);

        try {
            localStorage.setItem("clinic-theme", nextTheme);
        } catch (error) {
            // Theme still works for the current page.
        }
    });


    /* ==================== RTL MODE ==================== */

    function applyDirection(direction) {
        root.dir = direction;

        if (rtlToggle) {
            rtlToggle.setAttribute(
                "aria-label",
                direction === "rtl"
                    ? "Switch to left-to-right layout"
                    : "Switch to right-to-left layout"
            );

            rtlToggle.setAttribute(
                "aria-pressed",
                String(direction === "rtl")
            );
        }
    }

    let savedDirection = "ltr";

    try {
        savedDirection =
            localStorage.getItem("clinic-direction") || "ltr";
    } catch (error) {
        // Use left-to-right layout by default.
    }

    applyDirection(savedDirection);

    rtlToggle?.addEventListener("click", function () {
        const nextDirection =
            root.dir === "rtl" ? "ltr" : "rtl";

        applyDirection(nextDirection);

        try {
            localStorage.setItem("clinic-direction", nextDirection);
        } catch (error) {
            // Direction still works for the current page.
        }
    });


    /* ==================== MOBILE NAVIGATION ==================== */

    menuToggle?.addEventListener("click", function () {
        const isOpen = navigation.classList.toggle("menu-open");

        menuToggle.setAttribute("aria-expanded", String(isOpen));

        menuToggle.innerHTML = isOpen
            ? '<i data-lucide="x"></i>'
            : '<i data-lucide="menu"></i>';

        if (window.lucide) {
            window.lucide.createIcons();
        }
    });


    /* ==================== HOME DROPDOWN ==================== */

    const homeLink = homeDropdown?.querySelector(".home-link");

    homeLink?.addEventListener("click", function (event) {
        if (window.innerWidth <= 1024) {
            event.preventDefault();

            const isOpen =
                homeDropdown.classList.toggle("dropdown-open");

            homeLink.setAttribute(
                "aria-expanded",
                String(isOpen)
            );
        }
    });


    // Close the mobile menu after selecting a destination.
    navigation?.querySelectorAll("a:not(.home-link)").forEach(function (link) {
        link.addEventListener("click", function () {
            if (window.innerWidth <= 1024) {
                navigation.classList.remove("menu-open");
                menuToggle?.setAttribute("aria-expanded", "false");
                if (menuToggle) {
                    menuToggle.innerHTML = '<i data-lucide="menu"></i>';
                    if (window.lucide) window.lucide.createIcons();
                }
            }
        });
    });

    // Reset mobile-only open states when returning to desktop width.
    window.addEventListener("resize", function () {
        if (window.innerWidth > 1024) {
            navigation?.classList.remove("menu-open");
            homeDropdown?.classList.remove("dropdown-open");
            menuToggle?.setAttribute("aria-expanded", "false");
            homeLink?.setAttribute("aria-expanded", "false");
            if (menuToggle) {
                menuToggle.innerHTML = '<i data-lucide="menu"></i>';
                if (window.lucide) window.lucide.createIcons();
            }
        }
    });

    /* ==================== ACTIVE NAVIGATION ==================== */

    const currentPage = window.location.pathname
        .split("/")
        .pop()
        .toLowerCase() || "index.html";

    document.querySelectorAll(
        ".navigation-list a, .dropdown-menu a"
    ).forEach(function (link) {
        const linkPage = link.getAttribute("href")
            ?.split("/")
            .pop()
            .split("#")[0]
            .toLowerCase();

        if (linkPage === currentPage) {
            link.classList.add("active");

            if (link.closest(".dropdown-menu")) {
                homeLink?.classList.add("active");
            }
        }
    });


    /* ==================== FOOTER YEAR ==================== */

    const yearElement = document.getElementById("currentYear");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }


    /* ==================== ICONS ==================== */

    if (window.lucide) {
        window.lucide.createIcons();
    }
}


/* ==================== MOBILE NAVIGATION ==================== */

menuToggle?.addEventListener("click", function () {
    if (!navigation) return;

    const isOpen = navigation.classList.toggle("menu-open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu"
    );

    menuToggle.innerHTML = isOpen
        ? '<i data-lucide="x"></i>'
        : '<i data-lucide="menu"></i>';

    if (window.lucide) {
        window.lucide.createIcons();
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.querySelector(".menu-toggle");

    if (menuToggle) {
        menuToggle.addEventListener("click", () => {
            // Keep your existing menu-toggle logic here.
        });
    }
});

