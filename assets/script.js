document.addEventListener("DOMContentLoaded", function () {
    // Modal Elements
    const joinUsBtn = document.getElementById("join-us-btn");
    const modal = document.getElementById("modal");
    const closeBtn = document.getElementById("modal-close-btn");
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    const showSignupBtn = document.getElementById("showSignup");
    const showLoginBtn = document.getElementById("showLogin");

    // Show modal and reset to login form
    function openModal() {
        if (modal && loginForm && signupForm) {
            modal.classList.remove("hidden");
            loginForm.classList.remove("hidden");
            signupForm.classList.add("hidden");
            resetForms();
        }
    }

    // Hide modal
    function closeModal() {
        if (modal) {
            modal.classList.add("hidden");
        }
    }

    // Toggle between Login & Signup
    if (showSignupBtn && loginForm && signupForm) {
        showSignupBtn.addEventListener("click", function (event) {
            event.preventDefault();
            loginForm.classList.add("hidden");
            signupForm.classList.remove("hidden");
            resetForms();
        });
    }

    if (showLoginBtn && signupForm && loginForm) {
        showLoginBtn.addEventListener("click", function (event) {
            event.preventDefault();
            signupForm.classList.add("hidden");
            loginForm.classList.remove("hidden");
            resetForms();
        });
    }

    // Event Listeners
    if (joinUsBtn) {
        joinUsBtn.addEventListener("click", openModal);
    }
    
    if (closeBtn) {
        closeBtn.addEventListener("click", closeModal);
    }

    // Close modal when clicking outside the modal content
    if (modal) {
        modal.addEventListener("click", function (event) {
            if (event.target === modal) closeModal();
        });
    }

    function resetForms() {
        document.querySelectorAll("input").forEach(input => input.value = "");
        document.querySelectorAll(".error-message").forEach(error => error.remove());
    }

    // Sorting Dropdown Functionality
    const sortButton = document.getElementById("sort-by");
    const sortDropdown = document.getElementById("sort-dropdown");
    
    if (sortButton && sortDropdown) {
        const sortOptions = sortDropdown.querySelectorAll("li");

        // Toggle dropdown
        sortButton.addEventListener("click", function (event) {
            event.stopPropagation();
            sortDropdown.classList.toggle("hidden");
        });

        // Hide dropdown when clicking outside
        document.addEventListener("click", function (event) {
            if (!sortDropdown.contains(event.target) && event.target !== sortButton) {
                sortDropdown.classList.add("hidden");
            }
        });

        // Handle sorting
        sortOptions.forEach(option => {
            option.addEventListener("click", function () {
                const sortType = this.getAttribute("data-sort");
                console.log("Sorting by:", sortType);
                sortDropdown.classList.add("hidden");
            });
        });
    }

    // Mobile Menu Functionality
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const mobileMenu = document.getElementById("mobile-menu");
    const mobileMenuCloseBtn = document.getElementById("mobile-menu-close");

    if (mobileMenuBtn && mobileMenu) {
        // Open Mobile Menu
        mobileMenuBtn.addEventListener("click", () => {
            mobileMenu.classList.remove("mobile-nav-hidden");
        });
    }

    if (mobileMenuCloseBtn && mobileMenu) {
        // Close Mobile Menu
        mobileMenuCloseBtn.addEventListener("click", () => {
            mobileMenu.classList.add("mobile-nav-hidden");
        });
    }

    if (mobileMenu) {
        // Close Menu on Navigation Click
        const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");
        mobileNavLinks.forEach(link => {
            link.addEventListener("click", () => {
                mobileMenu.classList.add("mobile-nav-hidden");
            });
        });
    }

    // Open Modal from Mobile Menu
    const mobileModeJoinUsButtons = [
        document.getElementById("mobile-join-us-btn"),
        document.getElementById("mobile-hero-join-us-btn")
    ];

    mobileModeJoinUsButtons.forEach(button => {
        if (button && mobileMenu) {
            button.addEventListener("click", () => {
                openModal();
                mobileMenu.classList.add("mobile-nav-hidden");
            });
        }
    });
});