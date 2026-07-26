// =====================================
// Your Exodus Prayer Dashboard JavaScript
// =====================================

const API_URL = "https://yourexodus-api.onrender.com";


// =====================================
// PAGE INITIALIZATION
// =====================================

document.addEventListener("DOMContentLoaded", function () {

    loadUserHeader();

    loadPrayers();


    const prayerForm =
    document.getElementById("prayerForm");


    if (prayerForm) {

        prayerForm.addEventListener(
            "submit",
            createPrayerEntry
        );

    }

});




// =====================================
// GET CURRENT USER
// =====================================

function getCurrentUser() {


    const storedUser =
    localStorage.getItem("username");


    if (!storedUser) {

        return null;

    }



    try {


        const user =
        JSON.parse(storedUser);


        if (
            typeof user === "object" &&
            user !== null
        ) {

            return user;

        }


    }

    catch(error) {


        console.log(
            "Username stored as text."
        );


    }



    return {

        username: storedUser

    };


}




// =====================================
// LOAD USER HEADER
// =====================================

function loadUserHeader() {


    const user =
    getCurrentUser();



    const header =
    document.getElementById(
        "prayerWelcome"
    );



    if(user && header){


        header.innerHTML =
        `🙏 ${user.username}'s Prayer Wall`;


    }


}





// =====================================
// CREATE PRAYER ENTRY
// =====================================

async function createPrayerEntry(event){


    event.preventDefault();



    const user =
    getCurrentUser();



    if(!user || !user.id){


        alert(
            "Please login again to submit a prayer."
        );


        return;

    }




    const title =
    document.getElementById("title")?.value || "";



    const request =
    document.getElementById("prayerText")?.value || "";





    const prayerData = {


        title: title,


        request: request,


        user_id: user.id


    };





    try {



        const response =
        await fetch(
            `${API_URL}/prayers`,
            {

                method:"POST",

                headers:{

                    "Content-Type":
                    "application/json"

                },


                body:
                JSON.stringify(prayerData)

            }

        );





        if(!response.ok){


            throw new Error(
                "Unable to save prayer request."
            );


        }





        alert(
            "Your prayer request has been submitted. God hears your heart."
        );




        document
        .getElementById("prayerForm")
        ?.reset();




        loadPrayers();



    }



    catch(error){


        console.error(
            "Prayer creation error:",
            error
        );


        alert(
            "Error submitting prayer request."
        );


    }


}







// =====================================
// LOAD PRAYERS
// =====================================

async function loadPrayers(){



    const container =
    document.getElementById(
        "prayerList"
    );



    if(!container){

        return;

    }





    try {



        const response =
        await fetch(
            `${API_URL}/prayers`
        );





        if(!response.ok){


            throw new Error(
                "Unable to load prayers."
            );


        }





        const prayers =
        await response.json();





        container.innerHTML = "";





        if(
            !prayers ||
            prayers.length === 0
        ){


            container.innerHTML = `

            <div class="prayer-card">

                <h3>
                No prayer requests yet
                </h3>

                <p>
                Submit your first prayer request above.
                </p>

            </div>

            `;


            return;


        }






        prayers.forEach(prayer => {



            const card =
            document.createElement(
                "div"
            );



            card.className =
            "prayer-card";





            const date =
            prayer.created_at
            ?
            new Date(
                prayer.created_at
            ).toLocaleDateString()
            :
            "Recently";





            const status =
            prayer.answered
            ?
            "✅ Answered Prayer"
            :
            "🙏 Being Prayed For";






            card.innerHTML = `


            <h3>
            ${prayer.title}
            </h3>


            <p>
            ${prayer.request}
            </p>


            <p>
            📅 ${date}
            </p>


            <p>
            ${status}
            </p>



            ${
                !prayer.answered

                ?

                `
                <button
                onclick="markPrayerAnswered(${prayer.id})">
                Mark Answered
                </button>
                `

                :

                ""

            }



            <button
            onclick="deletePrayer(${prayer.id})">
            Delete
            </button>



            `;




            container.appendChild(card);



        });





    }



    catch(error){


        console.error(
            "Loading prayers failed:",
            error
        );


        container.innerHTML = `

        <div class="prayer-card">

        <h3>
        Error Loading Prayers
        </h3>

        <p>
        Unable to connect to prayer service.
        </p>

        </div>

        `;


    }



}






// =====================================
// MARK PRAYER ANSWERED
// =====================================

async function markPrayerAnswered(prayerId){


    try {



        const response =
        await fetch(
            `${API_URL}/prayers/${prayerId}`,
            {

                method:"PUT",

                headers:{

                    "Content-Type":
                    "application/json"

                },


                body:
                JSON.stringify({

                    answered:true

                })


            }

        );




        if(!response.ok){

            throw new Error(
                "Unable to update prayer."
            );

        }





        loadPrayers();



    }



    catch(error){


        console.error(error);


        alert(
            "Unable to update prayer."
        );


    }



}






// =====================================
// DELETE PRAYER
// =====================================

async function deletePrayer(prayerId){



    const confirmDelete =
    confirm(
        "Delete this prayer request?"
    );



    if(!confirmDelete){

        return;

    }





    try {



        const response =
        await fetch(
            `${API_URL}/prayers/${prayerId}`,
            {

                method:"DELETE"

            }

        );





        if(!response.ok){

            throw new Error(
                "Unable to delete prayer."
            );

        }





        loadPrayers();



    }



    catch(error){


        console.error(error);


        alert(
            "Unable to delete prayer."
        );


    }


}