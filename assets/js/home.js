
document.addEventListener("DOMContentLoaded", function () {

    /* =========================================
       LUCIDE ICONS
    ========================================= */

    function renderIcons() {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    renderIcons();


    /* =========================================
       SCROLL REVEAL ANIMATIONS
    ========================================= */

    const revealSections = document.querySelectorAll(".reveal-section");

    if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver(
            function (entries, observer) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.08,
                rootMargin: "0px 0px -30px 0px"
            }
        );

        revealSections.forEach(function (section) {
            revealObserver.observe(section);
        });
    } else {
        revealSections.forEach(function (section) {
            section.classList.add("is-visible");
        });
    }


    /* =========================================
       NEWSLETTER FORM
    ========================================= */

    const newsletterForm = document.getElementById("newsletterForm");
    const newsletterMessage = document.getElementById("newsletterMessage");

    newsletterForm?.addEventListener("submit", function (event) {
        event.preventDefault();

        const emailInput = document.getElementById("newsletterEmail");

        if (!emailInput || !emailInput.checkValidity()) {
            emailInput?.reportValidity();
            return;
        }

        if (newsletterMessage) {
            newsletterMessage.textContent =
                "The form is ready. Connect a subscription service to receive sign-ups.";

            newsletterMessage.setAttribute("role", "status");
        }
    });


    /* =========================================
       IMAGE LOADING
    ========================================= */

    document.querySelectorAll(".classic-hero img, .doctor-image img")
        .forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("image-load-error");
            });
        });

});
