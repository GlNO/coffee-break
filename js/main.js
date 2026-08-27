

const timer = document.querySelector(".timer");
const startButton = document.querySelector("#start-button");
const welcomeOverlay = document.querySelector("#welcome-overlay");
const welcomeCard = document.querySelector("#welcome-card");
const welcomeButton = document.querySelector("#welcome-button");
const customerNameInput = document.querySelector("#customer-name");
const taskInput = document.querySelector("#task-name");
const drinkInputs = document.querySelectorAll('input[name="drink"]');
const currentTask = document.querySelector("#current-task");
const currentTaskName = document.querySelector("#current-task-name");
const dailyFocusSummary = document.querySelector("#daily-focus-summary");
const rewardLayer = document.querySelector("#reward-layer");
const devButton = document.querySelector("#dev-button");
const devPanel = document.querySelector("#dev-panel");
const devCompleteButton = document.querySelector("#dev-complete-button");
const devResetButton = document.querySelector("#dev-reset-button");


const clickSound = new Audio("./assets/audio/click.wav");
const switchmodeSound = new Audio("./assets/audio/switch.wav");
const continueSound = new Audio("./assets/audio/scribble.mp3");
const coffeePourSound = new Audio("./assets/audio/coffee_pour.mp3");
const completedSound = new Audio("./assets/audio/completed.mp3");

const STORAGE_KEY = "coffee-break-customer-name";
const COLLECTION_STORAGE_KEY = "coffee-break-collection";
const TASK_STORAGE_KEY = "coffee-break-task";
const DEFAULT_DRINK = "cappucino";

const FOCUS_DURATION = 25 * 60;

let timeRemaining = FOCUS_DURATION;
let isRunning = false;
let isPaused = false;
let timerInterval = null;
let coffeePourPlayed = false;
let completionPopupTimeout = null;
let completionPopupCloseTimeout = null;

// timer display


const modeButtons = document.querySelectorAll(".mode-button");

const defaultDurations = {
    focus: 25 * 60,
    // focus: 7,
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
    updateCurrentTask();

    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
    isPaused = false;
    coffeePourPlayed = false;
    timeRemaining = durations[currentMode];
    updateTimerDisplay();
    updateButtonState();
}

