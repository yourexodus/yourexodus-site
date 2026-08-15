// =========================================================
// YOUR EXODUS - BIBLE STUDY DASHBOARD JAVASCRIPT
// =========================================================
// DATABASE-DRIVEN VERSION
//
// Bible Studies:
//     PostgreSQL → Flask API → JavaScript
//
// Categories:
//     Fixed/manual categories already stored in PostgreSQL
//     Category names are kept here for display.
//
// User:
//     Stored in localStorage["username"] as a JSON object.
//
// IMPORTANT:
//     No hard-coded Bible studies.
//     No fake fallback studies.
//     No /categories API route.
// =========================================================


const API_URL =
    "https://yourexodus-api.onrender.com";


// =========================================================
// CENTRAL STATE
// =========================================================

let allStudies = [];

let currentAdminTab =
    "published";

let activeStudyForViewer =
    null;


// =========================================================
// FIXED CATEGORIES
// =========================================================
//
// These match the categories you manually created
// in your PostgreSQL database.
//
// DO NOT remove these unless you change the
// corresponding database category IDs.
// =========================================================

const CATEGORIES = {

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


// =========================================================
// 1. INITIALIZATION
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        setupRoleView();

        setupEventListeners();

        populateCategoryControls();

        await loadInitialData();

    }
);


// =========================================================
// 2. USER
// =========================================================

function getCurrentUser() {
    const storedUser = localStorage.getItem("username");

    if (!storedUser) {
        return null;
    }

    try {
        const user = JSON.parse(storedUser);

        if (user && typeof user === "object") {
            return user;
        }
    } catch (error) {
        // Stored as a plain username instead of JSON
    }

    return {
        username: storedUser,
        role: localStorage.getItem("role") || "user"
    };
}


// =========================================================
// ADMIN DETECTION
// =========================================================

function isAdmin() {
    const user = getCurrentUser();

    if (!user) {
        return false;
    }

    return (
        user.is_admin === true ||
        user.role === "admin" ||
        user.role === "administrator" ||
        (
            user.username &&
            user.username.toLowerCase().includes("admin")
        )
    );
}


// =========================================================
// ROLE VIEW
// =========================================================

function setupRoleView() {

    const adminSection =
        document.getElementById(
            "adminDashboardSection"
        );


    const learnerSection =
        document.getElementById(
            "learnerDashboardSection"
        );


    const welcomeHeading =
        document.getElementById(
            "welcomeHeading"
        );


    const welcomeSubheading =
        document.getElementById(
            "welcomeSubheading"
        );


    if (isAdmin()) {

        if (adminSection) {

            adminSection.style.display =
                "block";
        }


        if (learnerSection) {

            learnerSection.style.display =
                "none";
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

            adminSection.style.display =
                "none";
        }


        if (learnerSection) {

            learnerSection.style.display =
                "block";
        }


        const user =
            getCurrentUser();


        const displayName =
            user?.username ||
            "Learner";


        if (welcomeHeading) {

            welcomeHeading.textContent =
                `📖 Welcome Back, ${escapeHtml(
                    displayName
                )}`;
        }


        if (welcomeSubheading) {

            welcomeSubheading.textContent =
                "Continue your discipleship journey and grow in the Word.";
        }
    }
}


// =========================================================
// 3. INITIAL DATA
// =========================================================

async function loadInitialData() {

    try {

        await fetchAllStudies();


        if (isAdmin()) {

            renderAdminDashboard();

        } else {

            renderLearnerDashboard();
        }


        renderPublicLibrary();


    } catch (error) {

        console.error(
            "Bible Study API Load Error:",
            error
        );


        showApiError(
            "Bible studies could not be loaded from the server. Please try again."
        );
    }
}


// =========================================================
// 4. CATEGORIES
// =========================================================

function getCategoryName(
    categoryId
) {

    return (
        CATEGORIES[
            Number(categoryId)
        ] ||
        "General"
    );
}


// =========================================================
// POPULATE CATEGORY DROPDOWNS
// =========================================================

