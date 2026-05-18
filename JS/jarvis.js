// ======================================
// MEMORY
// ======================================

let memory = {
    name: "Sir",
    lastCommand: null,
    lastCity: "Hyderabad"
};


// ======================================
// CLOCK (SAFE)
// ======================================

function updateClock() {

    const clock = document.getElementById("clock");
    if (!clock) return;

    const now = new Date();

    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    let ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    if (hours === 0) hours = 12;

    clock.innerText =
        `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')} ${ampm}`;
}

setInterval(updateClock, 1000);
updateClock();


// ======================================
// ELEMENTS
// ======================================

const orb = document.getElementById("orb");
const statusText = document.getElementById("statusText");
const typingDots = document.getElementById("typingDots");
const waveform = document.getElementById("waveform");


// ======================================
// SPEECH RECOGNITION
// ======================================

const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();

recognition.lang = "en-US";
recognition.continuous = true;
recognition.interimResults = false;


// ======================================
// POWER SYSTEM
// ======================================

let jarvisActive = false;


// ======================================
// ORB TOGGLE
// ======================================

orb.addEventListener("click", () => {

    if (!jarvisActive) {

        jarvisActive = true;

        updateStatus("ONLINE");
        updateResponse("JARVIS Activated...");

        orb.classList.add("listening");
        waveform?.classList.add("active"); // 🔥 WAV FORM START

        try {
            recognition.start();
        } catch (error) {
            console.log(error);
        }

    } else {

        jarvisActive = false;

        updateStatus("OFFLINE");
        updateResponse("JARVIS Offline");

        orb.classList.remove("listening", "speaking");
        waveform?.classList.remove("active"); // 🔥 STOP WAV FORM

        recognition.stop();
    }
});


// ======================================
// SPEECH INPUT
// ======================================

recognition.onresult = (event) => {

    const transcript =
        event.results[event.results.length - 1][0]
            .transcript
            .toLowerCase()
            .trim();

    if (!jarvisActive) return;

    orb.classList.remove("listening");

    waveform?.classList.add("active"); // LISTEN MODE AUDIO VISUAL

    const commands = extractMultipleCommands(transcript);
    commands.forEach(cmd => handleCommand(cmd));
};


// ======================================
// SAFE AUTO RESTART
// ======================================

recognition.onend = () => {

    if (jarvisActive) {
        setTimeout(() => {
            try {
                recognition.start();
            } catch (error) {
                console.log(error);
            }
        }, 300);
    }
};


// ======================================
// COMMAND HANDLER
// ======================================

async function handleCommand(command) {

    memory.lastCommand = command;

    const intent = detectIntent(command);
    await executeIntent(intent, command);
}


// ======================================
// INTENT DETECTION
// ======================================

function detectIntent(command) {

    command = command.toLowerCase();

    const intents = {

        greeting: ["hello", "hi", "hey", "morning", "evening"],
        youtube: ["youtube", "video", "videos", "watch", "stream"],
        google: ["google", "browser", "internet"],
        gmail: ["gmail", "mail", "email"],
        chatgpt: ["chatgpt", "chat", "ai"],
        weather: ["weather", "temperature", "forecast", "climate"],
        time: ["time", "clock"],
        search: ["search", "find", "look"],
        chat: ["explain", "what is", "who is", "why", "how", "tell me", "describe"]
    };

    let bestIntent = "unknown";
    let highestScore = 0;

    for (let intent in intents) {

        let score = 0;

        for (let keyword of intents[intent]) {
            if (command.includes(keyword)) score++;
        }

        if (score > highestScore) {
            highestScore = score;
            bestIntent = intent;
        }
    }

    return bestIntent;
}


// ======================================
// EXECUTION ENGINE
// ======================================

