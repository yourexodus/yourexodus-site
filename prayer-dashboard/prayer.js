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
        prayerForm.addEventListener("submit", createPrayerEntry);
    }

    const refreshBtn = document.getElementById("refreshPrayers");
    if (refreshBtn) {
        refreshBtn.addEventListener("click", loadPrayers);
    }

    const newPrayerBtn = document.getElementById("newPrayerBtn");
    if (newPrayerBtn) {
        newPrayerBtn.addEventListener("click", startNewPrayer);
    }
});

// =====================================
// GET USER HELPER
// =====================================

function getCurrentUser() {
    const stored = localStorage.getItem("user") || localStorage.getItem("username");

    if (!stored) {
        return null;
    }

    try {
        const parsed = JSON.parse(stored);
        if (typeof parsed === "object" && parsed !== null) {
            return parsed;
        }
        return { username: String(parsed) };
    } catch {
        return { username: stored };
    }
}

// =====================================
// HEADER
// =====================================

function loadUserHeader() {
    const user = getCurrentUser();
    const header = document.getElementById("prayerWelcome");

    if (user && header) {
        const nameDisplay = user.username || "Believer";
        header.textContent = `🙏 ${nameDisplay}'s Prayer Center`;
    }
}

// =====================================
// CREATE PRAYER
// =====================================

async function createPrayerEntry(event) {
    event.preventDefault();

    const user = getCurrentUser();

    if (!user) {
        alert("Please log in again to submit a prayer.");
        return;
    }

    // Safely capture inputs regardless of exact DOM element IDs
    const titleEl = document.getElementById("title") || document.getElementById("prayerTitle");
    const requestEl = document.getElementById("prayerText") || document.getElementById("prayerRequest");
    const categoryEl = document.getElementById("prayerCategory");
    const privateEl = document.getElementById("isPrivate") || document.getElementById("prayerPrivacy");

    const prayerData = {
        title: titleEl ? titleEl.value : "",
        request: requestEl ? requestEl.value : "",
        category: categoryEl ? categoryEl.value : "General",
        is_private: privateEl ? (privateEl.value === "true" || privateEl.value === "Private") : true,
        user_id: user.id || null,
        username: user.username || null
    };

    try {
        const response = await fetch(`${API_URL}/prayers`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(prayerData)
        });

        if (!response.ok) {
            throw new Error(`Server returned error status ${response.status}`);
        }

        const savedPrayer = await response.json();

        // Update active state
        currentPrayer = savedPrayer;

        // Populate top display sections instantly
        displayCurrentPrayer(savedPrayer);
        displayAIPrayer(savedPrayer);

        // Reset inputs
        if (event.target && typeof event.target.reset === "function") {
            event.target.reset();
        }

        // Refresh list (deduplication keeps current item top-only)
        loadPrayers();
    } catch (error) {
        console.error("Failed to create prayer entry:", error);
        alert("Unable to submit prayer. Please verify connection.");
    }
}

// =====================================
// CURRENT PRAYER BOX
// =====================================

function displayCurrentPrayer(prayer) {
    const box = document.getElementById("currentPrayer");
    if (!box) return;

    box.innerHTML = `
        <h3>${prayer.title || "Prayer Request"}</h3>
        <p>📂 <strong>Category:</strong> ${prayer.category || "General"}</p>
        <p>${prayer.request || ""}</p>
        <p><strong>Status:</strong> ${prayer.status || "Active"}</p>
    `;
}

// =====================================
// AI PRAYER RESPONSE BOX
// =====================================

function displayAIPrayer(prayer) {
    const box = document.getElementById("aiPrayer") || document.getElementById("aiResponseBox");
    if (!box) return;

    const aiContent = prayer.ai_response 
        || prayer.aiResponse 
        || "Your prayer request has been submitted. Your Scripture-based prayer response is being prepared.";

    box.innerHTML = `
        <h3>🙏 Personalized Scripture-Based Prayer</h3>
        <p>${aiContent}</p>
    `;
}

// =====================================
// LOAD USER PRAYERS (WITH DEDUPLICATION)
// =====================================

