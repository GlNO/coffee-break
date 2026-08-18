
const timer = document.querySelector(".timer");
const startButton = document.querySelector("#start-button");
const welcomeOverlay = document.querySelector("#welcome-overlay");
const welcomeCard = document.querySelector("#welcome-card");
const welcomeButton = document.querySelector("#welcome-button");
const customerNameInput = document.querySelector("#customer-name");
const settingsButton = document.querySelector("#settings-button");
const appNameLink = document.querySelector(".app-name");

const clickSound = new Audio("./assets/audio/click.wav");
const switchmodeSound = new Audio("./assets/audio/switch.wav");
const continueSound = new Audio("./assets/audio/scribble.mp3");
const coffeePourSound = new Audio("./assets/audio/coffee_pour.mp3");

const STORAGE_KEY = "coffee-break-customer-name";

const FOCUS_DURATION = 25 * 60;

let timeRemaining = FOCUS_DURATION;
let isRunning = false;
let isPaused = false;
let timerInterval = null;
let coffeePourPlayed = false;

// timer display


const modeButtons = document.querySelectorAll(".mode-button");

const defaultDurations = {
    // focus: 25 * 60,
    focus: 8,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
};




startButton.addEventListener("click", () => {
    clickSound.play();
});



let durations = { ...defaultDurations };
let currentMode = "focus";

function highlightSelectedMode() {
    modeButtons.forEach((button) => {
        const isActive = button.dataset.mode === currentMode;
        button.classList.toggle("is-active", isActive);
    });
}

function updateCurrentMode(mode) {
    currentMode = mode;
    highlightSelectedMode();

    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
    isPaused = false;
    coffeePourPlayed = false;
    timeRemaining = durations[currentMode];
    updateTimerDisplay();
    updateButtonState();
}

function moveToNextMode() {
    const nextMode = currentMode === "focus" ? "shortBreak" : "focus";
    updateCurrentMode(nextMode);
}

modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
        updateCurrentMode(button.dataset.mode);
        switchmodeSound.play();
    });
});

highlightSelectedMode();

function updateTimerDisplay(){


      const minutes = Math.floor(timeRemaining / 60);
      const seconds = timeRemaining % 60;

      const formattedMinutes = String(minutes).padStart(2, "0");
      const formattedSeconds = String(seconds).padStart(2, "0");

      timer.textContent = `${formattedMinutes}:${formattedSeconds}`;

}
function startTimer() {
    if (timeRemaining <= 0) {
        timeRemaining = durations[currentMode];
        updateTimerDisplay();
    }

    if (!isRunning) {
        isRunning = true;
        isPaused = false;
        updateButtonState();

        timerInterval = setInterval(function () {
            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                isRunning = false;
                isPaused = false;
                moveToNextMode();
                return;
            }

            if (timeRemaining === 6 && !coffeePourPlayed) {
                coffeePourSound.currentTime = 0;
                coffeePourSound.play();
                coffeePourPlayed = true;
            }

            timeRemaining--;
            updateTimerDisplay();

            if (timeRemaining === 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                isRunning = false;
                isPaused = false;
                moveToNextMode();
            }
        }, 1000);
    }
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
    isPaused = true;
    updateButtonState();
}

function finishTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
    isPaused = false;
    timeRemaining = 0;
    updateTimerDisplay();
    updateButtonState();
}



function updateButtonState() {
    if (isRunning) {
        startButton.textContent = "Pause Brewing";
    } else if (timeRemaining === 0) {
        startButton.textContent = "Brew Complete ☕";
    } else if (isPaused) {
        startButton.textContent = "Resume Brewing";
    } else {
        startButton.textContent = "Start Brewing";
    }
}


startButton.addEventListener("click", function() {
    if (isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
});

function formatNameForDisplay(value) {
    if (!value) return "";

    return value
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function updateSettingsButtonLabel() {
    const savedName = localStorage.getItem(STORAGE_KEY);
    const displayName = formatNameForDisplay(savedName);

    if (displayName && settingsButton) {
        settingsButton.textContent = `Hi, ${displayName}`;
    } else if (settingsButton) {
        settingsButton.textContent = "Hi there!";
    }
}

function submitCustomerName() {
    const name = customerNameInput.value.trim();

    if (!name) {
        customerNameInput.focus();
        return;
    }

    localStorage.setItem(STORAGE_KEY, name);
    welcomeOverlay.style.display = "none";
    continueSound.play();
    updateSettingsButtonLabel();
}

welcomeButton.addEventListener("click", submitCustomerName);

customerNameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        submitCustomerName();
    }
});

if (appNameLink) {
    appNameLink.addEventListener("click", (event) => {
        event.preventDefault();
        localStorage.removeItem(STORAGE_KEY);
        welcomeOverlay.style.display = "flex";
        customerNameInput.value = "";
        customerNameInput.focus();
        updateSettingsButtonLabel();
    });
}

const savedName = localStorage.getItem(STORAGE_KEY);

if (savedName) {
    welcomeOverlay.style.display = "none";
} else {
    welcomeOverlay.style.display = "flex";
}

updateSettingsButtonLabel();

updateTimerDisplay();
updateButtonState();