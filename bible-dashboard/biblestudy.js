// =========================================================
// YOUR EXODUS - BIBLE STUDY DASHBOARD JAVASCRIPT
// =========================================================

const API_URL = "https://yourexodus-api.onrender.com";

// =========================================================
// CENTRAL STATE
// =========================================================

let allStudies = [];
let currentAdminTab = "published";
let activeStudyForViewer = null;


// =========================================================
// 1. INITIALIZATION & ROLE DETECTION
// =========================================================

document.addEventListener("DOMContentLoaded", async () => {
    setupRoleView();
    setupEventListeners();
    await loadInitialData();
});


// =========================================================
// USER / ROLE
// =========================================================

function getCurrentUser() {
    const storedUser = localStorage.getItem("username");

    if (!storedUser) return null;

    try {
        const user = JSON.parse(storedUser);

        if (typeof user === "object" && user !== null) {
            return user;
        }
    } catch (e) {
        // Stored as plain string
    }

    const role = localStorage.getItem("role") || "user";

    return {
        username: storedUser,
        role: role
    };
}


function isAdmin() {
    const user = getCurrentUser();

    if (!user) return false;

    return (
        user.role === "admin" ||
        user.role === "administrator" ||
        (user.username &&
            user.username.toLowerCase().includes("admin"))
    );
}


function setupRoleView() {
    const adminSection =
        document.getElementById("adminDashboardSection");

    const learnerSection =
        document.getElementById("learnerDashboardSection");

    const welcomeHeading =
        document.getElementById("welcomeHeading");

    const welcomeSubheading =
        document.getElementById("welcomeSubheading");

    if (isAdmin()) {

        if (adminSection) {
            adminSection.style.display = "block";
        }

        if (learnerSection) {
            learnerSection.style.display = "none";
        }

        if (welcomeHeading) {
            welcomeHeading.textContent =
                "👑 Bible Study Administration";
        }

        if (welcomeSubheading) {
            welcomeSubheading.textContent =
                "Create, manage, draft, and analyze discipleship content for Your Exodus.";
        }

    } else {

        if (adminSection) {
            adminSection.style.display = "none";
        }

        if (learnerSection) {
            learnerSection.style.display = "block";
        }

        const user = getCurrentUser();

        const displayName =
            user ? user.username : "Learner";

        if (welcomeHeading) {
            welcomeHeading.textContent =
                `📖 Welcome Back, ${escapeHtml(displayName)}`;
        }

        if (welcomeSubheading) {
            welcomeSubheading.textContent =
                "Continue your discipleship journey and grow in the Word.";
        }
    }
}


// =========================================================
// INITIAL DATA LOAD
// =========================================================

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
// 2. ADMIN DASHBOARD
// =========================================================

function renderAdminDashboard() {

    calculateAndRenderMetrics();
    renderAdminGrid();
}


// =========================================================
// ADMIN METRICS
// =========================================================

function calculateAndRenderMetrics() {

    const published =
        allStudies.filter(
            study => study.published !== false
        );

    const drafts =
        allStudies.filter(
            study => study.published === false
        );

    const seriesSet =
        new Set(
            allStudies
                .map(study => study.category_id)
                .filter(Boolean)
        );

    const totalLearners =
        allStudies.reduce(
            (acc, study) =>
                acc + (study.learner_count || 0),
            0
        );

    const completedStudies =
        allStudies.reduce(
            (acc, study) =>
                acc + (study.completion_count || 0),
            0
        );

    const elPublished =
        document.getElementById("statPublishedCount");

    const elDrafts =
        document.getElementById("statDraftCount");

    const elSeries =
        document.getElementById("statSeriesCount");

    const elLearners =
        document.getElementById("statTotalLearners");

    const elCompletions =
        document.getElementById("statCompletions");

    const elDraftBadge =
        document.getElementById("draftBadge");

    if (elPublished) {
        elPublished.textContent = published.length;
    }

    if (elDrafts) {
        elDrafts.textContent = drafts.length;
    }

    if (elDraftBadge) {
        elDraftBadge.textContent = drafts.length;
    }

    if (elSeries) {
        elSeries.textContent = seriesSet.size;
    }

    if (elLearners) {
        elLearners.textContent = totalLearners;
    }

    if (elCompletions) {
        elCompletions.textContent = completedStudies;
    }
}


// =========================================================
// ADMIN STUDY GRID
// =========================================================

