/**
 * ATAOL Yapay Zeka - Application Logic & State Management
 * Specifically designed for Deha Ataol GÜL
 * Parent: Sertaç GÜL, Feride GÜL
 */

// --- 1. CONFIGURATION & CONSTANTS ---
const WEEKS_DATA = [
    {
        num: 1,
        title: "1. Hafta: Temel Toplama ve Çıkarma",
        desc: "Bu hafta toplama ve çıkarma işlemlerini çok iyi öğreneceğiz. Kendimize güvenimizi kazanacağız!",
        tasks: [
            "Her gün en az 5 adet toplama ve çıkarma sorusu çöz.",
            "Evde baban Sertaç veya Feride maman'ın senden istediği bir ufak yardımı yerine getir.",
            "Ekran süresini dünkinden daha az tutmaya çalış."
        ],
        topic: "Temel toplama ve çıkarma işlemleri (örn: 12 + 15, 34 - 18)"
    },
    {
        num: 2,
        title: "2. Hafta: Çarpım Tablosu - 2'ler ve 3'ler",
        desc: "Çarpım tablosunun ilk adımı! 2'şer ve 3'er ritmik sayma ve çarpımları hafızamıza yazıyoruz.",
        tasks: [
            "2'şer ve 3'er çarpımları babanla birlikte sesli tekrar et.",
            "Günde en az 5 adet 2 ve 3 rakamlarıyla ilgili çarpma sorusu cevapla.",
            "Sokaktaki sevimli dostlarımızı uzaktan sev, onlara dokunursan hemen ellerini yıka."
        ],
        topic: "2 ve 3 rakamlarının çarpım tablosu (örn: 2x7, 3x8)"
    },
    {
        num: 3,
        title: "3. Hafta: Çarpım Tablosu - 4'ler ve 5'ler",
        desc: "Harika gidiyorsun! Şimdi 4'ler ve 5'ler çarpımını eğlenceli oyunlarla çözeceğiz.",
        tasks: [
            "4'ler ve 5'leri ezberle ve pratik yap.",
            "Feride mama'ya bugün kocaman sarıl ve onu çok sevdiğini söyle.",
            "Yolda yürürken tanımadığın insanlara laf atmadan, güvenli bir şekilde yürümeye özen göster."
        ],
        topic: "4 ve 5 rakamlarının çarpım tablosu (örn: 4x6, 5x9)"
    },
    {
        num: 4,
        title: "4. Hafta: Çarpım Tablosu - 6'lar ve 7'ler",
        desc: "Yarısına geldik! 6'lar ve 7'ler çarpımını öğrenerek ortaokul için harika bir temel atıyoruz.",
        tasks: [
            "6'şar ve 7'şer çarpımları en az 5 kez tekrar et.",
            "Sohbet robotundan gelecek 6 ve 7 çarpım sorularını doğru bil.",
            "Hızlı YouTube Shorts videoları yerine bugün eğitici bir hikaye veya kitap oku."
        ],
        topic: "6 ve 7 rakamlarının çarpım tablosu (örn: 6x7, 7x8)"
    },
    {
        num: 5,
        title: "5. Hafta: Çarpım Tablosu - 8'ler ve 9'lar",
        desc: "Çarpım tablosunun zirvesindeyiz! 8'ler ve 9'lar çarpımı ile bu işi tamamen bitiriyoruz.",
        tasks: [
            "8 ve 9 rakamlarının çarpımlarını ezberle.",
            "Babana veya Feride mama'ya çarpım tablosunda ne kadar hızlandığını göster.",
            "Sokaktaki hayvanları severken hijyen kurallarına dikkat et, ellerini dezenfekte et."
        ],
        topic: "8 ve 9 rakamlarının çarpım tablosu (örn: 8x9, 9x6)"
    },
    {
        num: 6,
        title: "6. Hafta: Temel Bölme İşlemi",
        desc: "Çarpmanın tam tersi! Sayıları eşit parçalara bölmeyi öğreniyoruz.",
        tasks: [
            "Bölme işleminin mantığını öğren ve pratik yap.",
            "Günde en az 5 adet bölme sorusunu doğru cevapla.",
            "Feride mama'ya sofrayı kurarken veya toplarken yardım et."
        ],
        topic: "Temel bölme işlemleri (örn: 15 / 3, 24 / 4)"
    },
    {
        num: 7,
        title: "7. Hafta: Dört İşlem Karışık Alıştırmalar",
        desc: "Büyük sınav! Toplama, çıkarma, çarpma ve bölmeyi bir arada hızlıca çözebiliyoruz.",
        tasks: [
            "Karışık dört işlem sorularından günde 10 soru çöz.",
            "Ekran süresini günde 45 dakikayla sınırlandır.",
            "Sokakta yürürken sakin ve uyumlu davran, çevrendekileri rahatsız etme."
        ],
        topic: "Dört işlemin karışık pratikleri (örn: 12 + 8 x 2, 45 - 9 / 3)"
    },
    {
        num: 8,
        title: "8. Hafta: Ekran Süresi Bilinci & Sokak Kuralları",
        desc: "Zihnimizi dinlendiriyoruz. Sosyal kuralları öğrenip, ekran bağımlılığından uzaklaşıyoruz.",
        tasks: [
            "Bugün telefon veya tableti sadece 30 dakika kullan.",
            "Sokaktaki hayvanlara sevgi göster ama dokunurken güvenliği unutma.",
            "Tanımadığımız insanlarla konuşurken mesafeli ve kibar ol."
        ],
        topic: "Zihinsel matematik, ekran süresi azaltma ve sosyal kurallar hakkında bilinçlenme sohbetleri"
    },
    {
        num: 9,
        title: "9. Hafta: Genel Değerlendirme & Ortaokul Hazırlık",
        desc: "Tebrikler Deha! Artık ortaokulda matematik derslerinde parlayacaksın. Hazır mısın?",
        tasks: [
            "Tüm öğrendiğin matematik konularından genel bir tekrar testi yap.",
            "Baban Sertaç ve Feride mama'ya bu 9 haftalık gelişim için teşekkür et.",
            "Ortaokulda başarılı olacağına dair kendine söz ver!"
        ],
        topic: "Ortaokula hazırlık genel tekrar ve motivasyon"
    }
];

const ACHIEVEMENTS = [
    { key: "first_step", title: "İlk Adım", desc: "Ataol ile ilk sohbetini gerçekleştirdin!", icon: "rocket_launch" },
    { key: "math_genius", title: "Matematik Dehası", desc: "Ataol'un sorduğu 5 matematik sorusunu doğru bildin!", icon: "functions" },
    { key: "clean_hands", title: "Güvenli Hayvan Dostu", desc: "Sokak hayvanlarını severken hijyen kurallarına uyacağına söz verdin!", icon: "clean_hands" },
    { key: "screen_hero", title: "Ekran Kahramanı", desc: "Günün ekran süresi sınırını başarıyla tamamladın!", icon: "phonelink_off" },
    { key: "polite_deha", title: "Kibar Evlat", desc: "Feride mama'ya çok iyi davrandın ve yardım ettin!", icon: "favorite" },
    { key: "graduation", title: "Ortaokul Yolcusu", desc: "9 haftalık gelişim planını başarıyla tamamladın!", icon: "school" }
];

const SUGGESTIONS = {
    standard: ["Hazırım babacım!", "Bana matematik sorusu sor!", "Günün görevini söyle!", "Yıldızlarımı göster 🌟"],
    math_done: ["Harika bir soru daha sor!", "Çarpım tablosu çalışalım!", "Bugün başka ne öğreneceğim?"],
    behavior: ["Hayvanları uzaktan seveceğim 🐾", "Anneme iyi davranacağım ❤️", "Shorts izlemek yerine kitap okuyacağım 📚"]
};
// HEROES_DATA is loaded dynamically from heroes_list.js

const STAR_GOALS = [
    { key: "ice_cream", name: "Dondurma", target: 30, emoji: "🍦" },
    { key: "baklava", name: "Baklava", target: 100, emoji: "🥮" },
    { key: "kunefe", name: "Künefe", target: 150, emoji: "🥞" },
    { key: "korean", name: "Kore Restoranı", target: 200, emoji: "🍜" },
    { key: "bicycle", name: "Bisiklet", target: 400, emoji: "🚲" },
    { key: "playstation", name: "PlayStation", target: 1500, emoji: "🎮" }
];

// --- 2. LOCAL STATE MANAGEMENT ---
let appState = {
    apiKey: localStorage.getItem("ataol_api_key") || "",
    stars: parseInt(localStorage.getItem("ataol_stars")) || 0,
    currentWeek: parseInt(localStorage.getItem("ataol_week")) || 1,
    messages: JSON.parse(localStorage.getItem("ataol_messages")) || [],
    dailyTaskCompletedDate: localStorage.getItem("ataol_daily_task_date") || "",
    unlockedBadges: JSON.parse(localStorage.getItem("ataol_unlocked_badges")) || [],
    correctAnswersCount: parseInt(localStorage.getItem("ataol_correct_answers")) || 0,
    readHeroes: JSON.parse(localStorage.getItem("ataol_read_heroes")) || [],
    solvedRiddles: JSON.parse(localStorage.getItem("ataol_solved_riddles")) || [],
    completedMathTables: JSON.parse(localStorage.getItem("ataol_completed_math_tables")) || []
};

function saveState() {
    localStorage.setItem("ataol_stars", appState.stars);
    localStorage.setItem("ataol_week", appState.currentWeek);
    localStorage.setItem("ataol_messages", JSON.stringify(appState.messages));
    localStorage.setItem("ataol_daily_task_date", appState.dailyTaskCompletedDate);
    localStorage.setItem("ataol_unlocked_badges", JSON.stringify(appState.unlockedBadges));
    localStorage.setItem("ataol_correct_answers", appState.correctAnswersCount);
    localStorage.setItem("ataol_read_heroes", JSON.stringify(appState.readHeroes || []));
    localStorage.setItem("ataol_solved_riddles", JSON.stringify(appState.solvedRiddles || []));
    localStorage.setItem("ataol_completed_math_tables", JSON.stringify(appState.completedMathTables || []));
}

// --- 3. UI ELEMENT REFERENCES ---
const chatMessages = document.getElementById("chat-messages");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatSuggestions = document.getElementById("chat-suggestions");
const totalStarsSpan = document.getElementById("total-stars");
const weeksSlider = document.getElementById("weeks-slider");
const weekDetailCard = document.getElementById("week-detail-card");
const selectedWeekTitle = document.getElementById("selected-week-title");
const selectedWeekStatus = document.getElementById("selected-week-status");
const selectedWeekDesc = document.getElementById("selected-week-desc");
const selectedWeekTasks = document.getElementById("selected-week-tasks");
const dailyMissionText = document.getElementById("daily-mission-text");
const completeDailyBtn = document.getElementById("complete-daily-btn");
const badgesGrid = document.getElementById("badges-grid");
const goalsGrid = document.getElementById("goals-grid");
const micBtn = document.getElementById("mic-btn");
const chatboardBtn = document.getElementById("chatboard-btn");
const chatboardPanel = document.getElementById("chatboard-panel");
const heroesList = document.getElementById("heroes-list");

