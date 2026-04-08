'use strict';

// Starfield
(function() {
  const canvas = document.getElementById('stars'), ctx = canvas.getContext('2d');
  let stars = [];
  const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight; buildStars(); };
  const buildStars = () => { stars = Array.from({length: 220}, () => ({x: Math.random()*canvas.width, y: Math.random()*canvas.height, r: Math.random()*1.4, alpha: Math.random(), speed: Math.random()*0.3+0.05})); };
  (function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => { ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fillStyle = `rgba(200,232,240,${s.alpha.toFixed(2)})`; ctx.fill(); s.alpha += s.speed*0.018; if (s.alpha > 1 || s.alpha < 0) s.speed *= -1; });
    requestAnimationFrame(draw);
  })();
  resize(); addEventListener('resize', resize);
})();

// Theme Toggle
(function() {
  const btn = document.getElementById('theme-toggle'), icon = document.getElementById('theme-icon'), root = document.documentElement;
  const saved = localStorage.getItem('spacedev-theme') || 'dark';
  root.setAttribute('data-theme', saved);
  icon.textContent = saved === 'dark' ? '☀️' : '🌙';
  btn.onclick = () => { const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'; root.setAttribute('data-theme', next); icon.textContent = next === 'dark' ? '☀️' : '🌙'; localStorage.setItem('spacedev-theme', next); };
})();

// ISS Tracker
(function() {
  const map = L.map('map', {center: [0,0], zoom: 2, attributionControl: false});
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 6}).addTo(map);
  const issIcon = L.divIcon({className: '', html: '<div class="iss-dot"></div>', iconSize: [16,16], iconAnchor: [8,8]});
  let marker = null, path = [], line = null;

  async function fetchISS() {
    try {
      const data = await (await fetch('https://api.open-notify.org/iss-now.json')).json();
      const lat = parseFloat(data.iss_position.latitude).toFixed(4);
      const lon = parseFloat(data.iss_position.longitude).toFixed(4);
      document.getElementById('lat').textContent = lat;
      document.getElementById('lon').textContent = lon;
      document.getElementById('map-timestamp').textContent = new Date(data.timestamp * 1000).toUTCString();
      const pos = [+lat, +lon];
      if (!marker) marker = L.marker(pos, {icon: issIcon}).addTo(map).bindPopup(`<b style="font-family:monospace;color:#00f5ff">ISS</b><br>Lat: ${lat}°<br>Lon: ${lon}°`);
      else { marker.setLatLng(pos).setPopupContent(`<b style="font-family:monospace;color:#00f5ff">ISS</b><br>Lat: ${lat}°<br>Lon: ${lon}°`); }
      path.push(pos); if (path.length > 60) path.shift();
      if (line) map.removeLayer(line);
      if (path.length > 1) line = L.polyline(path, {color: '#00f5ff', weight: 1.5, opacity: 0.4, dashArray: '4 6'}).addTo(map);
      map.setView(pos, map.getZoom());
    } catch(e) { console.warn('[ISS]', e); }
  }
  fetchISS(); setInterval(fetchISS, 5000);

  async function fetchCrew() {
    const grid = document.getElementById('crew-grid');
    try {
      const data = await (await fetch('https://api.open-notify.org/astros.json')).json();
      if (!data.people?.length) { grid.innerHTML = '<p class="loading-text">No crew data available.</p>'; return; }
      grid.innerHTML = data.people.map(p => `<div class="crew-card"><div class="crew-avatar">${p.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}</div><div><div class="crew-name">${p.name}</div><div class="crew-craft">${p.craft}</div></div></div>`).join('');
      const counts = data.people.reduce((a, p) => (a[p.craft] = (a[p.craft]||0)+1, a), {});
      const badge = document.createElement('p');
      badge.style.cssText = 'grid-column:1/-1;font-family:"Share Tech Mono",monospace;font-size:0.72rem;letter-spacing:3px;color:var(--cyan-dim);margin-top:0.25rem';
      badge.textContent = `// ${data.number} HUMANS IN SPACE — ${Object.entries(counts).map(([c,n])=>`${n} aboard ${c}`).join(' · ')}`;
      grid.appendChild(badge);
    } catch(e) { grid.innerHTML = '<p class="loading-text">Could not load crew data.</p>'; }
  }
  fetchCrew();
})();


