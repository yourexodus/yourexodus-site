// ==========================================
// YOUR EXODUS DASHBOARD
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("Your Exodus Dashboard Loaded");

    // Get username from browser storage
    const username = localStorage.getItem("username");

    const welcomeMessage =
        document.getElementById("welcomeMessage");

    const welcomeSubtitle =
        document.getElementById("welcomeSubtitle");

    if (username) {

        welcomeMessage.innerHTML =
            `Welcome back, ${username}!`;

        welcomeSubtitle.innerHTML =
            "We're glad you're here. Continue your journey of faith, healing, and personal growth.";

    } else {

        welcomeMessage.innerHTML =
            "Welcome to Your Exodus";

        welcomeSubtitle.innerHTML =
            "Begin your journey of healing, faith, and rebuilding.";

    }

});