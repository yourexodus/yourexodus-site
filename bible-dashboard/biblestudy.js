// =========================================================
// YOUR EXODUS - BIBLE STUDY DASHBOARD JAVASCRIPT
// =========================================================

const API_URL = "https://yourexodus-api.onrender.com";

// Central State Management
let allStudies = [];
let currentAdminTab = "published"; // "published" or "drafts"
let activeStudyForViewer = null;

// =========================================================
// 1. INITIALIZATION & ROLE DETECTION
// =========================================================

document.addEventListener("DOMContentLoaded", async () => {
    setupRoleView();
    setupEventListeners();
    await loadInitialData();
});

function getCurrentUser() {
    const storedUser = localStorage.getItem("username");
    if (!storedUser) return null;

    try {
        const user = JSON.parse(storedUser);
        if (typeof user === "object" && user !== null) return user;
    } catch (e) {
        // Handled below if stored as plain string
    }

    const role = localStorage.getItem("role") || "user";
    return { username: storedUser, role: role };
}

function isAdmin() {
    const user = getCurrentUser();
    if (!user) return false;
    
    // Checks for explicit admin role or admin username flags
    return user.role === "admin" || 
           user.role === "administrator" || 
           (user.username && user.username.toLowerCase().includes("admin"));
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
        const displayName = user ? user.username : "Learner";
        
        if (welcomeHeading) welcomeHeading.textContent = `📖 Welcome Back, ${escapeHtml(displayName)}`;
        if (welcomeSubheading) welcomeSubheading.textContent = "Continue your discipleship journey and grow in the Word.";
    }
}

async function loadInitialData() {
    await fetchAllStudies();
    
    if (isAdmin()) {
        renderAdminDashboard();
    } else {
        renderLearnerDashboard();
    }

    renderPublicLibrary();
}

// =========================================================
// 2. ADMIN DASHBOARD MODULE
// =========================================================

function renderAdminDashboard() {
    calculateAndRenderMetrics();
    renderAdminGrid();
}

function calculateAndRenderMetrics() {
    const published = allStudies.filter(s => s.is_published !== false);
    const drafts = allStudies.filter(s => s.is_published === false);
    
    // Unique series count
    const seriesSet = new Set(allStudies.map(s => s.category).filter(Boolean));

    // Simulated learner engagement totals (ready for backend analytics endpoint integration)
    const totalLearners = allStudies.reduce((acc, s) => acc + (s.learner_count || 0), 0);
    const completedStudies = allStudies.reduce((acc, s) => acc + (s.completion_count || 0), 0);

    const elPublished = document.getElementById("statPublishedCount");
    const elDrafts = document.getElementById("statDraftCount");
    const elSeries = document.getElementById("statSeriesCount");
    const elLearners = document.getElementById("statTotalLearners");
    const elCompletions = document.getElementById("statCompletions");
    const elDraftBadge = document.getElementById("draftBadge");

    if (elPublished) elPublished.textContent = published.length;
    if (elDrafts) elDrafts.textContent = drafts.length;
    if (elDraftBadge) elDraftBadge.textContent = drafts.length;
    if (elSeries) elSeries.textContent = seriesSet.size;
    if (elLearners) elLearners.textContent = totalLearners;
    if (elCompletions) elCompletions.textContent = completedStudies;
}

