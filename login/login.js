// =====================================
// YOUR EXODUS LOGIN
// Connects Frontend to Flask API
// Saves Logged-In User
// =====================================

const loginForm = document.getElementById("loginForm");
const messageBox = document.getElementById("message");

const API_URL = "https://yourexodus-api.onrender.com";

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const username =
        document.getElementById("username").value.trim();

    const password =
        document.getElementById("password").value;

    const loginData = {

        username: username,
        password: password

    };

    try {

        const response = await fetch(

            `${API_URL}/users/login`,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify(loginData)

            }

        );

        const data = await response.json();

        console.log("LOGIN RESPONSE:", data);

        if (!response.ok) {

            messageBox.style.color = "red";

            messageBox.innerHTML =
                data.message || "Invalid username or password.";

            return;

        }

        // =====================================
        // SAVE USER SESSION
        // =====================================

        const loggedInUser = {

            id: data.id,
            username: data.username || username,
            email: data.email || ""

        };

        console.log("Logged In User:", loggedInUser);

        // Store the entire user object
        localStorage.setItem(
            "username",
            JSON.stringify(loggedInUser)
        );

        messageBox.style.color = "green";

        messageBox.innerHTML =
            "Login successful! Redirecting to your dashboard...";

        setTimeout(function () {

            window.location.href =
                "../dashboard/index.html";

        }, 1500);

    }

    catch (error) {

        console.error("Connection error:", error);

        messageBox.style.color = "red";

        messageBox.innerHTML =
            "Unable to connect to the server.";

    }

});