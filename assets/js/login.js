
/* =========================================================
   ELARA — LOGIN PAGE
========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    const root = document.documentElement;

    /* Password visibility */

    document.querySelectorAll("[data-password-toggle]").forEach(function (button) {
        button.addEventListener("click", function () {
            const input = document.getElementById(
                button.dataset.passwordToggle
            );

            if (!input) return;

            const showPassword = input.type === "password";

            input.type = showPassword ? "text" : "password";
            button.textContent = showPassword ? "Hide" : "Show";
            button.setAttribute(
                "aria-label",
                showPassword ? "Hide password" : "Show password"
            );
        });
    });

    /* Dark mode */

    const themeButton = document.getElementById("authThemeToggle");
    const themeLabel = document.getElementById("authThemeIcon");

    function updateThemeLabel() {
        if (!themeLabel) return;

        themeLabel.textContent =
            root.getAttribute("data-theme") === "dark" ? "Light" : "Dark";
    }

    if (themeButton) {
        updateThemeLabel();

        themeButton.addEventListener("click", function () {
            const isDark = root.getAttribute("data-theme") === "dark";

            root.setAttribute("data-theme", isDark ? "light" : "dark");
            updateThemeLabel();
        });
    }

    /* RTL toggle */

    const rtlButton = document.getElementById("authRtlToggle");

    if (rtlButton) {
        rtlButton.addEventListener("click", function () {
            const isRTL = root.getAttribute("dir") === "rtl";

            root.setAttribute("dir", isRTL ? "ltr" : "rtl");
        });
    }

    /* Login form validation */

    const loginForm = document.getElementById("loginForm");
    const loginMessage = document.getElementById("loginMessage");

    if (loginForm && loginMessage) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            loginMessage.textContent = "";

            const email = document.getElementById("loginEmail");
            const password = document.getElementById("loginPassword");

            [email, password].forEach(function (field) {
                field.removeAttribute("aria-invalid");
            });

            if (!email.checkValidity() || !email.value.trim()) {
                email.setAttribute("aria-invalid", "true");
                loginMessage.textContent =
                    "Please enter a valid email address.";
                email.focus();
                return;
            }

            if (!password.value) {
                password.setAttribute("aria-invalid", "true");
                loginMessage.textContent = "Please enter your password.";
                password.focus();
                return;
            }

            loginMessage.textContent =
                "Your details are valid, but authentication has not been connected yet.";
        });

        loginForm.querySelectorAll("input").forEach(function (field) {
            field.addEventListener("input", function () {
                field.removeAttribute("aria-invalid");
                loginMessage.textContent = "";
            });
        });
    }
});


/* =========================================================
   GOOGLE AND APPLE SIGN-IN
   OAuth integration is required for real authentication.
========================================================= */

const googleLoginButton = document.getElementById("googleLogin");
const appleLoginButton = document.getElementById("appleLogin");

if (googleLoginButton) {
    googleLoginButton.addEventListener("click", function () {
        if (loginMessage) {
            loginMessage.textContent =
                "Google sign-in is not configured yet.";
        }
    });
}

if (appleLoginButton) {
    appleLoginButton.addEventListener("click", function () {
        if (loginMessage) {
            loginMessage.textContent =
                "Apple sign-in is not configured yet.";
        }
    });
}

