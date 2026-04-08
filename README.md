# SPACE.DEV - ISS Tracker & Space News

A responsive single-page web app that combines:
- Live International Space Station tracking on an interactive map
- Current astronaut crew data from orbit
- Latest space news with search, filter, sort, and favourites
- A polished portfolio-style UI with animated starfield and theme toggle

This version was rebuilt from scratch because I was not satisfied with the previous version.

## Features

- Real-time ISS telemetry updates every 5 seconds
- Leaflet map with moving ISS marker and recent trajectory path
- Live coordinates and UTC timestamp display
- Current humans-in-space roster with craft grouping summary
- Space news hub:
  - Full-text search (debounced)
  - Source filtering
  - Sorting by date and title
  - Local favourites saved in browser storage
- Light and dark theme switching (persisted in localStorage)
- Mobile-friendly layout

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- Leaflet.js
- Open Notify API
- Spaceflight News API

## APIs Used

- ISS current position: https://api.open-notify.org/iss-now.json
- Astronauts in space: https://api.open-notify.org/astros.json
- Space articles: https://api.spaceflightnewsapi.net/v4/articles/?limit=80&format=json

## Run Locally

No build step is required.

1. Open the project folder.
2. Launch index.html in a browser.

Optional (recommended): run with a local server (for cleaner development workflow), for example VS Code Live Server.

## Project Structure

- index.html - page layout and sections
- style.css - styling, responsive rules, animations, and theme variables
- script.js - starfield animation, ISS tracker logic, crew fetch, and news hub logic

## Personalization

Before publishing, update these placeholders in index.html:
- Hero name (YOUR NAME)
- Footer name (YOUR NAME)
- About text details if needed

## Notes

- Network access is required for live ISS, crew, and news data.
- If an API request fails, fallback messages are shown in the interface.
- Favourites and selected theme are stored in localStorage per browser.

## License

This project is for educational and portfolio use.
