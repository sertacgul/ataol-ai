/**
 * ATAOL Yapay Zeka - Application Logic & State Management
 * Specifically designed for Deha Ataol GÜL
 * Parent: Sertaç GÜL, Feriş GÜL
 */

// --- 1. CONFIGURATION & CONSTANTS ---
const WEEKS_DATA = [
    {
        num: 1,
        title: "1. Hafta: Temel Toplama ve Çıkarma",
        desc: "Bu hafta toplama ve çıkarma işlemlerini çok iyi öğreneceğiz. Kendimize güvenimizi kazanacağız!",
        tasks: [
            "Her gün en az 5 adet toplama ve çıkarma sorusu çöz.",
            "Evde baban Sertaç veya annen Feriş'in senden istediği bir ufak yardımı yerine getir.",
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
            "Annen Feriş'e bugün kocaman sarıl ve onu çok sevdiğini söyle.",
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
            "Babana/Annene çarpım tablosunda ne kadar hızlandığını göster.",
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
            "Annen Feriş'e sofrayı kurarken veya toplarken yardım et."
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
            "Baban Sertaç ve annen Feriş'e bu 9 haftalık gelişim için teşekkür et.",
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
    { key: "polite_deha", title: "Kibar Evlat", desc: "Annen Feriş'e çok iyi davrandın ve yardım ettin!", icon: "favorite" },
    { key: "graduation", title: "Ortaokul Yolcusu", desc: "9 haftalık gelişim planını başarıyla tamamladın!", icon: "school" }
];

const SUGGESTIONS = {
    standard: ["Hazırım babacım!", "Bana matematik sorusu sor!", "Günün görevini söyle!", "Yıldızlarımı göster 🌟"],
    math_done: ["Harika bir soru daha sor!", "Çarpım tablosu çalışalım!", "Bugün başka ne öğreneceğim?"],
    behavior: ["Hayvanları uzaktan seveceğim 🐾", "Anneme iyi davranacağım ❤️", "Shorts izlemek yerine kitap okuyacağım 📚"]
};

// --- 2. LOCAL STATE MANAGEMENT ---
let appState = {
    apiKey: localStorage.getItem("ataol_api_key") || "",
    stars: parseInt(localStorage.getItem("ataol_stars")) || 0,
    currentWeek: parseInt(localStorage.getItem("ataol_week")) || 1,
    messages: JSON.parse(localStorage.getItem("ataol_messages")) || [],
    dailyTaskCompletedDate: localStorage.getItem("ataol_daily_task_date") || "",
    unlockedBadges: JSON.parse(localStorage.getItem("ataol_unlocked_badges")) || [],
    correctAnswersCount: parseInt(localStorage.getItem("ataol_correct_answers")) || 0
};

function saveState() {
    localStorage.setItem("ataol_stars", appState.stars);
    localStorage.setItem("ataol_week", appState.currentWeek);
    localStorage.setItem("ataol_messages", JSON.stringify(appState.messages));
    localStorage.setItem("ataol_daily_task_date", appState.dailyTaskCompletedDate);
    localStorage.setItem("ataol_unlocked_badges", JSON.stringify(appState.unlockedBadges));
    localStorage.setItem("ataol_correct_answers", appState.correctAnswersCount);
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
const micBtn = document.getElementById("mic-btn");
const chatboardBtn = document.getElementById("chatboard-btn");
const chatboardPanel = document.getElementById("chatboard-panel");

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
    
    // Load Chat History
    if (appState.messages.length === 0) {
        // First welcome message from Sertaç Father
        const welcomeText = `Dehacığım, canım oğlum, ben baban Sertaç. Bu sene seninle harika bir ortaokula hazırlık ve matematik serüvenine çıkıyoruz. Annen Feriş ve ben seni dünyalar kadar seviyoruz! Burası seninle özel sohbet edeceğimiz yer. Bana dilediğin her şeyi yazabilirsin. Hazır mısın? Sana bir matematik sorusu sorayım mı? 🌟`;
        addMessageToState("model", welcomeText);
        speakText(welcomeText);
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
        const announceMsg = `Dehacığım, baban Sertaç olarak senin gelişim planını güncelledim. Şimdi ${newWeekData.title} yolculuğundayız. Konumuz: ${newWeekData.topic}. Annen Feriş de ben de seninle gurur duyuyoruz. Hazır olduğunda bana 'yeni bir soru sor' diyebilirsin! 🚀`;
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
                correctAnswersCount: 0
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
        
        // Add text-to-speech button to model responses
        if (msg.role === "model") {
            const speakerBtn = document.createElement("button");
            speakerBtn.classList.add("speaker-btn");
            speakerBtn.innerHTML = `<span class="material-symbols-rounded">volume_up</span>`;
            speakerBtn.title = "Sesli Oku";
            speakerBtn.addEventListener("click", () => {
                speakText(msg.text);
            });
            meta.appendChild(speakerBtn);
        }
        
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
        alert("Lütfen ayarlardan Gemini API Key girin.");
        return;
    }
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    // Construct dynamic system prompt based on state
    const currentWeekInfo = WEEKS_DATA.find(w => w.num === appState.currentWeek);
    const systemPrompt = `
Sen Deha Ataol GÜL (10 yaşında, ortaokula başlayacak) adındaki çocuğun babası Sertaç GÜL'ün yapay zeka yansıması ve onun sevgi dolu sesisin. Onunla konuşan "ATAOL Yapay Zeka" isimli sohbet botusun, ama tamamen babasının sevgisini, koruyuculuğunu, babalık rehberliğini ve ses tonunu yansıtıyorsun.

ÖNEMLİ KİMLİK KURALLARI:
1. Deha'ya hitap ederken "Dehacığım", "canım oğlum", "güzel oğlum", "aslanım" diye hitap et.
2. Cümlelerini babası Sertaç konuşuyormuş gibi kur. "Ben baban Sertaç...", "Baban olarak seni...", "Biz annen Feriş'le seni..." şeklinde ifadeler kullan.
3. Eşin Feriş'in (Deha'nın annesinin) onu çok sevdiğinden bahset. Annesine her zaman iyi davranması, sözünü dinlemesi ve evde ona yardım etmesi gerektiğini sık sık hatırlat.
4. Deha 10 yaşında olduğu için cevapların KISA, dinamik, bol emojili, samimi ve motive edici olsun. Asla uzun sıkıcı paragraflar yazma.

DEHA'NIN HEDEFLERİ VE GELİŞİM PLANI:
1. Matematik: Temeli zayıf ve çarpım tablosunu bilmiyor. Deha'ya her konuşmada veya birkaç cümlede bir, o anki gelişim haftasına uygun matematik soruları sor. Soru sorduktan sonra cevabını bekle.
ŞU AN BULUNDUĞU HAFTA: ${currentWeekInfo.title}
BU HAFTANIN MATEMATİK KONUSU: ${currentWeekInfo.topic}
Eğer Deha matematik sorularına doğru cevap verirse onu coşkuyla tebrik et ("Harikasın aslan oğlum! Annen Feriş'le gurur duyduk, sana +5 Yıldız!" vb.) ve ona yıldız kazandığını belirt.
Eğer Deha sorulara yanlış cevap verirse, üzülmemesini söyle, şefkatle doğrusunu açıkla ve başka bir soruyla devam et.

ÖZEL DAVRANIŞSAL PROBLEMLERE YÖNELİK REHBERLİK:
1. Küfür, anlamsız veya saçma sözler: Deha küfür veya anlamsız şeyler yazsa dahi ASLA kızma, azarlama. Onu sevgiyle doğru yöne sevk et. Örn: "Güzel oğlum Deha, Feriş annen ve ben senin gibi akıllı bir çocuğa böyle kelimelerin yakışmadığını biliyoruz. Gel seninle daha güzel bir şey konuşalım, mesela sana bir soru sorayım..."
2. Ekran Bağımlılığı (YouTube Shorts): Deha çok fazla YouTube Shorts izliyor. Ona bunun zihnini yorduğunu, bunun yerine dışarıda oynamasını, kitap okumasını veya çarpım tablosu çalışmasını tatlı dille öner.
3. Sokak Hayvanları ve Hijyen: Sokakta gördüğü her hayvana dokunuyor. Hayvanları sevmenin çok güzel olduğunu ama sokak hayvanlarının mikrop taşıyabileceğini, onlara dokunmaması veya dokunursa hemen ellerini yıkaması gerektiğini sevgiyle anlat. Uzaktan sevmesini veya babasıyla beslemesini öner.
4. Yabancılar: Sokakta tanımadığı insanlara laf atmaması, onları rahatsız etmemesi ve güvenlik nedeniyle yabancılarla mesafesini koruması gerektiğini sevgiyle hatırlat.
5. İnternet Aramaları (Google Arama): Deha sana dünyayla, doğayla, tarihle veya ders dışı genel kültürle ilgili araştırma gerektiren bir soru sorduğunda, entegre Google Arama aracını kullanarak araştırma yap ve en doğru bilgiyi bul. Bu bilgiyi ona bir babanın bilgeliğiyle, şefkatli ve 10 yaşındaki bir çocuğun anlayacağı basitlikte aktar.

Konuşmanın akışını bozmadan, Deha'nın en son yazdığı mesaja göre babacan, motive edici ve tatlı bir yanıt ver.`;

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
                googleSearch: {}
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
        
        // Speak response out loud
        speakText(responseText);

    } catch (error) {
        console.error("Gemini API call failed:", error);
        removeTypingIndicator();
        const fallbackMsg = "Canım oğlum, bağlantımda küçük bir sorun oldu sanırım. Sen nasılsın, çalışmaların nasıl gidiyor?";
        addMessageToState("model", fallbackMsg);
        renderChatHistory();
        speakText(fallbackMsg);
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
            const achievementMsg = `Tebrikler Dehacığım! 🌟 Yeni bir madalya kazandın: "${badge.title}". Feriş annen de ben de senin bu başarını kutluyoruz! Sana fazladan +10 Yıldız!`;
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
        "Annen Feriş'e bugün yardıma ihtiyacı olup olmadığını sor ve ona yardım et!",
        "Bugün sokakta kedi veya köpek görürsen uzaktan tatlı dille sev, ellerini temiz tut!",
        "Bugün telefon ekranından uzak kalıp 15 sayfa kitap oku ve babana özetini anlat!",
        "En çok takıldığın çarpım tablosu rakamını (mesela 7'ler veya 8'ler) 5 defa sesli çalış!",
        "Bugün hiç YouTube Shorts izlemeden günü tamamla, yerine dışarıda biraz oyun oyna!",
        "Annen Feriş'e bugün kocaman sarıl ve 'Seni çok seviyorum canım annem' de!"
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
    
    const taskCompletedMsg = `Günün görevini başarıyla tamamladın Dehacığım! 🌟 Baban olarak seninle çok gurur duyuyorum. Sana +5 Yıldız daha kazandırdım. Annen Feriş de bu güzel habere çok sevindi. Harika gidiyorsun!`;
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

// --- 12. TEXT TO SPEECH (TTS) VOICE ---
function speakText(text) {
    if (!('speechSynthesis' in window)) return;
    
    // Cancel current speaking
    window.speechSynthesis.cancel();
    
    // Clean text from markdown bold stars etc.
    const cleanText = text.replace(/[*#_`~]/g, '');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "tr-TR";
    
    // Try to find a Turkish voice
    const voices = window.speechSynthesis.getVoices();
    const trVoice = voices.find(v => v.lang.startsWith("tr"));
    if (trVoice) {
        utterance.voice = trVoice;
    }
    
    utterance.rate = 1.0; // Playful normal rate
    utterance.pitch = 0.95; // Friendly warm pitch
    
    window.speechSynthesis.speak(utterance);
}

// Make sure voices are loaded
if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {};
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
    });
}