function renderAdminGrid() {

    const grid =
        document.getElementById("adminStudyGrid");

    if (!grid) return;

    grid.innerHTML = "";

    const filteredStudies =
        allStudies.filter(study => {

            if (currentAdminTab === "drafts") {

                return study.published === false;

            } else {

                return study.published !== false;
            }
        });


    if (filteredStudies.length === 0) {

        grid.innerHTML = `
            <div class="journal-card">
                <h3>No ${currentAdminTab} studies</h3>

                <p>
                    Use the "+ Create New Study"
                    button above to start writing content.
                </p>
            </div>
        `;

        return;
    }


    filteredStudies.forEach(study => {

        const card =
            document.createElement("div");

        card.className = "journal-card";

        const isDraft =
            study.published === false;

        const formattedDate =
            study.created_at
                ? new Date(study.created_at)
                    .toLocaleDateString()
                : "Date set on publish";

        const categoryName =
            getCategoryName(study.category_id);


        card.innerHTML = `
            <div>

                <div class="journal-title-row">

                    <h3>
                        ${escapeHtml(
                            study.title ||
                            "Untitled Study"
                        )}
                    </h3>

                    ${
                        isDraft
                            ? '<span class="badge-draft">Draft</span>'
                            : '<span class="badge-gold">Published</span>'
                    }

                </div>

                <p class="scripture-reference">
                    📖 ${escapeHtml(
                        study.scripture ||
                        "No Reference"
                    )}
                </p>

                <p>
                    ${escapeHtml(
                        snippetText(
                            study.content ||
                            study.summary ||
                            "",
                            120
                        )
                    )}
                </p>

                <p class="date">
                    Category:
                    ${escapeHtml(categoryName)}
                    |
                    Added:
                    ${formattedDate}
                </p>

            </div>

            <div class="card-actions-row">

                <button
                    class="btn-secondary btn-preview-admin"
                    data-id="${study.id}">
                    👁 Preview
                </button>

                <button
                    class="btn-secondary btn-edit-admin"
                    data-id="${study.id}">
                    ✏ Edit
                </button>

                <button
                    class="btn-secondary btn-toggle-publish"
                    data-id="${study.id}">
                    ${
                        isDraft
                            ? "📢 Publish"
                            : "📦 Unpublish"
                    }
                </button>

                <button
                    class="btn-danger btn-delete-admin"
                    data-id="${study.id}">
                    🗑 Delete
                </button>

            </div>
        `;

        grid.appendChild(card);
    });


    bindAdminGridButtons();
}


// =========================================================
// ADMIN BUTTONS
// =========================================================

function bindAdminGridButtons() {

    document
        .querySelectorAll(".btn-preview-admin")
        .forEach(btn => {

            btn.addEventListener("click", event => {

                const id =
                    event.currentTarget
                        .getAttribute("data-id");

                const study =
                    allStudies.find(
                        s => s.id == id
                    );

                if (study) {
                    openStudyViewer(study);
                }
            });
        });


    document
        .querySelectorAll(".btn-edit-admin")
        .forEach(btn => {

            btn.addEventListener("click", event => {

                const id =
                    event.currentTarget
                        .getAttribute("data-id");

                openEditModal(id);
            });
        });


    document
        .querySelectorAll(".btn-toggle-publish")
        .forEach(btn => {

            btn.addEventListener("click", event => {

                const id =
                    event.currentTarget
                        .getAttribute("data-id");

                togglePublishStatus(id);
            });
        });


    document
        .querySelectorAll(".btn-delete-admin")
        .forEach(btn => {

            btn.addEventListener("click", event => {

                const id =
                    event.currentTarget
                        .getAttribute("data-id");

                deleteStudy(id);
            });
        });
}


// =========================================================
// 3. LEARNER DASHBOARD
// =========================================================

