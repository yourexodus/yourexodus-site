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



    const journalForm =
        document.getElementById("journalForm");



    if (journalForm) {

        journalForm.addEventListener(
            "submit",
            createJournalEntry
        );

    }



    initializeDiscoverStories();


});





// =====================================
// GET CURRENT USER
// =====================================

function getCurrentUser() {


    const storedUser =
        localStorage.getItem("username");



    if (!storedUser) {

        console.log(
            "No logged-in user found."
        );

        return null;

    }



    try {


        return JSON.parse(storedUser);


    }


    catch(error) {


        console.error(
            "Invalid user data:",
            error
        );


        return null;


    }


}







// =====================================
// DISPLAY USER NAME
// =====================================

function loadUserHeader() {


    const user =
        getCurrentUser();



    const header =
        document.getElementById(
            "journalWelcome"
        );



    if(user && header){


        header.innerHTML =
        `📝 ${user.username}'s Journal`;


    }


}







// =====================================
// CREATE JOURNAL ENTRY
// =====================================

async function createJournalEntry(event){


    event.preventDefault();



    const user =
        getCurrentUser();



    if(!user){


        alert(
            "Please login before creating a journal entry."
        );


        return;


    }




    const journalData = {


        title:
        document.getElementById(
            "journalTitle"
        ).value,



        entry:
        document.getElementById(
            "journalEntry"
        ).value,



        scripture:
        document.getElementById(
            "journalScripture"
        ).value,



        mood:
        document.getElementById(
            "journalMood"
        ).value,



        is_private:
        document.getElementById(
            "journalPrivacy"
        ).value === "true",



        user_id:
        user.id


    };





    try{


        const response =
        await fetch(
            `${API_URL}/journals`,
            {

                method:"POST",

                headers:{

                    "Content-Type":
                    "application/json"

                },


                body:
                JSON.stringify(journalData)

            }
        );





        if(!response.ok){


            const error =
            await response.json();



            console.error(
                error
            );


            throw new Error(
                "Unable to save journal."
            );


        }




        alert(
            "Journal entry saved successfully!"
        );



        document
        .getElementById(
            "journalForm"
        )
        .reset();



        loadJournals();



    }


    catch(error){


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
// LOAD USER JOURNALS
// =====================================

async function loadJournals(){



    const user =
        getCurrentUser();



    if(!user){

        return;

    }



    try{


        const response =
        await fetch(
            `${API_URL}/users/${user.id}`
        );



        if(!response.ok){


            throw new Error(
                "Unable to load journals."
            );


        }





        const data =
        await response.json();




        const journalList =
        document.getElementById(
            "journalList"
        );



        if(!journalList){

            return;

        }




        journalList.innerHTML = "";




        if(
            !data.journals ||
            data.journals.length === 0
        ){


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







        data.journals.forEach(journal=>{


            const card =
            document.createElement(
                "div"
            );



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
                    <p>
                    Scripture:
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


    catch(error){


        console.error(
            "Journal loading error:",
            error
        );


    }


}







// =====================================
// DISCOVER STORIES
// =====================================

function initializeDiscoverStories(){


    const discoverButton =
    document.getElementById(
        "discoverStoriesBtn"
    );



    const drawer =
    document.getElementById(
        "discoverDrawer"
    );



    const closeButton =
    document.getElementById(
        "closeDrawer"
    );




    if(discoverButton && drawer){


        discoverButton.addEventListener(
            "click",
            ()=>{


                drawer.classList.add(
                    "open"
                );


                loadPublicStories();


            }
        );


    }





    if(closeButton && drawer){


        closeButton.addEventListener(
            "click",
            ()=>{


                drawer.classList.remove(
                    "open"
                );


            }
        );


    }



}







// =====================================
// LOAD PUBLIC JOURNALS
// =====================================

async function loadPublicStories(){



    const container =
    document.getElementById(
        "publicJournalList"
    );



    if(!container){

        return;

    }



    try{


        const response =
        await fetch(
            `${API_URL}/journals/public`
        );



        if(!response.ok){


            throw new Error(
                "Unable to load public stories."
            );


        }




        const journals =
        await response.json();




        container.innerHTML = "";




        if(journals.length === 0){


            container.innerHTML = `

            <div class="public-card">

                <h3>
                No public stories yet
                </h3>


                <p>
                Be the first to share your story.
                </p>


            </div>

            `;


            return;


        }







        journals.forEach(journal=>{


            const card =
            document.createElement(
                "div"
            );



            card.className =
            "public-card";




            card.innerHTML = `


                <h3>
                ${journal.title}
                </h3>


                <p>
                ${journal.entry.substring(0,150)}...
                </p>


                <p>
                Mood:
                ${journal.mood || "Not provided"}
                </p>



            `;



            container.appendChild(card);



        });



    }


    catch(error){


        console.error(
            "Public journal error:",
            error
        );



        container.innerHTML = `

        <div class="public-card">

            <h3>
            Error loading stories
            </h3>


            <p>
            ${error.message}
            </p>


        </div>

        `;


    }



}