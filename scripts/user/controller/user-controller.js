import User from "../models/user-model.js";
import { login } from "../services/user-service.js";

// It is a glue between View and Model
window.addEventListener("load", eventBinding);
window.addEventListener("load", alertMessages);

function alertMessages() {
    const modal = document.getElementById("alert-modal");
    const title = document.getElementById("alert-title");
    const message = document.getElementById("alert-message");
    const closeBtn = document.getElementById("alert-close-btn");
    const okBtn = document.getElementById("alert-ok-btn");

    if (!modal || !title || !message || !closeBtn || !okBtn) {
        console.error("Alert modal elements not found in the DOM!");
        return;
    }

    let redirectUrl = null;

    function showModal(alertTitle, alertMsg = "", url = null) {
        title.innerText = alertTitle;
        message.innerText = alertMsg;
        redirectUrl = url;

        modal.classList.remove("hidden");
        setTimeout(() => {
            modal.querySelector("div").classList.add("scale-100", "opacity-100");
        }, 10);
    }

    function hideModal() {
        modal.querySelector("div").classList.remove("scale-100", "opacity-100");
        setTimeout(() => {
            modal.classList.add("hidden");
            if (redirectUrl) {
                window.location.href = redirectUrl;
            }
        }, 300);
    }

    closeBtn.addEventListener("click", hideModal);
    okBtn.addEventListener("click", hideModal);

    window.showAlert = showModal;
}

function takeUserInput() {
    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value.trim();
    const name = document.querySelector("#name").value.trim();

    if (!email || !password || !name) {
        showAlert("Error", "Please fill in all fields.");
        return;
    }

    const user = new User(email, password, name);
    const { success, message, redirectUrl } = login(user);

    showAlert(success ? "Success" : "Registration Failed", message, redirectUrl);
    clearLoginForm();
}
function clearLoginForm() {
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    document.getElementById('name').value = '';
}

function eventBinding() {
    document.querySelector("#goLogin").addEventListener("click", takeUserInput);
}