function renderLearnerDashboard() {

    const continueCard =
        document.getElementById(
            "continueStudyingCard"
        );

    const activeStudy =
        loadActiveStudyProgress();


    if (activeStudy && continueCard) {

        continueCard.style.display = "block";

        document.getElementById(
            "activeStudyTitle"
        ).textContent =
            activeStudy.title ||
            "In-Progress Study";

        document.getElementById(
            "activeStudyScripture"
        ).textContent =
            `📖 ${activeStudy.scripture || ""}`;

        document.getElementById(
            "activeStudySummary"
        ).textContent =
            snippetText(
                activeStudy.content || "",
                140
            );

        document.getElementById(
            "activeProgressBadge"
        ).textContent =
            activeStudy.progress ||
            "In Progress";


        const continueBtn =
            document.getElementById(
                "continueStudyBtn"
            );

        if (continueBtn) {

            continueBtn.onclick =
                () => openStudyViewer(activeStudy);
        }

    } else if (continueCard) {

        continueCard.style.display = "none";
    }


    renderMySavedStudies();
}


// =========================================================
// COMPLETED STUDIES
// =========================================================

function renderMySavedStudies() {

    const container =
        document.getElementById(
            "myStudiesList"
        );

    if (!container) return;

    const completed =
        JSON.parse(
            localStorage.getItem(
                "completedStudies"
            ) || "[]"
        );


    if (completed.length === 0) {

        container.innerHTML = `
            <div class="journal-card">
                <h3>No completed studies yet</h3>

                <p>
                    Select a lesson from the
                    library below to begin
                    your discipleship study.
                </p>
            </div>
        `;

        return;
    }


    container.innerHTML = "";


    completed.forEach(item => {

        const card =
            document.createElement("div");

        card.className = "journal-card";


        card.innerHTML = `
            <div>

                <div class="journal-title-row">

                    <h3>
                        ${escapeHtml(item.title)}
                    </h3>

                    <span class="badge-gold">
                        Completed
                    </span>

                </div>

                <p class="scripture-reference">
                    📖 ${escapeHtml(
                        item.scripture || ""
                    )}
                </p>

                <p class="date">
                    Completed on:
                    ${item.completedAt}
                </p>

            </div>

            <div class="card-actions-row">

                <button
                    class="btn-secondary btn-review"
                    data-id="${item.id}">
                    Review Lesson
                </button>

            </div>
        `;

        container.appendChild(card);
    });


    document
        .querySelectorAll(".btn-review")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                event => {

                    const id =
                        event.currentTarget
                            .getAttribute("data-id");

                    const study =
                        allStudies.find(
                            s => s.id == id
                        );

                    if (study) {
                        openStudyViewer(study);
                    }
                }
            );
        });
}


function loadActiveStudyProgress() {

    const saved =
        localStorage.getItem(
            "activeStudyProgress"
        );

    return saved
        ? JSON.parse(saved)
        : null;
}


// =========================================================
// 4. PUBLIC BIBLE STUDY LIBRARY
// =========================================================

function renderPublicLibrary() {

    const grid =
        document.getElementById(
            "publicStudyGrid"
        );

    if (!grid) return;


    const searchTerm =
        (
            document.getElementById(
                "searchBox"
            )?.value || ""
        )
        .toLowerCase()
        .trim();


    const selectedCategory =
        document.getElementById(
            "categoryFilter"
        )?.value || "";


    // Only published studies
    let publicStudies =
        allStudies.filter(
            study => study.published !== false
        );


    // Search
    if (searchTerm) {

        publicStudies =
            publicStudies.filter(study => {

                const title =
                    (study.title || "")
                        .toLowerCase();

                const scripture =
                    (study.scripture || "")
                        .toLowerCase();

                const content =
                    (
                        study.content ||
                        study.summary ||
                        ""
                    ).toLowerCase();

                const category =
                    getCategoryName(
                        study.category_id
                    ).toLowerCase();


                return (
                    title.includes(searchTerm) ||
                    scripture.includes(searchTerm) ||
                    content.includes(searchTerm) ||
                    category.includes(searchTerm)
                );
            });
    }


    // Category filter
    if (
        selectedCategory &&
        selectedCategory !== "all"
    ) {

        const selectedCategoryId =
            parseInt(
                selectedCategory,
                10
            );

        publicStudies =
            publicStudies.filter(
                study =>
                    Number(study.category_id) ===
                    selectedCategoryId
            );
    }


    if (publicStudies.length === 0) {

        grid.innerHTML = `
            <p class="no-data">
                No Bible studies match
                your criteria.
                Check back soon!
            </p>
        `;

        return;
    }


    grid.innerHTML =
        publicStudies.map(study => {

            const categoryName =
                getCategoryName(
                    study.category_id
                );

            return `
                <div
                    class="study-card"
                    data-id="${escapeHtml(study.id)}">

                    <img
                        src="${escapeHtml(
                            study.coverImage ||
                            "placeholder.jpg"
                        )}"
                        alt="${escapeHtml(
                            study.title
                        )}"
                        class="study-card-img"
                    />

                    <div class="study-card-body">

                        <span class="badge">
                            ${escapeHtml(
                                categoryName
                            )}
                        </span>

                        <h3>
                            ${escapeHtml(
                                study.title
                            )}
                        </h3>

                        <p>
                            ${escapeHtml(
                                snippetText(
                                    study.content ||
                                    study.summary ||
                                    "",
                                    120
                                )
                            )}
                        </p>

                        <div class="card-actions">

                            <button
                                class="btn btn-primary view-study-btn"
                                data-id="${escapeHtml(
                                    study.id
                                )}">
                                Start Study
                            </button>

                            <button
                                class="btn btn-outline save-study-btn"
                                data-id="${escapeHtml(
                                    study.id
                                )}">
                                Save for Later
                            </button>

                        </div>

                    </div>
                </div>
            `;
        }).join("");


    document
        .querySelectorAll(".view-study-btn")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                event => {

                    const id =
                        event.currentTarget
                            .getAttribute("data-id");

                    const study =
                        allStudies.find(
                            s => s.id == id
                        );

                    if (study) {
                        openStudyViewer(study);
                    }
                }
            );
        });
}