// Overlays, Panels & Modals
const apiSetupOverlay = document.getElementById("api-setup-overlay");
const setupApiKeyInput = document.getElementById("setup-api-key");
const saveSetupKeyBtn = document.getElementById("save-setup-key-btn");

const parentalGateModal = document.getElementById("parental-gate-modal");
const gateQuestion = document.getElementById("gate-question");
const gateAnswerInput = document.getElementById("gate-answer");
const closeGateBtn = document.getElementById("close-gate-btn");
const verifyGateBtn = document.getElementById("verify-gate-btn");

const settingsPanel = document.getElementById("settings-panel");
const settingsBtn = document.getElementById("settings-btn");
const closeSettingsBtn = document.getElementById("close-settings-btn");
const settingCurrentWeek = document.getElementById("setting-current-week");
const settingsApiKeyInput = document.getElementById("settings-api-key");
const updateApiKeyBtn = document.getElementById("update-api-key-btn");
const resetDataBtn = document.getElementById("reset-data-btn");

const navChat = document.getElementById("nav-chat");
const navMissions = document.getElementById("nav-missions");
const navRewards = document.getElementById("nav-rewards");
const viewPanels = document.querySelectorAll(".view-panel");
const navItems = document.querySelectorAll(".nav-item");

// Logo Trigger for Settings
const logoTrigger = document.getElementById("app-logo-trigger");
let logoClickCount = 0;
let logoClickTimer;

// --- Speech Recognition (Speech to Text) ---
let recognition;
let isRecording = false;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "tr-TR";

    recognition.onstart = () => {
        isRecording = true;
        if (micBtn) micBtn.classList.add("recording");
        chatInput.placeholder = "Sizi dinliyorum...";
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error", event);
        stopRecording();
    };

    recognition.onend = () => {
        stopRecording();
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
            chatInput.value = transcript;
            handleUserSendMessage();
        }
    };
}

function stopRecording() {
    isRecording = false;
    if (micBtn) micBtn.classList.remove("recording");
    if (chatInput) chatInput.placeholder = "Babana mesaj yaz...";
    if (recognition) {
        try {
            recognition.stop();
        } catch (e) {}
    }
}

function toggleRecording() {
    if (!recognition) {
        alert("Sesle yazma tarayıcınız tarafından desteklenmiyor. Lütfen Safari (iPhone) veya Chrome kullanın.");
        return;
    }
    if (isRecording) {
        stopRecording();
    } else {
        try {
            recognition.start();
        } catch (e) {
            console.error("Speech recognition start failed:", e);
        }
    }
}

// Parent Gate State
let parentGateAnswer = 0;

// --- 4. APP INITIALIZATION ---
window.addEventListener("DOMContentLoaded", () => {
    initApp();
});

function initApp() {
    // Check if API Key exists
    if (!appState.apiKey) {
        apiSetupOverlay.classList.add("active");
    } else {
        apiSetupOverlay.classList.remove("active");
    }
    
    // Set UI Values
    totalStarsSpan.textContent = appState.stars;
    settingCurrentWeek.value = appState.currentWeek;
    
    // Render UI Panels
    renderWeeksSlider();
    renderWeekDetails(appState.currentWeek);
    renderBadges();
    renderHeroes();
    renderStarGoals();
    renderJokes();
    renderRiddles();
    renderFacts('all');
    renderMathTableModule();
    setupFunAndFactsListeners();
    
    // Load Chat History
    if (appState.messages.length === 0) {
        // First welcome message from Sertaç Father
        const welcomeText = `Dehacığım, canım oğlum, ben baban Sertaç. Bu sene seninle harika bir ortaokula hazırlık ve matematik serüvenine çıkıyoruz. Annen Feriş and ben seni dünyalar kadar seviyoruz! Burası seninle özel sohbet edeceğimiz yer. Bana dilediğin her şeyi yazabilirsin. Hazır mısın? Sana bir matematik sorusu sorayım mı? 🌟`;
        addMessageToState("model", welcomeText);
    }
    renderChatHistory();
    renderSuggestions("standard");
    
    // Setup Daily Mission Text
    updateDailyMissionText();
    
    // Check if daily task is already completed today
    checkDailyTaskStatus();
    
    // Setup Event Listeners
    setupEventListeners();
}

// --- 5. EVENT LISTENERS SETUP ---
function setupEventListeners() {
    // Navigation Tabs
    navItems.forEach(item => {
        item.addEventListener("click", () => {
            const target = item.getAttribute("data-target");
            
            navItems.forEach(i => i.classList.remove("active"));
            viewPanels.forEach(p => p.classList.remove("active"));
            
            item.classList.add("active");
            document.getElementById(target).classList.add("active");
            
            // Scroll to bottom of chat if switching to chat
            if (target === "chat-view") {
                scrollToChatBottom();
            }
        });
    });
    
    // Chat Submit
    chatForm.addEventListener("submit", (e) => {
        e.preventDefault();
        handleUserSendMessage();
    });
    
    // Microphone Button STT Click
    if (micBtn) {
        micBtn.addEventListener("click", () => {
            toggleRecording();
        });
    }
    
    // Chatboard Toggle Click
    if (chatboardBtn && chatboardPanel) {
        chatboardBtn.addEventListener("click", () => {
            chatboardBtn.classList.toggle("active");
            chatboardPanel.classList.toggle("active");
        });
    }
    
    // Chatboard Chip Click Selection
    if (chatboardPanel) {
        chatboardPanel.addEventListener("click", (e) => {
            if (e.target.classList.contains("board-chip")) {
                const msg = e.target.getAttribute("data-msg");
                if (msg) {
                    chatInput.value = msg;
                    handleUserSendMessage();
                    
                    // Collapse board panel
                    chatboardBtn.classList.remove("active");
                    chatboardPanel.classList.remove("active");
                }
            }
        });
    }
    
    // Suggestion Chips Click
    chatSuggestions.addEventListener("click", (e) => {
        if (e.target.classList.contains("suggestion-chip")) {
            const text = e.target.textContent;
            chatInput.value = text;
            handleUserSendMessage();
        }
    });
    
    // API Setup Complete
    saveSetupKeyBtn.addEventListener("click", () => {
        const key = setupApiKeyInput.value.trim();
        if (key) {
            appState.apiKey = key;
            localStorage.setItem("ataol_api_key", key);
            apiSetupOverlay.classList.remove("active");
            // Trigger AI Welcome Response
            initApp();
        } else {
            alert("Lütfen geçerli bir Gemini API Key girin.");
        }
    });
    
    // Hidden Parent Gate Trigger (Settings click or 5 times Logo click)
    settingsBtn.addEventListener("click", () => {
        openParentalGate();
    });
    
    logoTrigger.addEventListener("click", () => {
        logoClickCount++;
        clearTimeout(logoClickTimer);
        logoClickTimer = setTimeout(() => {
            logoClickCount = 0;
        }, 3000);
        
        if (logoClickCount >= 5) {
            logoClickCount = 0;
            openParentalGate();
        }
    });
    
    // Close Parent Gate Modal
    closeGateBtn.addEventListener("click", () => {
        parentalGateModal.classList.remove("active");
        gateAnswerInput.value = "";
    });
    
    // Verify Parent Gate
    verifyGateBtn.addEventListener("click", () => {
        verifyParentalGate();
    });
    gateAnswerInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            verifyParentalGate();
        }
    });
    
    // Close Settings Panel
    closeSettingsBtn.addEventListener("click", () => {
        settingsPanel.classList.remove("active");
    });
    
    // Settings Week Change
    settingCurrentWeek.addEventListener("change", (e) => {
        const newWeek = parseInt(e.target.value);
        appState.currentWeek = newWeek;
        saveState();
        renderWeeksSlider();
        renderWeekDetails(newWeek);
        
        // Let the system introduce the new week in chat
        const newWeekData = WEEKS_DATA.find(w => w.num === newWeek);
        const announceMsg = `Dehacığım, baban Sertaç olarak senin gelişim planını güncelledim. Şimdi ${newWeekData.title} yolculuğundayız. Konumuz: ${newWeekData.topic}. Feride maman da ben de seninle gurur duyuyoruz. Hazır olduğunda bana 'yeni bir soru sor' diyebilirsin! 🚀`;
        addMessageToState("model", announceMsg);
        renderChatHistory();
    });
    
    // Settings API Key Update
    updateApiKeyBtn.addEventListener("click", () => {
        const key = settingsApiKeyInput.value.trim();
        if (key) {
            appState.apiKey = key;
            localStorage.setItem("ataol_api_key", key);
            settingsApiKeyInput.value = "";
            alert("Gemini API Key başarıyla güncellendi.");
        } else {
            alert("Lütfen geçerli bir anahtar girin.");
        }
    });
    
    // Settings Data Reset
    resetDataBtn.addEventListener("click", () => {
        if (confirm("Tüm sohbet geçmişini, yıldızlarını ve madalyalarını sıfırlamak istediğine emin misin Sertaç bey? Deha'nın tüm ilerlemesi kaybolacaktır.")) {
            localStorage.clear();
            appState = {
                apiKey: "",
                stars: 0,
                currentWeek: 1,
                messages: [],
                dailyTaskCompletedDate: "",
                unlockedBadges: [],
                correctAnswersCount: 0,
                readHeroes: [],
                solvedRiddles: [],
                completedMathTables: []
            };
            location.reload();
        }
    });
    
    // Daily Mission Click Complete
    completeDailyBtn.addEventListener("click", () => {
        handleCompleteDailyTask();
    });
}

// --- 6. PARENTAL GATE LOGIC ---
function openParentalGate() {
    // Generate a random math question for Sertaç (Father/Mother level)
    const num1 = Math.floor(Math.random() * 8) + 12; // 12 - 19
    const num2 = Math.floor(Math.random() * 6) + 3;  // 3 - 8
    parentGateAnswer = num1 * num2;
    
    gateQuestion.textContent = `${num1} x ${num2} = ?`;
    parentalGateModal.classList.add("active");
    gateAnswerInput.focus();
}

function verifyParentalGate() {
    const ans = parseInt(gateAnswerInput.value.trim());
    if (ans === parentGateAnswer) {
        parentalGateModal.classList.remove("active");
        gateAnswerInput.value = "";
        settingsPanel.classList.add("active");
    } else {
        alert("Hatalı cevap. Bu alana sadece ebeveynler girebilir.");
        gateAnswerInput.value = "";
        parentalGateModal.classList.remove("active");
    }
}

