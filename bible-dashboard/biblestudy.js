// =========================================================
// YOUR EXODUS - BIBLE STUDY DASHBOARD JAVASCRIPT
// DATABASE-DRIVEN VERSION (HARDCODED CATEGORIES)
// =========================================================

const API_URL = "https://yourexodus-api.onrender.com";

// =========================================================
// HARDCODED CATEGORIES
// =========================================================

const allCategories = [
  {
    id: 1,
    name: "Faith",
    description: "Studies about trusting God and walking by faith."
  },
  {
    id: 2,
    name: "Prayer",
    description: "Studies focused on prayer and communication with God."
  },
  {
    id: 3,
    name: "Discipleship",
    description: "Studies about following Jesus and growing as a disciple."
  },
  {
    id: 4,
    name: "Relationships",
    description: "Biblical guidance for relationships, family, and community."
  },
  {
    id: 5,
    name: "Purpose",
    description: "Studies about discovering and living out God's purpose."
  },
  {
    id: 6,
    name: "Trials & Challenges",
    description: "Biblical encouragement for difficult seasons and challenges."
  },
  {
    id: 7,
    name: "Spiritual Growth",
    description: "Studies focused on becoming spiritually mature."
  },
  {
    id: 8,
    name: "Healing & Restoration",
    description: "Studies about God's healing, restoration, and renewal."
  },
  {
    id: 9,
    name: "Wisdom",
    description: "Biblical wisdom for everyday decisions and life."
  },
  {
    id: 10,
    name: "Hope",
    description: "Studies about hope, encouragement, and God's promises."
  }
];

// =========================================================
// CENTRAL STATE
// =========================================================

let allStudies = [];
let currentAdminTab = "published";
let activeStudyForViewer = null;

// =========================================================
// 1. INITIALIZATION
// =========================================================

document.addEventListener("DOMContentLoaded", async () => {
    setupRoleView();
    setupEventListeners();
    await loadInitialData();
});

// =========================================================
// 2. USER / ROLE
// =========================================================

function getCurrentUser() {
    const storedUser = localStorage.getItem("username");

    if (!storedUser) {
        return null;
    }

    try {
        const parsed = JSON.parse(storedUser);
        if (typeof parsed === "object" && parsed !== null) {
            return parsed;
        }
    } catch (error) {
        // Stored as plain username
    }

    const role = localStorage.getItem("role") || "user";
    const userId = localStorage.getItem("user_id");

    return {
        id: userId ? Number(userId) : null,
        username: storedUser,
        role: role,
        is_admin: localStorage.getItem("is_admin") === "true"
    };
}

function isAdmin() {
    const user = getCurrentUser();
    if (!user) return false;

    return (
        user.is_admin === true ||
        user.is_admin === 1 ||
        user.role === "admin" ||
        user.role === "administrator"
    );
}

function setupRoleView() {
    const adminSection = document.getElementById("adminDashboardSection");
    const learnerSection = document.getElementById("learnerDashboardSection");
    const welcomeHeading = document.getElementById("welcomeHeading");
    const welcomeSubheading = document.getElementById("welcomeSubheading");

    if (isAdmin()) {
        if (adminSection) adminSection.style.display = "block";
        if (learnerSection) learnerSection.style.display = "none";
        if (welcomeHeading) welcomeHeading.textContent = "👑 Bible Study Administration";
        if (welcomeSubheading) welcomeSubheading.textContent = "Create, manage, draft, and analyze discipleship content for Your Exodus.";
    } else {
        if (adminSection) adminSection.style.display = "none";
        if (learnerSection) learnerSection.style.display = "block";

        const user = getCurrentUser();
        const displayName = user?.username || "Learner";

        if (welcomeHeading) welcomeHeading.textContent = `📖 Welcome Back, ${displayName}`;
        if (welcomeSubheading) welcomeSubheading.textContent = "Continue your discipleship journey and grow in the Word.";
    }
}

// =========================================================
// 3. INITIAL DATA
// =========================================================

async function loadInitialData() {
    try {
        // Populate controls immediately from hardcoded categories array
        populateCategoryControls();

        // Load studies from backend API
        await fetchAllStudies();

        if (isAdmin()) {
            renderAdminDashboard();
        } else {
            renderLearnerDashboard();
        }

        renderPublicLibrary();

    } catch (error) {
        console.error("Initial Bible Study load failed:", error);
        showApiError("Bible studies could not be loaded from the server. Please refresh the page and try again.");
    }
}

// =========================================================
// 4. CATEGORIES CONTROLS
// =========================================================

