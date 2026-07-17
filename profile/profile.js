// ==========================================
// YOUR EXODUS PROFILE
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    // Get logged-in user from localStorage
    const storedUser = localStorage.getItem("user");

    // If no user is logged in, return to login page
    if (!storedUser) {

        alert("Please login to continue.");

        window.location.href = "../login/index.html";

        return;
    }

    // Convert stored JSON into an object
    const user = JSON.parse(storedUser);

    // Display username
    const usernameElement = document.getElementById("username");

    if (usernameElement) {

        usernameElement.textContent =
            user.username || "Your Exodus Member";

    }

    // Display email
    const emailElement = document.getElementById("email");

    if (emailElement) {

        emailElement.textContent =
            user.email || "Email unavailable";

    }

    console.log("Profile Loaded");

    console.log(user);

});