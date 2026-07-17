// =====================================
// YOUR EXODUS LOGIN
// Connects Frontend to Flask API
// =====================================


const loginForm = document.getElementById("loginForm");

const messageBox = document.getElementById("message");



loginForm.addEventListener("submit", async function(event){


    event.preventDefault();



    const username =
        document.getElementById("username").value;



    const password =
        document.getElementById("password").value;




    const loginData = {


        username: username,

        password: password


    };




    try {


        const response = await fetch(

            "http://127.0.0.1:10000/users/login",

            {


                method:"POST",


                headers:{


                    "Content-Type":"application/json"


                },


                body:JSON.stringify(loginData)


            }

        );




        const data = await response.json();





        if(response.ok){



            messageBox.style.color="green";


            messageBox.innerHTML =
            "Login successful! Welcome back.";





            // Save user session

            localStorage.setItem(
                "user",
                JSON.stringify(data)
            );




            setTimeout(function(){


                window.location.href =
                "../index.html";


            },1500);




        }

        else {



            messageBox.style.color="red";


            messageBox.innerHTML =
            data.message ||
            "Invalid username or password.";



        }



    }



    catch(error){



        console.error(error);



        messageBox.style.color="red";


        messageBox.innerHTML =
        "Cannot connect to server. Make sure Flask is running.";



    }



});