export function login(userInfo) {
    if (!localStorage) {
        return { success: false, message: "Your browser does not support localStorage." };
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    const existingUser = users.find(user => user.email === userInfo.email);

    if (existingUser) {
        return { success: false, message: "A user with this email already exists." };
    } else {
        users.push(userInfo);
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("currentUser", JSON.stringify(userInfo));

        return { success: true, message: "Registration successful!", redirectUrl: "income-expense-form.html" };
    }
}