async function loadPrayers() {
    const box = document.getElementById("prayerList");
    if (!box) return;

    const user = getCurrentUser();

    if (!user) {
        box.innerHTML = "<p>Please log in again to view your prayers.</p>";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/prayers`);

        if (!response.ok) {
            throw new Error("Unable to fetch prayers list.");
        }

        const prayers = await response.json();

        // Filter prayers belonging ONLY to logged in user
        const myPrayers = prayers.filter(prayer => {
            if (user.id && prayer.user_id) {
                return String(prayer.user_id) === String(user.id);
            }
            if (user.username && (prayer.username || prayer.user)) {
                const prayerUser = prayer.username || prayer.user;
                return String(prayerUser).toLowerCase() === String(user.username).toLowerCase();
            }
            return false;
        });

        // Sort newest first
        myPrayers.sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));

        if (myPrayers.length === 0) {
            box.innerHTML = "<p>No prayer requests yet.</p>";
            return;
        }

        // Auto-select latest prayer on refresh if non-active
        if (!currentPrayer && myPrayers.length > 0) {
            currentPrayer = myPrayers[0];
            displayCurrentPrayer(currentPrayer);
            displayAIPrayer(currentPrayer);
        }

        box.innerHTML = "";

        // Deduplication: Hide current Active Prayer from history list below
        const previousPrayers = myPrayers.filter(prayer => {
            if (!currentPrayer) return true;
            if (prayer.id && currentPrayer.id) {
                return String(prayer.id) !== String(currentPrayer.id);
            }
            return prayer !== currentPrayer;
        });

        if (previousPrayers.length === 0) {
            box.innerHTML = "<p><em>Your active prayer request is shown above. No older history yet.</em></p>";
            return;
        }

        previousPrayers.forEach(prayer => {
            const card = document.createElement("div");
            card.className = "prayer-card";

            const prayerDate = prayer.created_at || prayer.date;
            const dateDisplay = prayerDate ? new Date(prayerDate).toLocaleString() : "Recently";

            card.innerHTML = `
                <h3>${prayer.title || "Untitled Prayer"}</h3>
                <p>${prayer.request || ""}</p>
                <p>📂 <strong>Category:</strong> ${prayer.category || "General"}</p>
                <p>📅 ${dateDisplay}</p>
                <div class="card-actions" style="margin-top: 10px;">
                    <button onclick="markPrayerAnswered(${prayer.id})" class="btn-secondary">Mark Answered</button>
                    <button onclick="deletePrayer(${prayer.id})" class="btn-danger">Delete</button>
                </div>
            `;

            box.appendChild(card);
        });
    } catch (error) {
        console.error("Error in loadPrayers:", error);
        box.innerHTML = "<p>Unable to load prayers at this time.</p>";
    }
}

// =====================================
// NEW PRAYER RESET
// =====================================

function startNewPrayer() {
    currentPrayer = null;

    const prayerForm = document.getElementById("prayerForm");
    if (prayerForm) {
        prayerForm.reset();
    }

    const currentBox = document.getElementById("currentPrayer");
    if (currentBox) {
        currentBox.innerHTML = "<p>Submit a new prayer request above.</p>";
    }

    const aiBox = document.getElementById("aiPrayer") || document.getElementById("aiResponseBox");
    if (aiBox) {
        aiBox.innerHTML = "<p>Your personalized Scripture-based prayer will appear here.</p>";
    }

    loadPrayers();
}

// =====================================
// MARK ANSWERED
// =====================================

async function markPrayerAnswered(id) {
    if (!id) return;

    try {
        await fetch(`${API_URL}/prayers/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ answered: true })
        });
        loadPrayers();
    } catch (error) {
        console.error("Error marking prayer as answered:", error);
    }
}

// =====================================
// DELETE
// =====================================

async function deletePrayer(id) {
    if (!id) return;

    if (!confirm("Delete this prayer request?")) return;

    try {
        await fetch(`${API_URL}/prayers/${id}`, {
            method: "DELETE"
        });
        
        if (currentPrayer && String(currentPrayer.id) === String(id)) {
            startNewPrayer();
        } else {
            loadPrayers();
        }
    } catch (error) {
        console.error("Error deleting prayer:", error);
    }
}