function renderAdminGrid() {
    const grid = document.getElementById("adminStudyGrid");
    if (!grid) return;

    grid.innerHTML = "";

    const filteredStudies = allStudies.filter(study => {
        if (currentAdminTab === "drafts") {
            return study.is_published === false;
        } else {
            return study.is_published !== false;
        }
    });

    if (filteredStudies.length === 0) {
        grid.innerHTML = `
            <div class="journal-card">
                <h3>No ${currentAdminTab} studies</h3>
                <p>Use the "+ Create New Study" button above to start writing content.</p>
            </div>
        `;
        return;
    }

    filteredStudies.forEach(study => {
        const card = document.createElement("div");
        card.className = "journal-card";

        const isDraft = study.is_published === false;
        const formattedDate = study.created_at ? new Date(study.created_at).toLocaleDateString() : "Date set on publish";

        card.innerHTML = `
            <div>
                <div class="journal-title-row">
                    <h3>${escapeHtml(study.title || "Untitled Study")}</h3>
                    ${isDraft ? '<span class="badge-draft">Draft</span>' : '<span class="badge-gold">Published</span>'}
                </div>
                <p class="scripture-reference">📖 ${escapeHtml(study.scripture || "No Reference")}</p>
                <p>${escapeHtml(snippetText(study.content || study.summary || "", 120))}</p>
                <p class="date">Category: ${escapeHtml(study.category || "General")} | Added: ${formattedDate}</p>
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
    document.querySelectorAll(".btn-preview-admin").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = e.target.getAttribute("data-id");
            const study = allStudies.find(s => s.id == id);
            if (study) openStudyViewer(study);
        });
    });

    document.querySelectorAll(".btn-edit-admin").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = e.target.getAttribute("data-id");
            openEditModal(id);
        });
    });

    document.querySelectorAll(".btn-toggle-publish").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = e.target.getAttribute("data-id");
            togglePublishStatus(id);
        });
    });

    document.querySelectorAll(".btn-delete-admin").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = e.target.getAttribute("data-id");
            deleteStudy(id);
        });
    });
}

// =========================================================
// 3. LEARNER DASHBOARD MODULE
// =========================================================

function renderLearnerDashboard() {
    const continueCard = document.getElementById("continueStudyingCard");
    const activeStudy = loadActiveStudyProgress();

    if (activeStudy && continueCard) {
        continueCard.style.display = "block";
        document.getElementById("activeStudyTitle").textContent = activeStudy.title || "In-Progress Study";
        document.getElementById("activeStudyScripture").textContent = `📖 ${activeStudy.scripture || ""}`;
        document.getElementById("activeStudySummary").textContent = snippetText(activeStudy.content || "", 140);
        document.getElementById("activeProgressBadge").textContent = activeStudy.progress || "In Progress";

        const continueBtn = document.getElementById("continueStudyBtn");
        if (continueBtn) {
            continueBtn.onclick = () => openStudyViewer(activeStudy);
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
                <p>Select a lesson from the library below to begin your discipleship study.</p>
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
                <p class="date">Completed on: ${item.completedAt}</p>
            </div>
            <div class="card-actions-row">
                <button class="btn-secondary btn-review" data-id="${item.id}">Review Lesson</button>
            </div>
        `;
        container.appendChild(card);
    });

    document.querySelectorAll(".btn-review").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = e.target.getAttribute("data-id");
            const study = allStudies.find(s => s.id == id);
            if (study) openStudyViewer(study);
        });
    });
}

function loadActiveStudyProgress() {
    const saved = localStorage.getItem("activeStudyProgress");
    return saved ? JSON.parse(saved) : null;
}

// =========================================================
// 4. PUBLIC LIBRARY & FILTER MODULE
// =========================================================

