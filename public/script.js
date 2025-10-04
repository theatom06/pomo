let wakeLock = null;
let isRunning = false;
let isStudy = true;
let interval;
let remainingSeconds = 25 * 60;
let isEditing = false;
let notificationPermission = Notification.permission; // Store current permission status

// --- DOM Elements ---
const timerEl = document.getElementById("timer");
const startStopBtn = document.getElementById("startStop");
const resetBtn = document.getElementById("reset");
const studyLabel = document.getElementById("studyLabel");
const breakLabel = document.getElementById("breakLabel");
const studyTimeEl = document.getElementById("studyTime");
const breakTimeEl = document.getElementById("breakTime");
const alarmSound = document.getElementById("alarmSound");
const fullscreenBtn = document.getElementById('fullscreen-btn');
const fullscreenIcon = fullscreenBtn.querySelector('.material-icons');

// --- Wake Lock API ---

const requestWakeLock = async () => {
    if ('wakeLock' in navigator && wakeLock === null) {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('Screen Wake Lock acquired.');

            wakeLock.addEventListener('release', () => {
                console.log('Screen Wake Lock released by system.');
                if (isRunning && document.visibilityState === 'visible') {
                    requestWakeLock();
                } else {
                    wakeLock = null;
                }
            });
        } catch (err) {
            console.error(`Wake Lock request failed: ${err.name}, ${err.message}`);
            wakeLock = null;
        }
    }
};

const releaseWakeLock = async () => {
    if (wakeLock !== null) {
        try {
            await wakeLock.release();
            wakeLock = null;
            console.log('Screen Wake Lock released manually.');
        } catch (err) {
            console.error(`Wake Lock release failed: ${err.name}, ${err.message}`);
        }
    }
};

document.addEventListener('visibilitychange', async () => {
    if (isRunning && document.visibilityState === 'visible') {
        await requestWakeLock();
    } else {
        await releaseWakeLock();
    }
});

// --- Fullscreen API ---

fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
            fullscreenIcon.textContent = 'fullscreen_exit';
        }).catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.name}, ${err.message}`);
        });
    } else {
        document.exitFullscreen().then(() => {
            fullscreenIcon.textContent = 'fullscreen';
        }).catch(err => {
            console.error(`Error attempting to exit full-screen mode: ${err.name}, ${err.message}`);
        });
    }
});

document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
        fullscreenIcon.textContent = 'fullscreen_exit';
    } else {
        fullscreenIcon.textContent = 'fullscreen';
    }
});

// --- Utility Functions ---

function getDurations() {
    // Ensure time is an integer and not negative, fallback to default
    let studyM = Math.max(1, parseInt(studyTimeEl.textContent.trim()) || 25);
    let breakM = Math.max(1, parseInt(breakTimeEl.textContent.trim()) || 5);

    // Update the display with the sanitized value
    studyTimeEl.textContent = studyM;
    breakTimeEl.textContent = breakM;

    // Save persistent changes
    localStorage.setItem('studyDuration', studyM);
    localStorage.setItem('breakDuration', breakM);

    return {
        studyM,
        breakM
    };
}

function loadDurations() {
    const savedStudy = localStorage.getItem('studyDuration');
    const savedBreak = localStorage.getItem('breakDuration');

    if (savedStudy) studyTimeEl.textContent = savedStudy;
    if (savedBreak) breakTimeEl.textContent = savedBreak;

    const { studyM } = getDurations();
    remainingSeconds = studyM * 60;
}

function updateLabels() {
    // Disable contenteditable based on running state
    studyTimeEl.contentEditable = !isRunning;
    breakTimeEl.contentEditable = !isRunning;

    if (isEditing) {
        return;
    }

    if (isStudy) {
        studyLabel.className = "label active";
        breakLabel.className = "label inactive";
    } else {
        studyLabel.className = "label inactive";
        breakLabel.className = "label active";
    }
}

function updateDisplay() {
    let m = Math.floor(remainingSeconds / 60);
    let s = remainingSeconds % 60;
    timerEl.textContent = `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
    
    // Persistent Timer in Tab Title
    document.title = `${timerEl.textContent} - ${isStudy ? "Study" : "Break"}`;
}

// --- Notification Logic ---

async function requestNotificationPermission() {
    if (notificationPermission === 'default') {
        notificationPermission = await Notification.requestPermission();
    }
}

