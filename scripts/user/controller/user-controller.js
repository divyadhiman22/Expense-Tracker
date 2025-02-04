import User from "../models/user-model.js";
import { login } from "../services/user-service.js";

// It is a glue between View and model
window.addEventListener("load", eventBinding);

function takeUserInput() {
    // Retrieve user inputs
    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value.trim();
    const name = document.querySelector("#name").value.trim();

    // Check if all fields are filled
    if (!email || !password || !name) {
        alert("Please fill in all fields.");
        return;
    }

    // Create a User object
    const user = new User(email, password, name);

    // Call login and get registration status
    const registrationStatus = login(user);

    // Redirect to another page only if registration is successful
    if (registrationStatus) {
        console.log("Registration successful. Redirecting...");
        location.href = "income-expense-form.html";
    } else {
        console.log("Registration failed.");
    }
}

function eventBinding() {
    // Bind the click event to the "Login" button
    document.querySelector("#goLogin").addEventListener("click", takeUserInput);
}