function renderPublicLibrary() {
    const grid = document.getElementById("publicStudiesGrid");
    if (!grid) return;

    const searchTerm = (document.getElementById("searchBox")?.value || "").toLowerCase().trim();
    const selectedCategory = document.getElementById("categoryFilter")?.value || "";

    // 1. Filter out draft items
    let publicStudies = allStudies.filter(study => study.is_published !== false);

    // 2. Filter by Search Query (Title, Scripture, Content)
    if (searchTerm) {
        publicStudies = publicStudies.filter(study => {
            const title = (study.title || "").toLowerCase();
            const scripture = (study.scripture || "").toLowerCase();
            const content = (study.content || study.summary || "").toLowerCase();
            return title.includes(searchTerm) || scripture.includes(searchTerm) || content.includes(searchTerm);
        });
    }

    // 3. Filter by Category Dropdown
    if (selectedCategory && selectedCategory !== "All") {
        publicStudies = publicStudies.filter(study => 
            (study.category || "").toLowerCase() === selectedCategory.toLowerCase()
        );
    }

    if (publicStudies.length === 0) {
        grid.innerHTML = `<p class="no-data">No Bible studies match your criteria. Check back soon!</p>`;
        return;
    }

    grid.innerHTML = publicStudies.map(study => `
        <div class="study-card" data-id="${escapeHtml(study.id)}">
            <img src="${escapeHtml(study.coverImage || 'placeholder.jpg')}" alt="${escapeHtml(study.title)}" class="study-card-img" />
            <div class="study-card-body">
                <span class="badge">${escapeHtml(study.category || 'General')}</span>
                <h3>${escapeHtml(study.title)}</h3>
                <p>${escapeHtml(snippetText(study.content || study.summary || '', 120))}</p>
                <div class="card-actions">
                    <button class="btn btn-primary view-study-btn" data-id="${escapeHtml(study.id)}">
                        Start Study
                    </button>
                    <button class="btn btn-outline save-study-btn" data-id="${escapeHtml(study.id)}">
                        Save for Later
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Rebind view buttons
    document.querySelectorAll(".view-study-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = e.target.getAttribute("data-id");
            const study = allStudies.find(s => s.id == id);
            if (study) openStudyViewer(study);
        });
    });
}
// =========================================================
// 5. STUDY VIEWER & MODALS MODULE
// =========================================================

function openStudyViewer(study) {
    activeStudyForViewer = study;

    const overlay = document.getElementById("studyViewerOverlay");
    const titleEl = document.getElementById("viewerStudyTitle");
    const scriptureEl = document.getElementById("viewerScripture");
    const contentEl = document.getElementById("viewerContent");
    const videoContainer = document.getElementById("videoContainer");
    const videoPlayer = document.getElementById("videoPlayer");
    const notesInput = document.getElementById("learnerNotesInput");

    if (titleEl) titleEl.textContent = study.title || "Bible Study";
    if (scriptureEl) scriptureEl.textContent = study.scripture ? `📖 ${study.scripture}` : "";
    if (contentEl) contentEl.innerHTML = formatMarkdownParagraphs(study.content || "");

    // YouTube Embed Handling
    if (study.video_url && videoContainer && videoPlayer) {
        const embedUrl = convertToEmbedUrl(study.video_url);
        videoPlayer.src = embedUrl;
        videoContainer.style.display = "block";
    } else if (videoContainer) {
        videoContainer.style.display = "none";
        if (videoPlayer) videoPlayer.src = "";
    }

    // Load Existing Learner Notes
    if (notesInput) {
        const allNotes = JSON.parse(localStorage.getItem("studyNotes") || "{}");
        notesInput.value = allNotes[study.id] || "";
    }

    // Track active study for "Continue Studying" section
    saveActiveStudyProgress(study);

    if (overlay) overlay.classList.add("open");
}

function closeStudyViewer() {
    const overlay = document.getElementById("studyViewerOverlay");
    const videoPlayer = document.getElementById("videoPlayer");

    if (videoPlayer) videoPlayer.src = ""; // Stop video playback
    if (overlay) overlay.classList.remove("open");

    activeStudyForViewer = null;
}

// =========================================================
// API & CRUD ACTIONS
// =========================================================

async function fetchAllStudies() {
    try {
        const response = await fetch(`${API_URL}/bible-studies`);
        if (!response.ok) throw new Error("Failed to load studies");
        allStudies = await response.json();
        
        // Cache API response locally for fallback safety
        localStorage.setItem("your_exodus_studies", JSON.stringify(allStudies));
    } catch (error) {
        console.error("API Fetch Error:", error);
        
        // Check if we have locally saved studies first before resorting to 2 hardcoded items
        const savedLocal = localStorage.getItem("your_exodus_studies");
        if (savedLocal) {
            try {
                allStudies = JSON.parse(savedLocal);
                return;
            } catch (e) {
                console.error("Local storage parse error", e);
            }
        }
        allStudies = getFallbackMockData();
    }
}

async function handleStudyFormSubmit(event, forceDraft = false) {
    event.preventDefault();

    const id = document.getElementById("editStudyId")?.value;
    const title = document.getElementById("studyTitleInput")?.value;
    const scripture = document.getElementById("studyScriptureInput")?.value;
    const category = document.getElementById("studyCategorySelect")?.value;
    const video_url = document.getElementById("studyVideoInput")?.value;
    const content = document.getElementById("studyContentInput")?.value;

    const payload = {
        title,
        scripture,
        category,
        video_url,
        content,
        is_published: !forceDraft,
        created_at: new Date().toISOString()
    };

    try {
        const method = id ? "PUT" : "POST";
        const endpoint = id ? `${API_URL}/bible-studies/${id}` : `${API_URL}/bible-studies`;

        const response = await fetch(endpoint, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Save operation failed");

        alert(forceDraft ? "Draft saved successfully!" : "Bible study published successfully!");
        closeAdminModal();
        await loadInitialData();

    } catch (err) {
        console.warn("Save Error (Using local fallback):", err);
        
        // Local Fallback simulation for testing
        if (id) {
            const index = allStudies.findIndex(s => s.id == id);
            if (index !== -1) allStudies[index] = { ...allStudies[index], ...payload };
        } else {
            payload.id = Date.now();
            allStudies.unshift(payload);
        }

        // Save local state so switching role in browser keeps the study visible
        localStorage.setItem("your_exodus_studies", JSON.stringify(allStudies));

        alert(forceDraft ? "Draft saved (Local mode)!" : "Study published (Local mode)!");
        closeAdminModal();
        
        // Refresh appropriate views
        if (isAdmin()) {
            renderAdminDashboard();
        } else {
            renderLearnerDashboard();
        }
        renderPublicLibrary();
    }
}
async function togglePublishStatus(id) {
    const study = allStudies.find(s => s.id == id);
    if (!study) return;

    study.is_published = study.is_published === false ? true : false;

    try {
        await fetch(`${API_URL}/bible-studies/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(study)
        });
    } catch (e) {
        console.warn("Updated publish state locally");
    }

    renderAdminDashboard();
    renderPublicLibrary();
}

