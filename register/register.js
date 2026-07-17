// =====================================
// YOUR EXODUS - USER REGISTRATION
// Connects Frontend to Flask API
// =====================================


const registerForm = document.getElementById("registerForm");

const messageBox = document.getElementById("message");



registerForm.addEventListener("submit", async function(event) {

    event.preventDefault();


    // Get form values

    const username = document.getElementById("username").value;

    const email = document.getElementById("email").value;

    const password = document.getElementById("password").value;



    // API request body

    const userData = {

        username: username,

        email: email,

        password: password

    };



    try {


        const response = await fetch(
            "http://127.0.0.1:10000/users/register",
            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify(userData)

            }
        );



        const data = await response.json();



        if(response.ok){


            messageBox.style.color = "green";

            messageBox.innerHTML =
                "Account created successfully! Redirecting to login...";


            console.log("Registration successful:", data);



            // Send user to login page

            setTimeout(function(){

                window.location.href =
                    "../login/index.html";

            }, 2000);



        }

        else {


            messageBox.style.color = "red";


            messageBox.innerHTML =
                data.message ||
                "Registration failed. Please try again.";


            console.log("Registration error:", data);


        }



    }

    catch(error){


        console.error(
            "Connection error:",
            error
        );


        messageBox.style.color = "red";


        messageBox.innerHTML =
            "Unable to connect to server. Make sure your API is running.";


    }



});