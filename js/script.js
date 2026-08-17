
const timer = document.querySelector(".timer");
const startButton = document.querySelector("#start-button");

const FOCUS_DURATION = 25 * 60;

let timeRemaining = FOCUS_DURATION;
let isRunning = false;
let timerInterval = null;

// timer display

function updateTimerDisplay(){


      const minutes = Math.floor(timeRemaining / 60);
      const seconds = timeRemaining % 60;

      const formattedMinutes = String(minutes).padStart(2, "0");
      const formattedSeconds = String(seconds).padStart(2, "0");

      timer.textContent = `${formattedMinutes}:${formattedSeconds}`;

}
function startTimer() {
    if (!isRunning) {
        isRunning = true;
        updateButtonState();
        timerInterval = setInterval(function () {
            timeRemaining--;
            updateTimerDisplay();

            if (timeRemaining === 0) {
                clearInterval(timerInterval);
                isRunning = false;
                updateButtonState();
            }
        }, 1000);
    }
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
    updateButtonState();
}

function finishTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
    timeRemaining = 0;
    updateTimerDisplay();
    updateButtonState();
}



function updateButtonState() {
    if (isRunning) {
        startButton.textContent = "Pause Brewing";
    } else if (timeRemaining === 0) {
        startButton.textContent = "Brew Complete ☕";
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