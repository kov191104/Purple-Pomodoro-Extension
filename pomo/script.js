// Selecting Elements
const timerText = document.querySelector(".timer-text");
const phaseIndicator = document.querySelector(".phase-indicator");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

// Tab Elements
const timerTab = document.getElementById("timerTab");
const tasksTab = document.getElementById("tasksTab");
const timerSection = document.getElementById("timerSection");
const tasksSection = document.getElementById("tasksSection");

// User-defined input elements
const workInput = document.getElementById("workTimeInput");
const breakInput = document.getElementById("breakTimeInput");
const saveTimeBtn = document.getElementById("saveTimeBtn");

// Retrieve stored values or set defaults
let workTime = parseInt(localStorage.getItem("workTime")) || 25 * 60;
let breakTime = parseInt(localStorage.getItem("breakTime")) || 5 * 60;
let timeLeft = parseInt(localStorage.getItem("timeLeft")) || workTime;
let isRunning = localStorage.getItem("isRunning") === "true";
let isWorkPhase = localStorage.getItem("isWorkPhase") !== "false";
let interval;

// Function to update timer display
function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerText.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
    localStorage.setItem("timeLeft", timeLeft);
}

// Function to start the timer
function startTimer() {
    if (!isRunning) {
        isRunning = true;
        localStorage.setItem("isRunning", "true");

        interval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimer();
            } else {
                clearInterval(interval);
                isRunning = false;
                localStorage.setItem("isRunning", "false");

                // Request permission and send notification
                if (Notification.permission === "granted") {
                    new Notification(isWorkPhase ? "Break Time!" : "Work Time!", {
                        body: `Time to ${isWorkPhase ? "take a break" : "start working"}!`
                    });
                } else if (Notification.permission !== "denied") {
                    Notification.requestPermission().then(permission => {
                        if (permission === "granted") {
                            new Notification(isWorkPhase ? "Break Time!" : "Work Time!", {
                                body: `Time to ${isWorkPhase ? "take a break" : "start working"}!`
                            });
                        }
                    });
                }

                // Switch phases and restart timer
                isWorkPhase = !isWorkPhase;
                timeLeft = isWorkPhase ? workTime : breakTime;
                phaseIndicator.textContent = isWorkPhase ? "Work Time" : "Break Time";

                localStorage.setItem("isWorkPhase", isWorkPhase);
                localStorage.setItem("timeLeft", timeLeft);
                updateTimer();
            }
        }, 1000);
    }
}

// Function to pause the timer
function pauseTimer() {
    clearInterval(interval);
    isRunning = false;
    localStorage.setItem("isRunning", "false");
}

// Function to reset the timer
function resetTimer() {
    clearInterval(interval);
    isRunning = false;
    isWorkPhase = true;
    timeLeft = workTime;
    phaseIndicator.textContent = "Work Time";

    localStorage.setItem("isRunning", "false");
    localStorage.setItem("isWorkPhase", "true");
    localStorage.setItem("timeLeft", workTime);

    updateTimer();
}

// Function to save user-defined time
saveTimeBtn.addEventListener("click", () => {
    let newWorkTime = parseInt(workInput.value) * 60;
    let newBreakTime = parseInt(breakInput.value) * 60;

    if (!isNaN(newWorkTime) && newWorkTime > 0) {
        workTime = newWorkTime;
        localStorage.setItem("workTime", workTime);
    }
    
    if (!isNaN(newBreakTime) && newBreakTime > 0) {
        breakTime = newBreakTime;
        localStorage.setItem("breakTime", breakTime);
    }

    resetTimer(); // Reset and apply new values
});

// Request notification permission when the page loads
if (Notification.permission !== "granted" && Notification.permission !== "denied") {
    Notification.requestPermission();
}

// Event Listeners for Timer Controls
startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

// ---------------------- Tab Functionality ----------------------
timerTab.addEventListener("click", () => {
    timerSection.classList.remove("hidden");
    tasksSection.classList.add("hidden");
    timerTab.classList.add("active");
    tasksTab.classList.remove("active");
});

tasksTab.addEventListener("click", () => {
    timerSection.classList.add("hidden");
    tasksSection.classList.remove("hidden");
    timerTab.classList.remove("active");
    tasksTab.classList.add("active");
});

// ---------------------- Task List Functionality ----------------------
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

// Load Tasks
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
function renderTasks() {
    taskList.innerHTML = "";
    tasks.forEach((task, index) => {
        const li = document.createElement("li");
        li.innerHTML = `${task} <button onclick="removeTask(${index})">❌</button>`;
        taskList.appendChild(li);
    });
}

function removeTask(index) {
    tasks.splice(index, 1);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
}

addTaskBtn.addEventListener("click", () => {
    if (taskInput.value.trim() !== "") {
        tasks.push(taskInput.value);
        localStorage.setItem("tasks", JSON.stringify(tasks));
        taskInput.value = "";
        renderTasks();
    }
});

renderTasks(); // Load tasks on start

// Ensure timer updates correctly after refresh
updateTimer();
if (isRunning) startTimer();
