// =====================================
// Your Exodus Prayer Dashboard JavaScript
// =====================================

const API_URL = "https://yourexodus-api.onrender.com";

let currentPrayer = null;


// =====================================
// PAGE LOAD
// =====================================

document.addEventListener("DOMContentLoaded", () => {

    loadUserHeader();

    loadPrayers();

    const prayerForm = document.getElementById("prayerForm");

    if (prayerForm) {
        prayerForm.addEventListener(
            "submit",
            createPrayerEntry
        );
    }


    const refreshBtn =
        document.getElementById("refreshPrayers");

    if (refreshBtn) {

        refreshBtn.addEventListener(
            "click",
            loadPrayers
        );

    }


    const newPrayerBtn =
        document.getElementById("newPrayerBtn");

    if (newPrayerBtn) {

        newPrayerBtn.addEventListener(
            "click",
            startNewPrayer
        );

    }

});



// =====================================
// GET USER
// =====================================

function getCurrentUser() {

    const stored =
        localStorage.getItem("username");


    if (!stored) {

        return null;

    }


    try {

        return JSON.parse(stored);

    }

    catch {

        return {
            username: stored
        };

    }

}



// =====================================
// HEADER
// =====================================

function loadUserHeader() {

    const user = getCurrentUser();

    const header =
        document.getElementById(
            "prayerWelcome"
        );


    if (user && header) {

        header.textContent =
            `🙏 ${user.username}'s Prayer Center`;

    }

}



// =====================================
// CREATE PRAYER
// =====================================

async function createPrayerEntry(event) {

    event.preventDefault();


    const user =
        getCurrentUser();


    if (!user || !user.id) {

        alert(
            "Please login again."
        );

        return;

    }



    const prayerData = {

        title:
            document.getElementById("title").value,

        request:
            document.getElementById("prayerText").value,

        category:
            document.getElementById("prayerCategory").value,

        is_private:
            document.getElementById("isPrivate").value === "true",

        user_id:
            user.id

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


        const savedPrayer =
            await response.json();


        currentPrayer =
            savedPrayer;


        displayCurrentPrayer(
            savedPrayer
        );


        displayAIPrayer(
            savedPrayer
        );


        document
            .getElementById("prayerForm")
            .reset();


        loadPrayers();


    }


    catch(error) {

        console.error(
            error
        );

        alert(
            "Unable to submit prayer."
        );

    }

}




// =====================================
// CURRENT PRAYER
// =====================================

function displayCurrentPrayer(prayer) {


    const box =
        document.getElementById(
            "currentPrayer"
        );


    if (!box) return;



    box.innerHTML = `

        <h3>
            ${prayer.title}
        </h3>


        <p>
            📂 ${prayer.category || "General"}
        </p>


        <p>
            ${prayer.request}
        </p>


        <p>
            Status:
            ${prayer.status || "New"}
        </p>

    `;

}




// =====================================
// AI RESPONSE
// =====================================

function displayAIPrayer(prayer) {


    const box =
        document.getElementById(
            "aiPrayer"
        );


    if (!box) return;



    box.innerHTML = `

        <h3>
        🙏 Personalized Scripture-Based Prayer
        </h3>


        <p>
        ${
            prayer.ai_response
            ||
            "Your prayer has been received. Your Scripture-based prayer is being prepared."
        }
        </p>

    `;

}





// =====================================
// LOAD ONLY USER PRAYERS
// =====================================

async function loadPrayers() {


    const box =
        document.getElementById(
            "prayerList"
        );


    if (!box) return;



    const user =
        getCurrentUser();



    if (!user || !user.id) {

        box.innerHTML =
        "<p>Please login again.</p>";

        return;

    }



    try {


        const response =
            await fetch(
                `${API_URL}/prayers`
            );


        const prayers =
            await response.json();



        const myPrayers =
            prayers.filter(
                prayer =>
                prayer.user_id === user.id
            );



        myPrayers.sort(
            (a,b) =>
            new Date(b.created_at)
            -
            new Date(a.created_at)
        );



        box.innerHTML = "";



        if (myPrayers.length === 0) {

            box.innerHTML =
            `
            <p>
            No prayer requests yet.
            </p>
            `;

            return;

        }



        // Restore newest prayer
        if (!currentPrayer) {

            currentPrayer =
                myPrayers[0];

            displayCurrentPrayer(
                currentPrayer
            );

            displayAIPrayer(
                currentPrayer
            );

        }



        myPrayers.forEach(prayer => {


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "prayer-card";



            card.innerHTML = `

            <h3>
            ${prayer.title}
            </h3>


            <p>
            ${prayer.request}
            </p>


            <p>
            📅 ${
                new Date(
                    prayer.created_at
                ).toLocaleString()
            }
            </p>


            `;


            box.appendChild(
                card
            );


        });


    }


    catch(error) {

        console.error(error);

        box.innerHTML =
        "<p>Unable to load prayers.</p>";

    }

}



// =====================================
// NEW PRAYER
// =====================================

function startNewPrayer() {


    currentPrayer = null;


    document
    .getElementById("prayerForm")
    ?.reset();


    document
    .getElementById("currentPrayer")
    .innerHTML =
    "<p>Submit a new prayer request.</p>";



    document
    .getElementById("aiPrayer")
    .innerHTML =
    `
    <p>
    Your personalized Scripture-based prayer will appear here.
    </p>
    `;

}



// =====================================
// MARK ANSWERED
// =====================================

async function markPrayerAnswered(id) {

    await fetch(
        `${API_URL}/prayers/${id}`,
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


    loadPrayers();

}



// =====================================
// DELETE
// =====================================

async function deletePrayer(id) {


    if (!confirm(
        "Delete this prayer request?"
    )) return;



    await fetch(
        `${API_URL}/prayers/${id}`,
        {
            method:"DELETE"
        }
    );


    loadPrayers();

}