function spawnRewardCup() {
    const collection = JSON.parse(localStorage.getItem(COLLECTION_STORAGE_KEY) || "[]");
    const selectedDrink = localStorage.getItem("coffee-break-drink") || DEFAULT_DRINK;
    const task = localStorage.getItem(TASK_STORAGE_KEY) || "";
        collection.push({
            drink: selectedDrink,
            task,
            focusSeconds: durations.focus,
            earnedAt: new Date().toISOString()
        });
    localStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(collection));
    updateDailyFocusSummary();

    if (!rewardLayer) return;

    const cup = document.createElement("img");
    cup.src = `./assets/images/${selectedDrink}.png`;
    cup.alt = `${selectedDrink} reward`;
    cup.className = "reward-cup";

    const navLinks = document.querySelectorAll(".nav-links a");
    const collectionLink = navLinks[1]; 


    cup.style.left = "50%";
    cup.style.top = "50%";

    let endLeft = "50%";
    let endTop = "50%";

    if (collectionLink) {
        const rect = collectionLink.getBoundingClientRect();
        endLeft = `${rect.left + rect.width / 2}px`;
        endTop = `${rect.top + rect.height / 2}px`;
    }

    rewardLayer.appendChild(cup);

    cup.animate([
        { 
            opacity: 0, 
            left: "50%", 
            top: "50%",
            transform: "translate(-50%, -50%) scale(0.82) rotate(-8deg)"
        },
        { 
            opacity: 1, 
            left: "50%", 
            top: "50%",
            transform: "translate(-50%, -50%) scale(1) rotate(0deg)",
            offset: 0.15
        },
        { 
            opacity: 1, 
            left: "50%", 
            top: "50%",
            transform: "translate(-50%, -50%) scale(1) rotate(0deg)",
            offset: 0.45
        },
        { 
            opacity: 1, 
            left: endLeft, 
            top: endTop,
            transform: "translate(-50%, -50%) scale(0.72) rotate(4deg)",
            offset: 0.75
        },
        { 
            opacity: 0, 
            left: endLeft, 
            top: endTop,
            transform: "translate(-50%, -50%) scale(0.52) rotate(0deg)"
        }
    ], {
        duration: 5000,
        easing: "cubic-bezier(0.34, 1.56, 0.64, 1)"
    });


    if (collectionLink) {
        setTimeout(() => {
            collectionLink.animate([
                { transform: "scale(1) rotate(0deg)" },
                { transform: "scale(1.2) rotate(5deg)" },
                { transform: "scale(1.15) rotate(-3deg)" },
                { transform: "scale(1.1) rotate(2deg)" },
                { transform: "scale(1) rotate(0deg)" }
            ], {
                duration: 600,
                easing: "cubic-bezier(0.68, -0.55, 0.265, 1.55)"
            });
        }, 1170);
    }

    setTimeout(() => {
        cup.remove();
    }, 3200);
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
            updateDailyFocusSummary();

            if (timeRemaining === 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                isRunning = false;
                isPaused = false;
                const completedMode = currentMode;
                completedSound.play();

                if (completedMode === "focus") {
                    spawnRewardCup();
                }

                showCompletionPopup(completedMode);

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

function showCompletionPopup(mode) {
    const messages = {
        focus: "Well done! Your focus session is complete.",
        shortBreak: "Nice work! Take a little moment to recharge.",
        longBreak: "Great job! Time to slow down and recharge."
    };

    const completionPopup = document.querySelector("#completion-popup");
    const completionMessage = document.querySelector("#completion-message");
    if (!completionPopup || !completionMessage) return;

    clearTimeout(completionPopupTimeout);
    clearTimeout(completionPopupCloseTimeout);
    completionPopup.classList.remove("is-closing");
    completionMessage.textContent = messages[mode];
    completionPopup.hidden = false;
    completionPopupTimeout = setTimeout(() => {
        hideCompletionPopup();
    }, 3000);
}

function hideCompletionPopup() {
    const completionPopup = document.querySelector("#completion-popup");
    if (!completionPopup || completionPopup.hidden) return;

    clearTimeout(completionPopupTimeout);
    completionPopup.classList.add("is-closing");
    clearTimeout(completionPopupCloseTimeout);
    completionPopupCloseTimeout = setTimeout(() => {
        completionPopup.hidden = true;
        completionPopup.classList.remove("is-closing");
    }, 250);
}

function completeSessionForDev(mode) {
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
    isPaused = false;
    currentMode = mode;
    highlightSelectedMode();
    if (mode === "focus") {
        spawnRewardCup();
    }
    showCompletionPopup(mode);
    moveToNextMode();
    updateButtonState();
}



function updateButtonState() {
    if (isRunning) {
        startButton.textContent = "Pause Brewing";
    } else if (timeRemaining === 0) {
        startButton.textContent = "Brew Complete ☕";
    } else if (isPaused) {
        startButton.textContent = "Back to Work";
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
    const settingsButton = document.querySelector("#settings-button");
    const savedName = localStorage.getItem(STORAGE_KEY);
    const displayName = formatNameForDisplay(savedName);

    if (displayName && settingsButton) {
        settingsButton.textContent = `Hi, ${displayName}`;
    } else if (settingsButton) {
        settingsButton.textContent = "Hi there!";
    }     
}

function updateCurrentTask() {
    const task = localStorage.getItem(TASK_STORAGE_KEY);
    currentTask.classList.toggle("is-hidden", currentMode !== "focus");
    currentTaskName.textContent = task || "No task set";
}

function updateDailyFocusSummary() {
    const today = new Date().toDateString();
    const collection = JSON.parse(localStorage.getItem(COLLECTION_STORAGE_KEY) || "[]");
    const completedFocusSeconds = collection
        .filter((session) => session.earnedAt && new Date(session.earnedAt).toDateString() === today)
        .reduce((total, session) => total + (session.focusSeconds || (session.focusMinutes || 0) * 60), 0);
    const activeFocusSeconds = currentMode === "focus" && isRunning
        ? Math.max(0, durations.focus - timeRemaining)
        : 0;
    const focusedMinutes = Math.floor((completedFocusSeconds + activeFocusSeconds) / 60);
    const focusedHours = Math.floor(focusedMinutes / 60);
    const remainingMinutes = focusedMinutes % 60;
    const durationText = focusedHours > 0
        ? `${focusedHours} hour${focusedHours === 1 ? "" : "s"}${remainingMinutes > 0 ? ` and ${remainingMinutes} minute${remainingMinutes === 1 ? "" : "s"}` : ""}`
        : `${focusedMinutes} minute${focusedMinutes === 1 ? "" : "s"}`;

    dailyFocusSummary.textContent = `You've focused for ${durationText} today.`;
}

window.addEventListener("navbar-loaded", updateSettingsButtonLabel);

function submitCustomerName() {
    const name = customerNameInput.value.trim();
    const isTaskOnly = welcomeCard.classList.contains("task-only");

    if (!isTaskOnly && !name) {
        customerNameInput.focus();
        return;
    }

    if (!isTaskOnly) {
        localStorage.setItem(STORAGE_KEY, name);
    }
    localStorage.setItem(TASK_STORAGE_KEY, taskInput.value.trim());
    const selectedDrink = document.querySelector('input[name="drink"]:checked')?.value || DEFAULT_DRINK;
    localStorage.setItem("coffee-break-drink", selectedDrink);
    welcomeOverlay.style.display = "none";
    welcomeCard.classList.remove("task-only");
    continueSound.play();
    updateSettingsButtonLabel();
    updateCurrentTask();
}

welcomeButton.addEventListener("click", submitCustomerName);

customerNameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        submitCustomerName();
    }
});