async function deleteStudy(id) {
    if (!confirm("Are you sure you want to delete this study?")) return;

    try {
        await fetch(`${API_URL}/bible-studies/${id}`, { method: "DELETE" });
    } catch (e) {
        console.warn("Deleted study locally");
    }

    allStudies = allStudies.filter(s => s.id != id);
    renderAdminDashboard();
    renderPublicLibrary();
}

// =========================================================
// EVENT LISTENERS & HELPERS
// =========================================================

function setupEventListeners() {
    // Admin Tab Switching
    const tabPub = document.getElementById("tabPublished");
    const tabDraft = document.getElementById("tabDrafts");

    if (tabPub && tabDraft) {
        tabPub.addEventListener("click", () => {
            currentAdminTab = "published";
            tabPub.classList.add("active");
            tabDraft.classList.remove("active");
            renderAdminGrid();
        });

        tabDraft.addEventListener("click", () => {
            currentAdminTab = "drafts";
            tabDraft.classList.add("active");
            tabPub.classList.remove("active");
            renderAdminGrid();
        });
    }

    // Modal Triggers
    const openCreateBtn = document.getElementById("openCreateStudyBtn");
    if (openCreateBtn) {
        openCreateBtn.addEventListener("click", openCreateModal);
    }

    const closeFormBtn = document.getElementById("closeFormModal");
    if (closeFormBtn) {
        closeFormBtn.addEventListener("click", closeAdminModal);
    }

    const closeViewerBtn = document.getElementById("closeViewerModal");
    if (closeViewerBtn) {
        closeViewerBtn.addEventListener("click", closeStudyViewer);
    }

    // Form Action Triggers
    const form = document.getElementById("studyAdminForm");
    if (form) {
        form.addEventListener("submit", (e) => handleStudyFormSubmit(e, false));
    }

    const draftBtn = document.getElementById("saveDraftBtn");
    if (draftBtn) {
        draftBtn.addEventListener("click", (e) => handleStudyFormSubmit(e, true));
    }

    // Filter & Search
    const searchBox = document.getElementById("searchBox");
    if (searchBox) searchBox.addEventListener("input", renderPublicLibrary);

    const categoryFilter = document.getElementById("categoryFilter");
    if (categoryFilter) categoryFilter.addEventListener("change", renderPublicLibrary);

    // Learner Action Buttons inside Modal
    const saveNotesBtn = document.getElementById("saveNotesBtn");
    if (saveNotesBtn) {
        saveNotesBtn.addEventListener("click", saveLearnerNotes);
    }

    const markCompleteBtn = document.getElementById("markCompleteBtn");
    if (markCompleteBtn) {
        markCompleteBtn.addEventListener("click", markStudyComplete);
    }
}

