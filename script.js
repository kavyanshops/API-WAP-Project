// STARFIELD ANIMATION

function initStarfield() {
  const canvas = document.getElementById('stars');
  const ctx = canvas.getContext('2d');
  let stars = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createStars();
  }

  function createStars() {
    stars = [];
    for (let i = 0; i < 220; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.4,
        opacity: Math.random(),
        speed: Math.random() * 0.3 + 0.05
      });
    }
  }

  function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < stars.length; i++) {
      let star = stars[i];
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(200,232,240," + star.opacity.toFixed(2) + ")";
      ctx.fill();

      star.opacity += star.speed * 0.018;
      if (star.opacity > 1 || star.opacity < 0) {
        star.speed *= -1;
      }
    }

    requestAnimationFrame(drawStars);
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  drawStars();
}

// THEME TOGGLE

function initThemeToggle() {
  const themeBtn = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const root = document.documentElement;

  // Load saved theme or default to dark
  const savedTheme = localStorage.getItem('spacedev-theme') || 'dark';
  root.setAttribute('data-theme', savedTheme);
  themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

  // Toggle theme on button click
  themeBtn.addEventListener('click', function() {
    const currentTheme = root.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    root.setAttribute('data-theme', newTheme);
    themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('spacedev-theme', newTheme);
  });
}

// ISS TRACKER - MAP AND DATA

let issMap = null;
let issMarker = null;
let issPath = [];
let pathLine = null;

function initMap() {
  issMap = L.map('map', {
    center: [20, 0],
    zoom: 3,
    attributionControl: false
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 6
  }).addTo(issMap);
}

function createISSMarker() {
  const issIcon = L.divIcon({
    className: 'iss-marker',
    html: '<div class="iss-dot"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
  return issIcon;
}

function updateISSPosition() {
  fetch('https://api.wheretheiss.at/v1/satellites/25544')
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      const latitude = parseFloat(data.latitude);
      const longitude = parseFloat(data.longitude);
      const timestamp = new Date(data.timestamp * 1000).toUTCString();

      // Update the display values
      document.getElementById('lat').textContent = latitude.toFixed(4);
      document.getElementById('lon').textContent = longitude.toFixed(4);
      document.getElementById('map-timestamp').textContent = timestamp;

      // Make sure map is initialized before adding marker
      if (!issMap) {
        console.error('Map not initialized yet');
        return;
      }

      // Create or update marker
      const position = [latitude, longitude];
      const issIcon = createISSMarker();

      if (!issMarker) {
        issMarker = L.marker(position, { icon: issIcon }).addTo(issMap);
      } else {
        issMarker.setLatLng(position);
      }

      // Update popup
      const popupText = "<b style='color:#00f5ff'>ISS</b><br>Lat: " + latitude.toFixed(4) + "°<br>Lon: " + longitude.toFixed(4) + "°";
      if (issMarker.getPopup()) {
        issMarker.setPopupContent(popupText);
      } else {
        issMarker.bindPopup(popupText);
      }

      // Track path
      issPath.push(position);
      if (issPath.length > 60) {
        issPath.shift();
      }

      // Draw path line
      if (pathLine) {
        issMap.removeLayer(pathLine);
      }
      if (issPath.length > 1) {
        pathLine = L.polyline(issPath, {
          color: '#00f5ff',
          weight: 1.5,
          opacity: 0.4,
          dashArray: '4 6'
        }).addTo(issMap);
      }

      // Center map on ISS
      issMap.setView(position, issMap.getZoom());
    })
    .catch(function(error) {
      console.error('ISS Fetch Error:', error);
    });
}

// CREW DATA

function loadCrewData() {
  const crewGrid = document.getElementById('crew-grid');

  fetch('https://corquaid.github.io/international-space-station-APIs/JSON/people-in-space.json')
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      if (!data.people || data.people.length === 0) {
        crewGrid.innerHTML = '<p class="loading-text">No crew data available.</p>';
        return;
      }

      // Build crew cards
      let crewHTML = '';
      for (let i = 0; i < data.people.length; i++) {
        let person = data.people[i];
        
        let words = person.name.split(' ');
        let initials = '';
        for (let j = 0; j < words.length; j++) {
            if (words[j].length > 0) {
                initials = initials + words[j][0];
            }
        }
        initials = initials.slice(0, 2).toUpperCase();

        let craft = 'Unknown';
        if (person.craft) {
          craft = person.craft;
        } else if (person.spacecraft) {
          craft = person.spacecraft;
        }

        crewHTML += "<div class='crew-card'>";
        crewHTML += "<div class='crew-avatar'>" + initials + "</div>";
        crewHTML += "<div>";
        crewHTML += "<div class='crew-name'>" + person.name + "</div>";
        crewHTML += "<div class='crew-craft'>" + craft + "</div>";
        crewHTML += "</div></div>";
      }

      crewGrid.innerHTML = crewHTML;

      // Add summary badge
      let crewCount = data.number;
      let craftCounts = {};
      for (let i = 0; i < data.people.length; i++) {
        let person = data.people[i];
        let craft = 'Unknown';
        if (person.craft) {
          craft = person.craft;
        } else if (person.spacecraft) {
          craft = person.spacecraft;
        }
        
        if (craftCounts[craft] === undefined) {
          craftCounts[craft] = 1;
        } else {
          craftCounts[craft] = craftCounts[craft] + 1;
        }
      }

      let craftSummary = '';
      let craftKeys = Object.keys(craftCounts);
      for (let i = 0; i < craftKeys.length; i++) {
        let craft = craftKeys[i];
        craftSummary += craftCounts[craft] + " aboard " + craft;
        if (i < craftKeys.length - 1) {
          craftSummary += " · ";
        }
      }

      const badge = document.createElement('p');
      badge.style.cssText = 'grid-column:1/-1;font-family:"Share Tech Mono",monospace;font-size:0.72rem;letter-spacing:3px;color:var(--cyan-dim);margin-top:0.25rem';
      badge.textContent = "// " + crewCount + " HUMANS IN SPACE — " + craftSummary;
      crewGrid.appendChild(badge);
    })
    .catch(function(error) {
      crewGrid.innerHTML = '<p class="loading-text">Could not load crew data.</p>';
      console.error('Crew Fetch Error:', error);
    });
}

