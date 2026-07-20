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

        }

        catch (error) {

            console.error(
                "Invalid user data:",
                error
            );

        }

    }



    // ==========================================
    // PAGE ELEMENTS
    // ==========================================

    const welcomeMessage =
        document.getElementById("welcomeMessage");


    const welcomeSubtitle =
        document.getElementById("welcomeSubtitle");



    // ==========================================
    // DISPLAY USER INFORMATION
    // ==========================================

    if (user && user.username) {


        welcomeMessage.innerHTML =
            `Welcome back, ${user.username}!`;


        welcomeSubtitle.innerHTML =
            "We're glad you're here. Continue your journey of faith, healing, and personal growth.";


        console.log(
            "Logged in user:",
            user
        );


    } 
    
    else {


        welcomeMessage.innerHTML =
            "Welcome to Your Exodus";


        welcomeSubtitle.innerHTML =
            "Begin your journey of healing, faith, and rebuilding.";


        console.log(
            "No logged-in user found."
        );


    }



});