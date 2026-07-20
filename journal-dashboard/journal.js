
// =====================================
// Your Exodus Journal Dashboard JavaScript
// =====================================


// =====================================
// API CONFIGURATION
// =====================================

const API_URL = "https://yourexodus-api.onrender.com";


// =====================================
// PAGE INITIALIZATION
// =====================================

document.addEventListener("DOMContentLoaded", function () {

    loadUserHeader();

    loadJournals();

    const journalForm = document.getElementById("journalForm");

    if (journalForm) {

        journalForm.addEventListener(
            "submit",
            createJournalEntry
        );

    }

});



// =====================================
// GET CURRENT USER
// =====================================

function getCurrentUser() {

    const storedUser = localStorage.getItem("user");


    if (!storedUser) {

        console.log("No logged-in user found.");

        return null;

    }


    try {

        return JSON.parse(storedUser);

    }

    catch(error) {

        console.error(
            "Invalid user data in storage:",
            error
        );

        return null;

    }

}




// =====================================
// DISPLAY USER NAME
// =====================================

function loadUserHeader() {


    const user = getCurrentUser();


    const header =
    document.getElementById("journalWelcome");



    if (user && header) {


        header.innerHTML =
        `📝 ${user.username}'s Journey Journal`;


    }


}






// =====================================
// CREATE JOURNAL ENTRY
// =====================================

async function createJournalEntry(event) {


    event.preventDefault();



    const user = getCurrentUser();



    if (!user) {


        alert(
            "Please login before creating a journal entry."
        );


        return;


    }




    const journalData = {


        title:
        document.getElementById("journalTitle").value,


        entry:
        document.getElementById("journalEntry").value,


        scripture:
        document.getElementById("journalScripture").value,


        mood:
        document.getElementById("journalMood").value,


        is_private:
        document.getElementById("journalPrivacy").value === "true",


        user_id:
        user.id


    };




    try {


        const response = await fetch(

            `${API_URL}/journals`,

            {

                method: "POST",


                headers: {

                    "Content-Type": "application/json"

                },


                body:
                JSON.stringify(journalData)


            }

        );




        if (!response.ok) {


            const error =
            await response.json();


            console.error(
                "API Error:",
                error
            );


            throw new Error(
                "Unable to save journal entry."
            );


        }





        alert(
            "Journal entry saved successfully!"
        );



        document
        .getElementById("journalForm")
        .reset();



        loadJournals();



    }


    catch(error) {


        console.error(
            "Journal save error:",
            error
        );


        alert(
            "There was an error saving your journal."
        );


    }


}






// =====================================
// LOAD JOURNAL HISTORY
// =====================================

async function loadJournals() {


    const user = getCurrentUser();



    if (!user) {

        return;

    }



    try {


        const response = await fetch(

            `${API_URL}/users/${user.id}`

        );





        if (!response.ok) {


            throw new Error(
                "Unable to load journals."
            );


        }




        const data =
        await response.json();





        const journalList =
        document.getElementById("journalList");



        if (!journalList) {

            return;

        }



        journalList.innerHTML = "";






        if (
            !data.journals ||
            data.journals.length === 0
        ) {



            journalList.innerHTML = `

            <div class="journal-card">

                <h3>
                No journal entries yet
                </h3>

                <p>
                Begin your journey by creating your first reflection.
                </p>

            </div>

            `;


            return;


        }





        data.journals.forEach(journal => {



            const card =
            document.createElement("div");



            card.className =
            "journal-card";





            card.innerHTML = `


                <h3>
                ${journal.title}
                </h3>



                <p class="date">

                ${
                journal.created_at
                ?
                new Date(
                    journal.created_at
                ).toLocaleDateString()
                :
                ""
                }

                </p>





                <p>
                ${journal.entry}
                </p>





                ${
                journal.scripture
                ?
                `
                <strong>
                Scripture:
                </strong>

                <p>
                ${journal.scripture}
                </p>
                `
                :
                ""
                }




                <p>
                Mood:
                ${journal.mood || "Not provided"}
                </p>



            `;




            journalList.appendChild(card);



        });



    }


    catch(error) {


        console.error(
            "Journal loading error:",
            error
        );


    }


}
 