// NEWS HUB

let allArticles = [];
let favoriteIDs = [];
try {
  const stored = JSON.parse(localStorage.getItem('spacedev-favs'));
  if (Array.isArray(stored)) {
    favoriteIDs = stored;
  }
} catch (e) {
  console.warn('Could not parse favoriteIDs:', e);
}
let showingFavoritesOnly = false;

function escapeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(isoDate) {
  if (!isoDate) return '—';
  return new Date(isoDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function saveFavorites() {
  localStorage.setItem('spacedev-favs', JSON.stringify(favoriteIDs));
}

function updateFavoriteBadge() {
  const favBadge = document.getElementById('fav-count');
  if (favoriteIDs.length > 0) {
    const text = favoriteIDs.length === 1 ? 'favourite' : 'favourites';
    favBadge.textContent = `⭐ ${favoriteIDs.length} ${text}`;
  } else {
    favBadge.textContent = '';
  }
}

function loadNewsArticles() {
  const newsGrid = document.getElementById('news-grid');
  const newsLoading = document.getElementById('news-loading');
  const filterSource = document.getElementById('filter-source');

  newsLoading.classList.remove('hidden');
  newsGrid.innerHTML = '';

  fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=80&format=json')
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      if (data.results) {
        allArticles = data.results;
      } else {
        allArticles = [];
      }
      console.log('News articles loaded:', allArticles.length);

      // Populate source filter dropdown
      let sources = [];
      for (let i = 0; i < allArticles.length; i++) {
        let site = allArticles[i].news_site;
        if (site && !sources.includes(site)) {
          sources.push(site);
        }
      }
      sources.sort();

      for (let i = 0; i < sources.length; i++) {
        let option = document.createElement('option');
        option.value = sources[i];
        option.textContent = sources[i];
        filterSource.appendChild(option);
      }

      renderNews();
    })
    .catch(function(error) {
      console.error('News Fetch Error:', error);
      newsLoading.innerHTML = '<p class="loading-text">Failed to load news. Please check your internet connection.</p>';
    });
}

