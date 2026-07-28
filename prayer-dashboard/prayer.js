// =====================================
// Your Exodus Prayer Dashboard JavaScript
// =====================================

const API_URL = "https://yourexodus-api.onrender.com";

let currentPrayer = null;


// =====================================
// PAGE INITIALIZATION
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

    const refreshButton =
        document.getElementById("refreshPrayers");

    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            loadPrayers
        );

    }

    const newPrayerButton =
        document.getElementById("newPrayerBtn");

    if (newPrayerButton) {

        newPrayerButton.addEventListener(
            "click",
            startNewPrayer
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

        return JSON.parse(storedUser);

    }

    catch {

        return {

            username: storedUser

        };

    }

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

    if (user && header) {

        header.innerHTML =
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

        Start a new prayer request.

        </p>
        `;

    document
        .getElementById("aiPrayer")
        .innerHTML =
        `
        <p>

        Your personalized Scripture-based prayer
        will appear here.

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
            "Please log in again."
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

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(prayerData)

                }
            );

        if (!response.ok) {

            throw new Error();

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

        displayAIPrayer(savedPrayer);


	loadPrayers();

    }

    catch (error) {

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

    const createdDate =
        prayer.created_at
            ?
            new Date(
                prayer.created_at
            ).toLocaleString()
            :
            "Just Now";

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

    <p>

        📅 ${createdDate}

    </p>

    `;

}



// =====================================
// DISPLAY AI RESPONSE
// =====================================

// =====================================
// DISPLAY AI RESPONSE
// =====================================

function displayAIPrayer(prayer) {

    const container =
        document.getElementById("aiPrayer");


    if (!container) {

        return;

    }


    if (prayer.ai_response) {

        container.innerHTML =

        `
        <h3>
            🙏 Personalized Scripture-Based Prayer
        </h3>

        <p>
            ${prayer.ai_response}
        </p>
        `;

    }

    else {

        container.innerHTML =

        `
        <h3>
            🙏 Personalized Scripture-Based Prayer
        </h3>

        <p>
            Your prayer has been received.
            Your Scripture-based prayer is being prepared.
        </p>
        `;

    }

}

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

    try {

        const response =
            await fetch(
                `${API_URL}/prayers`
            );

        if (!response.ok) {

            throw new Error();

        }

        let prayers =
            await response.json();

        // ---------------------------------
        // Newest First
        // ---------------------------------

        prayers.sort((a, b) => {

            return new Date(b.created_at) -
                   new Date(a.created_at);

        });

        container.innerHTML = "";

        if (prayers.length === 0) {

            container.innerHTML = `

                <p>

                    No prayer requests yet.

                </p>

            `;

            return;

        }

        prayers.forEach(prayer => {

            const card =
                document.createElement("div");

            card.className =
                "prayer-card";

            const createdDate =
                prayer.created_at
                ?
                new Date(
                    prayer.created_at
                ).toLocaleString()
                :
                "Recently";

            card.innerHTML = `

                <h3>

                    ${prayer.title}

                </h3>

                <p>

                    ${prayer.request}

                </p>

                <p>

                    <strong>Category:</strong>
                    ${prayer.category}

                </p>

                <p>

                    ${prayer.is_private
                        ?
                        "🔒 Private"
                        :
                        "🌎 Public"}

                </p>

                <p>

                    <strong>Status:</strong>

                    ${prayer.answered
                        ?
                        "✅ Answered"
                        :
                        "🙏 Being Prayed For"}

                </p>

                <p>

                    📅 ${createdDate}

                </p>

            `;

            // --------------------------
            // Mark Answered Button
            // --------------------------

            if (!prayer.answered) {

                const answerButton =
                    document.createElement(
                        "button"
                    );

                answerButton.textContent =
                    "Mark Answered";

                answerButton.onclick =
                    () =>
                    markPrayerAnswered(
                        prayer.id
                    );

                card.appendChild(
                    answerButton
                );

            }

            // --------------------------
            // Delete Button
            // --------------------------

            const deleteButton =
                document.createElement(
                    "button"
                );

            deleteButton.textContent =
                "Delete";

            deleteButton.onclick =
                () =>
                deletePrayer(
                    prayer.id
                );

            card.appendChild(
                deleteButton
            );

            container.appendChild(
                card
            );

        });

    }

    catch (error) {

        console.error(error);

        container.innerHTML = `

            <p>

                Unable to load prayers.

            </p>

        `;

    }

}



// =====================================
// MARK ANSWERED
// =====================================

async function markPrayerAnswered(id) {

    try {

        const response =
            await fetch(

                `${API_URL}/prayers/${id}`,

                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                        "application/json"

                    },

                    body: JSON.stringify({

                        answered: true

                    })

                }

            );

        if (!response.ok) {

            throw new Error();

        }

        loadPrayers();

    }

    catch (error) {

        console.error(error);

        alert(
            "Unable to update prayer."
        );

    }

}



// =====================================
// DELETE PRAYER
// =====================================

async function deletePrayer(id) {

    if (

        !confirm(
            "Delete this prayer request?"
        )

    ) {

        return;

    }

    try {

        const response =
            await fetch(

                `${API_URL}/prayers/${id}`,

                {

                    method: "DELETE"

                }

            );

        if (!response.ok) {

            throw new Error();

        }

        // --------------------------
        // Clear Current Prayer
        // --------------------------

        if (

            currentPrayer &&
            currentPrayer.id === id

        ) {

            startNewPrayer();

        }

        loadPrayers();

    }

    catch (error) {

        console.error(error);

        alert(
            "Unable to delete prayer."
        );

    }

}



// =====================================
// REFRESH BUTTON
// =====================================

const refreshButton =
    document.getElementById(
        "refreshPrayers"
    );

if (refreshButton) {

    refreshButton.addEventListener(

        "click",

        loadPrayers

    );

}



// =====================================
// DISCOVER PUBLIC PRAYERS
// (Placeholder for your existing code)
// =====================================

// Keep your existing Discover Drawer,
// filtering,
// searching,
// username filter,
// date filter,
// category filter,
// sorting,
// and modal code below this point.