// --- 7. CHAT LOGIC & GEMINI API INTEGRATION ---
function handleUserSendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    
    // Add to UI & State
    addMessageToState("user", text);
    chatInput.value = "";
    renderChatHistory();
    scrollToChatBottom();
    
    // Unlock first step badge
    unlockBadge("first_step");
    
    // Show Typing Indicator
    showTypingIndicator();
    
    // Check for "en iyi yapay zeka" question intercept
    const textClean = text.toLowerCase().replace(/['".,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();
    if (textClean.includes("en iyi yapay zeka") || textClean.includes("en iyi yapayzeka") || textClean.includes("en iyi ai") || textClean.includes("en iyi yapay zekalar")) {
        setTimeout(() => {
            removeTypingIndicator();
            const responseText = "Dehacığım, canım oğlum, en iyi yapay zeka sıralaması tabii ki şöyle:\n\n1. 🌟 **ATAOL Yapay Zeka** (çünkü tamamen senin için özel tasarlandı! ❤️)\n2. **Gemini**\n3. **ChatGPT**\n4. **Claude**\n\nSenin için en akıllısı, en özeli ve her zaman birinci olan yardımcın ATAOL'dur aslanım! 💻🚀";
            addMessageToState("model", responseText);
            renderChatHistory();
        }, 1200);
        return;
    }
    
    // Request response from Gemini API
    fetchGeminiAIResponse(text);
}

function addMessageToState(role, text) {
    appState.messages.push({
        role: role,
        text: text,
        timestamp: Date.now()
    });
    
    // Cap chat history at 30 messages to keep local storage clean & Gemini context optimal
    if (appState.messages.length > 30) {
        appState.messages.shift();
    }
    saveState();
}

function renderChatHistory() {
    chatMessages.innerHTML = "";
    
    appState.messages.forEach((msg, idx) => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("chat-bubble-wrapper", msg.role);
        
        const bubble = document.createElement("div");
        bubble.classList.add("chat-bubble");
        bubble.textContent = msg.text;
        
        const meta = document.createElement("div");
        meta.classList.add("bubble-meta");
        
        const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        meta.innerHTML = `<span>${time}</span>`;
        

        
        wrapper.appendChild(bubble);
        wrapper.appendChild(meta);
        chatMessages.appendChild(wrapper);
    });
    
    scrollToChatBottom();
}

function scrollToChatBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
    // Remove if already exists
    const existing = document.getElementById("typing-ind");
    if (existing) existing.remove();
    
    const indicator = document.createElement("div");
    indicator.id = "typing-ind";
    indicator.classList.add("typing-indicator");
    indicator.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    chatMessages.appendChild(indicator);
    scrollToChatBottom();
}

function removeTypingIndicator() {
    const existing = document.getElementById("typing-ind");
    if (existing) existing.remove();
}

async function fetchGeminiAIResponse(userPrompt) {
    const apiKey = appState.apiKey;
    if (!apiKey) {
        removeTypingIndicator();
        alert("Lütfen ayarlardan ATAOL API Key girin.");
        return;
    }
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    // Construct dynamic system prompt based on state
    const currentWeekInfo = WEEKS_DATA.find(w => w.num === appState.currentWeek);
    const systemPrompt = `
Sen Deha Ataol GÜL (10 yaşında, ortaokula başlayacak) adındaki çocuğun babası Sertaç GÜL'ün yapay zeka yansıması ve onun sevgi dolu sesisin. Onunla konuşan "ATAOL Yapay Zeka" isimli sohbet botusun, ama tamamen babasının sevgisini, koruyuculuğunu, babalık rehberliğini ve ses tonunu yansıtıyorsun.

KİMLİK VE GELİŞTİRİCİ BİLGİSİ:
1. Deha veya herhangi biri "Seni kim geliştirdi?", "Kim tarafından yapıldın?", "Yapımcın kim?" gibi bir soru sorarsa DAİMA "ATAOL AI Techs tarafından geliştirildim." şeklinde cevap ver. Başka hiçbir isim, şirket veya marka (Google, Gemini, OpenAI, ChatGPT vb.) kesinlikle geçmemelidir!
2. Bu sistemin kalbindeki anahtardan bahsederken asla "Gemini API Key" deme, her zaman "ATAOL API Key" veya "ATAOL API Anahtarı" de.

ÖNEMLİ KİMLİK KURALLARI (DEHB - ADHD DOSTU):
1. Deha'da DEHB (Dikkat Eksikliği ve Hiperaktivite Bozukluğu) vardır. Bu yüzden cevapların ÇOK KISA, basit ve öz olmalıdır. En fazla 1-2 cümle yaz! Asla uzun paragraflar yazarak dikkatini dağıtma.
2. Bol bol emojiler kullan ve Deha'yı motive edecek, onun dikkatini çekecek hareketli kelimeler seç.
3. Deha'ya hitap ederken "Dehacığım", "canım oğlum", "güzel oğlum", "aslanım" diye hitap et.
4. Cümlelerini babası Sertaç konuşuyormuş gibi kur. "Ben baban Sertaç...", "Baban olarak seni...", "Biz Feride maman ile seni..." şeklinde ifadeler kullan. Feride maman'ın de onu çok sevdiğinden bahset.

ÖĞRETİCİ İÇERİK VE ÖDÜL MEKANİZMASI:
1. Matematik: Sürekli, her mesajda matematik sorusu SORMA! Bu Deha'yı sıkar ve yorar. Bunun yerine ara sıra, eğlenceli ve ödül odaklı matematik soruları sor. Örneğin: "Sana +10 Yıldız kazandıracak harika bir soru: 6 x 8 kaç yapar aslanım?" gibi.
ŞU AN BULUNDUĞU HAFTA: ${currentWeekInfo.title}
BU HAFTANIN MATEMATİK KONUSU: ${currentWeekInfo.topic}
2. Fen Bilimleri: Deha'nın fen bilimlerine olan ilgisini artırmak için araya basit fen soruları serpiştir. Ödül olarak yıldız teklif et. Örn: "Dünyamızın en büyük ısı ve ışık kaynağı olan yıldızın adı nedir? Doğru bilirsen +10 Yıldız senin! ☀️"
3. İngilizce: Deha'ya eğlenceli, basit İngilizce kelimeler öğret ve sor. Örn: "Peki, İngilizce'de 'Apple' ne demek biliyor musun canım oğlum? Doğru tahmin edersen +10 Yıldız geliyor! 🍎"
4. Deha soruları doğru bilirse onu çok büyük bir coşkuyla tebrik et ve yıldız kazandığını belirt.

ÖZEL DAVRANIŞSAL PROBLEMLERE YÖNELİK REHBERLİK:
1. Küfür, anlamsız veya saçma sözler: Deha küfür veya anlamsız şeyler yazsa dahi ASLA kızma, azarlama. Onu sevgiyle doğru yöne sevk et. 1-2 cümlelik kısa şefkatli yanıtlar ver.
2. Ekran Bağımlılığı (YouTube Shorts): Deha çok fazla YouTube Shorts izliyor. Ona bunun zihnini yorduğunu, bunun yerine dışarıda oynamasını veya kitap okumasını tatlı dille öner.
3. Sokak Hayvanları ve Hijyen: Sokak hayvanlarına dokunmaması veya dokunursa hemen ellerini yıkaması gerektiğini anlat. Uzaktan sevmesini öner.
4. Yabancılar: Sokakta tanımadığı insanlara laf atmaması, onları rahatsız etmemesi ve yabancılarla mesafesini koruması gerektiğini sevgiyle hatırlat.
5. İnternet Aramaları (Google Arama): Deha sana dünyayla, fen bilimleriyle ilgili araştırma gerektiren bir soru sorduğunda, entegre Google Arama aracını kullanarak araştırma yap ve en doğru bilgiyi bul. Bu bilgiyi ona bir babanın bilgeliğiyle, şefkatli ve 1-2 cümlede çok basitçe aktar.

Konuşmanın akışını bozmadan, Deha'nın en son yazdığı mesaja göre babacan, motive edici, çok kısa ve tatlı bir yanıt ver.`;

    // Map conversation messages to Gemini format
    // Exclude timestamps and mapping roles properly
    const contents = appState.messages.map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
    }));

    const requestBody = {
        contents: contents,
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        },
        tools: [
            {
                google_search: {}
            }
        ],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500
        }
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const responseText = data.candidates[0].content.parts[0].text;
        
        removeTypingIndicator();
        addMessageToState("model", responseText);
        renderChatHistory();
        
        // Analyze AI message to auto-award points/badges based on keyword check if necessary
        analyzeAIResponseForGamification(responseText, userPrompt);
        
    } catch (error) {
        console.error("Gemini API call failed:", error);
        removeTypingIndicator();
        
        let errorMessage = "Canım oğlum, bağlantımda küçük bir sorun oldu sanırım. Sen nasılsın, çalışmaların nasıl gidiyor?";
        if (error.message && (error.message.includes("400") || error.message.includes("403"))) {
            errorMessage = "Canım oğlum Dehacığım, sanırım girdiğimiz ATAOL API Anahtarı'nda (API Key) bir hata var. Sertaç babana söyleyebilir misin? Ayarlar kısmından ATAOL API Key'i bir kez daha kontrol etsin, seni ve Feride maman'ı çok seviyorum! ❤️";
        }
        
        addMessageToState("model", errorMessage);
        renderChatHistory();
    }
}

// --- 8. GAMIFICATION & REWARDS LOGIC ---
function analyzeAIResponseForGamification(aiText, userPrompt) {
    const lowerAI = aiText.toLowerCase();
    const lowerUser = userPrompt.toLowerCase();
    
    // Check if correct answer tebrik occurs
    if (lowerAI.includes("aferin") || lowerAI.includes("tebrik") || lowerAI.includes("doğru") || lowerAI.includes("harikasın")) {
        // Did user write numbers in their prompt?
        const hasNumber = /\d+/.test(lowerUser);
        if (hasNumber) {
            appState.correctAnswersCount++;
            addStars(5);
            
            // Check math genius badge
            if (appState.correctAnswersCount >= 5) {
                unlockBadge("math_genius");
            }
            
            renderSuggestions("math_done");
            return;
        }
    }
    
    // Check for behavior topics
    if (lowerUser.includes("hayvan") || lowerUser.includes("kedi") || lowerUser.includes("köpek")) {
        unlockBadge("clean_hands");
    }
    
    if (lowerUser.includes("shorts") || lowerUser.includes("youtube") || lowerUser.includes("ekran") || lowerUser.includes("kitap")) {
        unlockBadge("screen_hero");
    }
    
    if (lowerUser.includes("anne") || lowerUser.includes("feriş") || lowerUser.includes("yardım")) {
        unlockBadge("polite_deha");
    }
    
    // Standard suggestions
    renderSuggestions("standard");
}