// =========================================================
// 5. STUDY VIEWER
// =========================================================

function openStudyViewer(study) {

    activeStudyForViewer = study;


    const overlay =
        document.getElementById(
            "studyViewerOverlay"
        );

    const titleEl =
        document.getElementById(
            "viewerStudyTitle"
        );

    const scriptureEl =
        document.getElementById(
            "viewerScripture"
        );

    const contentEl =
        document.getElementById(
            "viewerContent"
        );

    const videoContainer =
        document.getElementById(
            "videoContainer"
        );

    const videoPlayer =
        document.getElementById(
            "videoPlayer"
        );

    const notesInput =
        document.getElementById(
            "learnerNotesInput"
        );


    if (titleEl) {
        titleEl.textContent =
            study.title || "Bible Study";
    }


    if (scriptureEl) {

        scriptureEl.textContent =
            study.scripture
                ? `📖 ${study.scripture}`
                : "";
    }


    if (contentEl) {

        contentEl.innerHTML =
            formatMarkdownParagraphs(
                study.content || ""
            );
    }


    // YouTube
    if (
        study.video_url &&
        videoContainer &&
        videoPlayer
    ) {

        const embedUrl =
            convertToEmbedUrl(
                study.video_url
            );

        videoPlayer.src = embedUrl;

        videoContainer.style.display =
            "block";

    } else {

        if (videoContainer) {
            videoContainer.style.display =
                "none";
        }

        if (videoPlayer) {
            videoPlayer.src = "";
        }
    }


    // Notes
    if (notesInput) {

        const allNotes =
            JSON.parse(
                localStorage.getItem(
                    "studyNotes"
                ) || "{}"
            );

        notesInput.value =
            allNotes[study.id] || "";
    }


    saveActiveStudyProgress(study);


    if (overlay) {
        overlay.classList.add("open");
    }
}


function closeStudyViewer() {

    const overlay =
        document.getElementById(
            "studyViewerOverlay"
        );

    const videoPlayer =
        document.getElementById(
            "videoPlayer"
        );


    if (videoPlayer) {
        videoPlayer.src = "";
    }

    if (overlay) {
        overlay.classList.remove("open");
    }

    activeStudyForViewer = null;
}


// =========================================================
// 6. API - FETCH STUDIES
// =========================================================

async function fetchAllStudies() {

    try {

        const response =
            await fetch(
                `${API_URL}/bible-studies`
            );


        if (!response.ok) {
            throw new Error(
                "Failed to load studies"
            );
        }


        allStudies =
            await response.json();


        localStorage.setItem(
            "your_exodus_studies",
            JSON.stringify(allStudies)
        );

    } catch (error) {

        console.error(
            "API Fetch Error:",
            error
        );


        const savedLocal =
            localStorage.getItem(
                "your_exodus_studies"
            );


        if (savedLocal) {

            try {

                allStudies =
                    JSON.parse(savedLocal);

                return;

            } catch (e) {

                console.error(
                    "Local storage parse error",
                    e
                );
            }
        }


        allStudies =
            getFallbackMockData();
    }
}


