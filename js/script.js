
const timer = document.querySelector(".timer");
const startButton = document.querySelector("#start-button");

const FOCUS_DURATION = 25 * 60;

let timeRemaining = FOCUS_DURATION;
let isRunning = false;
let isPaused = false;
let timerInterval = null;

// timer display


const modeButtons = document.querySelectorAll(".mode-button");

const defaultDurations = {
    focus: 5,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
};

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



updateTimerDisplay();
updateButtonState();