async function executeIntent(intent, command) {

    switch (intent) {

        case "greeting":
            respond(`Hello ${memory.name}`);
            break;

        case "youtube":
            respond("Opening YouTube");
            openWebsite("https://www.youtube.com");
            break;

        case "google":
            respond("Opening Google");
            openWebsite("https://www.google.com");
            break;

        case "gmail":
            respond("Opening Gmail");
            openWebsite("https://www.gmail.com");
            break;

        case "chatgpt":
            respond("Opening ChatGPT");
            openWebsite("https://chatgpt.com");
            break;

        case "time":
            tellTime();
            break;

        case "search":
            searchGoogle(command);
            break;

        case "weather":

            let city = command
                .replace("what's the weather in", "")
                .replace("what is the weather in", "")
                .replace("tell me the weather in", "")
                .replace("weather in", "")
                .replace("weather", "")
                .trim();

            city = city.replace(/[.,?!]/g, "");

            if (!city) city = memory.lastCity;

            memory.lastCity = city;

            getWeather(city);
            break;

        case "chat":
        default: {

            respond("Thinking...");

            const aiReply = await askAI(
                `User said: "${command}". Previous command: "${memory.lastCommand || "none"}". Respond naturally.`
            );

            respond(aiReply);
            break;
        }
    }
}


// ======================================
// RESPONSE SYSTEM
// ======================================

function respond(message) {

    typingDots.style.display = "flex";
    updateStatus("THINKING");

    setTimeout(() => {

        typingDots.style.display = "none";

        typeResponse(message);
        speak(message);

        updateStatus("SPEAKING");

    }, 700);
}


// ======================================
// TYPE EFFECT
// ======================================

function typeResponse(text) {

    const response = document.getElementById("response");
    response.innerHTML = "";

    let i = 0;

    const typing = setInterval(() => {

        response.innerHTML += text[i];
        i++;

        if (i >= text.length) clearInterval(typing);

    }, 30);
}


// ======================================
// UI
// ======================================

function updateResponse(text) {
    document.getElementById("response").innerText = text;
}

function updateStatus(status) {
    statusText.innerText = status;
}


// ======================================
// TEXT TO SPEECH (WITH WAV FORM FIX)
// ======================================

function speak(text) {

    const speech = new SpeechSynthesisUtterance(text);

    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1;

    try {
        recognition.stop();
    } catch (e) {}

    orb.classList.remove("listening");
    orb.classList.add("speaking");

    waveform?.classList.add("active"); // 🔥 WAV FORM SPEAK MODE

    window.speechSynthesis.speak(speech);

    speech.onend = () => {

        orb.classList.remove("speaking");
        waveform?.classList.remove("active");

        if (jarvisActive) {
            updateStatus("LISTENING");
            orb.classList.add("listening");
            waveform?.classList.add("active");
        }
    };
}


// ======================================
// UTILITIES
// ======================================

function openWebsite(url) {
    window.open(url, "_blank");
}


// ======================================
// TIME
// ======================================

function tellTime() {

    const now = new Date();

    let hours = now.getHours();
    let minutes = now.getMinutes();
    let ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    if (hours === 0) hours = 12;

    respond(`The time is ${hours}:${String(minutes).padStart(2,'0')} ${ampm}`);
}


// ======================================
// GOOGLE SEARCH
// ======================================

function searchGoogle(command) {

    const searchQuery = command.replace("search", "").trim();

    respond(`Searching for ${searchQuery}`);

    openWebsite(`https://www.google.com/search?q=${searchQuery}`);
}


// ======================================
// WEATHER
// ======================================

async function getWeather(city) {

    const apiKey = "72f9230c8a0ea813ec54bcb0cfb046d0";

    if (!city) city = "London";

    const url =
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    try {

        const res = await fetch(url);
        const data = await res.json();

        if (data.cod != 200) {
            respond(`I couldn't find weather for ${city}`);
            return;
        }

        respond(`The weather in ${city} is ${data.main.temp}°C with ${data.weather[0].description}`);

    } catch (error) {
        respond("Weather service is not working.");
    }
}


// ======================================
// AI BRAIN
// ======================================

async function askAI(prompt) {

    try {

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer YOUR_OPENAI_API_KEY"
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "You are JARVIS, a smart AI assistant." },
                    { role: "user", content: prompt }
                ]
            })
        });

        const data = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        return "AI service is unavailable.";
    }
}


// ======================================
// MULTI COMMAND
// ======================================

function extractMultipleCommands(text) {
    return text.split(" and ").map(cmd => cmd.trim());
}