function populateCategoryControls() {

    const filter =
        document.getElementById(
            "categoryFilter"
        );


    const select =
        document.getElementById(
            "studyCategorySelect"
        );


    // -----------------------------------------------------
    // PUBLIC CATEGORY FILTER
    // -----------------------------------------------------

    if (filter) {

        filter.innerHTML = `
            <option value="all">
                All Categories
            </option>
        `;


        Object.entries(
            CATEGORIES
        ).forEach(
            ([id, name]) => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    id;


                option.textContent =
                    name;


                filter.appendChild(
                    option
                );
            }
        );
    }


    // -----------------------------------------------------
    // ADMIN CATEGORY SELECT
    // -----------------------------------------------------

    if (select) {

        select.innerHTML = `
            <option value="">
                Select Category
            </option>
        `;


        Object.entries(
            CATEGORIES
        ).forEach(
            ([id, name]) => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    id;


                option.textContent =
                    name;


                select.appendChild(
                    option
                );
            }
        );
    }
}


// =========================================================
// 5. FETCH BIBLE STUDIES
// =========================================================

async function fetchAllStudies() {

    const response =
        await fetch(
            `${API_URL}/bible-studies`
        );


    if (!response.ok) {

        throw new Error(
            `Bible Study API failed (${response.status})`
        );
    }


    const data =
        await response.json();


    /*
     * The API may return:
     *
     * [
     *     {...},
     *     {...}
     * ]
     *
     * OR:
     *
     * {
     *     bible_studies: [...]
     * }
     */


    if (Array.isArray(data)) {

        allStudies =
            data;

    } else if (
        Array.isArray(
            data.bible_studies
        )
    ) {

        allStudies =
            data.bible_studies;

    } else {

        allStudies = [];
    }


    console.log(
        "Bible studies loaded from API:",
        allStudies
    );
}


// =========================================================
// 6. ADMIN DASHBOARD
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
            study =>
                study.published !== false
        );


    const drafts =
        allStudies.filter(
            study =>
                study.published === false
        );


    const seriesSet =
        new Set(
            allStudies
                .map(
                    study =>
                        study.category_id
                )
                .filter(Boolean)
        );


    const totalLearners =
        allStudies.reduce(
            (
                total,
                study
            ) =>
                total +
                Number(
                    study.learner_count ||
                    0
                ),
            0
        );


    const completions =
        allStudies.reduce(
            (
                total,
                study
            ) =>
                total +
                Number(
                    study.completion_count ||
                    0
                ),
            0
        );


    const publishedEl =
        document.getElementById(
            "statPublishedCount"
        );


    const draftEl =
        document.getElementById(
            "statDraftCount"
        );


    const seriesEl =
        document.getElementById(
            "statSeriesCount"
        );


    const learnersEl =
        document.getElementById(
            "statTotalLearners"
        );


    const completionsEl =
        document.getElementById(
            "statCompletions"
        );


    const draftBadge =
        document.getElementById(
            "draftBadge"
        );


    if (publishedEl) {

        publishedEl.textContent =
            published.length;
    }


    if (draftEl) {

        draftEl.textContent =
            drafts.length;
    }


    if (draftBadge) {

        draftBadge.textContent =
            drafts.length;
    }


    if (seriesEl) {

        seriesEl.textContent =
            seriesSet.size;
    }


    if (learnersEl) {

        learnersEl.textContent =
            totalLearners;
    }


    if (completionsEl) {

        completionsEl.textContent =
            completions;
    }
}


// =========================================================
// ADMIN STUDY GRID
// =========================================================

function renderAdminGrid() {

    const grid =
        document.getElementById(
            "adminStudyGrid"
        );


    if (!grid) {

        return;
    }


    grid.innerHTML = "";


    const filteredStudies =
        allStudies.filter(
            study => {

                if (
                    currentAdminTab ===
                    "drafts"
                ) {

                    return (
                        study.published ===
                        false
                    );
                }


                return (
                    study.published !==
                    false
                );
            }
        );


    if (
        filteredStudies.length ===
        0
    ) {

        grid.innerHTML = `

            <div class="journal-card">

                <h3>
                    No ${escapeHtml(
                        currentAdminTab
                    )} studies
                </h3>

                <p>
                    Use the
                    "+ Create New Study"
                    button to add content.
                </p>

            </div>
        `;


        return;
    }


    filteredStudies.forEach(
        study => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "journal-card";


            const isDraft =
                study.published ===
                false;


            const formattedDate =
                study.created_at
                    ? new Date(
                        study.created_at
                    ).toLocaleDateString()
                    : "Date unavailable";


            const categoryName =
                getCategoryName(
                    study.category_id
                );


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
                                ? `
                                    <span class="badge-draft">
                                        Draft
                                    </span>
                                `
                                : `
                                    <span class="badge-gold">
                                        Published
                                    </span>
                                `
                        }

                    </div>


                    <p class="scripture-reference">

                        📖 ${escapeHtml(
                            study.scripture ||
                            "No Scripture Reference"
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
                        ${escapeHtml(
                            categoryName
                        )}

                        |

                        Added:
                        ${escapeHtml(
                            formattedDate
                        )}

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


            grid.appendChild(
                card
            );
        }
    );


    bindAdminGridButtons();
}