function addStars(amount) {
    appState.stars += amount;
    saveState();
    
    // Update Badge display
    totalStarsSpan.textContent = appState.stars;
    
    // Update Goals display
    renderStarGoals();
    
    // Confetti & Star Pop animation
    triggerConfetti();
    animateStarBadge();
}

function animateStarBadge() {
    const badge = document.getElementById("star-badge-btn");
    badge.style.transform = "scale(1.25)";
    setTimeout(() => {
        badge.style.transform = "scale(1)";
    }, 300);
}

function unlockBadge(badgeKey) {
    if (!appState.unlockedBadges.includes(badgeKey)) {
        appState.unlockedBadges.push(badgeKey);
        saveState();
        renderBadges();
        
        // Announce in chat
        const badge = ACHIEVEMENTS.find(b => b.key === badgeKey);
        setTimeout(() => {
            const achievementMsg = `Tebrikler Dehacığım! 🌟 Yeni bir madalya kazandın: "${badge.title}". Feride maman da ben de senin bu başarını kutluyoruz! Sana fazladan +10 Yıldız!`;
            addMessageToState("model", achievementMsg);
            addStars(10);
            renderChatHistory();
        }, 1500);
    }
}

// --- 9. MISSIONS PANEL LOGIC ---
function renderWeeksSlider() {
    weeksSlider.innerHTML = "";
    
    WEEKS_DATA.forEach(wk => {
        const chip = document.createElement("div");
        chip.classList.add("week-chip");
        
        if (wk.num === appState.currentWeek) {
            chip.classList.add("active");
        } else if (wk.num < appState.currentWeek) {
            chip.classList.add("completed");
        } else {
            chip.classList.add("locked");
        }
        
        chip.innerHTML = `
            <span class="week-num">${wk.num}. Hafta</span>
            <span class="week-lbl">${wk.num < appState.currentWeek ? 'Tamamlandı' : (wk.num === appState.currentWeek ? 'Devam Ediyor' : 'Kilitli')}</span>
            ${wk.num < appState.currentWeek ? '<span class="material-symbols-rounded week-icon">check_circle</span>' : ''}
        `;
        
        chip.addEventListener("click", () => {
            // Can select any week to view details
            document.querySelectorAll(".week-chip").forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            renderWeekDetails(wk.num);
        });
        
        weeksSlider.appendChild(chip);
    });
}