function renderNews() {
  const newsGrid = document.getElementById('news-grid');
  const newsLoading = document.getElementById('news-loading');
  const noResults = document.getElementById('no-results');
  const resultsCount = document.getElementById('results-count');
  const searchInput = document.getElementById('search-input');
  const filterSource = document.getElementById('filter-source');
  const sortSelect = document.getElementById('sort-select');

  // Get filter values
  const searchQuery = searchInput.value.trim().toLowerCase();
  const selectedSource = filterSource.value;
  const sortBy = sortSelect.value;

  // Filter articles
  let filtered = [];
  for (let i = 0; i < allArticles.length; i++) {
    let article = allArticles[i];
    let keep = true;

    // Check favorites
    if (showingFavoritesOnly && !favoriteIDs.includes(article.id)) {
      keep = false;
    }

    // Check source filter
    if (selectedSource !== 'all' && article.news_site !== selectedSource) {
      keep = false;
    }

    // Check search query
    if (searchQuery) {
      let matchTitle = article.title.toLowerCase().includes(searchQuery);
      let matchSummary = false;
      if (article.summary) {
        matchSummary = article.summary.toLowerCase().includes(searchQuery);
      }
      let matchSite = article.news_site.toLowerCase().includes(searchQuery);

      if (!matchTitle && !matchSummary && !matchSite) {
        keep = false;
      }
    }

    if (keep) {
      filtered.push(article);
    }
  }

  // Sort articles
  if (sortBy === 'newest') {
    filtered.sort(function(a, b) { return new Date(b.published_at) - new Date(a.published_at); });
  } else if (sortBy === 'oldest') {
    filtered.sort(function(a, b) { return new Date(a.published_at) - new Date(b.published_at); });
  } else if (sortBy === 'az') {
    filtered.sort(function(a, b) { return a.title.localeCompare(b.title); });
  } else if (sortBy === 'za') {
    filtered.sort(function(a, b) { return b.title.localeCompare(a.title); });
  }

  newsLoading.classList.add('hidden');

  if (filtered.length === 0) {
    newsGrid.innerHTML = '';
    noResults.classList.remove('hidden');
    resultsCount.textContent = '0 articles found';
  } else {
    noResults.classList.add('hidden');
    let countText = filtered.length + ' articles found';
    if (filtered.length === 1) {
       countText = '1 article found';
    }
    resultsCount.textContent = countText;

    let newsHTML = '';
    for (let i = 0; i < filtered.length; i++) {
      let article = filtered[i];
      let isFavorited = favoriteIDs.includes(article.id);
      
      let summary = 'No summary available.';
      if (article.summary) {
        summary = escapeHTML(article.summary.slice(0, 200));
        if (article.summary.length > 200) {
          summary += '…';
        }
      }

      let imageHTML = "<div class='news-card-img-placeholder'>🚀</div>";
      if (article.image_url) {
        imageHTML = "<img class='news-card-img' src='" + article.image_url + "' alt='" + escapeHTML(article.title) + "' loading='lazy'/>";
      }

      let starIcon = '☆';
      if (isFavorited) {
        starIcon = '★';
      }

      let favClass = '';
      if (isFavorited) {
         favClass = 'favourited';
      }

      newsHTML += "<article class='news-card'>";
      newsHTML += imageHTML;
      newsHTML += "<div class='news-card-body'>";
      newsHTML += "<div class='news-card-meta'>";
      newsHTML += "<span class='news-source'>" + escapeHTML(article.news_site) + "</span>";
      newsHTML += "<span class='news-date'>" + formatDate(article.published_at) + "</span>";
      newsHTML += "</div>";
      newsHTML += "<h3 class='news-title'>" + escapeHTML(article.title) + "</h3>";
      newsHTML += "<p class='news-summary'>" + summary + "</p>";
      newsHTML += "<div class='news-card-footer'>";
      newsHTML += "<a class='read-more-btn' href='" + article.url + "' target='_blank' rel='noopener noreferrer'>Read More →</a>";
      newsHTML += "<button class='fav-btn " + favClass + "' data-id='" + article.id + "'>" + starIcon + "</button>";
      newsHTML += "</div></div></article>";
    }

    newsGrid.innerHTML = newsHTML;

    // Add event listeners to favorite buttons
    let favButtons = newsGrid.querySelectorAll('.fav-btn');
    for (let i = 0; i < favButtons.length; i++) {
      favButtons[i].addEventListener('click', function() {
        const articleId = parseInt(this.dataset.id);
        const index = favoriteIDs.indexOf(articleId);

        if (index > -1) {
          favoriteIDs.splice(index, 1);
        } else {
          favoriteIDs.push(articleId);
        }

        saveFavorites();
        this.classList.toggle('favourited');
        if (favoriteIDs.includes(articleId)) {
           this.textContent = '★';
        } else {
           this.textContent = '☆';
        }
        updateFavoriteBadge();

        if (showingFavoritesOnly) {
          renderNews();
        }
      });
    }
  }

  updateFavoriteBadge();
}

function setupNewsControls() {
  const searchInput = document.getElementById('search-input');
  const clearSearch = document.getElementById('clear-search');
  const filterSource = document.getElementById('filter-source');
  const sortSelect = document.getElementById('sort-select');
  const favToggleBtn = document.getElementById('fav-toggle');

  let searchTimeout;

  searchInput.addEventListener('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(renderNews, 280);
  });

  clearSearch.addEventListener('click', function() {
    searchInput.value = '';
    renderNews();
    searchInput.focus();
  });

  filterSource.addEventListener('change', renderNews);
  sortSelect.addEventListener('change', renderNews);

  favToggleBtn.addEventListener('click', function() {
    showingFavoritesOnly = !showingFavoritesOnly;
    this.classList.toggle('active', showingFavoritesOnly);
    this.textContent = showingFavoritesOnly ? '⭐ All Articles' : '⭐ Show Favourites';
    renderNews();
  });
}

// INITIALIZATION - RUN WHEN PAGE LOADS

console.log('Script loaded successfully');

document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 DOMContentLoaded - Starting initialization...');

  // Start animations
  initStarfield();
  console.log('✓ Starfield initialized');

  initThemeToggle();
  console.log('✓ Theme toggle initialized');

  // Initialize ISS tracker
  initMap();
  console.log('✓ Map initialized');

  updateISSPosition();
  setInterval(updateISSPosition, 5000); // Update every 5 seconds
  console.log('✓ ISS tracker started (updates every 5s)');

  // Load crew
  loadCrewData();
  console.log('✓ Loading crew data...');

  // Initialize news hub
  loadNewsArticles();
  console.log('✓ Loading news articles...');

  setupNewsControls();
  console.log('✓ News controls setup');

  console.log('✅ ISS Tracker Ready!');
});