// =========================================================
// ADMIN BUTTONS
// =========================================================

function bindAdminGridButtons() {

    document
        .querySelectorAll(
            ".btn-preview-admin"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        const id =
                            event.currentTarget
                                .dataset
                                .id;


                        const study =
                            allStudies.find(
                                item =>
                                    item.id ==
                                    id
                            );


                        if (study) {

                            openStudyViewer(
                                study
                            );
                        }
                    }
                );
            }
        );


    document
        .querySelectorAll(
            ".btn-edit-admin"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        openEditModal(
                            event.currentTarget
                                .dataset
                                .id
                        );
                    }
                );
            }
        );


    document
        .querySelectorAll(
            ".btn-toggle-publish"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        togglePublishStatus(
                            event.currentTarget
                                .dataset
                                .id
                        );
                    }
                );
            }
        );


    document
        .querySelectorAll(
            ".btn-delete-admin"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        deleteStudy(
                            event.currentTarget
                                .dataset
                                .id
                        );
                    }
                );
            }
        );
}


// =========================================================
// 7. LEARNER DASHBOARD
// =========================================================

function renderLearnerDashboard() {

    const continueCard =
        document.getElementById(
            "continueStudyingCard"
        );


    const activeStudy =
        loadActiveStudyProgress();


    if (
        activeStudy &&
        continueCard
    ) {

        continueCard.style.display =
            "block";


        const title =
            document.getElementById(
                "activeStudyTitle"
            );


        const scripture =
            document.getElementById(
                "activeStudyScripture"
            );


        const summary =
            document.getElementById(
                "activeStudySummary"
            );


        const badge =
            document.getElementById(
                "activeProgressBadge"
            );


        if (title) {

            title.textContent =
                activeStudy.title ||
                "In-Progress Study";
        }


        if (scripture) {

            scripture.textContent =
                `📖 ${
                    activeStudy.scripture ||
                    ""
                }`;
        }


        if (summary) {

            summary.textContent =
                snippetText(
                    activeStudy.content ||
                    "",
                    140
                );
        }


        if (badge) {

            badge.textContent =
                activeStudy.progress ||
                "In Progress";
        }


        const continueButton =
            document.getElementById(
                "continueStudyBtn"
            );


        if (continueButton) {

            continueButton.onclick =
                () =>
                    openStudyViewer(
                        activeStudy
                    );
        }


    } else if (
        continueCard
    ) {

        continueCard.style.display =
            "none";
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


    if (!container) {

        return;
    }


    let completed = [];


    try {

        completed =
            JSON.parse(
                localStorage.getItem(
                    "completedStudies"
                ) || "[]"
            );

    } catch (error) {

        completed = [];
    }


    if (
        completed.length ===
        0
    ) {

        container.innerHTML = `

            <div class="journal-card">

                <h3>
                    No completed studies yet
                </h3>

                <p>
                    Select a lesson from the
                    library below to begin.
                </p>

            </div>
        `;


        return;
    }


    container.innerHTML = "";


    completed.forEach(
        item => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "journal-card";


            card.innerHTML = `

                <div>

                    <div class="journal-title-row">

                        <h3>
                            ${escapeHtml(
                                item.title
                            )}
                        </h3>

                        <span class="badge-gold">
                            Completed
                        </span>

                    </div>


                    <p class="scripture-reference">

                        📖 ${escapeHtml(
                            item.scripture ||
                            ""
                        )}

                    </p>


                    <p class="date">

                        Completed on:
                        ${escapeHtml(
                            item.completedAt
                        )}

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


            container.appendChild(
                card
            );
        }
    );


    document
        .querySelectorAll(
            ".btn-review"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        const study =
                            allStudies.find(
                                item =>
                                    item.id ==
                                    event.currentTarget
                                        .dataset
                                        .id
                            );


                        if (study) {

                            openStudyViewer(
                                study
                            );
                        }
                    }
                );
            }
        );
}


// =========================================================
// ACTIVE STUDY PROGRESS
// =========================================================

function loadActiveStudyProgress() {

    const saved =
        localStorage.getItem(
            "activeStudyProgress"
        );


    if (!saved) {

        return null;
    }


    try {

        return JSON.parse(
            saved
        );

    } catch (error) {

        localStorage.removeItem(
            "activeStudyProgress"
        );


        return null;
    }
}


// =========================================================
// 8. PUBLIC LIBRARY
// =========================================================

function renderPublicLibrary() {

    const grid =
        document.getElementById(
            "publicStudyGrid"
        );


    if (!grid) {

        return;
    }


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


    let publicStudies =
        allStudies.filter(
            study =>
                study.published !==
                false
        );


    // -----------------------------------------------------
    // SEARCH
    // -----------------------------------------------------

    if (searchTerm) {

        publicStudies =
            publicStudies.filter(
                study => {

                    const title =
                        (
                            study.title ||
                            ""
                        )
                        .toLowerCase();


                    const scripture =
                        (
                            study.scripture ||
                            ""
                        )
                        .toLowerCase();


                    const content =
                        (
                            study.content ||
                            study.summary ||
                            ""
                        )
                        .toLowerCase();


                    const category =
                        getCategoryName(
                            study.category_id
                        )
                        .toLowerCase();


                    return (
                        title.includes(
                            searchTerm
                        ) ||
                        scripture.includes(
                            searchTerm
                        ) ||
                        content.includes(
                            searchTerm
                        ) ||
                        category.includes(
                            searchTerm
                        )
                    );
                }
            );
    }


    // -----------------------------------------------------
    // CATEGORY FILTER
    // -----------------------------------------------------

    if (
        selectedCategory &&
        selectedCategory !== "all"
    ) {

        publicStudies =
            publicStudies.filter(
                study =>
                    Number(
                        study.category_id
                    ) ===
                    Number(
                        selectedCategory
                    )
            );
    }


    // -----------------------------------------------------
    // NO RESULTS
    // -----------------------------------------------------

    if (
        publicStudies.length ===
        0
    ) {

        grid.innerHTML = `

            <p class="no-data">

                No Bible studies match
                your criteria.

                Check back soon!

            </p>
        `;


        return;
    }


    // -----------------------------------------------------
    // RENDER
    // -----------------------------------------------------

    grid.innerHTML =
        publicStudies
            .map(
                study => {

                    const categoryName =
                        getCategoryName(
                            study.category_id
                        );


                    return `

                        <div
                            class="study-card"
                            data-id="${study.id}">

                            ${
                                study.coverImage
                                    ? `
                                        <img
                                            src="${escapeHtml(
                                                study.coverImage
                                            )}"
                                            alt="${escapeHtml(
                                                study.title ||
                                                "Bible Study"
                                            )}"
                                            class="study-card-img"
                                        />
                                    `
                                    : ""
                            }


                            <div class="study-card-body">

                                <span class="badge">

                                    ${escapeHtml(
                                        categoryName
                                    )}

                                </span>


                                <h3>

                                    ${escapeHtml(
                                        study.title ||
                                        "Bible Study"
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
                                        data-id="${study.id}">

                                        Start Study

                                    </button>


                                    <button
                                        class="btn btn-outline save-study-btn"
                                        data-id="${study.id}">

                                        Save for Later

                                    </button>

                                </div>

                            </div>

                        </div>
                    `;
                }
            )
            .join("");


    bindPublicStudyButtons();
}


// =========================================================
// PUBLIC BUTTONS
// =========================================================

function bindPublicStudyButtons() {

    document
        .querySelectorAll(
            ".view-study-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        const study =
                            allStudies.find(
                                item =>
                                    item.id ==
                                    event.currentTarget
                                        .dataset
                                        .id
                            );


                        if (study) {

                            openStudyViewer(
                                study
                            );
                        }
                    }
                );
            }
        );


    document
        .querySelectorAll(
            ".save-study-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        saveStudyForLater(
                            event.currentTarget
                                .dataset
                                .id
                        );
                    }
                );
            }
        );
}


// =========================================================
// SAVE FOR LATER
// =========================================================

function saveStudyForLater(id) {

    let saved = [];


    try {

        saved =
            JSON.parse(
                localStorage.getItem(
                    "savedStudies"
                ) || "[]"
            );

    } catch (error) {

        saved = [];
    }


    if (
        !saved.includes(
            String(id)
        )
    ) {

        saved.push(
            String(id)
        );


        localStorage.setItem(
            "savedStudies",
            JSON.stringify(
                saved
            )
        );


        alert(
            "Study saved for later."
        );


    } else {

        alert(
            "This study is already saved."
        );
    }
}


// =========================================================
// 9. STUDY VIEWER
// =========================================================

function openStudyViewer(
    study
) {

    activeStudyForViewer =
        study;


    const overlay =
        document.getElementById(
            "studyViewerOverlay"
        );


    const title =
        document.getElementById(
            "viewerStudyTitle"
        );


    const scripture =
        document.getElementById(
            "viewerScripture"
        );


    const content =
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


    const notes =
        document.getElementById(
            "learnerNotesInput"
        );


    if (title) {

        title.textContent =
            study.title ||
            "Bible Study";
    }


    if (scripture) {

        scripture.textContent =
            study.scripture
                ? `📖 ${study.scripture}`
                : "";
    }


    if (content) {

        content.innerHTML =
            formatStudyContent(
                study.content ||
                ""
            );
    }


    // -----------------------------------------------------
    // YOUTUBE
    // -----------------------------------------------------

    if (
        study.video_url &&
        videoContainer &&
        videoPlayer
    ) {

        videoPlayer.src =
            convertToEmbedUrl(
                study.video_url
            );


        videoContainer.style.display =
            "block";


    } else {

        if (videoContainer) {

            videoContainer.style.display =
                "none";
        }


        if (videoPlayer) {

            videoPlayer.src =
                "";
        }
    }


    // -----------------------------------------------------
    // NOTES
    // -----------------------------------------------------

    if (notes) {

        let allNotes = {};


        try {

            allNotes =
                JSON.parse(
                    localStorage.getItem(
                        "studyNotes"
                    ) || "{}"
                );

        } catch (error) {

            allNotes = {};
        }


        notes.value =
            allNotes[
                study.id
            ] || "";
    }


    saveActiveStudyProgress(
        study
    );


    if (overlay) {

        overlay.classList.add(
            "open"
        );
    }
}


// =========================================================
// CLOSE VIEWER
// =========================================================

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

        videoPlayer.src =
            "";
    }


    if (overlay) {

        overlay.classList.remove(
            "open"
        );
    }


    activeStudyForViewer =
        null;
}


// =========================================================
// 10. CREATE / UPDATE BIBLE STUDY
// =========================================================

async function handleStudyFormSubmit(
    event,
    forceDraft = false
) {

    event.preventDefault();


    // -----------------------------------------------------
    // FORM VALUES
    // -----------------------------------------------------

    const id =
        document.getElementById(
            "editStudyId"
        )?.value;


    const title =
        document.getElementById(
            "studyTitleInput"
        )?.value
            .trim();


    const scripture =
        document.getElementById(
            "studyScriptureInput"
        )?.value
            .trim();


    const categoryValue =
        document.getElementById(
            "studyCategorySelect"
        )?.value;


    const category_id =
        Number(
            categoryValue
        );


    const video_url =
        document.getElementById(
            "studyVideoInput"
        )?.value
            .trim();


    const content =
        document.getElementById(
            "studyContentInput"
        )?.value
            .trim();


    // -----------------------------------------------------
    // CURRENT USER
    // -----------------------------------------------------
    //
    // IMPORTANT:
    // Your login stores:
    //
    // localStorage["username"]
    //
    // as:
    //
    // {
    //     id: 11,
    //     username: "frontend_admin",
    //     email: "...",
    //     is_admin: true
    // }
    //
    // Therefore user.id is the API user_id.
    // -----------------------------------------------------

    const user =
        getCurrentUser();


    const user_id =
        user?.id;


    console.log(
        "CURRENT USER:",
        user
    );


    console.log(
        "USER ID:",
        user_id
    );


    // -----------------------------------------------------
    // VALIDATION
    // -----------------------------------------------------

    if (
        !title ||
        !scripture ||
        !content
    ) {

        alert(
            "Please complete the title, scripture, and lesson content."
        );


        return;
    }


    if (
        !category_id ||
        Number.isNaN(
            category_id
        )
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
            "Missing user ID. Current user:",
            user
        );


        return;
    }


    // -----------------------------------------------------
    // API PAYLOAD
    // -----------------------------------------------------
    //
    // IMPORTANT:
    //
    // The API requires:
    //
    // scripture
    // user_id
    //
    // It does NOT accept:
    //
    // scripture_reference
    // -----------------------------------------------------

    const payload = {

        title:
            title,

        scripture:
            scripture,

        summary:
            "",

        content:
            content,

        published:
            !forceDraft,

        category_id:
            category_id,

        user_id:
            Number(user_id),

        video_url:
            video_url ||
            null
    };


    console.log(
        "BIBLE STUDY PAYLOAD:",
        payload
    );


    // -----------------------------------------------------
    // SAVE TO API
    // -----------------------------------------------------

    try {

        const method =
            id
                ? "PUT"
                : "POST";


        const endpoint =
            id
                ? `${API_URL}/bible-studies/${id}`
                : `${API_URL}/bible-studies`;


        console.log(
            `${method} ${endpoint}`
        );


        const response =
            await fetch(
                endpoint,
                {
                    method:

                        method,

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Accept":
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
                .catch(
                    () => null
                );


        console.log(
            "API RESPONSE:",
            responseData
        );


        if (!response.ok) {

            console.error(
                "Bible Study API Error:",
                responseData
            );


            let errorMessage =
                `Save failed (${response.status})`;


            if (
                responseData?.message
            ) {

                errorMessage =
                    responseData.message;

            } else if (
                responseData?.errors
            ) {

                errorMessage =
                    JSON.stringify(
                        responseData.errors
                    );
            }


            throw new Error(
                errorMessage
            );
        }


        // -------------------------------------------------
        // SUCCESS
        // -------------------------------------------------

        console.log(
            "Bible Study saved successfully:",
            responseData
        );


        alert(
            forceDraft
                ? "Draft saved successfully!"
                : "Bible study published successfully!"
        );


        closeAdminModal();


        // Reload directly from PostgreSQL/API
        await loadInitialData();


    } catch (error) {

        console.error(
            "Bible Study Save Error:",
            error
        );


        alert(
            `Bible study could not be saved.\n\n${error.message}`
        );
    }
}


// =========================================================
// 11. PUBLISH / UNPUBLISH
// =========================================================

async function togglePublishStatus(
    id
) {

    const study =
        allStudies.find(
            item =>
                item.id == id
        );


    if (!study) {

        return;
    }


    const newPublishedState =
        study.published ===
        false;


    try {

        const response =
            await fetch(
                `${API_URL}/bible-studies/${id}`,
                {

                    method:
                        "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            ...study,

                            published:
                                newPublishedState
                        })
                }
            );


        const responseData =
            await response
                .json()
                .catch(
                    () => null
                );


        if (!response.ok) {

            throw new Error(
                responseData?.message ||
                responseData?.error ||
                `Update failed (${response.status})`
            );
        }


        await loadInitialData();


    } catch (error) {

        console.error(
            "Publish update failed:",
            error
        );


        alert(
            `The study could not be updated.\n\n${error.message}`
        );
    }
}


// =========================================================
// 12. DELETE STUDY
// =========================================================

async function deleteStudy(
    id
) {

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

                    method:
                        "DELETE",

                    headers: {

                        "Accept":
                            "application/json"
                    }
                }
            );


        const responseData =
            await response
                .json()
                .catch(
                    () => null
                );


        if (!response.ok) {

            throw new Error(
                responseData?.message ||
                responseData?.error ||
                `Delete failed (${response.status})`
            );
        }


        await loadInitialData();


        alert(
            "Bible study deleted successfully."
        );


    } catch (error) {

        console.error(
            "Delete error:",
            error
        );


        alert(
            `The Bible study could not be deleted.\n\n${error.message}`
        );
    }
}


// =========================================================
// 13. EVENT LISTENERS
// =========================================================

function setupEventListeners() {

    // -----------------------------------------------------
    // ADMIN TABS
    // -----------------------------------------------------

    const tabPublished =
        document.getElementById(
            "tabPublished"
        );


    const tabDrafts =
        document.getElementById(
            "tabDrafts"
        );


    if (tabPublished) {

        tabPublished.addEventListener(
            "click",
            () => {

                currentAdminTab =
                    "published";


                tabPublished.classList.add(
                    "active"
                );


                if (tabDrafts) {

                    tabDrafts.classList.remove(
                        "active"
                    );
                }


                renderAdminGrid();
            }
        );
    }


    if (tabDrafts) {

        tabDrafts.addEventListener(
            "click",
            () => {

                currentAdminTab =
                    "drafts";


                tabDrafts.classList.add(
                    "active"
                );


                if (tabPublished) {

                    tabPublished.classList.remove(
                        "active"
                    );
                }


                renderAdminGrid();
            }
        );
    }


    // -----------------------------------------------------
    // CREATE
    // -----------------------------------------------------

    const createButton =
        document.getElementById(
            "openCreateStudyBtn"
        );


    if (createButton) {

        createButton.addEventListener(
            "click",
            openCreateModal
        );
    }


    // -----------------------------------------------------
    // CLOSE FORM
    // -----------------------------------------------------

    const closeFormButton =
        document.getElementById(
            "closeFormModal"
        );


    if (closeFormButton) {

        closeFormButton.addEventListener(
            "click",
            closeAdminModal
        );
    }


    // -----------------------------------------------------
    // CLOSE VIEWER
    // -----------------------------------------------------

    const closeViewerButton =
        document.getElementById(
            "closeViewerModal"
        );


    if (closeViewerButton) {

        closeViewerButton.addEventListener(
            "click",
            closeStudyViewer
        );
    }


    // -----------------------------------------------------
    // FORM SUBMIT
    // -----------------------------------------------------

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


    // -----------------------------------------------------
    // SAVE DRAFT
    // -----------------------------------------------------

    const draftButton =
        document.getElementById(
            "saveDraftBtn"
        );


    if (draftButton) {

        draftButton.addEventListener(
            "click",
            event =>
                handleStudyFormSubmit(
                    event,
                    true
                )
        );
    }


    // -----------------------------------------------------
    // SEARCH
    // -----------------------------------------------------

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


    // -----------------------------------------------------
    // CATEGORY FILTER
    // -----------------------------------------------------

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


    // -----------------------------------------------------
    // SAVE NOTES
    // -----------------------------------------------------

    const saveNotesButton =
        document.getElementById(
            "saveNotesBtn"
        );


    if (saveNotesButton) {

        saveNotesButton.addEventListener(
            "click",
            saveLearnerNotes
        );
    }


    // -----------------------------------------------------
    // MARK COMPLETE
    // -----------------------------------------------------

    const markCompleteButton =
        document.getElementById(
            "markCompleteBtn"
        );


    if (markCompleteButton) {

        markCompleteButton.addEventListener(
            "click",
            markStudyComplete
        );
    }
}


// =========================================================
// 14. CREATE MODAL
// =========================================================

function openCreateModal() {

    const form =
        document.getElementById(
            "studyAdminForm"
        );


    if (form) {

        form.reset();
    }


    const editId =
        document.getElementById(
            "editStudyId"
        );


    if (editId) {

        editId.value =
            "";
    }


    const category =
        document.getElementById(
            "studyCategorySelect"
        );


    if (category) {

        category.value =
            "";
    }


    const modalTitle =
        document.getElementById(
            "modalTitle"
        );


    if (modalTitle) {

        modalTitle.textContent =
            "✏ Create New Bible Study";
    }


    document
        .getElementById(
            "studyFormOverlay"
        )
        ?.classList.add(
            "open"
        );
}


// =========================================================
// 15. EDIT MODAL
// =========================================================

function openEditModal(
    id
) {

    const study =
        allStudies.find(
            item =>
                item.id == id
        );


    if (!study) {

        return;
    }


    const editId =
        document.getElementById(
            "editStudyId"
        );


    const title =
        document.getElementById(
            "studyTitleInput"
        );


    const scripture =
        document.getElementById(
            "studyScriptureInput"
        );


    const category =
        document.getElementById(
            "studyCategorySelect"
        );


    const video =
        document.getElementById(
            "studyVideoInput"
        );


    const content =
        document.getElementById(
            "studyContentInput"
        );


    if (editId) {

        editId.value =
            study.id;
    }


    if (title) {

        title.value =
            study.title ||
            "";
    }


    if (scripture) {

        scripture.value =
            study.scripture ||
            "";
    }


    if (category) {

        category.value =
            study.category_id ||
            "";
    }


    if (video) {

        video.value =
            study.video_url ||
            "";
    }


    if (content) {

        content.value =
            study.content ||
            "";
    }


    const modalTitle =
        document.getElementById(
            "modalTitle"
        );


    if (modalTitle) {

        modalTitle.textContent =
            "✏ Edit Bible Study";
    }


    document
        .getElementById(
            "studyFormOverlay"
        )
        ?.classList.add(
            "open"
        );
}


// =========================================================
// CLOSE ADMIN MODAL
// =========================================================

function closeAdminModal() {

    document
        .getElementById(
            "studyFormOverlay"
        )
        ?.classList.remove(
            "open"
        );
}


// =========================================================
// 16. NOTES
// =========================================================

function saveLearnerNotes() {

    if (
        !activeStudyForViewer
    ) {

        return;
    }


    const input =
        document.getElementById(
            "learnerNotesInput"
        );


    const text =
        input?.value ||
        "";


    let allNotes = {};


    try {

        allNotes =
            JSON.parse(
                localStorage.getItem(
                    "studyNotes"
                ) || "{}"
            );

    } catch (error) {

        allNotes = {};
    }


    allNotes[
        activeStudyForViewer.id
    ] =
        text;


    localStorage.setItem(
        "studyNotes",
        JSON.stringify(
            allNotes
        )
    );


    alert(
        "Notes saved successfully!"
    );
}


// =========================================================
// 17. MARK STUDY COMPLETE
// =========================================================

function markStudyComplete() {

    if (
        !activeStudyForViewer
    ) {

        return;
    }


    let completed = [];


    try {

        completed =
            JSON.parse(
                localStorage.getItem(
                    "completedStudies"
                ) || "[]"
            );

    } catch (error) {

        completed = [];
    }


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
            JSON.stringify(
                completed
            )
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
// 18. ACTIVE STUDY PROGRESS
// =========================================================

function saveActiveStudyProgress(
    study
) {

    localStorage.setItem(
        "activeStudyProgress",
        JSON.stringify({

            id:
                study.id,

            title:
                study.title,

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
// 19. HTML ESCAPING
// =========================================================

function escapeHtml(
    value
) {

    return String(
        value ??
        ""
    )
        .replace(
            /[&<>"']/g,
            character => {

                const escapeMap = {

                    "&":
                        "&amp;",

                    "<":
                        "&lt;",

                    ">":
                        "&gt;",

                    '"':
                        "&quot;",

                    "'":
                        "&#039;"
                };


                return escapeMap[
                    character
                ];
            }
        );
}


// =========================================================
// 20. TEXT SNIPPET
// =========================================================

function snippetText(
    text,
    length
) {

    if (!text) {

        return "";
    }


    const value =
        String(text);


    return (
        value.length >
        length
    )
        ? value.substring(
            0,
            length
        ) + "..."
        : value;
}


// =========================================================
// 21. FORMAT STUDY CONTENT
// =========================================================

function formatStudyContent(
    text
) {

    return String(
        text ||
        ""
    )
        .split(
            /\n\s*\n/
        )
        .map(
            paragraph =>
                `<p style="margin-bottom:15px;">${escapeHtml(
                    paragraph
                )}</p>`
        )
        .join("");
}


// =========================================================
// 22. YOUTUBE URL
// =========================================================

function convertToEmbedUrl(
    url
) {

    if (!url) {

        return "";
    }


    if (
        url.includes(
            "youtube.com/embed/"
        )
    ) {

        return url;
    }


    if (
        url.includes(
            "youtube.com/watch?v="
        )
    ) {

        const videoId =
            url
                .split(
                    "watch?v="
                )[1]
                ?.split(
                    "&"
                )[0];


        return videoId
            ? `https://www.youtube.com/embed/${videoId}`
            : url;
    }


    if (
        url.includes(
            "youtu.be/"
        )
    ) {

        const videoId =
            url
                .split(
                    "youtu.be/"
                )[1]
                ?.split(
                    "?"
                )[0]
                ?.split(
                    "&"
                )[0];


        return videoId
            ? `https://www.youtube.com/embed/${videoId}`
            : url;
    }


    return url;
}


// =========================================================
// 23. API ERROR DISPLAY
// =========================================================

function showApiError(
    message
) {

    const grids = [

        document.getElementById(
            "publicStudyGrid"
        ),

        document.getElementById(
            "adminStudyGrid"
        )
    ];


    grids.forEach(
        grid => {

            if (!grid) {

                return;
            }


            grid.innerHTML = `

                <div class="journal-card">

                    <h3>
                        Unable to Load Bible Studies
                    </h3>


                    <p>
                        ${escapeHtml(
                            message
                        )}
                    </p>


                    <button
                        class="btn btn-primary"
                        onclick="window.location.reload()">

                        Try Again

                    </button>

                </div>
            `;
        }
    );
}
 