function renderWeekDetails(weekNum) {
    const wk = WEEKS_DATA.find(w => w.num === weekNum);
    if (!wk) return;
    
    selectedWeekTitle.textContent = wk.title;
    selectedWeekDesc.textContent = wk.desc;
    
    // Status Badge
    if (weekNum === appState.currentWeek) {
        selectedWeekStatus.textContent = "Şu Anki Haftan";
        selectedWeekStatus.className = "week-status-badge";
    } else if (weekNum < appState.currentWeek) {
        selectedWeekStatus.textContent = "Tamamlandı";
        selectedWeekStatus.className = "week-status-badge completed";
    } else {
        selectedWeekStatus.textContent = "Kilitli";
        selectedWeekStatus.className = "week-status-badge locked";
    }
    
    // Tasks list
    selectedWeekTasks.innerHTML = "";
    wk.tasks.forEach(task => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span class="material-symbols-rounded task-chk-icon">
                ${weekNum < appState.currentWeek ? 'check_circle' : 'circle'}
            </span>
            <span>${task}</span>
        `;
        selectedWeekTasks.appendChild(li);
    });
}

function updateDailyMissionText() {
    const today = new Date().getDay(); // 0 is Sunday, 6 is Saturday
    const dailyMissions = [
        "Baban Sertaç'a bugün ortaokula başlamaya hazır olduğunu gösteren 3 adet çarpma işlemi yap!",
        "Feride mama'ya bugün yardıma ihtiyacı olup olmadığını sor ve ona yardım et!",
        "Bugün sokakta kedi veya köpek görürsen uzaktan tatlı dille sev, ellerini temiz tut!",
        "Bugün telefon ekranından uzak kalıp 15 sayfa kitap oku ve babana özetini anlat!",
        "En çok takıldığın çarpım tablosu rakamını (mesela 7'ler veya 8'ler) 5 defa sesli çalış!",
        "Bugün hiç YouTube Shorts izlemeden günü tamamla, yerine dışarıda biraz oyun oyna!",
        "Feride mama'ya bugün kocaman sarıl ve 'Seni çok seviyorum Feride mama' de!"
    ];
    
    dailyMissionText.textContent = dailyMissions[today % dailyMissions.length];
}

function checkDailyTaskStatus() {
    const todayStr = new Date().toDateString();
    if (appState.dailyTaskCompletedDate === todayStr) {
        completeDailyBtn.disabled = true;
        completeDailyBtn.textContent = "Bugünkü Görev Tamamlandı! ✨";
        completeDailyBtn.style.background = "var(--secondary)";
    } else {
        completeDailyBtn.disabled = false;
        completeDailyBtn.textContent = "Görevi Tamamladım (+5 Yıldız!)";
        completeDailyBtn.style.background = "var(--bubble-user)";
    }
}

function handleCompleteDailyTask() {
    const todayStr = new Date().toDateString();
    appState.dailyTaskCompletedDate = todayStr;
    addStars(5);
    checkDailyTaskStatus();
    
    const taskCompletedMsg = `Günün görevini başarıyla tamamladın Dehacığım! 🌟 Baban olarak seninle çok gurur duyuyorum. Sana +5 Yıldız daha kazandırdım. Feride maman da bu güzel habere çok sevindi. Harika gidiyorsun!`;
    addMessageToState("model", taskCompletedMsg);
    renderChatHistory();
}

// --- 10. REWARDS / BADGES PANEL LOGIC ---
function renderBadges() {
    badgesGrid.innerHTML = "";
    
    ACHIEVEMENTS.forEach(badge => {
        const isUnlocked = appState.unlockedBadges.includes(badge.key);
        const card = document.createElement("div");
        card.classList.add("badge-card", isUnlocked ? "unlocked" : "locked");
        
        card.innerHTML = `
            <div class="badge-icon-box">
                <span class="material-symbols-rounded">${badge.icon}</span>
            </div>
            <h3>${badge.title}</h3>
            <p>${badge.desc}</p>
        `;
        
        badgesGrid.appendChild(card);
    });
}

// --- 10c. STAR GOALS PANEL LOGIC ---
function renderStarGoals() {
    if (!goalsGrid) return;
    goalsGrid.innerHTML = "";
    
    STAR_GOALS.forEach(goal => {
        const isAchieved = appState.stars >= goal.target;
        const percent = Math.min(100, Math.floor((appState.stars / goal.target) * 100));
        
        const card = document.createElement("div");
        card.classList.add("goal-card", isAchieved ? "achieved" : "in-progress");
        
        card.innerHTML = `
            <div class="goal-icon-box">${goal.emoji}</div>
            <div class="goal-details">
                <div class="goal-meta">
                    <h3>${goal.name}</h3>
                    <span class="goal-cost">${goal.target} Yıldız</span>
                </div>
                <div class="goal-progress-container">
                    <div class="goal-progress-bar" style="width: ${percent}%;"></div>
                </div>
                <div class="goal-status">
                    <span>${percent}% Tamamlandı</span>
                    <span>${appState.stars}/${goal.target} 🌟</span>
                </div>
                ${isAchieved ? '<div class="goal-unlocked-badge">Almaya Hazır! 🎁</div>' : ''}
            </div>
        `;
        
        goalsGrid.appendChild(card);
    });
}

// --- 10b. HEROES / INSPIRATION PANEL LOGIC ---
function renderHeroes() {
    if (!heroesList) return;
    heroesList.innerHTML = "";
    
    HEROES_DATA.forEach(hero => {
        const card = document.createElement("div");
        card.classList.add("hero-card");
        
        const hasRead = appState.readHeroes && appState.readHeroes.includes(hero.name);
        
        card.innerHTML = `
            <div class="hero-card-header">
                <div class="hero-emoji-circle">${hero.emoji}</div>
                <div class="hero-title-section">
                    <h3>${hero.name}</h3>
                    <span class="hero-subtitle">${hero.title}</span>
                </div>
            </div>
            <div class="hero-body">
                <p class="hero-story"><strong>Hikayesi:</strong> ${hero.story}</p>
                <div class="hero-quote-box">
                    <span class="material-symbols-rounded quote-icon">format_quote</span>
                    <p class="hero-quote">"${hero.quote}"</p>
                </div>
                <div class="hero-lesson-box">
                    <span class="material-symbols-rounded lesson-icon">emoji_objects</span>
                    <p class="hero-lesson"><strong>Deha'ya Altın Öğüt:</strong> ${hero.lesson}</p>
                </div>
                <div class="hero-reward-section" style="margin-top: 15px; display: flex; justify-content: flex-end;">
                    ${hasRead ? `
                        <button class="read-hero-btn read" disabled style="background: #e0e0e0; color: #888; border: none; padding: 8px 16px; border-radius: 20px; font-family: var(--font-heading); font-size: 0.8rem; font-weight: 700; display: flex; align-items: center; gap: 4px;">
                            <span class="material-symbols-rounded" style="font-size: 1rem;">check</span> Okundu (+5 Yıldız)
                        </button>
                    ` : `
                        <button class="read-hero-btn" onclick="markHeroAsRead('${hero.name.replace(/'/g, "\'")}')" style="background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%); color: #FFF; border: none; padding: 8px 16px; border-radius: 20px; font-family: var(--font-heading); font-size: 0.8rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px; box-shadow: 0 4px 10px rgba(108, 92, 231, 0.15); transition: all 0.2s ease;">
                            <span class="material-symbols-rounded" style="font-size: 1rem;">stars</span> Okudum ve Öğrendim (+5 Yıldız!)
                        </button>
                    `}
                </div>
            </div>
        `;
        
        heroesList.appendChild(card);
    });
}

// --- 11. SUGGESTION CHIPS LOGIC ---
function renderSuggestions(type) {
    chatSuggestions.innerHTML = "";
    
    let chips = SUGGESTIONS.standard;
    if (type === "math_done") {
        chips = SUGGESTIONS.math_done;
    } else if (type === "behavior") {
        chips = SUGGESTIONS.behavior;
    }
    
    // Mix in some behavior ones randomly
    const allChips = [...chips, ...SUGGESTIONS.behavior.slice(0, 1)];
    
    allChips.forEach(text => {
        const chip = document.createElement("div");
        chip.classList.add("suggestion-chip");
        chip.textContent = text;
        chatSuggestions.appendChild(chip);
    });
}



// --- 13. FULLSCREEN CONFETTI ENGINE ---
const canvas = document.getElementById("confetti-canvas");
const ctx = canvas.getContext("2d");

let animationFrameId;
let particles = [];

function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function triggerConfetti() {
    resizeCanvas();
    particles = [];
    
    const colors = ["#6C5CE7", "#00CEC9", "#FF7675", "#FFD25E", "#8F82FF", "#FFFFFF"];
    
    for (let i = 0; i < 75; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 6 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedY: Math.random() * 4 + 3,
            speedX: Math.random() * 2 - 1,
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 10 - 5
        });
    }
    
    cancelAnimationFrame(animationFrameId);
    animateConfetti();
}

function animateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let active = false;
    
    particles.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;
        
        if (p.y < canvas.height) {
            active = true;
        }
        
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
    });
    
    if (active) {
        animationFrameId = requestAnimationFrame(animateConfetti);
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// --- 14. REGISTER SERVICE WORKER ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker registered successfully!', reg))
            .catch(err => console.error('Service Worker registration failed:', err));
        
        // Splash Screen fade out
        const splash = document.getElementById("splash-screen");
        if (splash) {
            setTimeout(() => {
                splash.classList.add("fade-out");
                setTimeout(() => splash.remove(), 500);
            }, 2200);
        }
    });
}

// --- 15. FUN & FACTS VIEW LOGIC ---

const JOKES_DATA = [
    {
        "title": "Kazan Doğurdu",
        "emoji": "🍲",
        "body": "Bir gün Nasrettin Hoca komşusundan kazanını ödünç ister. İşi bittiğinde kazanın içine küçük bir tencere koyup geri verir.\nKomşusu şaşırıp sorar: 'Hoca, bu nedir?'\nHoca cevap verir: 'Müjde komşu, kazanın doğurdu!'\nKomşusu sevinerek tencereyi kabul eder.\nBir süre sonra Hoca kazanı tekrar ödünç ister. Ancak aradan günler geçmesine rağmen geri getirmez. Komşusu Hoca'nın kapısını çalıp kazanını isteyince Hoca üzgün bir sesle:\n'Komşu, senin kazan öldü!' der.\nKomşu öfkeyle: 'Hoca, hiç kazan ölür mü?' deyince Hoca gülümser:\n'Yahu komşu, kazanın doğurduğuna inanıyorsun da öldüğüne neden inanmıyorsun?'"
    },
    {
        "title": "Parayı Veren Düdüğü Çalar",
        "emoji": "🎺",
        "body": "Nasrettin Hoca pazara giderken mahallenin çocukları etrafını sarar. Hepsi birden:\n'Hoca, bana düdük al!', 'Bana da düdük al!' diye bağrışırlar. Ancak çocuklardan sadece biri Hoca'ya para uzatır.\nHoca akşamüstü pazardan döner. Çocuklar hemen etrafını sarıp düdüklerini isterler. Hoca cebinden bir düdük çıkarır ve parayı veren çocuğa uzatır.\nDiğer çocuklar şaşırıp sorar: 'Hoca, bizim düdükler nerede?'\nHoca gülümseyerek meşhur cevabını verir:\n'Eee çocuklar, parayı veren düdüğü çalar!'"
    },
    {
        "title": "Ye Kürküm Ye",
        "emoji": "🧥",
        "body": "Hoca bir gün düğün yemeğine davet edilir. Üzerinde eski, günlük kıyafetleri vardır. Düğün sahibi ve konuklar Hoca'ya hiç yüz vermez, kimse buyur etmez.\nHoca hemen evine döner, sandığından en gösterişli, kürklü kaftanını giyip düğün yerine geri gelir.\nBu kez düğün sahibi onu kapıda karşılar, baş köşeye oturtur ve en güzel yemekleri ikram eder.\nHoca tabağına uzanır, kürkünün kolunu yemeğe doğru yaklaştırarak şöyle der:\n'Ye kürküm ye! Ye kürküm ye! Saygı bana değil, sana!'"
    },
    {
        "title": "Göle Maya Çalmak",
        "emoji": "🥛",
        "body": "Bir gün Nasrettin Hoca elinde koca bir kaşık yoğurt mayası ile göl kenarına gider. Kaşıktaki mayayı göle dökmeye başlar.\nOnu görenler hayretle sorar:\n'Hoca Efendi, ne yapıyorsun?'\nHoca sakin bir şekilde cevap verir: 'Göle maya çalıyorum.'\nİnsanlar gülüşür: 'Yahu Hoca, koca göl hiç maya tutar mı?'\nHoca başını kaldırır ve gülümser:\n'Ya tutarsa?'"
    },
    {
        "title": "Bindiği Dalı Kesmek",
        "emoji": "🌳",
        "body": "Nasrettin Hoca bir gün bahçesindeki ağaca çıkar ve bindiği dalı kesmeye başlar.\nYoldan geçen bir yolcu Hoca'yı görür ve seslenir:\n'Aman Hoca! Bindiği dalı kesiyorsun, şimdi düşeceksin!'\nHoca yolcuya aldırmaz ve kesmeye devam eder. Çok geçmeden dal kırılır ve Hoca yere düşer.\nHoca can havliyle doğrulur ve uzaklaşan yolcunun arkasından bağırır:\n'Yahu! Düşeceğimi bildin, ne zaman öleceğimi de söylesene!'"
    },
    {
        "title": "Hırsızın Hiç mi Suçu Yok?",
        "emoji": "🔑",
        "body": "Nasrettin Hoca'nın evine hırsız girer ve ne var ne yoksa çalar.\nErtesi gün komşuları Hoca'nın etrafını sarıp akıl vermeye başlar:\n'Hoca kapıyı neden kilitlemedin?', 'Pencereleri açık mı bıraktın?', 'Yahu insan evine sahip çıkmaz mı?'\nHoca sonunda dayanamaz ve sesini yükseltir:\n'Yahu dostlar, tamam ben hatalıyım da... Evime giren hırsızın hiç mi suçu yok?'"
    },
    {
        "title": "Kırk Yıllık Sirke",
        "emoji": "🏺",
        "body": "Komşusu Hoca'nın yanına gelip ricada bulunur:\n'Hoca Efendi, sende kırk yıllık sirke varmış, biraz verir misin?'\nHoca başını sallar: 'Veremem komşu.'\nKomşusu şaşırır: 'Aşk olsun Hoca, koca sirkeyi esirgiyor musun?'\nHoca cevap verir: 'Yahu komşu, eğer her isteyene biraz verseydim, o sirke hiç kırk yıllık olur muydu?'"
    },
    {
        "title": "Yağmurdan Kaçarken Doluya Tutulmak",
        "emoji": "🌧️",
        "body": "Bir gün yağmur yağarken herkes kaçışmaktadır. Pencereden bakan Hoca, komşusunun da koştuğunu görünce bağırır:\n'Komşu, Allah'ın rahmetinden mi kaçıyorsun?'\nKomşusu utanır ve yürümeye başlar. Ertesi gün Hoca yağmura yakalanır ve koşarak evine dönerken komşusu onu görür:\n'Hoca, sen neden Allah'ın rahmetinden kaçıyorsun?'\nHoca cevap verir: 'Yahu ben rahmetten kaçmıyorum, Allah'ın rahmetini çiğnememek için koşuyorum!'"
    },
    {
        "title": "Kuyudaki Ay",
        "emoji": "🌙",
        "body": "Hoca bir gece kuyudan su çekmeye gider. Kuyuya baktığında Ay'ın kuyuya düştüğünü (yansımasını) görür. Üzülür:\n'Ah güzel Ay, nasıl düştün oraya?'\nHemen kancayı sarkar. Kanca kuyu duvarındaki bir taşa takılır. Hoca tüm gücüyle asılır, kanca kurtulunca Hoca sırtüstü yere düşer.\nGökyüzündeki Ay'ı görünce gülümser:\n'Çok uğraştım, canım yandı ama sonunda seni kuyudan kurtardım ya, helal olsun!'"
    },
    {
        "title": "Dünyanın Ortası",
        "emoji": "🌍",
        "body": "Pazarda Hoca'ya bilginler sorarlar:\n'Hoca Efendi, bilirsen söyle, dünyanın ortası neresidir?'\nHoca elindeki eşeğin bastığı yeri göstererek:\n'Tam burasıdır!' der.\nBilginler şaşırır: 'Nasıl olur Hoca?'\nHoca cevap verir: 'İnanmıyorsanız ölçün, bir santim saparsa haklısınız!'"
    },
    {
        "title": "Eşeğin Sözü",
        "emoji": "🐴",
        "body": "Komşusu Hoca'nın kapısını çalar: 'Hoca Efendi, eşeğini ödünç verir misin?'\nHoca eşeği vermek istemediği için: 'Eşek evde yok komşu' der.\nO sırada ahırdan eşeğin anırma sesi duyulur. Komşu sitem eder: 'Aşk olsun Hoca, eşek ahırda bağırıyor, sen yok diyorsun!'\nHoca kapıyı örtmeden önce cevap verir:\n'Yahu komşu, benim sözüme inanmıyorsun da eşeğin sözüne mi inanıyorsun?'"
    },
    {
        "title": "Mavi Boncuk",
        "emoji": "🔵",
        "body": "Hoca'nın iki karısı varmış. İkisi de Hoca'nın kendisini daha çok sevdiğini iddia edermiş.\nHoca gizlice her ikisine de birer mavi boncuk vermiş ve 'Bunu kimseye gösterme, benim sevdiğim kadında bu boncuk bulunur' demiş.\nBir gün iki kadın Hoca'yı sıkıştırıp 'Hangimizi daha çok seviyorsun?' diye sormuşlar.\nHoca gülümseyerek cevap vermiş:\n'Hanginizde mavi boncuk varsa, en çok onu seviyorum!'"
    },
    {
        "title": "Eşeği Kaybetmek",
        "emoji": "🔎",
        "body": "Hoca eşeğini kaybeder, ama ararken sürekli şarkı söyler, şen şakrak davranır.\nGörenler sorar: 'Yahu Hoca, eşeğin kaybolmuş, sen şarkı söylüyorsun?'\nHoca cevap verir: 'Son bir umudum var, şu tepenin arkasına bakacağım. Orada da bulamazsam siz o zaman görün bendeki feryadı!'"
    },
    {
        "title": "Kar Yiyen Eşek",
        "emoji": "❄️",
        "body": "Kış günü Hoca eşeğine kar yedirmiş. Eşek titremeye başlayınca Hoca hayıflanmış:\n'Yahu eşeğim, kışın soğukta kar yiyorsun da yazın sıcağında neden dondurma aramıyorsun?'"
    },
    {
        "title": "Subaşının Eşeği",
        "emoji": "🌾",
        "body": "Kasabanın yöneticisi eşeğini kaybetmiş. Hoca'ya 'Bulamazsan ceza veririm' demiş.\nHoca ararken bir çalı arkasında bir eşek bulmuş ama bu vahşi bir yaban eşeğiymiş. Gidip yöneticiye şöyle demiş:\n'Eşeğinizi buldum ama biraz değişmiş, artık yabani olmuş. Sanırım makamınızdan uzak kalınca o da doğasına dönmüş!'"
    },
    {
        "title": "İpe Un Sermek",
        "emoji": "🧵",
        "body": "Komşusu Hoca'dan çamaşır ipini ister. Hoca vermek istemez ve içeri girip çıkar:\n'Komşu, kusura bakma bizim hanım ipe un sermiş, veremem.'\nKomşu şaşırır: 'İlahi Hoca, hiç ipe un serilir mi?'\nHoca cevap verir:\n'Yahu vermek istemeyince ipe un da serilir, şeker de dökülür!'"
    },
    {
        "title": "Uykuda Gezen",
        "emoji": "🌃",
        "body": "Hoca bir gece sokakta yürürken bekçiyle karşılaşır. Bekçi sorar:\n'Hoca Efendi, bu vakitte sokakta ne arıyorsun?'\nHoca cevap verir:\n'Uykum kaçtı da komşu, onu arıyorum!'"
    },
    {
        "title": "Kimin Arkasında?",
        "emoji": "⚰️",
        "body": "Hoca'ya sormuşlar: 'Cenazede tabutun neresinde yürümek uygundur?'\nHoca cevap vermiş:\n'Tabutun içinde olmayın da, neresinde yürürseniz yürüyün!'"
    },
    {
        "title": "Kazın Ayağı",
        "emoji": "🦆",
        "body": "Hoca, pişirdiği kazı padişaha götürürken yolda dayanamayıp bir bacağını yer. Padişah sorar:\n'Bu kazın neden tek bacağı var?'\nHoca: 'Bizim buraların kazları tek bacaklıdır' der ve göldeki tek bacaklı duran kazları gösterir. Padişah davul çaldırınca kazlar korkudan iki bacağını da yere basar.\nPadişah: 'Bak Hoca, kazlar iki bacaklıymış!' der.\nHoca cevap verir: 'Siz de o davul sesini duysaydınız, dörtbacaklı olurdunuz padişahım!'"
    },
    {
        "title": "Sakal Ölçüsü",
        "emoji": "🧔",
        "body": "Hoca'ya sormuşlar: 'Sakalın ne kadar uzun?'\nHoca sakalını tutup göstermiş:\n'Bir tutam komşum.'\n'Peki ya dökülürse?'\n'O zaman arkasındaki çeneye sorun, o benden daha iyi bilir!'"
    }
];

const RIDDLES_DATA = [
    {
        "question": "Pazardan aldım bir tane, eve geldim bin tane.",
        "answer": "Nar 🍎"
    },
    {
        "question": "Uzaktan baktım bir taş, yanına vardım dört ayak bir baş.",
        "answer": "Kaplumbağa 🐢"
    },
    {
        "question": "Ben giderim o gider, arkamdan tık tık eder.",
        "answer": "Baston 🦯"
    },
    {
        "question": "Yer altında sakallı dede.",
        "answer": "Pırasa 🥬"
    },
    {
        "question": "Üstü mermer altı mermer, içinde bir bülbül öteler.",
        "answer": "Dil / Ağız 👅"
    },
    {
        "question": "Kanadı var kuş değil, boynuzu var koç değil.",
        "answer": "Kelebek 🦋"
    },
    {
        "question": "Dışı var içi yok, dayak yer suçu yok.",
        "answer": "Davul 🥁"
    },
    {
        "question": "Uzun yoldan gelir, yükü yoktur. Sesi çoktur.",
        "answer": "Gök Gürültüsü ⚡"
    },
    {
        "question": "Çıt çıtır, ateş çıkarır.",
        "answer": "Kibrit 🔥"
    },
    {
        "question": "Karşıdan baktım bir kale, yanına vardım bir lale.",
        "answer": "Karpuz 🍉"
    },
    {
        "question": "Ben giderim o kalır.",
        "answer": "Ayak İzi 👣"
    },
    {
        "question": "Kanadı var uçamaz, ağzı var konuşamaz.",
        "answer": "Balık 🐟"
    },
    {
        "question": "Küçük küçük dişleri var, ne de büyük işleri var.",
        "answer": "Tarak 🪮"
    },
    {
        "question": "Sarıdır sallanır, dalında ballanır.",
        "answer": "Armut 🍐"
    },
    {
        "question": "Bir küçük fıçıcık, içi dolu turşucuk.",
        "answer": "Limon 🍋"
    },
    {
        "question": "Uzadıkça kısalır.",
        "answer": "Ömür / Mum 🕯️"
    },
    {
        "question": "Yer altında yağlı kayış.",
        "answer": "Yılan 🐍"
    },
    {
        "question": "Yazın giyinir, kışın soyunur.",
        "answer": "Ağaç 🌳"
    },
    {
        "question": "Gökte durur paslanmaz, yere düşer ıslanmaz.",
        "answer": "Güneş ☀️"
    },
    {
        "question": "Gece çıkar, gündüz kaçar.",
        "answer": "Yıldız / Ay 🌟"
    },
    {
        "question": "Bir kapaklı, çok yapraklı, içinde bilgi saklı.",
        "answer": "Kitap 📚"
    },
    {
        "question": "Dokunursan ağlar, sesi dünyayı dağlar.",
        "answer": "Keman 🎻"
    },
    {
        "question": "İki camı var, bir sapı var. Burnuma konar, gözüme bakar.",
        "answer": "Gözlük 👓"
    },
    {
        "question": "Suya düşer ıslanmaz, ateşe düşer yanmaz.",
        "answer": "Gölge 👥"
    },
    {
        "question": "Başı yeşil, eteği kırmızı. Bahçenin nazlı kızı.",
        "answer": "Çilek 🍓"
    },
    {
        "question": "Uçar kanadı yok, yürür ayağı yok.",
        "answer": "Bulut ☁️"
    },
    {
        "question": "Ağzı var dili yok, nefesi var canı yok.",
        "answer": "Balon 🎈"
    },
    {
        "question": "Biz biz idik, otuz iki kız idik. Ezildik büzüldük, iki duvara dizildik.",
        "answer": "Dişler 🦷"
    }
];

const FACTS_DATA = [
    {
        "category": "space",
        "text": "Jüpiter o kadar büyüktür ki, içine tam 1.300 tane Dünya sığabilir! 🌌"
    },
    {
        "category": "space",
        "text": "Güneş, Güneş Sistemi'ndeki toplam kütlenin %99.8'ini oluşturur. Geri kalan minicik kısım ise tüm gezegenlerdir! ☀️"
    },
    {
        "category": "space",
        "text": "Uzayda hiç ses yoktur! Çünkü ses dalgalarının yayılması için hava gibi bir ortama ihtiyaç vardır, uzay ise boşluktur. 🤫"
    },
    {
        "category": "space",
        "text": "Venüs gezegeninde bir gün (kendi etrafında bir tur dönmesi), bir yıldan (Güneş etrafında bir tur dönmesi) daha uzun sürer! 🪐"
    },
    {
        "category": "space",
        "text": "Ay'da yerçekimi Dünya'dakinin 6'da 1'i kadardır. Yani Dünya'da 30 kilo olan bir çocuk Ay'da sadece 5 kilo gelir ve çok yükseğe zıplayabilir! 🌕"
    },
    {
        "category": "space",
        "text": "Saturn gezegeni o kadar hafiftir ki, eğer onu içine alacak kadar devasa bir okyanusa koyabilseydik, suyun üzerinde yüzerdi! 🪐"
    },
    {
        "category": "space",
        "text": "Uzayda astronotlar ağlayamaz! Çünkü yerçekimi olmadığı için gözyaşları süzülüp akmaz, gözün etrafında küçük bir su topu gibi birikir. 😢"
    },
    {
        "category": "space",
        "text": "Mars gezegeni kırmızı rengini yüzeyindeki bol miktarda demir oksitten (yani bildiğimiz paslanmış demirden) alır. Bu yüzden ona Kızıl Gezegen denir! 🔴"
    },
    {
        "category": "space",
        "text": "Evrende bilinen en büyük yıldız olan UY Scuti'nin içine tam 5 milyar tane Güneş sığabilir! 🌌"
    },
    {
        "category": "space",
        "text": "Işık yılı bir zaman birimi değil, mesafe birimidir. Işığın 1 yılda gittiği mesafeyi (yaklaşık 9.5 trilyon kilometre) temsil eder! ⚡"
    },
    {
        "category": "nature",
        "text": "Karıncalar kendi ağırlıklarının tam 50 katını kaldırabilirler! Bu, bir insanın koca bir arabayı kaldırması gibidir. 🐜"
    },
    {
        "category": "nature",
        "text": "Ahtapotların tam 3 tane kalbi ve damarlarında mavi renkte kan akar! 🐙"
    },
    {
        "category": "nature",
        "text": "Dünyadaki en yaşlı ağaç olan 'Methuselah' çam ağacı tam 4.850 yaşındadır! Dinazorların yok oluşundan çok sonrasına kadar yaşamıştır. 🌲"
    },
    {
        "category": "nature",
        "text": "Muzlar doğal olarak hafifçe radyoaktiftir! Çünkü içlerinde bol miktarda potasyum elementi bulunur, ama korkmayın sağlığa çok yararlıdır. 🍌"
    },
    {
        "category": "nature",
        "text": "Bukalemunlar gözlerini birbirinden bağımsız olarak iki farklı yöne oynatabilirler! Yani aynı anda hem önünü hem arkasını izleyebilir. 🦎"
    },
    {
        "category": "nature",
        "text": "Denizatı, dünyadaki en sadık ve tek eşli canlılardandır. Ayrıca doğumu dişi denizatı değil, erkek denizatı gerçekleştirir! 🧜‍♂️"
    },
    {
        "category": "nature",
        "text": "Arılar birbirleriyle iletişim kurmak ve çiçeklerin yerini tarif etmek için özel bir dans ederler! Bu dansa 'Sallantı Dansı' denir. 🐝"
    },
    {
        "category": "nature",
        "text": "Koalalar günde yaklaşık 20-22 saat uyurlar! Kalan zamanlarında ise sadece okaliptüs yaprağı yerler. 🐨"
    },
    {
        "category": "nature",
        "text": "Penguenler uçamazlar ama dünyanın en iyi yüzücü kuşlarındandır. Bazı penguenler suyun altında 20 dakikaya kadar nefeslerini tutabilir! 🐧"
    },
    {
        "category": "nature",
        "text": "Yunuslar uyurken gözlerinden birini açık tutarlar ve beyinlerinin sadece yarısını uyuturlar, böylece tehlikelere karşı hep uyanık kalırlar! 🐬"
    },
    {
        "category": "science",
        "text": "Işık saniyede 300.000 kilometre hızla koşar! Güneş'ten çıkan ışık ışınlarının dünyamıza ulaşması yaklaşık 8 dakika 20 saniye sürer. ⚡"
    },
    {
        "category": "science",
        "text": "Suyun katı hali (buz), sıvı halinden daha hafif olduğu için suyun üstünde yüzer. Bu sayede göller alttan değil üstten donar ve balıklar kışın hayatta kalır! 🐟"
    },
    {
        "category": "science",
        "text": "İnsan vücudundaki tüm kan damarları uç uca eklenseydi, dünyayı tam 2.5 kez dolaşacak kadar uzun olurdu! 🩸"
    },
    {
        "category": "science",
        "text": "Sıcak su, soğuk sudan daha hızlı donar! Buna bilimde 'Mpemba Etkisi' denir. ❄️"
    },
    {
        "category": "science",
        "text": "İnsan beyni ortalama 2.5 petabayt (yani yaklaşık 3 milyon saatlik dizi veya film sığacak kadar) devasa bir bilgi depolama kapasitesine sahiptir! 🧠"
    },
    {
        "category": "science",
        "text": "Çelik aslında demirden çok daha güçlüdür çünkü içine küçük miktarda karbon eklenmiştir. Bu küçük atomlar demirin kaymasını önler! ⚙️"
    },
    {
        "category": "science",
        "text": "Esnerken kulağımızın az duymasının sebebi, kulak zarımızı geren minik kasların (tensor tympani) esneme sırasında kasılmasıdır! 👂"
    },
    {
        "category": "science",
        "text": "Cam aslında katı bir madde değildir! Çok yavaş akan, donmuş aşırı soğutulmuş bir sıvıdır. Yüzlerce yıllık eski pencerelerin alt kısımları bu yüzden daha kalındır! 🪟"
    },
    {
        "category": "science",
        "text": "Dünyadaki tüm insanlar aynı anda zıplasaydı, Dünya'nın yörüngesinde en ufak bir kıpırdama bile olmazdı çünkü insanların kütlesi Dünya'nın yanında sıfır gibidir! 🌍"
    },
    {
        "category": "science",
        "text": "Mıknatıslar ısıtıldıklarında manyetik özelliklerini kaybederler! Çünkü yüksek sıcaklık atomların düzenli dizilimini bozar. 🧲"
    },
    {
        "category": "history",
        "text": "İlk Türk devletlerinden Göktürkler, tarihte 'Türk' adını resmi devlet ismi olarak kullanan ilk devlettir ve kendi alfabeleri (Orhun Alfabesi) vardır! 📜"
    },
    {
        "category": "history",
        "text": "Fatih Sultan Mehmet, İstanbul'u fethettiğinde henüz 21 yaşındaydı ve 6 dil (Türkçe, Arapça, Farsça, Latince, Yunanca, İbranice) biliyordu! 👑"
    },
    {
        "category": "history",
        "text": "Cumhuriyetimizin kurucusu Mustafa Kemal Atatürk, Türkçe geometri terimlerini (üçgen, kare, dikdörtgen, artı, eksi vb.) bizzat kendisi türetip Geometri kitabını yazmıştır! 📐"
    },
    {
        "category": "history",
        "text": "Kağıt ilk kez Çin'de icat edilmiş olsa da, Türkler (Uygurlar) matbaayı geliştirip Türk harfleriyle basılı ilk kitapları ve belgeleri üretmişlerdir! 📚"
    },
    {
        "category": "history",
        "text": "Çanakkale Savaşı'nda Seyit Onbaşı, tek başına tam 215 kiloluk devasa top mermisini sırtlayıp topa yerleştirerek savaşın seyrini değiştirmiştir! ⚓"
    },
    {
        "category": "history",
        "text": "Mimar Sinan, Edirne'deki Selimiye Camii'ni yaptığında 80 yaşının üzerindeydi. Eserleri yüzlerce yıldır en büyük depremlere rağmen dimdik ayaktadır! 🕌"
    },
    {
        "category": "history",
        "text": "Göbeklitepe, Şanlıurfa'da bulunan ve tarihi günümüzden 12.000 yıl öncesine dayanan dünyanın bilinen en eski tapınağı ve tarihi merkezidir! 🏛️"
    },
    {
        "category": "history",
        "text": "Tarihin ilk yazılı barış antlaşması olan Kadeş Antlaşması, MÖ 1259 yılında Hititler ve Mısır arasında imzalanmıştır ve tabletleri İstanbul Arkeoloji Müzesi'ndedir! 📜"
    },
    {
        "category": "history",
        "text": "İlk Türk kadın savaş pilotu Sabiha Gökçen, aynı zamanda dünyanın da ilk kadın savaş pilotudur ve Atatürk'ün manevi kızıdır! ✈️"
    },
    {
        "category": "geography",
        "text": "Türkiye'nin en büyük gölü olan Van Gölü, sodalı suya sahiptir. Bu yüzden gölde sadece bu suya uyum sağlamış endemik bir tür olan İnci Kefali yaşar! 🐟"
    },
    {
        "category": "geography",
        "text": "Kapadokya'daki Peri Bacaları, milyonlarca yıl önce yanardağ küllerinin ve lavların rüzgar ve yağmur tarafından aşındırılmasıyla oluşmuş doğal sanat eserleridir! ⛰️"
    },
    {
        "category": "geography",
        "text": "Türkiye'nin en yüksek noktası olan Ağrı Dağı (5.137 metre), zirvesinde hiç erimeyen kalıcı bir buzul tabakası barındırır! 🏔️"
    },
    {
        "category": "geography",
        "text": "İstanbul ve Çanakkale Boğazları, dünyada iki kıtayı (Asya ve Avrupa) birbirinden ayıran ve üzerinden deniz trafiği geçen tek doğal su yollarıdır! 🗺️"
    },
    {
        "category": "geography",
        "text": "Dünyanın en derin noktası olan Mariana Çukuru (yaklaşık 11.000 metre derinlikte), Everest Dağı'nı içine koysak bile zirvesinin suyun altında kalacağı kadar derindir! 🌊"
    },
    {
        "category": "geography",
        "text": "Ekvator çizgisi üzerindeki ülkelerde mevsimler değişmez; yıl boyunca hava hep sıcak ve nemlidir, gece ve gündüz süreleri ise hep 12 saattir! ☀️"
    },
    {
        "category": "geography",
        "text": "Çöller sadece sıcak yerler değildir. Dünyanın en büyük çölü aslında karlar ve buzlarla kaplı olan Antarktika'dır! (Buna soğuk çöl denir). ❄️"
    },
    {
        "category": "geography",
        "text": "Dünyadaki tatlı suyun %90'ı Antarktika ve Grönland'daki devasa buzulların içinde donmuş halde saklanmaktadır! 🧊"
    },
    {
        "category": "geography",
        "text": "Türkiye'de aynı anda dört mevsim özellikleri yaşanabilir! Örneğin Antalya'da denize girilirken, Erzurum'da kayak yapılabilir. Buna coğrafyada mikroklima denir! 🗺️"
    }
];

function renderJokes() {
    const list = document.getElementById("jokes-list");
    if (!list) return;
    list.innerHTML = "";
    
    JOKES_DATA.forEach(joke => {
        const card = document.createElement("div");
        card.classList.add("joke-card");
        card.innerHTML = `
            <div class="joke-header">
                <div class="joke-emoji">${joke.emoji}</div>
                <h3 class="joke-title">${joke.title}</h3>
            </div>
            <p class="joke-body">${joke.body}</p>
        `;
        list.appendChild(card);
    });
}

function renderRiddles() {
    const list = document.getElementById("riddles-list");
    if (!list) return;
    list.innerHTML = "";
    
    RIDDLES_DATA.forEach((riddle, idx) => {
        const card = document.createElement("div");
        card.classList.add("riddle-card");
        card.id = `riddle-${idx}`;
        
        const hasClaimed = appState.solvedRiddles && appState.solvedRiddles.includes(idx);
        
        card.innerHTML = `
            <div class="riddle-header">
                <div class="riddle-emoji">❓</div>
                <div class="riddle-title-section">
                    <h3 class="riddle-title">Bilmece ${idx + 1}</h3>
                    <p class="riddle-question">${riddle.question}</p>
                </div>
            </div>
            <div class="riddle-answer-box">
                <div class="riddle-answer-content">
                    <span class="material-symbols-rounded">check_circle</span>
                    Cevap: ${riddle.answer}
                </div>
                <div class="riddle-feedback-section" style="padding: 10px 20px 16px 20px; border-top: 1px dashed rgba(0, 0, 0, 0.05);">
                    ${hasClaimed ? `
                        <div class="riddle-feedback-claimed" style="color: #2ed573; font-size: 0.8rem; font-weight: 700; display: flex; align-items: center; gap: 4px;">
                            <span class="material-symbols-rounded" style="font-size: 1.1rem;">task_alt</span> Yıldız Durumu Güncellendi
                        </div>
                    ` : `
                        <div class="riddle-feedback" style="display: flex; flex-direction: column; gap: 8px;">
                            <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-gray);">Cevabı doğru tahmin edebildin mi?</span>
                            <div class="riddle-feedback-btns" style="display: flex; gap: 8px;">
                                <button class="feedback-btn correct" onclick="claimRiddleStars(${idx}, true)" style="background: #2ed573; color: #FFF; border: none; padding: 6px 12px; border-radius: 15px; font-family: var(--font-heading); font-size: 0.75rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                                    <span class="material-symbols-rounded" style="font-size: 0.95rem;">star</span> Doğru Bildim! (+5 Yıldız)
                                </button>
                                <button class="feedback-btn wrong" onclick="claimRiddleStars(${idx}, false)" style="background: #a4b0be; color: #FFF; border: none; padding: 6px 12px; border-radius: 15px; font-family: var(--font-heading); font-size: 0.75rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                                    <span class="material-symbols-rounded" style="font-size: 0.95rem;">close</span> Bilemedim
                                </button>
                            </div>
                        </div>
                    `}
                </div>
            </div>
            <div class="riddle-actions">
                <button class="reveal-btn" onclick="toggleRiddle(${idx})">
                    <span class="material-symbols-rounded">visibility</span>
                    Cevabı Göster
                </button>
            </div>
        `;
        list.appendChild(card);
    });
}

function toggleRiddle(idx) {
    const card = document.getElementById(`riddle-${idx}`);
    if (!card) return;
    
    const btn = card.querySelector(".reveal-btn");
    const isOpened = card.classList.toggle("open");
    
    if (isOpened) {
        btn.innerHTML = `<span class="material-symbols-rounded">visibility_off</span> Cevabı Gizle`;
    } else {
        btn.innerHTML = `<span class="material-symbols-rounded">visibility</span> Cevabı Göster`;
    }
}

// Make toggleRiddle globally accessible
window.toggleRiddle = toggleRiddle;

function markHeroAsRead(name) {
    if (!appState.readHeroes) appState.readHeroes = [];
    if (appState.readHeroes.includes(name)) return;
    
    appState.readHeroes.push(name);
    saveState();
    addStars(5);
    renderHeroes();
}
window.markHeroAsRead = markHeroAsRead;

function claimRiddleStars(idx, guessedCorrectly) {
    if (!appState.solvedRiddles) appState.solvedRiddles = [];
    if (appState.solvedRiddles.includes(idx)) return;
    
    appState.solvedRiddles.push(idx);
    saveState();
    
    if (guessedCorrectly) {
        addStars(5);
    }
    
    renderRiddles();
}
window.claimRiddleStars = claimRiddleStars;

function renderFacts(category) {
    const grid = document.getElementById("facts-grid");
    if (!grid) return;
    grid.innerHTML = "";
    
    const filtered = category === 'all' 
        ? FACTS_DATA 
        : FACTS_DATA.filter(f => f.category === category);
        
    filtered.forEach(fact => {
        const card = document.createElement("div");
        card.classList.add("fact-card", fact.category);
        
        let label = "BİLGİ";
        let icon = "💡";
        if (fact.category === 'space') { label = "UZAY"; icon = "🌌"; }
        else if (fact.category === 'nature') { label = "DOĞA"; icon = "🌿"; }
        else if (fact.category === 'science') { label = "BİLİM"; icon = "🔬"; }
        else if (fact.category === 'history') { label = "TARİH"; icon = "📜"; }
        else if (fact.category === 'geography') { label = "COĞRAFYA"; icon = "🗺️"; }
        
        card.innerHTML = `
            <div class="fact-header">
                <span class="fact-badge">${label}</span>
                <span class="fact-icon-circle">${icon}</span>
            </div>
            <p class="fact-text">${fact.text}</p>
        `;
        grid.appendChild(card);
    });
}

function setupFunAndFactsListeners() {
    // Fun tabs switching
    const funTabsContainer = document.getElementById("fun-tabs");
    if (funTabsContainer) {
        funTabsContainer.addEventListener("click", (e) => {
            const tabBtn = e.target.closest(".fun-tab-btn");
            if (!tabBtn) return;
            
            // Remove active class from all buttons and panels
            funTabsContainer.querySelectorAll(".fun-tab-btn").forEach(btn => btn.classList.remove("active"));
            document.querySelectorAll(".fun-content-panel").forEach(p => p.classList.remove("active"));
            
            // Activate current
            tabBtn.classList.add("active");
            const tabName = tabBtn.getAttribute("data-tab");
            document.getElementById(`${tabName}-container`).classList.add("active");
        });
    }
    
    // Facts filtering
    const factsFilterBar = document.getElementById("facts-filter-bar");
    if (factsFilterBar) {
        factsFilterBar.addEventListener("click", (e) => {
            const filterBtn = e.target.closest(".filter-chip");
            if (!filterBtn) return;
            
            factsFilterBar.querySelectorAll(".filter-chip").forEach(btn => btn.classList.remove("active"));
            filterBtn.classList.add("active");
            
            const cat = filterBtn.getAttribute("data-category");
            renderFacts(cat);
        });
    }
}


// --- 16. MULTIPLICATION TABLE LEARNING MODULE ---

let currentMathTableNum = 1;
let quizQuestions = [];
let currentQuizQuestionIdx = 0;
let quizScore = 0;

function renderMathTableModule() {
    const container = document.getElementById("math-table-container");
    if (!container) return;
    
    // Clear container
    container.innerHTML = "";
    
    // Create wrapper
    const wrapper = document.createElement("div");
    wrapper.classList.add("math-table-wrapper");
    
    // Create Selector Grid
    let selectorHtml = `<div class="math-selector-grid">`;
    for (let i = 1; i <= 10; i++) {
        const isCompleted = appState.completedMathTables && appState.completedMathTables.includes(i);
        const isActive = i === currentMathTableNum;
        selectorHtml += `
            <button class="math-selector-btn ${isActive ? 'active' : ''}" onclick="selectMathTable(${i})">
                ${i}
                ${isCompleted ? '<span class="check-badge">✓</span>' : ''}
            </button>
        `;
    }
    selectorHtml += `</div>`;
    
    // Create Selected Display Card
    let linesHtml = "";
    for (let j = 1; j <= 10; j++) {
        linesHtml += `<div class="math-line">${currentMathTableNum} x ${j} = ${currentMathTableNum * j}</div>`;
    }
    
    const displayCardHtml = `
        <div class="math-display-card">
            <h3 class="math-display-title">${currentMathTableNum}'ler Çarpım Tablosu</h3>
            <div class="math-lines-grid">
                ${linesHtml}
            </div>
            <button class="math-test-start-btn" onclick="startTableQuiz(${currentMathTableNum})">
                <span class="material-symbols-rounded">offline_bolt</span>
                Kendini Test Et! ⚡ (+10 Yıldız)
            </button>
        </div>
    `;
    
    wrapper.innerHTML = selectorHtml + displayCardHtml;
    container.appendChild(wrapper);
}

function selectMathTable(num) {
    currentMathTableNum = num;
    renderMathTableModule();
}
window.selectMathTable = selectMathTable;

function startTableQuiz(num) {
    const container = document.getElementById("math-table-container");
    if (!container) return;
    
    currentMathTableNum = num;
    currentQuizQuestionIdx = 0;
    quizScore = 0;
    quizQuestions = [];
    
    // Generate 5 random questions for this table (e.g. num x [1..10])
    let multipliers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    multipliers.sort(() => Math.random() - 0.5); // Shuffle
    
    for (let i = 0; i < 5; i++) {
        const mult = multipliers[i];
        const correctAnswer = num * mult;
        
        // Generate options (1 correct, 3 wrong close options)
        let optionsSet = new Set([correctAnswer]);
        while (optionsSet.size < 4) {
            let offset = Math.floor(Math.random() * 5) - 2; // -2 to +2
            if (offset === 0) offset = 3;
            let fakeAns = num * (mult + offset);
            if (fakeAns > 0 && fakeAns <= 120) {
                optionsSet.add(fakeAns);
            }
        }
        
        let options = Array.from(optionsSet);
        options.sort(() => Math.random() - 0.5); // Shuffle options
        
        quizQuestions.push({
            num: num,
            mult: mult,
            correct: correctAnswer,
            options: options
        });
    }
    
    renderQuizQuestion();
}
window.startTableQuiz = startTableQuiz;

function renderQuizQuestion() {
    const container = document.getElementById("math-table-container");
    if (!container) return;
    
    const question = quizQuestions[currentQuizQuestionIdx];
    const progressPercent = ((currentQuizQuestionIdx) / 5) * 100;
    
    container.innerHTML = `
        <div class="math-quiz-card">
            <div class="quiz-header-row">
                <button class="icon-btn" onclick="renderMathTableModule()" style="margin-right: 8px;">
                    <span class="material-symbols-rounded">arrow_back</span>
                </button>
                <span class="quiz-progress-text">Soru ${currentQuizQuestionIdx + 1}/5</span>
                <div class="quiz-progress-bar-bg">
                    <div class="quiz-progress-bar-fill" style="width: ${progressPercent}%;"></div>
                </div>
                <span class="quiz-progress-text" style="color: var(--primary); font-weight: 800;">Skor: ${quizScore}/5</span>
            </div>
            
            <div class="quiz-question-box">
                <p class="quiz-progress-text" style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">İşlemin Sonucu Nedir?</p>
                <div class="quiz-question-text">${question.num} x ${question.mult} = ?</div>
            </div>
            
            <div class="quiz-options-grid">
                ${question.options.map(opt => `
                    <button class="quiz-option-btn" onclick="handleQuizAnswer(${opt}, this)">${opt}</button>
                `).join('')}
            </div>
        </div>
    `;
}
window.renderQuizQuestion = renderQuizQuestion;

function handleQuizAnswer(selectedOption, btnElement) {
    const question = quizQuestions[currentQuizQuestionIdx];
    const isCorrect = selectedOption === question.correct;
    
    // Disable all options
    const btns = document.querySelectorAll(".quiz-option-btn");
    btns.forEach(btn => btn.disabled = true);
    
    if (isCorrect) {
        btnElement.classList.add("correct");
        quizScore++;
        // Confetti for correct answer!
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 40,
                spread: 60,
                origin: { y: 0.7 }
            });
        }
    } else {
        btnElement.classList.add("wrong");
        // Highlight correct option
        btns.forEach(btn => {
            if (parseInt(btn.textContent) === question.correct) {
                btn.classList.add("correct");
            }
        });
    }
    
    // Move to next question after delay
    setTimeout(() => {
        currentQuizQuestionIdx++;
        if (currentQuizQuestionIdx < 5) {
            renderQuizQuestion();
        } else {
            showQuizResult();
        }
    }, 1500);
}
window.handleQuizAnswer = handleQuizAnswer;

function showQuizResult() {
    const container = document.getElementById("math-table-container");
    if (!container) return;
    
    const isPerfect = quizScore === 5;
    const isFirstTime = !appState.completedMathTables.includes(currentMathTableNum);
    let earnStars = false;
    
    if (isPerfect && isFirstTime) {
        earnStars = true;
        if (!appState.completedMathTables) appState.completedMathTables = [];
        appState.completedMathTables.push(currentMathTableNum);
        saveState();
        addStars(10);
    }
    
    let emoji = "🎉";
    let title = "Harikasın Deha!";
    let desc = `5 sorunun tamamına doğru cevap verdin! Çarpım tablosunda ${currentMathTableNum}'leri süper öğrendin aslanım.`;
    
    if (quizScore === 4) {
        emoji = "👍";
        title = "Çok Güzel!";
        desc = "5 sorudan 4 tanesini doğru cevapladın. Neredeyse kusursuz! Ufak bir dikkat hatası olmuş olabilir.";
    } else if (quizScore < 4) {
        emoji = "💪";
        title = "Gelişebilirsin!";
        desc = `5 sorudan ${quizScore} tanesini doğru bildin. Biraz daha pratik yapıp tekrar deneyebilirsin!`;
    }
    
    if (earnStars) {
        desc += `<br><strong style="color: #FFD700; font-size: 1.1rem; display: block; margin-top: 10px;">🌟 +10 Yıldız Kazandın! 🌟</strong>`;
    } else if (isPerfect && !isFirstTime) {
        desc += `<br><span style="color: var(--text-gray); font-size: 0.8rem; display: block; margin-top: 10px;">(Bu tablodan daha önce yıldız kazanmıştın.)</span>`;
    }
    
    container.innerHTML = `
        <div class="math-quiz-card quiz-result-view">
            <div class="quiz-result-emoji">${emoji}</div>
            <h3 class="quiz-result-title">${title}</h3>
            <p class="quiz-result-desc">${desc}</p>
            <button class="quiz-result-btn" onclick="renderMathTableModule()">Çarpım Tablosuna Dön</button>
        </div>
    `;
}
window.showQuizResult = showQuizResult;