function populateCategoryControls() {
    const filter = document.getElementById("categoryFilter");
    const select = document.getElementById("studyCategorySelect");

    if (filter) {
        filter.innerHTML = `<option value="all">All Categories</option>`;
        allCategories.forEach(category => {
            const option = document.createElement("option");
            option.value = category.id;
            option.textContent = category.name;
            filter.appendChild(option);
        });
    }

    if (select) {
        select.innerHTML = `<option value="">Select Category</option>`;
        allCategories.forEach(category => {
            const option = document.createElement("option");
            option.value = category.id;
            option.textContent = category.name;
            select.appendChild(option);
        });
    }
}

function getCategoryName(categoryId) {
    const category = allCategories.find(
        item => Number(item.id) === Number(categoryId)
    );
    return category ? category.name : "Uncategorized";
}

// =========================================================
// 5. FETCH BIBLE STUDIES
// =========================================================

async function fetchAllStudies() {
    const response = await fetch(`${API_URL}/bible-studies`);

    if (!response.ok) {
        throw new Error(`Bible Study API failed (${response.status})`);
    }

    const data = await response.json();

    if (Array.isArray(data)) {
        allStudies = data;
    } else if (Array.isArray(data.bible_studies)) {
        allStudies = data.bible_studies;
    } else {
        allStudies = [];
    }

    console.log("Bible studies loaded from API:", allStudies);
}

// =========================================================
// 6. ADMIN DASHBOARD
// =========================================================

function renderAdminDashboard() {
    calculateAndRenderMetrics();
    renderAdminGrid();
}

function calculateAndRenderMetrics() {
    const published = allStudies.filter(study => study.published !== false);
    const drafts = allStudies.filter(study => study.published === false);

    const seriesSet = new Set(
        allStudies.map(study => study.category_id).filter(Boolean)
    );

    const totalLearners = allStudies.reduce(
        (total, study) => total + Number(study.learner_count || 0),
        0
    );

    const completions = allStudies.reduce(
        (total, study) => total + Number(study.completion_count || 0),
        0
    );

    const publishedEl = document.getElementById("statPublishedCount");
    const draftEl = document.getElementById("statDraftCount");
    const seriesEl = document.getElementById("statSeriesCount");
    const learnersEl = document.getElementById("statTotalLearners");
    const completionsEl = document.getElementById("statCompletions");
    const draftBadge = document.getElementById("draftBadge");

    if (publishedEl) publishedEl.textContent = published.length;
    if (draftEl) draftEl.textContent = drafts.length;
    if (draftBadge) draftBadge.textContent = drafts.length;
    if (seriesEl) seriesEl.textContent = seriesSet.size;
    if (learnersEl) learnersEl.textContent = totalLearners;
    if (completionsEl) completionsEl.textContent = completions;
}

