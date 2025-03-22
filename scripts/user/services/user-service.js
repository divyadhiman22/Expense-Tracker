// use-service.js
import User from "../models/user-model.js";

/**
 * Login function to authenticate a user
 * @param {Object} user - User object with email and password 
 * @returns {Object} Result with success status and message
 */
export function login(user) {
    try {
        if (!localStorage) {
            return { success: false, message: "Your browser does not support localStorage." };
        }

        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem("users")) || [];
        
        // Find the user with the matching email
        const existingUser = users.find(u => u.email === user.email);
        
        // Check if user exists and password matches
        if (!existingUser) {
            return { 
                success: false, 
                message: "No account found with this email. Please sign up first." 
            };
        }
        
        if (existingUser.password !== user.password) {
            return { 
                success: false, 
                message: "Incorrect password. Please try again." 
            };
        }
        
        // Store current user in localStorage
        localStorage.setItem("currentUser", JSON.stringify(existingUser));
        
        // Initialize user's data space if it doesn't exist
        // Using email as the key identifier for user data
        if (!localStorage.getItem(`userData_${existingUser.email}`)) {
            localStorage.setItem(`userData_${existingUser.email}`, JSON.stringify({}));
        }
        
        return { 
            success: true, 
            message: "Login successful! Redirecting to dashboard..."
        };
    } catch (error) {
        console.error("Login error:", error);
        return { 
            success: false, 
            message: "An error occurred during login. Please try again." 
        };
    }
}

/**
 * Signup function to register a new user
 * @param {Object} user - User object with email, password, and name
 * @returns {Object} Result with success status and message
 */
export function signup(user) {
    try {
        if (!localStorage) {
            return { success: false, message: "Your browser does not support localStorage." };
        }

        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem("users")) || [];
        
        // Check if user with this email already exists
        const existingUser = users.find(u => u.email === user.email);
        
        if (existingUser) {
            return { 
                success: false, 
                message: "A user with this email already exists. Please use a different email or login." 
            };
        }
        
        // Ensure user has a userId
        if (!user.userId) {
            // Create a user instance to generate userId if not already done
            const newUser = new User(user.email, user.password, user.name);
            user = { ...newUser };
        }
        
        // Add new user to users array
        users.push(user);
        
        // Save updated users array to localStorage
        localStorage.setItem("users", JSON.stringify(users));
        
        // Initialize user's data space using email as identifier
        localStorage.setItem(`userData_${user.email}`, JSON.stringify({}));
        
        return { 
            success: true, 
            message: "Account created successfully! Please login with your credentials."
        };
    } catch (error) {
        console.error("Signup error:", error);
        return { 
            success: false, 
            message: "An error occurred during registration. Please try again." 
        };
    }
}

/**
 * Function to reset form fields
 */
export function resetForm() {
    const inputs = document.querySelectorAll("input");
    if (inputs) {
        inputs.forEach(input => input.value = "");
    }
    
    const errorMessages = document.querySelectorAll(".error-message");
    if (errorMessages) {
        errorMessages.forEach(error => error.remove());
    }
}

/**
 * Function to get the currently logged-in user
 * @returns {Object|null} Current user object or null if not logged in
 */
export function getCurrentUser() {
    try {
        const userJson = localStorage.getItem("currentUser");
        return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
        console.error("Error getting current user:", error);
        return null;
    }
}

/**
 * Function to log out the current user
 */
export function logout() {
    try {
        localStorage.removeItem("currentUser");
        return { success: true };
    } catch (error) {
        console.error("Error during logout:", error);
        return { 
            success: false, 
            message: "An error occurred during logout. Please try again." 
        };
    }
}

/**
 * Function to save user-specific data
 * @param {string} key - The key to store the data under
 * @param {any} data - The data to store
 * @returns {Object} Result with success status and message
 */
export function saveUserData(key, data) {
    try {
        const currentUser = getCurrentUser();
        
        if (!currentUser || !currentUser.email) {
            return { 
                success: false, 
                message: "No user is currently logged in." 
            };
        }
        
        // Get existing user data using email as identifier
        const userDataKey = `userData_${currentUser.email}`;
        const userData = JSON.parse(localStorage.getItem(userDataKey)) || {};
        
        // Update data
        userData[key] = data;
        
        // Save back to localStorage
        localStorage.setItem(userDataKey, JSON.stringify(userData));
        
        return { 
            success: true, 
            message: "Data saved successfully." 
        };
    } catch (error) {
        console.error("Error saving user data:", error);
        return { 
            success: false, 
            message: "An error occurred while saving data." 
        };
    }
}

/**
 * Function to get user-specific data
 * @param {string} key - The key to retrieve the data from
 * @returns {any} The retrieved data, or null if not found
 */
export function getUserData(key) {
    try {
        const currentUser = getCurrentUser();
        
        if (!currentUser || !currentUser.email) {
            return null;
        }
        
        // Get user data using email as identifier
        const userDataKey = `userData_${currentUser.email}`;
        const userData = JSON.parse(localStorage.getItem(userDataKey)) || {};
        
        return userData[key] || null;
    } catch (error) {
        console.error("Error getting user data:", error);
        return null;
    }
}