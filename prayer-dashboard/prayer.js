document.addEventListener("DOMContentLoaded", () => {
    // =====================================
    // 1. STATE & STORAGE
    // =====================================
    let myPrayers = JSON.parse(localStorage.getItem("myPrayers")) || [];
    let publicPrayers = JSON.parse(localStorage.getItem("publicPrayers")) || [
        {
            id: 101,
            title: "Peace in Times of Uncertainty",
            category: "Anxiety",
            text: "Praying for anyone feeling overwhelmed today. May God grant strength and peace.",
            author: "Sarah_M",
            date: "2026-07-25",
            prayersCount: 4
        },
        {
            id: 102,
            title: "Job Opportunity",
            category: "Employment",
            text: "Trusting the Lord for direction after a company layoff.",
            author: "David_K",
            date: "2026-07-26",
            prayersCount: 2
        }
    ];

    // =====================================
    // 2. DOM ELEMENTS
    // =====================================
    const prayerForm = document.getElementById("prayerForm");
    const titleInput = document.getElementById("title");
    const categorySelect = document.getElementById("prayerCategory");
    const textInput = document.getElementById("prayerText");
    const privacySelect = document.getElementById("isPrivate");
    const newPrayerBtn = document.getElementById("newPrayerBtn");

    const currentPrayerDiv = document.getElementById("currentPrayer");
    const aiPrayerDiv = document.getElementById("aiPrayer");
    const prayerListDiv = document.getElementById("prayerList");
    const answeredListDiv = document.getElementById("answeredPrayerList");
    const refreshPrayersBtn = document.getElementById("refreshPrayers");

    // Discover Modal Elements
    const discoverOverlay = document.getElementById("discoverOverlay");
    const discoverBtn = document.getElementById("discoverPrayersBtn");
    const closeDrawerBtn = document.getElementById("closeDrawer");
    const publicPrayerListDiv = document.getElementById("publicPrayerList");
    const refreshPublicBtn = document.getElementById("refreshPublicPrayers");
    const prayerSearchInput = document.getElementById("prayerSearch");

    // =====================================
    // 3. INITIAL RENDER
    // =====================================
    renderMyPrayers();

    // =====================================
    // 4. EVENT LISTENERS
    // =====================================

    // Reset Form
    if (newPrayerBtn) {
        newPrayerBtn.addEventListener("click", () => {
            prayerForm.reset();
            titleInput.focus();
        });
    }

    // Submit Prayer
    if (prayerForm) {
        prayerForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const title = titleInput.value.trim();
            const category = categorySelect.value;
            const text = textInput.value.trim();
            const isPrivate = privacySelect.value === "true";

            if (!title || !text) return;

            const newPrayer = {
                id: Date.now(),
                title,
                category,
                text,
                isPrivate,
                isAnswered: false,
                date: new Date().toLocaleDateString()
            };

            // Save to state & storage
            myPrayers.unshift(newPrayer);
            savePrayers();

            // Display active current prayer
            displayCurrentPrayer(newPrayer);

            // Generate simulated AI reflection
            generateAIReflection(newPrayer);

            // If public, share to public wall
            if (!isPrivate) {
                publicPrayers.unshift({
                    id: newPrayer.id,
                    title: newPrayer.title,
                    category: newPrayer.category,
                    text: newPrayer.text,
                    author: "Community Member",
                    date: newPrayer.date,
                    prayersCount: 0
                });
                localStorage.setItem("publicPrayers", JSON.stringify(publicPrayers));
            }

            renderMyPrayers();
            prayerForm.reset();
        });
    }

    // Refresh My Prayers
    if (refreshPrayersBtn) {
        refreshPrayersBtn.addEventListener("click", renderMyPrayers);
    }

    // Modal Drawer Toggle
    if (discoverBtn && discoverOverlay) {
        discoverBtn.addEventListener("click", () => {
            discoverOverlay.style.display = "block";
            renderPublicPrayers();
        });
    }

    if (closeDrawerBtn && discoverOverlay) {
        closeDrawerBtn.addEventListener("click", () => {
            discoverOverlay.style.display = "none";
        });
    }

    if (discoverOverlay) {
        discoverOverlay.addEventListener("click", (e) => {
            if (e.target === discoverOverlay) {
                discoverOverlay.style.display = "none";
            }
        });
    }

    if (refreshPublicBtn) {
        refreshPublicBtn.addEventListener("click", renderPublicPrayers);
    }

    if (prayerSearchInput) {
        prayerSearchInput.addEventListener("input", renderPublicPrayers);
    }

    // =====================================
    // 5. HELPER FUNCTIONS
    // =====================================

    function savePrayers() {
        localStorage.setItem("myPrayers", JSON.stringify(myPrayers));
    }

    function displayCurrentPrayer(prayer) {
        currentPrayerDiv.innerHTML = `
            <div class="prayer-item">
                <h3>${escapeHTML(prayer.title)}</h3>
                <div class="prayer-meta">
                    <span><strong>Category:</strong> ${escapeHTML(prayer.category)}</span>
                    <span><strong>Status:</strong> ${prayer.isPrivate ? "Private" : "Public"}</span>
                </div>
                <div class="prayer-body">${escapeHTML(prayer.text)}</div>
            </div>
        `;
    }

    function generateAIReflection(prayer) {
        aiPrayerDiv.innerHTML = `<p class="placeholder-text"><em>Seeking Scripture reflection for "${escapeHTML(prayer.title)}"...</em></p>`;

        setTimeout(() => {
            aiPrayerDiv.innerHTML = `
                <div class="prayer-item">
                    <h3>Encouragement & Scripture Reflection</h3>
                    <p class="prayer-body">
                        Lord, we lift up <strong>${escapeHTML(prayer.title)}</strong>. We place this request in Your hands, knowing You hear every word.
                    </p>
                    <br>
                    <blockquote style="font-size: 15px;">
                        "The Lord is near to all who call on Him, to all who call on Him in truth." — Psalm 145:18
                    </blockquote>
                </div>
            `;
        }, 800);
    }

    function renderMyPrayers() {
        const activePrayers = myPrayers.filter(p => !p.isAnswered);
        const answeredPrayers = myPrayers.filter(p => p.isAnswered);

        // Active List
        if (activePrayers.length === 0) {
            prayerListDiv.innerHTML = `<p class="placeholder-text">No active prayer requests.</p>`;
        } else {
            prayerListDiv.innerHTML = activePrayers.map(p => `
                <div class="prayer-item">
                    <h3>${escapeHTML(p.title)}</h3>
                    <div class="prayer-meta">
                        <span>${escapeHTML(p.category)}</span> • 
                        <span>${p.date}</span> • 
                        <span>${p.isPrivate ? "Private" : "Public"}</span>
                    </div>
                    <div class="prayer-body">${escapeHTML(p.text)}</div>
                    <div class="prayer-actions">
                        <button class="btn-small" onclick="markAnswered(${p.id})">Mark as Answered ✅</button>
                        <button class="btn-small btn-danger" onclick="deletePrayer(${p.id})">Delete</button>
                    </div>
                </div>
            `).join("");
        }

        // Answered List
        if (answeredPrayers.length === 0) {
            answeredListDiv.innerHTML = `<p class="placeholder-text">When you mark a prayer as answered, it will appear here.</p>`;
        } else {
            answeredListDiv.innerHTML = answeredPrayers.map(p => `
                <div class="prayer-item" style="border-color: #2e6f40;">
                    <h3>${escapeHTML(p.title)} ✅</h3>
                    <div class="prayer-meta">
                        <span>${escapeHTML(p.category)}</span> • <span>Answered</span>
                    </div>
                    <div class="prayer-body">${escapeHTML(p.text)}</div>
                    <div class="prayer-actions">
                        <button class="btn-small btn-danger" onclick="deletePrayer(${p.id})">Delete</button>
                    </div>
                </div>
            `).join("");
        }
    }

    function renderPublicPrayers() {
        const search = prayerSearchInput ? prayerSearchInput.value.toLowerCase() : "";
        const filtered = publicPrayers.filter(p => 
            p.title.toLowerCase().includes(search) || 
            p.text.toLowerCase().includes(search) ||
            p.category.toLowerCase().includes(search)
        );

        if (filtered.length === 0) {
            publicPrayerListDiv.innerHTML = `<p class="placeholder-text">No public prayers found.</p>`;
            return;
        }

        publicPrayerListDiv.innerHTML = filtered.map(p => `
            <div class="prayer-item">
                <h3>${escapeHTML(p.title)}</h3>
                <div class="prayer-meta">
                    <span>By: ${escapeHTML(p.author)}</span> • 
                    <span>${escapeHTML(p.category)}</span>
                </div>
                <div class="prayer-body">${escapeHTML(p.text)}</div>
                <div class="prayer-actions">
                    <button class="btn-small" onclick="prayForPublic(${p.id})">🙏 Pray (${p.prayersCount || 0})</button>
                </div>
            </div>
        `).join("");
    }

    // Global Functions for Inline Onclick Handlers
    window.markAnswered = function(id) {
        myPrayers = myPrayers.map(p => p.id === id ? { ...p, isAnswered: true } : p);
        savePrayers();
        renderMyPrayers();
    };

    window.deletePrayer = function(id) {
        myPrayers = myPrayers.filter(p => p.id !== id);
        savePrayers();
        renderMyPrayers();
    };

    window.prayForPublic = function(id) {
        publicPrayers = publicPrayers.map(p => p.id === id ? { ...p, prayersCount: (p.prayersCount || 0) + 1 } : p);
        localStorage.setItem("publicPrayers", JSON.stringify(publicPrayers));
        renderPublicPrayers();
    };

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }
});