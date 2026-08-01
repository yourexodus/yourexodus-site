// =========================================
// YourExodus Bible Study Dashboard Script
// =========================================

const API_URL = "https://yourexodus-api.onrender.com";

let allStudies = [];

document.addEventListener("DOMContentLoaded", () => {
  loadBibleStudies();

  const searchBox = document.getElementById("searchBox");
  if (searchBox) {
    searchBox.addEventListener("input", handleSearch);
  }
});

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
        <div class="empty-study">
          <p>Unable to load Bible studies right now.</p>
        </div>
      `;
    }
  }
}

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

  studies.forEach((study) => {
    const card = document.createElement("div");
    card.className = "study-card";

    const formattedDate = study.created_at
      ? new Date(study.created_at).toLocaleDateString()
      : "";

    card.innerHTML = `
      <h3>${escapeHtml(study.title || "Untitled")}</h3>
      <p class="scripture-reference">${escapeHtml(study.scripture || "")}</p>
      <p>${escapeHtml(study.content || study.lesson || study.summary || "")}</p>
      <div class="study-meta">
        <span>Created: ${formattedDate}</span>
      </div>
    `;

    container.appendChild(card);
  });
}

function handleSearch(event) {
  const query = event.target.value.toLowerCase().trim();
  const filtered = allStudies.filter((s) => {
    const title = (s.title || "").toLowerCase();
    const scripture = (s.scripture || "").toLowerCase();
    return title.includes(query) || scripture.includes(query);
  });
  displayBibleStudies(filtered);
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (match) => {
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