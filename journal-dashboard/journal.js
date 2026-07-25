// =====================================
// Your Exodus Journal Dashboard JavaScript
// =====================================


const API_URL = "https://yourexodus-api.onrender.com";

let publicStories = [];





// =====================================
// PAGE INITIALIZATION
// =====================================

document.addEventListener("DOMContentLoaded", function () {


    loadUserHeader();

    loadJournals();


    const journalForm =
    document.getElementById("journalForm");


    if(journalForm){

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


function getCurrentUser(){


    const storedUser =
    localStorage.getItem("username");



    if(!storedUser){

        console.log(
            "No logged in user."
        );

        return null;

    }



    try{


        const user =
        JSON.parse(storedUser);



        if(typeof user === "object"){

            return user;

        }


    }

    catch(error){


        console.log(
            "Using username string."
        );


    }



    return {

        username:storedUser

    };


}








// =====================================
// USER HEADER
// =====================================


function loadUserHeader(){


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
// CREATE JOURNAL
// =====================================


async function createJournalEntry(event){


    event.preventDefault();



    const user =
    getCurrentUser();



    if(!user || !user.id){


        alert(
            "Please login again."
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
            error
        );


        alert(
            "Error saving journal."
        );


    }


}









// =====================================
// LOAD USER JOURNALS
// =====================================


async function loadJournals(){



    const user =
    getCurrentUser();



    if(!user || !user.id){

        return;

    }




    try{


        const response =
        await fetch(
            `${API_URL}/users/${user.id}`
        );



        const data =
        await response.json();




        const list =
        document.getElementById(
            "journalList"
        );



        if(!list){

            return;

        }




        list.innerHTML="";




        if(!data.journals ||
           data.journals.length===0){


            list.innerHTML = `

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


            <p>
            ${journal.entry}
            </p>


            <p>
            Mood:
            ${journal.mood || "Not provided"}
            </p>


            `;



            list.appendChild(card);



        });



    }


    catch(error){


        console.error(
            "Loading journals failed:",
            error
        );


    }


}










// =====================================
// DISCOVER STORIES
// =====================================


function initializeDiscoverStories(){



    const button =
    document.getElementById(
        "discoverStoriesBtn"
    );



    const overlay =
    document.getElementById(
        "discoverOverlay"
    );



    const close =
    document.getElementById(
        "closeDrawer"
    );





    if(button){


        button.addEventListener(
            "click",
            ()=>{


                overlay.classList.add(
                    "open"
                );


                loadPublicStories();


            }

        );


    }





    if(close){


        close.addEventListener(
            "click",
            ()=>{


                overlay.classList.remove(
                    "open"
                );


            }

        );


    }





    const refresh =
    document.getElementById(
        "refreshStories"
    );


    if(refresh){


        refresh.addEventListener(
            "click",
            loadPublicStories
        );


    }





    const search =
    document.getElementById(
        "storySearch"
    );


    if(search){


        search.addEventListener(
            "input",
            filterStories
        );


    }




    const mood =
    document.getElementById(
        "moodFilter"
    );


    if(mood){


        mood.addEventListener(
            "change",
            filterStories
        );


    }





    const sort =
    document.getElementById(
        "storySort"
    );


    if(sort){


        sort.addEventListener(
            "change",
            filterStories
        );


    }




    makeModalDraggable();


}









// =====================================
// LOAD PUBLIC STORIES
// =====================================


async function loadPublicStories(){



    const container =
    document.getElementById(
        "publicJournalList"
    );



    try{


        const response =
        await fetch(
            `${API_URL}/journals/public`
        );



        if(!response.ok){

            throw new Error(
                "Unable to load stories."
            );

        }





        publicStories =
        await response.json();




        displayStories(
            publicStories
        );


    }



    catch(error){


        console.error(
            error
        );


        container.innerHTML = `

        <div class="public-card">

        <h3>
        Error Loading Stories
        </h3>

        <p>
        ${error.message}
        </p>

        </div>

        `;


    }


}









// =====================================
// DISPLAY STORIES
// =====================================


function displayStories(stories){


    const container =
    document.getElementById(
        "publicJournalList"
    );



    container.innerHTML="";



    if(stories.length===0){


        container.innerHTML = `

        <div class="public-card">

        <h3>
        No stories found
        </h3>

        </div>

        `;


        return;

    }




    stories.forEach(
        story=>{


        const card =
        document.createElement(
            "div"
        );


        card.className =
        "public-card";



        card.innerHTML = `


        <h3>
        ${story.title}
        </h3>


        <p>
        ${story.entry.substring(0,160)}...
        </p>


        <p>
        Mood:
        ${story.mood || "Not provided"}
        </p>


        `;



        container.appendChild(card);



    });


}









// =====================================
// SEARCH + FILTER
// =====================================


function filterStories(){


    const search =
    document
    .getElementById(
        "storySearch"
    )
    .value
    .toLowerCase();



    const mood =
    document
    .getElementById(
        "moodFilter"
    )
    .value;




    let filtered =
    publicStories.filter(
        story=>{


        const matchesSearch =
        story.title.toLowerCase()
        .includes(search)
        ||
        story.entry.toLowerCase()
        .includes(search);



        const matchesMood =
        mood==="all"
        ||
        story.mood===mood;



        return matchesSearch && matchesMood;


    });




    const sort =
    document.getElementById(
        "storySort"
    ).value;




    if(sort==="oldest"){


        filtered.reverse();


    }



    displayStories(
        filtered
    );


}










// =====================================
// DRAG MODAL
// =====================================


function makeModalDraggable(){


    const modal =
    document.getElementById(
        "discoverModal"
    );


    const header =
    document.getElementById(
        "modalDrag"
    );



    let offsetX=0;

    let offsetY=0;

    let dragging=false;




    header.onmousedown =
    function(e){


        dragging=true;


        offsetX =
        e.clientX -
        modal.offsetLeft;


        offsetY =
        e.clientY -
        modal.offsetTop;


    };





    document.onmousemove =
    function(e){


        if(!dragging){

            return;

        }


        modal.style.left =
        (e.clientX-offsetX)+"px";


        modal.style.top =
        (e.clientY-offsetY)+"px";


    };





    document.onmouseup =
    function(){


        dragging=false;


    };


}