function sendNotification(mode) {
    if (notificationPermission === 'granted') {
        const title = mode === 'study' ? "Time for a Break! ☕" : "Back to Work! 🧠";
        const options = {
            body: mode === 'study' ? `Your ${getDurations().studyM}-minute study session is over.` : `Your ${getDurations().breakM}-minute break is over.`,
            icon: 'https://i.imgur.com/your-icon-link.png' // Replace with a small icon for better UX
        };
        new Notification(title, options);
    }
}

// --- Timer Core Logic ---

async function switchMode() {
    // Decide which notification to send BEFORE switching isStudy
    sendNotification(isStudy ? 'study' : 'break');

    let {
        studyM,
        breakM
    } = getDurations();
    isStudy = !isStudy; // Toggle the mode

    if (isStudy) {
        document.body.style.backgroundColor = "#000";
        remainingSeconds = studyM * 60;
    } else {
        // Use the new, slightly more vibrant color for break
        document.body.style.backgroundColor = "#003058"; 
        remainingSeconds = breakM * 60;
        startStopBtn.click(); // Auto-start break mode
    }

    if (isRunning) {
        interval = setInterval(tick, 1000);
        await requestWakeLock();
    } else {
        startStopBtn.textContent = "Start";
    }

    updateLabels();
    updateDisplay();
}

function playAlarm() {
    alarmSound.currentTime = 0;
    alarmSound.play().catch(e => console.log("Audio playback failed:", e));
}

function tick() {
    if (remainingSeconds > 0) {
        remainingSeconds--;
        updateDisplay();
    } else {
        clearInterval(interval);
        isRunning = false;
        playAlarm();
        switchMode();
    }
}

async function toggleStartStop() {
    if (!isRunning) {
        // Starting the timer: Request wake lock and notification permission
        await requestNotificationPermission(); 
        interval = setInterval(tick, 1000);
        isRunning = true;
        startStopBtn.textContent = "Pause";
        await requestWakeLock();
    } else {
        // Pausing the timer: Release wake lock
        clearInterval(interval);
        isRunning = false;
        startStopBtn.textContent = "Start";
        await releaseWakeLock();
    }
    updateLabels(); // Re-evaluate contentEditable state
}

// --- Event Listeners ---

startStopBtn.addEventListener("click", toggleStartStop);

resetBtn.addEventListener("click", async () => {
    if (confirm("Reset the timer?")) {
        clearInterval(interval);
        isRunning = false;
        isStudy = true;
        loadDurations(); // Reload initial state from storage/defaults
        document.body.style.backgroundColor = "#000";
        startStopBtn.textContent = "Start";
        updateDisplay();
        updateLabels();
        await releaseWakeLock();
    }
});

// Editing handlers for labels with Confirmation
[studyTimeEl, breakTimeEl].forEach(el => {
    el.addEventListener("focus", async (e) => {
        // If running, prevent editing and ask for confirmation to pause/edit
        if (isRunning) {
            e.preventDefault();
            e.target.blur(); // Remove the focus indicator immediately

            if (confirm("The timer is running. Do you want to pause it to change the time?")) {
                await toggleStartStop(); // This pauses the timer and releases the lock
                // Now that it's paused, we allow focusing again
                el.focus(); 
            }
            return;
        }

        // If not running (paused or reset), proceed with editing
        isEditing = true;
        if (el === studyTimeEl) {
            studyLabel.className = "label active";
            breakLabel.className = "label inactive";
        } else {
            studyLabel.className = "label inactive";
            breakLabel.className = "label active";
        }
    });

    el.addEventListener("blur", () => {
        isEditing = false;
        getDurations(); // Sanitizes, saves to storage, and updates the time values in the labels
        updateLabels(); // Reverts labels to timer-mode state

        // Update remaining seconds based on which field was blurred and the current mode
        const studyM = (parseInt(studyTimeEl.textContent.trim()) || 25);
        const breakM = (parseInt(breakTimeEl.textContent.trim()) || 5);
        
        if (isStudy) {
            remainingSeconds = studyM * 60;
        } else {
            remainingSeconds = breakM * 60;
        }
        updateDisplay();
    });
});

document.addEventListener("keydown", e => {
    if (e.code === "Space" && e.target.isContentEditable !== true) {
        e.preventDefault();
        toggleStartStop();
    }
});

// Initialization
loadDurations();
updateDisplay();
updateLabels();