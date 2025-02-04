// Logic for Login Logout
//User Related logic will be written here

export function login(userInfo) {
    if (localStorage) {
        let users = JSON.parse(localStorage.getItem("users")) || [];

        // Check if the email already exists
        const existingUser = users.find(user => user.email === userInfo.email);

        if (existingUser) {
            alert("A user with this email is already registered.");
            return false; // Registration failed
        } else {
            // Add the new user and update localStorage
            users.push(userInfo);
            localStorage.setItem("users", JSON.stringify(users));

            // Also set the current user in `localStorage`
            localStorage.setItem("currentUser", JSON.stringify(userInfo));

            alert("Registration successful!");
            return true; // Registration successful
        }
    } else {
        alert("Outdated browser. LocalStorage is not supported.");
        return false; // Registration failed due to no localStorage support
    }
}

