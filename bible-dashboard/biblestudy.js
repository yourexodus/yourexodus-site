// =========================================
// Your Exodus Bible Study Dashboard Script
// =========================================

const API_URL = "https://yourexodus-api.onrender.com";
let allStudies = [];

document.addEventListener("DOMContentLoaded", () => {
    loadBibleStudies();

    const searchBox = document.getElementById("searchBox");
    if (searchBox) {
        searchBox.addEventListener("input", filterStudies);
    }
});

// =========================================
// LOAD BIBLE STUDIES
// =========================================
async function loadBibleStudies() {
    const container = document.getElementById("bibleStudyList");

    try {
        const response = await fetch(`${API_URL}/bible-studies`);

        if (!response.ok) {
            throw new Error("Unable to load Bible studies");
        }

        allStudies = await response.json();
        displayBibleStudies(allStudies);

    } catch (error) {
        console.error("Bible Study Load Error:", error);

        if (container) {
            container.innerHTML = `
                <div class="journal-card">
                    <h3>Error Loading Studies</h3>
                    <p>Unable to load Bible studies right now. Please try again later.</p>
                </div>
            `;
        }
    }
}

// =========================================
// DISPLAY BIBLE STUDIES
// =========================================
function displayBibleStudies(studies) {
    const container = document.getElementById("bibleStudyList");

    if (!container) return;

    container.innerHTML = "";

    if (!studies || studies.length === 0) {
        container.innerHTML = `
            <div class="journal-card">
                <h3>No Bible Studies Found</h3>
                <p>No Bible studies have been published yet.</p>
            </div>
        `;
        return;
    }

    studies.forEach(study => {
        const card = document.createElement("div");
        card.className = "journal-card";

        const formattedDate = study.created_at
            ? new Date(study.created_at).toLocaleDateString()
            : "Date unavailable";

        card.innerHTML = `
            <h3>${escapeHtml(study.title || "Untitled Study")}</h3>
            
            ${study.scripture ? `<p class="scripture-reference">📖 ${escapeHtml(study.scripture)}</p>` : ""}
            
            <p>${escapeHtml(study.content || study.summary || study.lesson || "")}</p>
            
            <p class="date">Added: ${formattedDate}</p>
        `;

        container.appendChild(card);
    });
}

// =========================================
// SEARCH & FILTER
// =========================================
function filterStudies(event) {
    const query = (event.target.value || "").toLowerCase().trim();

    const filtered = allStudies.filter(study => {
        const title = (study.title || "").toLowerCase();
        const scripture = (study.scripture || "").toLowerCase();
        const content = (study.content || study.summary || "").toLowerCase();

        return title.includes(query) || scripture.includes(query) || content.includes(query);
    });

    displayBibleStudies(filtered);
}

// Helper utility to sanitize output text
function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, match => {
        const escapeMap = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };
        return escapeMap[match];
    });
}