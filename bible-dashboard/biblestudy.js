// =========================================
// YourExodus Bible Study Dashboard Script
// =========================================

const API_URL = "https://yourexodus-api.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
    loadBibleStudies();

    const form = document.getElementById("bibleStudyForm");

    if (form) {
        form.addEventListener("submit", createBibleStudy);
    }
});


// =========================================
// Load Bible Studies
// =========================================

async function loadBibleStudies() {

    try {

        const response = await fetch(`${API_URL}/bible-studies`);

        if (!response.ok) {
            throw new Error("Unable to load Bible studies");
        }

        const studies = await response.json();

        displayBibleStudies(studies);

    } catch (error) {

        console.error("Bible Study Load Error:", error);

        const container = document.getElementById("bibleStudyList");

        if (container) {
            container.innerHTML =
                "<p>Unable to load Bible studies right now.</p>";
        }
    }
}


// =========================================
// Display Bible Studies
// =========================================

function displayBibleStudies(studies) {

    const container = document.getElementById("bibleStudyList");

    if (!container) return;


    container.innerHTML = "";


    if (!studies || studies.length === 0) {

        container.innerHTML = `
            <div class="empty-study">
                <p>No Bible studies available yet.</p>
            </div>
        `;

        return;
    }


    studies.forEach(study => {


        const card = document.createElement("div");

        card.className = "study-card";


        card.innerHTML = `

            <h3>${study.title}</h3>

            <p class="scripture-reference">
                ${study.scripture || ""}
            </p>


            <p>
                ${study.content || study.lesson || ""}
            </p>


            <div class="study-meta">

                <span>
                    Created:
                    ${study.created_at || ""}
                </span>

            </div>

        `;


        container.appendChild(card);

    });

}



// =========================================
// Create Bible Study (Admin)
// =========================================

async function createBibleStudy(event) {

    event.preventDefault();


    const username = localStorage.getItem("username");


    const title =
        document.getElementById("studyTitle").value;


    const scripture =
        document.getElementById("scripture").value;


    const content =
        document.getElementById("studyContent").value;



    const studyData = {

        title: title,

        scripture: scripture,

        content: content,

        username: username

    };



    try {


        const response = await fetch(
            `${API_URL}/bible-studies`,
            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify(studyData)

            }
        );



        if (!response.ok) {

            throw new Error(
                "Failed to create Bible study"
            );

        }



        alert(
            "Bible Study Created Successfully!"
        );


        event.target.reset();


        loadBibleStudies();



    } catch(error) {

        console.error(
            "Create Bible Study Error:",
            error
        );


        alert(
            "Unable to save Bible Study."
        );

    }

}