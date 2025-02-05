window.addEventListener('load',init);
function init(){
    isAlreadyLogin();
   bindLogoutEvent();
   alertMessages();
}

function alertMessages() {
    const modal = document.getElementById("alert-modal");
    const title = document.getElementById("alert-title");
    const closeBtn = document.getElementById("alert-close-btn");
    const okBtn = document.getElementById("alert-ok-btn");

    let redirectUrl = null; // Variable to store redirection URL

    // Function to show modal
    function showModal(alertTitle, url = null) {
        title.innerText = alertTitle;
        redirectUrl = url; // Store the URL if provided

        modal.classList.remove("hidden");
        modal.querySelector("div").classList.add("scale-100", "opacity-100");
    }

    // Function to hide modal
    function hideModal() {
        modal.classList.add("hidden");
        modal.querySelector("div").classList.remove("scale-100", "opacity-100");

        // Redirect after modal closes (if URL is provided)
        if (redirectUrl) {
            location.href = redirectUrl;
        }
    }

    // Close modal on close button click
    closeBtn.addEventListener("click", hideModal);

    // Close modal on OK button click
    okBtn.addEventListener("click", hideModal);

    // Expose function to global scope for easy access
    window.showAlert = showModal;
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
    // location.href = "index.html";
    showAlert("Logged out succesfully", "index.html")
}
function bindLogoutEvent(){
    document.querySelector("#goLogout").addEventListener('click', logout);
}