document.addEventListener("click", (event) => {
    const appNameLink = event.target.closest(".app-name");
    const settingsButton = event.target.closest("#settings-button");
    const newTaskButton = event.target.closest("#new-task-button");

    if (newTaskButton) {
        welcomeCard.classList.add("task-only");
        taskInput.value = "";
        welcomeOverlay.style.display = "flex";
        taskInput.focus();
        return;
    }

    if (settingsButton) {
        welcomeCard.classList.remove("task-only");
        const savedDrink = localStorage.getItem("coffee-break-drink") || DEFAULT_DRINK;
        const selectedInput = document.querySelector(`input[name="drink"][value="${savedDrink}"]`);

        if (selectedInput) selectedInput.checked = true;
        taskInput.value = localStorage.getItem(TASK_STORAGE_KEY) || "";
        welcomeOverlay.style.display = "flex";
        customerNameInput.value = localStorage.getItem(STORAGE_KEY) || "";
        customerNameInput.focus();
        return;
    }

    if (appNameLink) {
        event.preventDefault();
        welcomeCard.classList.remove("task-only");
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem("coffee-break-drink");
        localStorage.removeItem(TASK_STORAGE_KEY);
        welcomeOverlay.style.display = "flex";
        customerNameInput.value = "";
        customerNameInput.focus();
        updateSettingsButtonLabel();
    }
});

const savedName = localStorage.getItem(STORAGE_KEY);

if (savedName) {
    welcomeOverlay.style.display = "none";
} else {
    welcomeOverlay.style.display = "flex";
}

updateSettingsButtonLabel();
updateCurrentTask();
updateDailyFocusSummary();

updateTimerDisplay();
updateButtonState();

devButton.addEventListener("click", () => {
    const isOpen = !devPanel.hidden;
    devPanel.hidden = isOpen;
    devButton.setAttribute("aria-expanded", String(!isOpen));
});

devCompleteButton.addEventListener("click", () => completeSessionForDev("focus"));

document.querySelector("#dev-complete-short-button").addEventListener("click", () => {
    completeSessionForDev("shortBreak");
});

document.querySelector("#dev-complete-long-button").addEventListener("click", () => {
    completeSessionForDev("longBreak");
});

devResetButton.addEventListener("click", () => {
    localStorage.removeItem(COLLECTION_STORAGE_KEY);
    updateDailyFocusSummary();
});

document.addEventListener("click", (event) => {
    if (event.target.closest("#completion-close")) {
        hideCompletionPopup();
    }
});