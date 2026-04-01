# Universal Data Hub

Universal Data Hub is a simple responsive web app that fetches live data from a public API and displays it in card form. It lets users search, filter, and sort the results, making the data easier to explore on desktop and mobile devices.

## Public API
This project uses the **REST Countries API**.

- API website: https://restcountries.com/
- Endpoint used: https://restcountries.com/v3.1/all?fields=name,capital,flags,population,region

## Features
- Fetch data using `fetch()`
- Display data dynamically on the page
- Search items by name
- Filter by region
- Sort by name or population
- Show loading and error states
- Responsive layout for mobile, tablet, and desktop

## Technologies
- HTML
- CSS
- Vanilla JavaScript
- REST Countries API

## How It Works
- The page loads live data from the API.
- JavaScript uses array methods like `filter()` and `sort()` to update results.
- The UI updates instantly when the user types, filters, or changes sorting.

## Setup and Run
1. Clone the repository:
   ```bash
   git clone https://github.com/kavyanshops/API-WAP-Project.git
   ```
2. Open the project folder in VS Code.
3. Open `index.html` in a browser.

No extra installation is required.