function openCreateModal() {
    document.getElementById("studyAdminForm")?.reset();
    document.getElementById("editStudyId").value = "";
    document.getElementById("modalTitle").textContent = "✏ Create New Bible Study";
    document.getElementById("studyFormOverlay")?.classList.add("open");
}

function openEditModal(id) {
    const study = allStudies.find(s => s.id == id);
    if (!study) return;

    document.getElementById("editStudyId").value = study.id;
    document.getElementById("studyTitleInput").value = study.title || "";
    document.getElementById("studyScriptureInput").value = study.scripture || "";
    document.getElementById("studyCategorySelect").value = study.category || "Discipleship";
    document.getElementById("studyVideoInput").value = study.video_url || "";
    document.getElementById("studyContentInput").value = study.content || "";

    document.getElementById("modalTitle").textContent = "✏ Edit Bible Study";
    document.getElementById("studyFormOverlay")?.classList.add("open");
}

function closeAdminModal() {
    document.getElementById("studyFormOverlay")?.classList.remove("open");
}

function saveLearnerNotes() {
    if (!activeStudyForViewer) return;
    const text = document.getElementById("learnerNotesInput")?.value || "";

    const allNotes = JSON.parse(localStorage.getItem("studyNotes") || "{}");
    allNotes[activeStudyForViewer.id] = text;
    localStorage.setItem("studyNotes", JSON.stringify(allNotes));

    alert("Notes saved successfully!");
}

function markStudyComplete() {
    if (!activeStudyForViewer) return;

    const completed = JSON.parse(localStorage.getItem("completedStudies") || "[]");
    const exists = completed.some(item => item.id == activeStudyForViewer.id);

    if (!exists) {
        completed.push({
            id: activeStudyForViewer.id,
            title: activeStudyForViewer.title,
            scripture: activeStudyForViewer.scripture,
            completedAt: new Date().toLocaleDateString()
        });
        localStorage.setItem("completedStudies", JSON.stringify(completed));
    }

    localStorage.removeItem("activeStudyProgress");

    alert("Praise God! Study marked as complete.");
    closeStudyViewer();
    renderLearnerDashboard();
}

function saveActiveStudyProgress(study) {
    localStorage.setItem("activeStudyProgress", JSON.stringify({
        id: study.id,
        title: study.title,
        scripture: study.scripture,
        content: study.content,
        progress: "In Progress"
    }));
}

// Utility formatting tools
function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, match => {
        const escapeMap = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
        return escapeMap[match];
    });
}

function snippetText(str, length) {
    if (!str) return "";
    return str.length > length ? str.substring(0, length) + "..." : str;
}

function formatMarkdownParagraphs(text) {
    return text.split("\n\n").map(p => `<p style="margin-bottom: 15px;">${escapeHtml(p)}</p>`).join("");
}

function convertToEmbedUrl(url) {
    if (!url) return "";
    if (url.includes("embed/")) return url;
    if (url.includes("watch?v=")) {
        return url.replace("watch?v=", "embed/");
    }
    if (url.includes("youtu.be/")) {
        return url.replace("youtu.be/", "www.youtube.com/embed/");
    }
    return url;
}

function getFallbackMockData() {
    return [
        {
            id: 1,
            title: "The Fig Tree",
            scripture: "Matthew 21:18-22",
            category: "New Testament",
            content: "Early in the morning, as Jesus was on his way back to the city, he was hungry. Seeing a fig tree by the road, he went up to it but found nothing on it except leaves. Then he said to it, 'May you never bear fruit again!' Immediately the tree withered.",
            is_published: true,
            learner_count: 84,
            completion_count: 62,
            created_at: "2026-07-31"
        },
        {
            id: 2,
            title: "Walking in Faith",
            scripture: "Hebrews 11:1-6",
            category: "Discipleship",
            content: "Now faith is confidence in what we hope for and assurance about what we do not see. This is what the ancients were commended for.",
            is_published: false,
            learner_count: 0,
            completion_count: 0,
            created_at: "2026-08-01"
        }
    ];
}