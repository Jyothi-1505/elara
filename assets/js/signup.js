
/* =========================================================
   ELARA — SIGNUP PAGE
========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    const form = document.getElementById("signupForm");
    const message = document.getElementById("signupMessage");

    if (!form || !message) return;

    const nameField = document.getElementById("signupName");
    const emailField = document.getElementById("signupEmail");
    const phoneField = document.getElementById("signupPhone");
    const passwordField = document.getElementById("signupPassword");
    const confirmField = document.getElementById("signupConfirmPassword");
    const termsField = document.getElementById("signupTerms");

    /* Password visibility */

    document.querySelectorAll("[data-password-toggle]").forEach(function (button) {
        button.addEventListener("click", function () {
            const field = document.getElementById(
                button.dataset.passwordToggle
            );

            if (!field) return;

            const shouldShow = field.type === "password";

            field.type = shouldShow ? "text" : "password";
            button.textContent = shouldShow ? "Hide" : "Show";

            button.setAttribute(
                "aria-label",
                shouldShow ? "Hide password" : "Show password"
            );
        });
    });

    /* Clear field errors when the user edits a field */

    form.querySelectorAll("input").forEach(function (field) {
        field.addEventListener("input", function () {
            field.removeAttribute("aria-invalid");
            message.textContent = "";
        });

        field.addEventListener("change", function () {
            field.removeAttribute("aria-invalid");
            message.textContent = "";
        });
    });

    /* Validate the signup form */

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        message.textContent = "";

        const fields = [
            nameField,
            emailField,
            phoneField,
            passwordField,
            confirmField,
            termsField
        ];

        fields.forEach(function (field) {
            field.removeAttribute("aria-invalid");
        });

        let firstInvalidField = null;
        let errorMessage = "";

        function setError(field, text) {
            field.setAttribute("aria-invalid", "true");

            if (!firstInvalidField) {
                firstInvalidField = field;
                errorMessage = text;
            }
        }

        if (!nameField.value.trim()) {
            setError(nameField, "Please enter your full name.");
        }

        if (
            !emailField.value.trim() ||
            !emailField.validity.valid
        ) {
            setError(emailField, "Please enter a valid email address.");
        }

        const phoneDigits = phoneField.value.replace(/\D/g, "");

        if (
            !phoneField.value.trim() ||
            phoneDigits.length < 7 ||
            phoneDigits.length > 15
        ) {
            setError(phoneField, "Please enter a valid phone number.");
        }

        if (passwordField.value.length < 8) {
            setError(
                passwordField,
                "Your password must contain at least 8 characters."
            );
        }

        if (
            confirmField.value.length === 0 ||
            confirmField.value !== passwordField.value
        ) {
            setError(
                confirmField,
                "Your passwords do not match."
            );
        }

        if (!termsField.checked) {
            setError(
                termsField,
                "Please agree to the Terms and Conditions and Privacy Policy."
            );
        }

        if (firstInvalidField) {
            message.textContent = errorMessage;
            firstInvalidField.focus();
            return;
        }

        /*
         * The form is valid, but account creation requires
         * a backend or authentication service.
         * Do not store passwords in localStorage.
         */

        message.textContent =
            "Your details are valid. Account creation is not connected yet.";
    });
});


/* ==========================================
   GOOGLE AND APPLE SIGN-UP
========================================== */

const googleSignupButton = document.getElementById("googleSignup");
const appleSignupButton = document.getElementById("appleSignup");

if (googleSignupButton) {
    googleSignupButton.addEventListener("click", function () {
        message.textContent =
            "Google sign-up is not configured yet.";
    });
}

if (appleSignupButton) {
    appleSignupButton.addEventListener("click", function () {
        message.textContent =
            "Apple sign-up is not configured yet.";
    });
}

