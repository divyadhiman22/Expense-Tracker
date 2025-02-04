window.addEventListener('load',init);
function init(){
    isAlreadyLogin();
   bindLogoutEvent();
}

function isAlreadyLogin() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (currentUser) {
        // Greet the current user by their name
        document.querySelector("#greet").innerText = currentUser.name;
    } else {
        // Redirect to the login page if no user is logged in
        location.href = "index.html";
    }
}

function logout(){
    location.href = "index.html";
    alert("Logged out succesfully")
}
function bindLogoutEvent(){
    document.querySelector("#goLogout").addEventListener('click', logout);
}