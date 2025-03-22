import User from "../models/user-model.js";
import { login, signup } from "../services/user-service.js";

document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("modal");
    const closeButton = document.getElementById("modal-close-btn");

    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");

    const loginEmail = document.getElementById("login-email");
    const loginPassword = document.getElementById("login-password");
    const signupEmail = document.getElementById("signup-email");
    const signupName = document.getElementById("signup-name");
    const signupPassword = document.getElementById("signup-password");
    const signupConfirmPassword = document.getElementById("signup-confirm-password");

    const loginButton = document.getElementById("goLogin");
    const signupButton = document.getElementById("goSignup");

    const showSignupBtn = document.getElementById("showSignup");
    const showLoginBtn = document.getElementById("showLogin");

    const joinUsBtn = document.getElementById("join-us-btn");

    // Validation Patterns
    const patterns = {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,  
        name: /^[A-Za-z\s]+$/ 
    };

    // Show Error Message
    function showError(input, message) {
        let errorSpan = input.nextElementSibling;
        if (!errorSpan || !errorSpan.classList.contains("error-message")) {
            errorSpan = document.createElement("span");
            errorSpan.classList.add("error-message");
            errorSpan.style.color = "#e30d62";
            errorSpan.style.fontSize = "0.9rem";
            input.parentNode.appendChild(errorSpan);
        }
        errorSpan.textContent = message;
    }

    // Clear Error Message
    function clearError(input) {
        let errorSpan = input.nextElementSibling;
        if (errorSpan && errorSpan.classList.contains("error-message")) {
            errorSpan.remove();
        }
    }

    // Validate Input Fields
    function validateField(input, pattern, errorMessage) {
        if (!pattern.test(input.value.trim())) {
            showError(input, errorMessage);
            return false;
        } else {
            clearError(input);
            return true;
        }
    }

    // Validate Forms (Login & Signup)
    function validateLoginForm() {
        let isValid = true;

        if (!validateField(loginEmail, patterns.email, "Enter a valid email")) isValid = false;
        if (!validateField(loginPassword, patterns.password, "Password must be at least 6 characters with 1 letter & 1 number")) isValid = false;

        return isValid;
    }

    function validateSignupForm() {
        let isValid = true;

        if (!validateField(signupName, patterns.name, "Name must contain only letters")) isValid = false;
        if (!validateField(signupEmail, patterns.email, "Enter a valid email")) isValid = false;
        if (!validateField(signupPassword, patterns.password, "Password must be at least 6 characters with 1 letter & 1 number")) isValid = false;
        
        if (signupConfirmPassword.value !== signupPassword.value) {
            showError(signupConfirmPassword, "Passwords do not match");
            isValid = false;
        } else {
            clearError(signupConfirmPassword);
        }

        return isValid;
    }

    // Reset Forms & Errors
    function resetForms() {
        document.querySelectorAll("input").forEach(input => input.value = ""); 
        document.querySelectorAll(".error-message").forEach(error => error.remove()); 
    }

    // Show Alert Modal
    function showAlert(title, message = "", callback = null) {
        const modal = document.getElementById("alert-modal");
        const alertTitle = document.getElementById("alert-title");
        const alertMessage = document.getElementById("alert-message");
        const closeBtn = document.getElementById("alert-close-btn");
        const okBtn = document.getElementById("alert-ok-btn");

        if (!modal || !alertTitle || !alertMessage || !closeBtn || !okBtn) {
            console.error("Alert modal elements not found in the DOM!");
            return;
        }

        alertTitle.innerText = title;
        alertMessage.innerText = message;

        modal.classList.remove("hidden");
        setTimeout(() => {
            modal.querySelector("div").classList.add("scale-100", "opacity-100");
        }, 10);

        const hideModal = () => {
            modal.querySelector("div").classList.remove("scale-100", "opacity-100");
            setTimeout(() => {
                modal.classList.add("hidden");
                if (callback && typeof callback === 'function') {
                    callback();
                }
            }, 300);
        };

        // Remove any previous event listeners
        const newCloseBtn = closeBtn.cloneNode(true);
        const newOkBtn = okBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        okBtn.parentNode.replaceChild(newOkBtn, okBtn);

        newCloseBtn.addEventListener("click", hideModal);
        newOkBtn.addEventListener("click", hideModal);
    }

    // Show Signup Form
    showSignupBtn.addEventListener("click", function (event) {
        event.preventDefault();
        loginForm.classList.add("hidden");
        signupForm.classList.remove("hidden");
        resetForms();
    });

    // Show Login Form
    showLoginBtn.addEventListener("click", function (event) {
        event.preventDefault();
        signupForm.classList.add("hidden");
        loginForm.classList.remove("hidden");
        resetForms();
    });

    // Open Modal with Login Form by Default
    joinUsBtn.addEventListener("click", function () {
        modal.classList.remove("hidden");
        loginForm.classList.remove("hidden");
        signupForm.classList.add("hidden");
        resetForms();
    });

    // Close Modal & Reset Forms
    closeButton.addEventListener("click", function () {
        modal.classList.add("hidden");
        resetForms();
    });

    // Handle Login
    function handleLogin(event) {
        event.preventDefault();
        if (!validateLoginForm()) return;

        const user = {
            email: loginEmail.value.trim(),
            password: loginPassword.value.trim()
        };
        
        const result = login(user);

        if (result.success) {
            showAlert("Success", result.message, () => {
                window.location.href = "income-expense-form.html";
            });
        } else {
            showAlert("Login Failed", result.message);
        }
    }

    // Handle Signup
    function handleSignup(event) {
        event.preventDefault();
        if (!validateSignupForm()) return;

        const user = {
            email: signupEmail.value.trim(),
            password: signupPassword.value.trim(),
            name: signupName.value.trim()
        };
        
        const result = signup(user);

        if (result.success) {
            showAlert("Account Created", result.message, () => {
                // Show login form after successful signup
                signupForm.classList.add("hidden");
                loginForm.classList.remove("hidden");
                resetForms();
            });
        } else {
            showAlert("Signup Failed", result.message);
        }
    }

    // Attach Events
    loginButton.addEventListener("click", handleLogin);
    signupButton.addEventListener("click", handleSignup);

    // Real-time Validation on Input Fields
    loginEmail.addEventListener("input", () => validateField(loginEmail, patterns.email, "Enter a valid email"));
    loginPassword.addEventListener("input", () => validateField(loginPassword, patterns.password, "Password must be at least 6 characters with 1 letter & 1 number"));

    signupEmail.addEventListener("input", () => validateField(signupEmail, patterns.email, "Enter a valid email"));
    signupName.addEventListener("input", () => validateField(signupName, patterns.name, "Name must contain only letters"));
    signupPassword.addEventListener("input", () => validateField(signupPassword, patterns.password, "Password must be at least 6 characters with 1 letter & 1 number"));
    signupConfirmPassword.addEventListener("input", () => {
        if (signupConfirmPassword.value !== signupPassword.value) {
            showError(signupConfirmPassword, "Passwords do not match");
        } else {
            clearError(signupConfirmPassword);
        }
    });
});