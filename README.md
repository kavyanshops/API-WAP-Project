# PULSAR - Capstone ISS Tracker

A straightforward, static web application that gives users real-time insights into the International Space Station, outer-space telemetry, and daily space-related news.

## Hosted Website

https://api-wap-project.vercel.app/

## 🚀 Key Features

*   **Live ISS Tracking:** Dynamic tracking map that plots the current coordinates of the ISS in real-time, refreshing every 5 seconds.
*   **Humans in Space:** A live view of the crew currently orbiting Earth, complete with names and their respective spacecrafts.
*   **Space News Hub:** A complete news feed displaying the latest space and astronomy related articles, featuring categorization by news source, search functionality, and a personal ‘Favorites’ list.
*   **Dynamic UI:** Clean grid-based layouts, a dark/light mode toggle, and a dynamic HTML Canvas background.

## 💻 Tech Stack

This project was built focusing on web fundamentals using no external build frameworks:
*   **HTML5** 
*   **CSS3** (Flexbox, CSS Variables)
*   **JavaScript** (DOM Manipulation, Loops, Fetch API)
*   **Leaflet.js** (For interactive map rendering)

### Data Providers (REST APIs)
*   **Wheretheiss API** (`https://api.wheretheiss.at/v1/satellites/25544`) - Coordinates & telemetry of the ISS.
*   **Open-Notify APIs Archive** (`https://corquaid.github.io/international-space-station-APIs/JSON/people-in-space.json`) - Reliable feed of current astronauts.
*   **Spaceflight News API** (`https://api.spaceflightnewsapi.net/v4/articles`) - Live article streaming.

---

## 🛠️ How to Run Locally

Because this project is a purely static website containing only HTML, CSS, and JS files without any dependencies, it is incredibly simple to run on any computer:

### Option 1: Direct File Open (Easiest)
1. Download or clone this repository to your computer.
2. Locate the folder where you saved the files.
3. Simply double-click `index.html`. It will open in your default web browser (Chrome, Safari, Firefox, Edge).
4. *Note: Ensure you have an active internet connection so the Application can fetch the API data and map tiles!*

### Option 2: Live Server (Recommended for Developers)
If you are modifying the code using Visual Studio Code, it's recommended to run a local server:
1. Open this project folder in **Visual Studio Code**.
2. Install the **"Live Server"** extension created by Ritwick Dey from the extensions panel.
3. Right-click on the `index.html` file in the sidebar and select **"Open with Live Server"**.
4. Your browser will automatically open a local server (usually `http://127.0.0.1:5500`) to view the application.

## 📝 Design Notes

*   No complex array methods or advanced modern syntax were used. The application's fundamental logic utilizes loops and straightforward conditionals.
*   Local storage (`localStorage`) is used cleanly to save the user's Dark Mode preference and their favorite News Articles.