function renderAdminGrid() {
    const grid = document.getElementById("adminStudyGrid");
    if (!grid) return;

    const filteredStudies = allStudies.filter(study => {
        if (currentAdminTab === "drafts") {
            return study.published === false;
        }
        return study.published !== false;
    });

    if (filteredStudies.length === 0) {
        grid.innerHTML = `
            <div class="journal-card">
                <h3>No ${escapeHtml(currentAdminTab)} studies</h3>
                <p>Create a new Bible study to begin adding content.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = "";

    filteredStudies.forEach(study => {
        const card = document.createElement("div");
        card.className = "journal-card";

        const isDraft = study.published === false;
        const formattedDate = study.created_at
            ? new Date(study.created_at).toLocaleDateString()
            : "Date unavailable";
        const categoryName = getCategoryName(study.category_id);

        card.innerHTML = `
            <div>
                <div class="journal-title-row">
                    <h3>${escapeHtml(study.title || "Untitled Study")}</h3>
                    ${isDraft 
                        ? `<span class="badge-draft">Draft</span>` 
                        : `<span class="badge-gold">Published</span>`
                    }
                </div>
                <p class="scripture-reference">📖 ${escapeHtml(study.scripture || "No Scripture Reference")}</p>
                <p>${escapeHtml(snippetText(study.content || study.summary || "", 120))}</p>
                <p class="date">Category: ${escapeHtml(categoryName)} | Added: ${escapeHtml(formattedDate)}</p>
            </div>
            <div class="card-actions-row">
                <button class="btn-secondary btn-preview-admin" data-id="${study.id}">👁 Preview</button>
                <button class="btn-secondary btn-edit-admin" data-id="${study.id}">✏ Edit</button>
                <button class="btn-secondary btn-toggle-publish" data-id="${study.id}">
                    ${isDraft ? "📢 Publish" : "📦 Unpublish"}
                </button>
                <button class="btn-danger btn-delete-admin" data-id="${study.id}">🗑 Delete</button>
            </div>
        `;

        grid.appendChild(card);
    });

    bindAdminGridButtons();
}

function bindAdminGridButtons() {
    document.querySelectorAll(".btn-preview-admin").forEach(button => {
        button.addEventListener("click", event => {
            const id = event.currentTarget.dataset.id;
            const study = allStudies.find(item => item.id == id);
            if (study) openStudyViewer(study);
        });
    });

    document.querySelectorAll(".btn-edit-admin").forEach(button => {
        button.addEventListener("click", event => {
            openEditModal(event.currentTarget.dataset.id);
        });
    });

    document.querySelectorAll(".btn-toggle-publish").forEach(button => {
        button.addEventListener("click", event => {
            togglePublishStatus(event.currentTarget.dataset.id);
        });
    });

    document.querySelectorAll(".btn-delete-admin").forEach(button => {
        button.addEventListener("click", event => {
            deleteStudy(event.currentTarget.dataset.id);
        });
    });
}

// =========================================================
// 7. LEARNER DASHBOARD
// =========================================================

function renderLearnerDashboard() {
    const continueCard = document.getElementById("continueStudyingCard");
    const activeStudy = loadActiveStudyProgress();

    if (activeStudy && continueCard) {
        continueCard.style.display = "block";

        const title = document.getElementById("activeStudyTitle");
        const scripture = document.getElementById("activeStudyScripture");
        const summary = document.getElementById("activeStudySummary");
        const badge = document.getElementById("activeProgressBadge");

        if (title) title.textContent = activeStudy.title || "In-Progress Study";
        if (scripture) scripture.textContent = `📖 ${activeStudy.scripture || ""}`;
        if (summary) summary.textContent = snippetText(activeStudy.content || "", 140);
        if (badge) badge.textContent = activeStudy.progress || "In Progress";

        const continueButton = document.getElementById("continueStudyBtn");
        if (continueButton) {
            continueButton.onclick = () => openStudyViewer(activeStudy);
        }
    } else if (continueCard) {
        continueCard.style.display = "none";
    }

    renderMySavedStudies();
}

function renderMySavedStudies() {
    const container = document.getElementById("myStudiesList");
    if (!container) return;

    const completed = JSON.parse(localStorage.getItem("completedStudies") || "[]");

    if (completed.length === 0) {
        container.innerHTML = `
            <div class="journal-card">
                <h3>No completed studies yet</h3>
                <p>Select a lesson from the library below to begin.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = "";

    completed.forEach(item => {
        const card = document.createElement("div");
        card.className = "journal-card";

        card.innerHTML = `
            <div>
                <div class="journal-title-row">
                    <h3>${escapeHtml(item.title)}</h3>
                    <span class="badge-gold">Completed</span>
                </div>
                <p class="scripture-reference">📖 ${escapeHtml(item.scripture || "")}</p>
                <p class="date">Completed on: ${escapeHtml(item.completedAt)}</p>
            </div>
            <div class="card-actions-row">
                <button class="btn-secondary btn-review" data-id="${item.id}">Review Lesson</button>
            </div>
        `;

        container.appendChild(card);
    });

    document.querySelectorAll(".btn-review").forEach(button => {
        button.addEventListener("click", event => {
            const study = allStudies.find(item => item.id == event.currentTarget.dataset.id);
            if (study) openStudyViewer(study);
        });
    });
}

function loadActiveStudyProgress() {
    const saved = localStorage.getItem("activeStudyProgress");
    if (!saved) return null;

    try {
        return JSON.parse(saved);
    } catch (error) {
        localStorage.removeItem("activeStudyProgress");
        return null;
    }
}

// =========================================================
// 8. PUBLIC LIBRARY
// =========================================================

function renderPublicLibrary() {
    const grid = document.getElementById("publicStudyGrid");
    if (!grid) return;

    const searchTerm = (document.getElementById("searchBox")?.value || "").toLowerCase().trim();
    const selectedCategory = document.getElementById("categoryFilter")?.value || "";

    let publicStudies = allStudies.filter(study => study.published !== false);

    if (searchTerm) {
        publicStudies = publicStudies.filter(study => {
            const title = (study.title || "").toLowerCase();
            const scripture = (study.scripture || "").toLowerCase();
            const content = (study.content || study.summary || "").toLowerCase();
            const category = getCategoryName(study.category_id).toLowerCase();

            return (
                title.includes(searchTerm) ||
                scripture.includes(searchTerm) ||
                content.includes(searchTerm) ||
                category.includes(searchTerm)
            );
        });
    }

    if (selectedCategory && selectedCategory !== "all") {
        publicStudies = publicStudies.filter(
            study => Number(study.category_id) === Number(selectedCategory)
        );
    }

    if (publicStudies.length === 0) {
        grid.innerHTML = `<p class="no-data">No Bible studies match your criteria.</p>`;
        return;
    }

    grid.innerHTML = publicStudies.map(study => {
        const categoryName = getCategoryName(study.category_id);
        return `
            <div class="study-card" data-id="${study.id}">
                ${study.coverImage ? `<img src="${escapeHtml(study.coverImage)}" alt="${escapeHtml(study.title)}" class="study-card-img" />` : ""}
                <div class="study-card-body">
                    <span class="badge">${escapeHtml(categoryName)}</span>
                    <h3>${escapeHtml(study.title || "Bible Study")}</h3>
                    <p>${escapeHtml(snippetText(study.content || study.summary || "", 120))}</p>
                    <div class="card-actions">
                        <button class="btn btn-primary view-study-btn" data-id="${study.id}">Start Study</button>
                        <button class="btn btn-outline save-study-btn" data-id="${study.id}">Save</button>
                    </div>
                </div>
            </div>
        `;
    }).join("");

    bindPublicLibraryButtons();
}

function bindPublicLibraryButtons() {
    document.querySelectorAll(".view-study-btn").forEach(button => {
        button.addEventListener("click", event => {
            const studyId = event.currentTarget.dataset.id;
            const study = allStudies.find(item => item.id == studyId);
            if (study) openStudyViewer(study);
        });
    });

    document.querySelectorAll(".save-study-btn").forEach(button => {
        button.addEventListener("click", event => {
            const studyId = event.currentTarget.dataset.id;
            saveStudyForLater(studyId);
        });
    });
}

// =========================================================
// 9. EVENT LISTENERS & MODAL HANDLERS
// =========================================================

function setupEventListeners() {
    const publishedTab = document.getElementById("tabPublished");
    const draftsTab = document.getElementById("tabDrafts");

    if (publishedTab) {
        publishedTab.addEventListener("click", () => {
            currentAdminTab = "published";
            publishedTab.classList.add("active");
            if (draftsTab) draftsTab.classList.remove("active");
            renderAdminGrid();
        });
    }

    if (draftsTab) {
        draftsTab.addEventListener("click", () => {
            currentAdminTab = "drafts";
            draftsTab.classList.add("active");
            if (publishedTab) publishedTab.classList.remove("active");
            renderAdminGrid();
        });
    }

    // Attach Create Bible Study button handler (covers multiple common button IDs)
    const createBtn = document.getElementById("createStudyBtn") || 
                      document.getElementById("btnCreateStudy") || 
                      document.getElementById("openCreateStudyBtn");
                      
    if (createBtn) {
        createBtn.addEventListener("click", openCreateModal);
    }

    const searchBox = document.getElementById("searchBox");
    const categoryFilter = document.getElementById("categoryFilter");

    if (searchBox) searchBox.addEventListener("input", renderPublicLibrary);
    if (categoryFilter) categoryFilter.addEventListener("change", renderPublicLibrary);

    const studyForm = document.getElementById("studyForm");
    if (studyForm) studyForm.addEventListener("submit", handleStudyFormSubmit);

    document.querySelectorAll(".modal-close, .btn-close-modal").forEach(button => {
        button.addEventListener("click", () => {
            closeAllModals();
        });
    });
}

// =========================================================
// 10. CRUD OPERATIONS (API CALLS)
// =========================================================

async function handleStudyFormSubmit(event) {
    event.preventDefault();

    const studyId = document.getElementById("studyIdInput")?.value;
    const title = document.getElementById("studyTitleInput")?.value;
    const scripture = document.getElementById("studyScriptureInput")?.value;
    const categoryId = document.getElementById("studyCategorySelect")?.value;
    const content = document.getElementById("studyContentInput")?.value;
    const isPublished = document.getElementById("studyPublishedCheckbox")?.checked;

    const payload = {
        title: title,
        scripture: scripture,
        category_id: categoryId ? Number(categoryId) : null,
        content: content,
        published: Boolean(isPublished)
    };

    const isEdit = Boolean(studyId);
    const url = isEdit
        ? `${API_URL}/bible-studies/${studyId}`
        : `${API_URL}/bible-studies`;
    const method = isEdit ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Failed to save study (${response.status})`);
        }

        closeAllModals();
        await loadInitialData();

    } catch (error) {
        console.error("Save Study Error:", error);
        alert("Failed to save the Bible study. Please try again.");
    }
}

async function togglePublishStatus(id) {
    const study = allStudies.find(item => item.id == id);
    if (!study) return;

    const updatedStatus = study.published === false;

    try {
        const response = await fetch(`${API_URL}/bible-studies/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ published: updatedStatus })
        });

        if (!response.ok) {
            throw new Error(`Toggle publish failed (${response.status})`);
        }

        await loadInitialData();

    } catch (error) {
        console.error("Publish Toggle Error:", error);
        alert("Failed to update status.");
    }
}