// =========================================================
// 7. CREATE / UPDATE BIBLE STUDY
// =========================================================

async function handleStudyFormSubmit(
    event,
    forceDraft = false
) {

    event.preventDefault();


    const id =
        document.getElementById(
            "editStudyId"
        )?.value;


    const title =
        document.getElementById(
            "studyTitleInput"
        )?.value.trim();


    const scripture =
        document.getElementById(
            "studyScriptureInput"
        )?.value.trim();


    const category_id =
        parseInt(
            document.getElementById(
                "studyCategorySelect"
            )?.value,
            10
        );


    const video_url =
        document.getElementById(
            "studyVideoInput"
        )?.value.trim();


    const content =
        document.getElementById(
            "studyContentInput"
        )?.value.trim();


    const user =
        getCurrentUser();


    const user_id =
        user?.id;


    // Validation
    if (!title || !scripture || !content) {

        alert(
            "Please complete the title, scripture, and lesson content."
        );

        return;
    }


    if (
        !category_id ||
        Number.isNaN(category_id)
    ) {

        alert(
            "Please select a Bible study category."
        );

        return;
    }


    if (!user_id) {

        alert(
            "Your user information could not be found. Please log in again."
        );

        console.error(
            "Missing user ID:",
            user
        );

        return;
    }


    const payload = {

        title: title,

        scripture: scripture,

        summary: "",

        content: content,

        published: !forceDraft,

        category_id: category_id,

        user_id: user_id,

        video_url: video_url || null
    };


    console.log(
        "BIBLE STUDY PAYLOAD:",
        payload
    );


    try {

        const method =
            id ? "PUT" : "POST";


        const endpoint =
            id
                ? `${API_URL}/bible-studies/${id}`
                : `${API_URL}/bible-studies`;


        const response =
            await fetch(
                endpoint,
                {
                    method: method,

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );


        const responseData =
            await response
                .json()
                .catch(() => null);


        if (!response.ok) {

            console.error(
                "Bible Study API Error:",
                responseData
            );

            throw new Error(
                responseData?.message ||
                `Save operation failed (${response.status})`
            );
        }


        console.log(
            "Bible Study saved:",
            responseData
        );


        alert(
            forceDraft
                ? "Draft saved successfully!"
                : "Bible study published successfully!"
        );


        closeAdminModal();


        await loadInitialData();


    } catch (err) {

        console.error(
            "Bible Study Save Error:",
            err
        );


        alert(
            `Bible study could not be saved.\n\n${err.message}`
        );
    }
}


// =========================================================
// 8. PUBLISH / UNPUBLISH
// =========================================================

async function togglePublishStatus(id) {

    const study =
        allStudies.find(
            s => s.id == id
        );


    if (!study) return;


    study.published =
        study.published === false
            ? true
            : false;


    try {

        const response =
            await fetch(
                `${API_URL}/bible-studies/${id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(study)
                }
            );


        if (!response.ok) {
            throw new Error(
                "Failed to update publish status"
            );
        }


    } catch (e) {

        console.warn(
            "Updated publish state locally",
            e
        );
    }


    renderAdminDashboard();
    renderPublicLibrary();
}


// =========================================================
// 9. DELETE STUDY
// =========================================================

async function deleteStudy(id) {

    if (
        !confirm(
            "Are you sure you want to delete this study?"
        )
    ) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/bible-studies/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {
            throw new Error(
                "Delete failed"
            );
        }


    } catch (e) {

        console.warn(
            "Deleted study locally",
            e
        );
    }


    allStudies =
        allStudies.filter(
            s => s.id != id
        );


    renderAdminDashboard();
    renderPublicLibrary();
}


// =========================================================
// 10. EVENT LISTENERS
// =========================================================

function setupEventListeners() {

    // Admin tabs

    const tabPub =
        document.getElementById(
            "tabPublished"
        );

    const tabDraft =
        document.getElementById(
            "tabDrafts"
        );


    if (tabPub && tabDraft) {

        tabPub.addEventListener(
            "click",
            () => {

                currentAdminTab =
                    "published";

                tabPub.classList.add(
                    "active"
                );

                tabDraft.classList.remove(
                    "active"
                );

                renderAdminGrid();
            }
        );


        tabDraft.addEventListener(
            "click",
            () => {

                currentAdminTab =
                    "drafts";

                tabDraft.classList.add(
                    "active"
                );

                tabPub.classList.remove(
                    "active"
                );

                renderAdminGrid();
            }
        );
    }


    // Create

    const openCreateBtn =
        document.getElementById(
            "openCreateStudyBtn"
        );


    if (openCreateBtn) {

        openCreateBtn.addEventListener(
            "click",
            openCreateModal
        );
    }


    // Close form

    const closeFormBtn =
        document.getElementById(
            "closeFormModal"
        );


    if (closeFormBtn) {

        closeFormBtn.addEventListener(
            "click",
            closeAdminModal
        );
    }


    // Close viewer

    const closeViewerBtn =
        document.getElementById(
            "closeViewerModal"
        );


    if (closeViewerBtn) {

        closeViewerBtn.addEventListener(
            "click",
            closeStudyViewer
        );
    }


    // Form submit

    const form =
        document.getElementById(
            "studyAdminForm"
        );


    if (form) {

        form.addEventListener(
            "submit",
            event =>
                handleStudyFormSubmit(
                    event,
                    false
                )
        );
    }


    // Save draft

    const draftBtn =
        document.getElementById(
            "saveDraftBtn"
        );


    if (draftBtn) {

        draftBtn.addEventListener(
            "click",
            event =>
                handleStudyFormSubmit(
                    event,
                    true
                )
        );
    }


    // Search

    const searchBox =
        document.getElementById(
            "searchBox"
        );


    if (searchBox) {

        searchBox.addEventListener(
            "input",
            renderPublicLibrary
        );
    }


    // Category filter

    const categoryFilter =
        document.getElementById(
            "categoryFilter"
        );


    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            renderPublicLibrary
        );
    }


    // Notes

    const saveNotesBtn =
        document.getElementById(
            "saveNotesBtn"
        );


    if (saveNotesBtn) {

        saveNotesBtn.addEventListener(
            "click",
            saveLearnerNotes
        );
    }


    // Complete

    const markCompleteBtn =
        document.getElementById(
            "markCompleteBtn"
        );


    if (markCompleteBtn) {

        markCompleteBtn.addEventListener(
            "click",
            markStudyComplete
        );
    }
}


// =========================================================
// 11. CREATE MODAL
// =========================================================

function openCreateModal() {

    document
        .getElementById(
            "studyAdminForm"
        )
        ?.reset();


    document.getElementById(
        "editStudyId"
    ).value = "";


    document.getElementById(
        "studyCategorySelect"
    ).value = "";


    document.getElementById(
        "modalTitle"
    ).textContent =
        "✏ Create New Bible Study";


    document
        .getElementById(
            "studyFormOverlay"
        )
        ?.classList.add("open");
}


// =========================================================
// 12. EDIT MODAL
// =========================================================

function openEditModal(id) {

    const study =
        allStudies.find(
            s => s.id == id
        );


    if (!study) return;


    document.getElementById(
        "editStudyId"
    ).value =
        study.id;


    document.getElementById(
        "studyTitleInput"
    ).value =
        study.title || "";


    document.getElementById(
        "studyScriptureInput"
    ).value =
        study.scripture || "";


    document.getElementById(
        "studyCategorySelect"
    ).value =
        study.category_id || "";


    document.getElementById(
        "studyVideoInput"
    ).value =
        study.video_url || "";


    document.getElementById(
        "studyContentInput"
    ).value =
        study.content || "";


    document.getElementById(
        "modalTitle"
    ).textContent =
        "✏ Edit Bible Study";


    document
        .getElementById(
            "studyFormOverlay"
        )
        ?.classList.add("open");
}


// =========================================================
// CLOSE ADMIN MODAL
// =========================================================

function closeAdminModal() {

    document
        .getElementById(
            "studyFormOverlay"
        )
        ?.classList.remove("open");
}


// =========================================================
// 13. NOTES
// =========================================================

function saveLearnerNotes() {

    if (!activeStudyForViewer) return;


    const text =
        document.getElementById(
            "learnerNotesInput"
        )?.value || "";


    const allNotes =
        JSON.parse(
            localStorage.getItem(
                "studyNotes"
            ) || "{}"
        );


    allNotes[
        activeStudyForViewer.id
    ] = text;


    localStorage.setItem(
        "studyNotes",
        JSON.stringify(allNotes)
    );


    alert(
        "Notes saved successfully!"
    );
}


// =========================================================
// 14. MARK STUDY COMPLETE
// =========================================================

function markStudyComplete() {

    if (!activeStudyForViewer) return;


    const completed =
        JSON.parse(
            localStorage.getItem(
                "completedStudies"
            ) || "[]"
        );


    const exists =
        completed.some(
            item =>
                item.id ==
                activeStudyForViewer.id
        );


    if (!exists) {

        completed.push({

            id:
                activeStudyForViewer.id,

            title:
                activeStudyForViewer.title,

            scripture:
                activeStudyForViewer.scripture,

            completedAt:
                new Date()
                    .toLocaleDateString()
        });


        localStorage.setItem(
            "completedStudies",
            JSON.stringify(completed)
        );
    }


    localStorage.removeItem(
        "activeStudyProgress"
    );


    alert(
        "Praise God! Study marked as complete."
    );


    closeStudyViewer();

    renderLearnerDashboard();
}


// =========================================================
// 15. ACTIVE STUDY PROGRESS
// =========================================================

function saveActiveStudyProgress(study) {

    localStorage.setItem(
        "activeStudyProgress",
        JSON.stringify({

            id: study.id,

            title: study.title,

            scripture:
                study.scripture,

            content:
                study.content,

            progress:
                "In Progress"
        })
    );
}


// =========================================================
// 16. CATEGORY LOOKUP
// =========================================================

function getCategoryName(categoryId) {

    const categories = {

        1: "Faith",

        2: "Prayer",

        3: "God's Word",

        4: "Trusting God",

        5: "Purpose & Calling",

        6: "Overcoming",

        7: "Relationships",

        8: "Wisdom & Decisions",

        9: "Healing & Restoration",

        10: "Character & Growth"
    };


    return (
        categories[Number(categoryId)] ||
        "General"
    );
}


// =========================================================
// 17. HTML ESCAPING
// =========================================================

function escapeHtml(str) {

    return String(str || "")
        .replace(
            /[&<>"']/g,
            match => {

                const escapeMap = {

                    "&": "&amp;",

                    "<": "&lt;",

                    ">": "&gt;",

                    '"': "&quot;",

                    "'": "&#039;"
                };


                return escapeMap[match];
            }
        );
}


// =========================================================
// 18. TEXT SNIPPET
// =========================================================

function snippetText(str, length) {

    if (!str) return "";

    return str.length > length
        ? str.substring(0, length) + "..."
        : str;
}


// =========================================================
// 19. FORMAT STUDY CONTENT
// =========================================================

function formatMarkdownParagraphs(text) {

    return text
        .split("\n\n")
        .map(
            paragraph =>
                `<p style="margin-bottom: 15px;">${escapeHtml(
                    paragraph
                )}</p>`
        )
        .join("");
}


// =========================================================
// 20. YOUTUBE URL
// =========================================================

function convertToEmbedUrl(url) {

    if (!url) return "";

    if (url.includes("embed/")) {
        return url;
    }


    if (url.includes("watch?v=")) {

        return url.replace(
            "watch?v=",
            "embed/"
        );
    }


    if (url.includes("youtu.be/")) {

        const videoId =
            url.split("youtu.be/")[1]
                ?.split("?")[0]
                ?.split("&")[0];


        return videoId
            ? `https://www.youtube.com/embed/${videoId}`
            : url;
    }


    return url;
}


// =========================================================
// 21. FALLBACK DATA
// =========================================================

function getFallbackMockData() {

    return [

        {
            id: 1,

            title: "The Fig Tree",

            scripture:
                "Matthew 21:18-22",

            category_id: 1,

            content:
                "Early in the morning, as Jesus was on his way back to the city, he was hungry. Seeing a fig tree by the road, he went up to it but found nothing on it except leaves. Then he said to it, 'May you never bear fruit again!' Immediately the tree withered.",

            published: true,

            learner_count: 84,

            completion_count: 62,

            created_at:
                "2026-07-31"
        },


        {
            id: 2,

            title: "Walking in Faith",

            scripture:
                "Hebrews 11:1-6",

            category_id: 1,

            content:
                "Now faith is confidence in what we hope for and assurance about what we do not see. This is what the ancients were commended for.",

            published: false,

            learner_count: 0,

            completion_count: 0,

            created_at:
                "2026-08-01"
        }
    ];
}