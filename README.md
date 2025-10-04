# 🍅 Pomo-04

A minimalist, highly focused, and persistent Pomodoro Timer application designed to maximize concentration by preventing distractions and screen sleep. Perfect for deep work and study sessions.

## 🚀 Live Demo

Experience the timer live and start your focused work:

[**pomo-04.web.app**](https://www.google.com/search?q=https://pomo-04.web.app)

## ✨ Features

Pomo-04 is built to provide an uninterrupted, distraction-free environment with advanced browser APIs:

| **Feature** | **Description** | 
| :--- | :--- |
| **🧠 Screen Wake Lock** | Uses the Wake Lock API to prevent your screen from dimming or sleeping while the timer is running, ensuring continuous focus. | 
| **🖥️ Fullscreen Mode** | Dedicated fullscreen button provides a completely distraction-free, immersive study environment. | 
| **💾 Persistent Settings** | Saves your customized Study and Break durations using `localStorage`, so your preferences are retained across sessions and refreshes. | 
| **🔔 Desktop Notifications** | Sends OS-level notifications when a session ends (Study -> Break or Break -> Study), even if the tab is minimized or in the background. | 
| **💡 Tab Title Timer** | The remaining time is displayed directly in the browser tab title, allowing you to monitor progress even when viewing other research tabs. | 
| **🎨 Smooth Transitions** | The background color smoothly transitions between Study (Black) and Break (Deep Blue) modes, providing a calming visual cue for the cycle change. | 
| **🔒 Edit Confirmation** | Prevents accidental changes: you cannot edit the Study or Break times while the timer is running. Attempting to edit will prompt a confirmation to pause the timer first. | 

## 💻 How to Use

1. **Set Durations:** Click the editable numbers next to "Study" or "Break" to set your desired time in minutes. This setting is saved automatically.

2. **Start/Pause:** Click the **Start** button to begin the current cycle. The button changes to **Pause**.

3. **Toggle Cycle:** The timer automatically switches from Study to Break mode when time runs out, accompanied by an alarm sound and a desktop notification.

4. **Reset:** Use the **Close (X)** button to stop the timer, release the screen lock, and reset the timer back to the start of the current cycle's duration.

5. **Focus Mode:** Click the **Fullscreen** icon (top-left) to enter a completely immersive, distraction-free mode.

## 🛠️ Technology Stack

This project is a single-page application built for speed and minimalism using core web technologies:

* **HTML5:** Structure and Content

* **CSS3 (Custom):** Styling, layout, and smooth transitions

* **Vanilla JavaScript:** Core logic, state management, and implementation of advanced APIs:

  * `Screen Wake Lock API`

  * `Fullscreen API`

  * `Notification API`

  * `Web Audio API` (for the alarm sound)

## 🏗️ Local Setup

To clone and run Pomo-04 locally:

1. **Clone the repository:**
```bash
git clone https://github.com/theatom06/pomo.git
cd pomo
```
2. Just open `public/index.html` in your favorite web browser (preferably Chrome or Edge for full API support).