async function deleteStudy(id) {
    if (!confirm("Are you sure you want to delete this Bible study?")) return;

    try {
        const response = await fetch(`${API_URL}/bible-studies/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error(`Delete request failed (${response.status})`);
        }

        await loadInitialData();

    } catch (error) {
        console.error("Delete Study Error:", error);
        alert("Failed to delete Bible study.");
    }
}

// =========================================================
// 11. MODAL AND VIEWER CONTROLS
// =========================================================

function openCreateModal() {
    const idInput = document.getElementById("studyIdInput");
    const titleInput = document.getElementById("studyTitleInput");
    const scriptureInput = document.getElementById("studyScriptureInput");
    const categorySelect = document.getElementById("studyCategorySelect");
    const contentInput = document.getElementById("studyContentInput");
    const publishedCheckbox = document.getElementById("studyPublishedCheckbox");

    if (idInput) idInput.value = "";
    if (titleInput) titleInput.value = "";
    if (scriptureInput) scriptureInput.value = "";
    if (categorySelect) categorySelect.value = "";
    if (contentInput) contentInput.value = "";
    if (publishedCheckbox) publishedCheckbox.checked = true;

    const modal = document.getElementById("studyModal");
    if (modal) {
        modal.style.display = "block";
    }
}

function openStudyViewer(study) {
    activeStudyForViewer = study;

    localStorage.setItem(
        "activeStudyProgress",
        JSON.stringify({
            id: study.id,
            title: study.title,
            scripture: study.scripture,
            content: study.content,
            progress: "In Progress"
        })
    );

    const modal = document.getElementById("studyViewerModal");
    const titleEl = document.getElementById("viewerTitle");
    const scriptureEl = document.getElementById("viewerScripture");
    const contentEl = document.getElementById("viewerContent");

    if (titleEl) titleEl.textContent = study.title || "Untitled";
    if (scriptureEl) scriptureEl.textContent = study.scripture || "";
    if (contentEl) contentEl.innerHTML = escapeHtml(study.content || "");

    if (modal) modal.style.display = "block";

    if (!isAdmin()) {
        renderLearnerDashboard();
    }
}

function openEditModal(id) {
    const study = allStudies.find(item => item.id == id);
    if (!study) return;

    document.getElementById("studyIdInput").value = study.id;
    document.getElementById("studyTitleInput").value = study.title || "";
    document.getElementById("studyScriptureInput").value = study.scripture || "";
    document.getElementById("studyCategorySelect").value = study.category_id || "";
    document.getElementById("studyContentInput").value = study.content || "";
    document.getElementById("studyPublishedCheckbox").checked = study.published !== false;

    const modal = document.getElementById("studyModal");
    if (modal) modal.style.display = "block";
}

function closeAllModals() {
    document.querySelectorAll(".modal").forEach(modal => {
        modal.style.display = "none";
    });
}

function saveStudyForLater(studyId) {
    const study = allStudies.find(item => item.id == studyId);
    if (!study) return;

    let saved = JSON.parse(localStorage.getItem("savedStudies") || "[]");

    if (!saved.some(item => item.id == studyId)) {
        saved.push(study);
        localStorage.setItem("savedStudies", JSON.stringify(saved));
        alert(`Saved "${study.title}" to your list!`);
    } else {
        alert("This study is already in your saved list.");
    }
}

// =========================================================
// 12. UTILITY FUNCTIONS
// =========================================================

function snippetText(text, maxLength = 100) {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function showApiError(message) {
    const alertContainer = document.getElementById("apiErrorContainer");
    if (alertContainer) {
        alertContainer.textContent = message;
        alertContainer.style.display = "block";
    } else {
        console.warn(message);
    }
}