// News Hub
(function() {
  const $ = id => document.getElementById(id);
  const newsGrid = $('news-grid'), newsLoading = $('news-loading'), noResults = $('no-results');
  const resultsCount = $('results-count'), favCountEl = $('fav-count'), searchInput = $('search-input');
  const clearSearch = $('clear-search'), filterSource = $('filter-source'), sortSelect = $('sort-select'), favToggleBtn = $('fav-toggle');
  let allArticles = [], favouriteIDs = JSON.parse(localStorage.getItem('spacedev-favs')) || [], showingFavs = false;

  const escapeHtml = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const formatDate = iso => iso ? new Date(iso).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'}) : '—';
  const saveFavs = () => localStorage.setItem('spacedev-favs', JSON.stringify(favouriteIDs));
  const updateFavBadge = () => favCountEl.textContent = favouriteIDs.length ? `⭐ ${favouriteIDs.length} favourite${favouriteIDs.length>1?'s':''}` : '';

  async function fetchNews() {
    newsLoading.classList.remove('hidden'); newsGrid.innerHTML = '';
    try {
      allArticles = (await (await fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=80&format=json')).json()).results || [];
      [...new Set(allArticles.map(a=>a.news_site).filter(Boolean))].sort().forEach(s => { const o = document.createElement('option'); o.value = o.textContent = s; filterSource.appendChild(o); });
      render();
    } catch(e) { newsLoading.innerHTML = '<p class="loading-text">Failed to load news. Please refresh.</p>'; }
  }

  function render() {
    const q = searchInput.value.trim().toLowerCase(), src = filterSource.value, sort = sortSelect.value;
    let res = showingFavs ? allArticles.filter(a => favouriteIDs.includes(a.id)) : [...allArticles];
    if (src !== 'all') res = res.filter(a => a.news_site === src);
    if (q) res = res.filter(a => a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q) || a.news_site.toLowerCase().includes(q));
    res.sort((a,b) => sort==='newest' ? new Date(b.published_at)-new Date(a.published_at) : sort==='oldest' ? new Date(a.published_at)-new Date(b.published_at) : sort==='az' ? a.title.localeCompare(b.title) : sort==='za' ? b.title.localeCompare(a.title) : 0);
    newsLoading.classList.add('hidden');
    if (!res.length) { newsGrid.innerHTML = ''; noResults.classList.remove('hidden'); resultsCount.textContent = '0 articles found'; }
    else {
      noResults.classList.add('hidden');
      resultsCount.textContent = `${res.length} article${res.length>1?'s':''} found`;
      newsGrid.innerHTML = res.map(a => {
        const isFav = favouriteIDs.includes(a.id), sum = a.summary ? escapeHtml(a.summary.slice(0,200)) + (a.summary.length>200?'…':'') : 'No summary available.';
        return `<article class="news-card">${a.image_url ? `<img class="news-card-img" src="${a.image_url}" alt="${escapeHtml(a.title)}" loading="lazy"/>` : '<div class="news-card-img-placeholder">🚀</div>'}<div class="news-card-body"><div class="news-card-meta"><span class="news-source">${escapeHtml(a.news_site)}</span><span class="news-date">${formatDate(a.published_at)}</span></div><h3 class="news-title">${escapeHtml(a.title)}</h3><p class="news-summary">${sum}</p><div class="news-card-footer"><a class="read-more-btn" href="${a.url}" target="_blank" rel="noopener noreferrer">Read More →</a><button class="fav-btn ${isFav?'favourited':''}" data-id="${a.id}">${isFav?'★':'☆'}</button></div></div></article>`;
      }).join('');
      newsGrid.querySelectorAll('.fav-btn').forEach(btn => btn.onclick = () => {
        const id = +btn.dataset.id, idx = favouriteIDs.indexOf(id);
        idx > -1 ? favouriteIDs.splice(idx,1) : favouriteIDs.push(id);
        saveFavs(); btn.classList.toggle('favourited'); btn.textContent = favouriteIDs.includes(id) ? '★' : '☆'; updateFavBadge();
        if (showingFavs) render();
      });
    }
    updateFavBadge();
  }

  let timer; searchInput.oninput = () => { clearTimeout(timer); timer = setTimeout(render, 280); };
  clearSearch.onclick = () => { searchInput.value = ''; render(); searchInput.focus(); };
  filterSource.onchange = sortSelect.onchange = render;
  favToggleBtn.onclick = () => { showingFavs = !showingFavs; favToggleBtn.classList.toggle('active', showingFavs); favToggleBtn.textContent = showingFavs ? '⭐ All Articles' : '⭐ Show Favourites'; render(); };
  fetchNews();
})();