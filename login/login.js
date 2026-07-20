// =====================================
// YOUR EXODUS LOGIN
// Connects Frontend to Flask API
// =====================================

const loginForm = document.getElementById("loginForm");

const messageBox = document.getElementById("message");


loginForm.addEventListener("submit", async function(event){

    event.preventDefault();

    // Get form values
    const username =
        document.getElementById("username").value;

    const password =
        document.getElementById("password").value;


    // Build request body
    const loginData = {

        username: username,

        password: password

    };


    try {

        const response = await fetch(

            "https://yourexodus-api.onrender.com/users/login",

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify(loginData)

            }

        );


        const data = await response.json();


        if (response.ok) {

            messageBox.style.color = "green";

            messageBox.innerHTML =
                "Login successful! Redirecting to your dashboard...";

            // Save logged-in username
            localStorage.setItem(
                "username",
                username
            );

            // Redirect to dashboard
            setTimeout(function () {

                window.location.href =
                    "../dashboard/index.html";

            }, 1500);

        }

        else {

            messageBox.style.color = "red";

            messageBox.innerHTML =
                data.message ||
                "Invalid username or password.";

        }

    }

    catch (error) {

        console.error(
            "Connection error:",
            error
        );

        messageBox.style.color = "red";

        messageBox.innerHTML =
            "Unable to connect to the server.";

    }

});