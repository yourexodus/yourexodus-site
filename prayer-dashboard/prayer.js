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


    const prayerForm =
        document.getElementById("prayerForm");


    if (prayerForm) {

        prayerForm.addEventListener(
            "submit",
            createPrayerEntry
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


    const refreshBtn =
        document.getElementById("refreshPrayers");


    if (refreshBtn) {

        refreshBtn.addEventListener(
            "click",
            loadPrayers
        );

    }

});



// =====================================
// CURRENT USER
// =====================================

function getCurrentUser() {

    const storedUser =
        localStorage.getItem("username");


    if (!storedUser) {

        return null;

    }


    try {

        return JSON.parse(storedUser);

    }

    catch {

        return {
            username: storedUser
        };

    }

}



// =====================================
// USER HEADER
// =====================================

function loadUserHeader() {

    const user =
        getCurrentUser();


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
// NEW PRAYER
// =====================================

function startNewPrayer() {


    currentPrayer = null;


    document
        .getElementById("prayerForm")
        .reset();


    document
        .getElementById("prayerFormTitle")
        .textContent =
        "🆕 New Prayer Request";


    document
        .getElementById("currentPrayer")
        .innerHTML =
        `
        <p>
        Submit a new prayer request.
        </p>
        `;


    document
        .getElementById("aiPrayer")
        .innerHTML =
        `
        <p>
        Your personalized Scripture-based prayer
        will appear here after submission.
        </p>
        `;

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



        if (!response.ok) {

            throw new Error(
                "Prayer submission failed."
            );

        }



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
            .getElementById("prayerFormTitle")
            .textContent =
            "🙏 Current Prayer";



        loadPrayers();



    }


    catch(error) {


        console.error(error);


        alert(
            "Unable to submit prayer."
        );

    }

}




// =====================================
// DISPLAY CURRENT PRAYER
// =====================================

function displayCurrentPrayer(prayer) {


    const container =
        document.getElementById(
            "currentPrayer"
        );


    if (!container) {

        return;

    }



    container.innerHTML =
    `

    <h3>
    ${prayer.title}
    </h3>


    <p>
    <strong>Category:</strong>
    ${prayer.category}
    </p>


    <p>
    ${prayer.request}
    </p>


    <p>
    <strong>Status:</strong>
    ${prayer.status}
    </p>


    `;

}




// =====================================
// DISPLAY AI PRAYER
// =====================================

function displayAIPrayer(prayer) {


    const container =
        document.getElementById(
            "aiPrayer"
        );


    if (!container) {

        return;

    }



    container.innerHTML =
    `

    <h3>
    🙏 Personalized Scripture-Based Prayer
    </h3>


    <p>
    ${prayer.ai_response
        || "Your prayer response is being prepared."}
    </p>

    `;

}



// =====================================
// LOAD PRAYERS
// =====================================

async function loadPrayers() {


    const container =
        document.getElementById(
            "prayerList"
        );


    if (!container) {

        return;

    }



    const response =
        await fetch(
            `${API_URL}/prayers`
        );


    const prayers =
        await response.json();



    prayers.sort(
        (a,b) =>
        new Date(b.created_at)
        -
        new Date(a.created_at)
    );



    container.innerHTML = "";



    prayers.forEach(prayer => {


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "prayer-card";



        card.innerHTML =
        `

        <h3>
        ${prayer.title}
        </h3>


        <p>
        ${prayer.request}
        </p>


        <p>
        📅 ${new Date(
            prayer.created_at
        ).toLocaleString()}
        </p>


        `;


        container.appendChild(card);


    });


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
// DELETE PRAYER
// =====================================

async function deletePrayer(id) {


    if (!confirm(
        "Delete this prayer request?"
    )) {

        return;

    }


    await fetch(
        `${API_URL}/prayers/${id}`,
        {
            method:"DELETE"
        }
    );


    loadPrayers();

}