document.addEventListener("DOMContentLoaded", () => {
    // =====================================
    // 1. STATE & LOCAL STORAGE
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

    // Auto-generate AI response data for any older items in history missing it
    let storageNeedsUpdate = false;
    myPrayers = myPrayers.map(prayer => {
        if (!prayer.aiResponse) {
            prayer.aiResponse = generateAIReflectionData(
                prayer.title || "Prayer Request", 
                prayer.category || "Other", 
                prayer.text || ""
            );
            storageNeedsUpdate = true;
        }
        return prayer;
    });

    if (storageNeedsUpdate) {
        savePrayers();
    }

    // =====================================
    // 2. DOM ELEMENTS
    // =====================================
    const prayerForm = document.getElementById("prayerForm");
    const titleInput = document.getElementById("title");
    const categorySelect = document.getElementById("prayerCategory");
    const textInput = document.getElementById("prayerText");
    const privacySelect = document.getElementById("isPrivate");

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

    // Load active prayer into current top display if available
    if (myPrayers.length > 0 && !myPrayers[0].isAnswered) {
        displayCurrentPrayer(myPrayers[0]);
        if (myPrayers[0].aiResponse) {
            displayAIResponse(myPrayers[0].aiResponse);
        }
    }

    // =====================================
    // 4. EVENT LISTENERS
    // =====================================

    // Form Submission
    if (prayerForm) {
        prayerForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const title = titleInput.value.trim();
            const category = categorySelect.value;
            const text = textInput.value.trim();
            const isPrivate = privacySelect.value === "true";

            if (!title || !text) return;

            // Generate robust AI content
            const aiData = generateAIReflectionData(title, category, text);

            const newPrayer = {
                id: Date.now(),
                title: title,
                category: category,
                text: text,
                isPrivate: isPrivate,
                isAnswered: false,
                date: new Date().toLocaleDateString(),
                aiResponse: aiData // Persisted into prayer object
            };

            // Save to local storage
            myPrayers.unshift(newPrayer);
            savePrayers();

            // Render current prayer & AI guidance
            displayCurrentPrayer(newPrayer);
            displayAIResponse(aiData);

            // Add to public community wall if not private
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

    // Refresh Buttons
    if (refreshPrayersBtn) {
        refreshPrayersBtn.addEventListener("click", renderMyPrayers);
    }

    // Discover Modal Drawer Toggle
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
    // 5. AI ENGINE & RENDER HELPERS
    // =====================================

    function savePrayers() {
        localStorage.setItem("myPrayers", JSON.stringify(myPrayers));
    }

    function generateAIReflectionData(title, category, text) {
        const userSnippet = text ? `"${text.substring(0, 60)}${text.length > 60 ? '...' : ''}"` : title;

        const scriptureMap = {
            Anxiety: {
                verse: "Philippians 4:6-7",
                quote: "Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God. And the peace of God, which surpasses all understanding, will guard your hearts and your minds in Christ Jesus.",
                reflection: `When asking for focus and calm (${userSnippet}), remember that God's peace acts as a protective guard over your heart and mind. Quiet your thoughts and rest in His divine stillness.`,
                prayer: `Lord God, calm every rushing thought around "${title}". Where there is scatter or strain, bring divine focus and still tranquility. Replace worry with Your supernatural peace.`
            },
            Healing: {
                verse: "Jeremiah 30:17",
                quote: "For I will restore health to you, and your wounds I will heal, declares the Lord.",
                reflection: `God is our Ultimate Restorer. Regarding ${userSnippet}, His presence brings comforting restoration to every physical and emotional need.`,
                prayer: `Heavenly Father, touch every area needing healing in "${title}". Grant complete strength, comfort, and restoration in Jesus' name.`
            },
            Employment: {
                verse: "Proverbs 3:5-6",
                quote: "Trust in the Lord with all your heart, and do not lean on your own understanding. In all your ways acknowledge Him, and He will make straight your paths.",
                reflection: `God holds your direction. As you pray for ${userSnippet}, trust that He opens doors no man can shut and orders every step.`,
                prayer: `Father, guide every decision for "${title}". Open clear doors of opportunity and provision according to Your perfect timing.`
            },
            Finances: {
                verse: "Philippians 4:19",
                quote: "And my God will supply every need of yours according to His riches in glory in Christ Jesus.",
                reflection: `God is faithful to sustain you through every circumstance. Bring ${userSnippet} to Him with assurance of His provision.`,
                prayer: `Lord, grant wisdom and divine provision for "${title}". Ease financial stress and reveal Your steady hand.`
            },
            Family: {
                verse: "Joshua 24:15",
                quote: "As for me and my house, we will serve the Lord.",
                reflection: `Family is a sacred commitment. God works in hearts to bring peace and understanding even when things feel complicated.`,
                prayer: `Heavenly Father, surround this home and family with unity and grace regarding "${title}". Protect and heal every bond.`
            },
            Marriage: {
                verse: "1 Corinthians 13:4-7",
                quote: "Love is patient, love is kind... It always protects, always trusts, always hopes, always perseveres.",
                reflection: "Marriage thrives when rooted in divine patience and grace.",
                prayer: `Lord, strengthen this marriage covenant in response to "${title}". Grant deeper patience, understanding, and unity.`
            },
            Children: {
                verse: "Isaiah 54:13",
                quote: "All your children shall be taught by the Lord, and great shall be the peace of your children.",
                reflection: "Children are precious gifts in God's hands. Place your cares for them with total confidence in His care.",
                prayer: `Father, protect and lead these children. Cover "${title}" in Your grace and grant them calm, steady hearts.`
            },
            "Spiritual Growth": {
                verse: "Psalm 119:105",
                quote: "Your word is a lamp to my feet and a light to my path.",
                reflection: "Drawing closer to God is a daily process. His Word illuminates each next step.",
                prayer: `Lord, deepen spiritual clarity and hunger for Your truth in "${title}". Keep this heart centered on You.`
            },
            Thanksgiving: {
                verse: "1 Thessalonians 5:18",
                quote: "Give thanks in all circumstances; for this is the will of God in Christ Jesus for you.",
                reflection: "Gratitude unlocks joy and helps us recognize God's hand active in our daily life.",
                prayer: `Father, we praise You and give thanks for Your unending grace and faithfulness regarding "${title}"!`
            }
        };

        const defaultContent = {
            verse: "Psalm 46:1",
            quote: "God is our refuge and strength, a very present help in trouble.",
            reflection: `Whatever burden you carry in ${userSnippet}, God is your immediate source of strength and shelter.`,
            prayer: `Lord Jesus, take hold of "${title}". Grant focus, strength, and calm assurance as we place this into Your hands.`
        };

        return scriptureMap[category] || defaultContent;
    }

    function displayCurrentPrayer(prayer) {
        currentPrayerDiv.innerHTML = `
            <div class="prayer-item">
                <h3>${escapeHTML(prayer.title)}</h3>
                <div class="prayer-meta">
                    <span><strong>Category:</strong> ${escapeHTML(prayer.category)}</span> • 
                    <span><strong>Status:</strong> ${prayer.isPrivate ? "Private" : "Public"}</span>
                </div>
                <div class="prayer-body">${escapeHTML(prayer.text)}</div>
            </div>
        `;
    }

    function displayAIResponse(ai) {
        aiPrayerDiv.innerHTML = `
            <div class="prayer-item" style="border: none; background: transparent; padding: 0;">
                <blockquote style="margin-bottom: 14px;">
                    "${escapeHTML(ai.quote)}"
                    <br><br>
                    <strong>— ${escapeHTML(ai.verse)}</strong>
                </blockquote>
                <p class="prayer-body" style="margin-bottom: 12px;">
                    <strong>Biblical Encouragement:</strong> ${escapeHTML(ai.reflection)}
                </p>
                <div class="ai-history-box" style="margin-top: 10px;">
                    <h4>Guided Prayer</h4>
                    <p class="prayer-body" style="font-style: italic;">"${escapeHTML(ai.prayer)}"</p>
                </div>
            </div>
        `;
    }

    function renderMyPrayers() {
        const activePrayers = myPrayers.filter(p => !p.isAnswered);
        const answeredPrayers = myPrayers.filter(p => p.isAnswered);

        // Render Active Prayers
        if (activePrayers.length === 0) {
            prayerListDiv.innerHTML = `<p class="placeholder-text">No active prayer requests.</p>`;
        } else {
            prayerListDiv.innerHTML = activePrayers.map(p => `
                <div class="prayer-item">
                    <h3>${escapeHTML(p.title)}</h3>
                    <div class="prayer-meta">
                        <span>Category: ${escapeHTML(p.category)}</span> • 
                        <span>Submitted: ${p.date}</span> • 
                        <span>${p.isPrivate ? "Private" : "Public"}</span>
                    </div>
                    <div class="prayer-body">${escapeHTML(p.text)}</div>

                    ${p.aiResponse ? `
                        <div class="ai-history-box">
                            <h4>🤖 Scripture Reflection (${escapeHTML(p.aiResponse.verse)})</h4>
                            <p class="prayer-body" style="font-style: italic; margin-bottom: 8px;">
                                "${escapeHTML(p.aiResponse.quote)}"
                            </p>
                            <p class="prayer-body" style="margin-bottom: 8px;">
                                <strong>Encouragement:</strong> ${escapeHTML(p.aiResponse.reflection)}
                            </p>
                            <p class="prayer-body">
                                <strong>Guided Prayer:</strong> ${escapeHTML(p.aiResponse.prayer)}
                            </p>
                        </div>
                    ` : ''}

                    <div class="prayer-actions">
                        <button class="btn-small" onclick="markAnswered(${p.id})">Mark as Answered ✅</button>
                        <button class="btn-small btn-danger" onclick="deletePrayer(${p.id})">Delete</button>
                    </div>
                </div>
            `).join("");
        }

        // Render Answered Prayers
        if (answeredPrayers.length === 0) {
            answeredListDiv.innerHTML = `<p class="placeholder-text">When you mark a prayer as answered, it will appear here.</p>`;
        } else {
            answeredListDiv.innerHTML = answeredPrayers.map(p => `
                <div class="prayer-item" style="border-color: #2e6f40;">
                    <h3>${escapeHTML(p.title)} ✅</h3>
                    <div class="prayer-meta">
                        <span>Category: ${escapeHTML(p.category)}</span> • <span>Status: Answered</span>
                    </div>
                    <div class="prayer-body">${escapeHTML(p.text)}</div>

                    ${p.aiResponse ? `
                        <div class="ai-history-box">
                            <h4>🤖 Scripture Reflection (${escapeHTML(p.aiResponse.verse)})</h4>
                            <p class="prayer-body" style="font-style: italic;">
                                "${escapeHTML(p.aiResponse.quote)}"
                            </p>
                        </div>
                    ` : ''}

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

    // Window Functions for Inline Event Handlers
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