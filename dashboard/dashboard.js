// ==========================================
// YOUR EXODUS DASHBOARD
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    console.log("Your Exodus Dashboard Loaded");

    // ==========================================
    // GET LOGGED-IN USER FROM LOCAL STORAGE
    // ==========================================
    const storedUser = localStorage.getItem("username");
    let user = null;

    if (storedUser) {
        try {
            user = JSON.parse(storedUser);
        } catch (error) {
            console.error("Invalid user data:", error);
        }
    }

    // ==========================================
    // PAGE ELEMENTS
    // ==========================================
    const welcomeMessage = document.getElementById("welcomeMessage");
    const welcomeSubtitle = document.getElementById("welcomeSubtitle");
    const adminSection = document.getElementById("adminSection");

    // ==========================================
    // DISPLAY USER INFORMATION
    // ==========================================
    if (user && user.username) {
        if (welcomeMessage) {
            welcomeMessage.innerHTML = `Welcome back, ${user.username}!`;
        }
        if (welcomeSubtitle) {
            welcomeSubtitle.innerHTML = "We're glad you're here. Continue your journey of faith, healing, and personal growth.";
        }
        console.log("Logged in user:", user);
    } else {
        if (welcomeMessage) {
            welcomeMessage.innerHTML = "Welcome to Your Exodus";
        }
        if (welcomeSubtitle) {
            welcomeSubtitle.innerHTML = "Begin your journey of healing, faith, and rebuilding.";
        }
        console.log("No logged-in user found.");
    }

    // ==========================================
    // SHOW ADMIN DASHBOARD FOR ADMINS ONLY
    // ==========================================
    if (adminSection) {
        if (user && user.is_admin === true) {
            adminSection.style.display = "block";
            console.log("Admin access granted.");
        } else {
            adminSection.style.display = "none";
        }
    }
});