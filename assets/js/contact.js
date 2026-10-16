
/* ==========================================
   CONTACT FAQ — WORKING ACCORDION
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    const faqItems = document.querySelectorAll(".contact-faq__item");

    faqItems.forEach((item) => {
        const question = item.querySelector(".contact-faq__question");
        const answer = item.querySelector(".contact-faq__answer");

        if (!question || !answer) return;

        // Set the initial state
        const initiallyOpen = question.getAttribute("aria-expanded") === "true";

        question.setAttribute("type", "button");
        question.setAttribute("aria-expanded", String(initiallyOpen));
        answer.hidden = !initiallyOpen;

        question.addEventListener("click", () => {
            const isOpen = question.getAttribute("aria-expanded") === "true";

            // Close other FAQ answers
            faqItems.forEach((otherItem) => {
                const otherQuestion = otherItem.querySelector(
                    ".contact-faq__question"
                );
                const otherAnswer = otherItem.querySelector(
                    ".contact-faq__answer"
                );

                if (!otherQuestion || !otherAnswer) return;

                otherQuestion.setAttribute("aria-expanded", "false");
                otherAnswer.hidden = true;
            });

            // Toggle the selected answer
            if (!isOpen) {
                question.setAttribute("aria-expanded", "true");
                answer.hidden = false;
            }
        });
    });
});
