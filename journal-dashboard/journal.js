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

    const journalForm = document.getElementById("journalForm");

    if (journalForm) {
        journalForm.addEventListener(
            "submit",
            createJournalEntry
        );
    }

    initializeDiscoverStories();

    makeModalDraggable();

});



// =====================================
// GET CURRENT USER
// =====================================

function getCurrentUser() {

    const storedUser = localStorage.getItem("username");

    if (!storedUser) {
        return null;
    }


    try {

        const user = JSON.parse(storedUser);

        if (typeof user === "object" && user !== null) {
            return user;
        }

    } catch(error) {

        console.log("Username stored as text.");

    }


    return {
        username: storedUser
    };

}



// =====================================
// LOAD USER HEADER
// =====================================

function loadUserHeader() {

    const user = getCurrentUser();

    const header =
    document.getElementById(
        "journalWelcome"
    );


    if (user && header) {

        header.innerHTML =
        `📝 ${user.username}'s Journal`;

    }

}



// =====================================
// CREATE JOURNAL ENTRY
// =====================================

async function createJournalEntry(event) {

    event.preventDefault();


    const user = getCurrentUser();


    if (!user || !user.id) {

        alert("Please login again.");

        return;

    }



    const journalData = {

        title:
        document.getElementById("journalTitle")?.value || "",


        entry:
        document.getElementById("journalEntry")?.value || "",


        scripture:
        document.getElementById("journalScripture")?.value || "",


        mood:
        document.getElementById("journalMood")?.value || "",


        is_private:
        document.getElementById("journalPrivacy")?.value === "true",


        user_id:
        user.id

    };



    try {


        const response =
        await fetch(
            `${API_URL}/journals`,
            {

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:
                JSON.stringify(journalData)

            }
        );



        if (!response.ok) {

            throw new Error(
                "Unable to save journal"
            );

        }



        alert(
            "Journal entry saved successfully!"
        );


        document
        .getElementById("journalForm")
        ?.reset();


        loadJournals();


    }

    catch(error) {

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

async function loadJournals() {


    const user =
    getCurrentUser();


    if (!user || !user.id) {
        return;
    }



    try {


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


        if (!list) {
            return;
        }



        list.innerHTML = "";



        if (!data.journals ||
            data.journals.length === 0) {


            list.innerHTML = `

            <div class="journal-card">

                <h3>No journal entries yet</h3>

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


            <p>
            ${journal.entry}
            </p>


            <p>
            🙏 Mood:
            ${journal.mood || "Not provided"}
            </p>


            `;


            list.appendChild(card);


        });



    }

    catch(error) {

        console.error(
            "Journal loading error:",
            error
        );

    }


}




// =====================================
// DISCOVER STORIES
// =====================================

function initializeDiscoverStories() {


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



    if (button && overlay) {


        button.addEventListener(
            "click",
            function(){

                overlay.classList.add(
                    "open"
                );

                loadPublicStories();

            }
        );

    }



    if(close && overlay) {


        close.addEventListener(
            "click",
            function(){

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


    if(refresh) {

        refresh.addEventListener(
            "click",
            loadPublicStories
        );

    }



    const search =
    document.getElementById(
        "storySearch"
    );


    if(search) {

        search.addEventListener(
            "input",
            filterStories
        );

    }




    const mood =
    document.getElementById(
        "moodFilter"
    );


    if(mood) {

        mood.addEventListener(
            "change",
            filterStories
        );

    }



    const sort =
    document.getElementById(
        "storySort"
    );


    if(sort) {

        sort.addEventListener(
            "change",
            filterStories
        );

    }


    const usernameFilter =
    document.getElementById(
        "storyUsernameFilter"
    );


    if(usernameFilter) {

        usernameFilter.addEventListener(
            "input",
            filterStories
        );

    }



    const dateFilter =
    document.getElementById(
        "storyDateFilter"
    );


    if(dateFilter) {

        dateFilter.addEventListener(
            "change",
            filterStories
        );

    }

}






// =====================================
// LOAD PUBLIC STORIES
// =====================================

async function loadPublicStories() {


    const container =
    document.getElementById(
        "publicJournalList"
    );


    if(!container){
        return;
    }



    try {


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


        console.error(error);


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


    if(!container){
        return;
    }


    container.innerHTML = "";



    if(stories.length === 0){


        container.innerHTML = `

        <div class="public-card">

        <h3>
        No stories found
        </h3>

        </div>

        `;

        return;

    }




    stories.forEach(story => {



        const card =
        document.createElement(
            "div"
        );


        card.className =
        "public-card";



        const username =
        story.username ||
        story.user?.username ||
        story.author ||
        "Community Member";



        const date =
        story.created_at
        ?
        new Date(
            story.created_at
        ).toLocaleDateString()
        :
        "Date unavailable";



        const snippet = story.entry ? story.entry.substring(0, 160) : "";

        card.innerHTML = `


        <h3>
        📝 ${story.title}
        </h3>



        <p>
        👤 ${username}
        </p>



        <p>
        📅 ${date}
        </p>



        <p>
        ${snippet}...
        </p>



        <p>
        🙏 Mood:
        ${story.mood || "Not provided"}
        </p>



        `;


        container.appendChild(card);



    });


}





// =====================================
// SEARCH / FILTER / SORT
// =====================================

function filterStories(){

    const search =
    (document.getElementById("storySearch")?.value || "").toLowerCase();

    const mood =
    document.getElementById("moodFilter")?.value || "all";

    const usernameFilter =
    (document.getElementById("storyUsernameFilter")?.value || "").toLowerCase();

    const dateFilter =
    document.getElementById("storyDateFilter")?.value || "";

    let filtered =
    publicStories.filter(
        story => {

            const username =
            story.username ||
            story.user?.username ||
            story.author ||
            "Community Member";

            const text =
            `${story.title || ""} ${story.entry || ""} ${username}`
            .toLowerCase();

            const matchesSearch =
            text.includes(search);

            const matchesMood =
            mood === "all" ||
            story.mood === mood;

            const matchesUsername =
            username
            .toLowerCase()
            .includes(usernameFilter);

            let matchesDate = true;

            if(dateFilter && story.created_at){

                const storyDate =
                new Date(
                    story.created_at
                )
                .toISOString()
                .split("T")[0];

                matchesDate =
                storyDate === dateFilter;

            }

            return matchesSearch &&
                   matchesMood &&
                   matchesUsername &&
                   matchesDate;

        }
    );

    const sort =
    document.getElementById("storySort")?.value;

    if(sort === "oldest"){
        filtered.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
    } else {
        filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
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


    if(!modal || !header){
        return;
    }



    let dragging = false;

    let offsetX = 0;

    let offsetY = 0;



    header.onmousedown =
    function(e){


        dragging = true;


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
        (e.clientX - offsetX) + "px";



        modal.style.top =
        (e.clientY - offsetY) + "px";


    };



    document.onmouseup =
    function(){

        dragging = false;

    };

}