(() => {
  'use strict';
  const cards = JSON.parse(document.getElementById('atlas-data').textContent);
  const sourceById = new Map(PLACES.map(place => [place.id, place]));
  const tourismById = new Map(TOURISM.map(item => [item.id, item]));
  const guidePaths = {
    season:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/>',
    location:'<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    tips:'<path d="M9 18h6m-5 3h4M8 14c-1.5-1.3-2-2.8-2-4a6 6 0 1 1 12 0c0 1.2-.5 2.7-2 4l-1 2H9l-1-2Z"/>',
    nature:'<path d="M12 21V9m0 8C7 16 5 12 5 7c6 0 9 4 7 10Zm0-3c0-5 3-8 8-9 0 5-3 9-8 9Z"/>',
    history:'<path d="M3 21h18M5 21V9l7-6 7 6v12M9 21v-8h6v8M5 10h14"/>',
    modern:'<path d="M4 21h16M6 21V8l6-5 6 5v13M10 11h4m-4 4h4"/>',
    science:'<circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(35 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-35 12 12)"/>',
    sources:'<path d="M9 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-4M12 12 21 3m-5 0h5v5"/>'
  };
  function placeIcon(id){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','2');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');svg.setAttribute('aria-hidden','true');svg.innerHTML=MARKER_ICONS[id]||'';return svg}
  function guideIcon(name){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.8');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');svg.setAttribute('aria-hidden','true');svg.innerHTML=guidePaths[name]||'';return svg}
  function guideLine(className,iconName,text){const p=document.createElement('p');p.className=className;p.append(guideIcon(iconName),document.createTextNode(text));return p}
  const svg = document.getElementById('atlas');
  const frame = document.getElementById('map-frame');
  const project = document.getElementById('project-map');
  const projectStage = document.getElementById('project-stage');
  const projectPins = document.getElementById('project-pins');
  const projectPinOffsets = {charyn:[-30,-23],kolsai:[-17,22],kaindy:[27,19],turkistan:[-19,-13],yasawi:[20,13]};
  const mobilePinOffsets = {altyn:[11,-40],burabay:[-21,-17],baikonur:[-25,-25],balkhash:[-35,-1]};
  const mediumPinOffsets = {altyn:[7,-43],burabay:[-35,-20]};
  const pinOffsetProfile = () => window.matchMedia('(max-width:560px)').matches ? 'mobile' : window.matchMedia('(max-width:1600px)').matches ? 'medium' : 'wide';
  const cardPanel = document.getElementById('card-panel');
  const search = document.getElementById('search');
  let category = 'all', selected = null;
  window.__mapMode = 'atlas';

  function matches(place) {
    const query = search.value.trim().toLocaleLowerCase();
    const source = sourceById.get(place.id);
    return (category === 'all' || place.category === category) &&
      (!query || `${place.name} ${place.region} ${source?.feature || ''}`.toLocaleLowerCase().includes(query));
  }
  const visible = () => cards.filter(matches);
  function selectById(id) {
    if (!visible().some(place => place.id === id)) {
      category = 'all'; search.value = ''; applyFilters();
    }
    showSection('map');
    document.dispatchEvent(new CustomEvent('atlas:request-select', {detail:{id}}));
  }
  document.addEventListener('map:select-place', event => selectById(event.detail.id));

  function openFromGuide(id) {
    showSection('map');
    selectById(id);
    document.getElementById('shell').scrollIntoView({block: 'start', behavior: 'auto'});
  }
  function drawGuide() {
    const grid = document.getElementById('guide-grid'); grid.replaceChildren();
    for (const place of cards) {
      const travel = tourismById.get(place.id); if (!travel) continue;
      const item = document.createElement('article'); item.className = 'guide-card';
      const category=place.category==='history'?'History & Culture':place.category==='modern'?'Architecture':place.category==='science'?'Science':'Nature';
      item.append(guideLine(`guide-category ${place.category}`,place.category,category));
      const name = document.createElement('h3'); name.textContent = place.name; item.append(name);
      item.append(guideLine('guide-region','location',place.region));
      if (travel.season) item.append(guideLine('guide-season','season',`Best time to visit: ${travel.season}`));
      if (travel.tip) item.append(guideLine('guide-tip','tips',`Travel Tips: ${travel.tip}`));
      if (place.coordinateConfidence === 'low') {const warning = document.createElement('p'); warning.className = 'guide-warning'; warning.textContent = 'Approximate marker. Confirm the exact visitor location before travelling.'; item.append(warning)}
      const sources = document.createElement('div'); sources.className = 'guide-sources';sources.append(guideLine('guide-sources-title','sources','Official Sources'));
      for (const [label,url] of travel.sources) {const source = document.createElement('a'); source.href = url; source.textContent = `${label} ↗`; source.target = '_blank'; source.rel = 'noopener noreferrer'; sources.append(source)}
      item.append(sources);
      const open = document.createElement('button'); open.type = 'button'; open.textContent = 'View place on map'; open.addEventListener('click', () => openFromGuide(place.id)); item.append(open); grid.append(item);
    }
  }

  function drawFilters() {
    const box = document.getElementById('filters');
    box.replaceChildren();
    for (const item of CATEGORIES) {
      const button = document.createElement('button');
      button.type = 'button'; button.className = `filter-chip ${item.id}`;
      button.textContent = item.label; button.setAttribute('aria-pressed', String(category === item.id));
      button.addEventListener('click', () => {category = item.id; applyFilters()});
      box.append(button);
    }
  }
  function drawList() {
    const box = document.getElementById('destination-list');
    box.replaceChildren();
    const items = visible();
    document.getElementById('result-count').textContent = `${items.length} / ${cards.length}`;
    if (!items.length) {
      const empty = document.createElement('p'); empty.className = 'empty-state';
      empty.textContent = 'No places found. Try another search or category.'; box.append(empty); return;
    }
    for (const place of items) {
      const button = document.createElement('button');
      button.type = 'button'; button.className = `destination-row ${place.category}`;
      button.dataset.id = place.id; button.setAttribute('aria-current', String(selected === place.id));
      const number = document.createElement('span'); number.className = 'destination-number'; number.append(placeIcon(place.id));const smallNumber=document.createElement('small');smallNumber.textContent=place.number;number.append(smallNumber);
      const copy = document.createElement('span'); copy.className = 'destination-copy';
      const title = document.createElement('strong'); title.textContent = place.name;
      const region = document.createElement('small'); region.textContent = place.region;
      copy.append(title, region); button.append(number, copy);
      button.addEventListener('click', () => selectById(place.id)); box.append(button);
    }
  }
  function drawProjectPins() {
    projectPins.replaceChildren();
    for (const place of visible()) {
      const position = ILLUSTRATED_POSITIONS[place.id];
      const button = document.createElement('button'); button.type = 'button';
      button.className = `project-pin ${place.category}${place.coordinateConfidence === 'low' ? ' provisional' : ''}${selected === place.id ? ' selected' : ''}`;
      button.style.left = `${position[0] / 1609 * 100}%`;
      button.style.top = `${position[1] / 1014 * 100}%`;
      const profile = pinOffsetProfile();
      const offset = (profile === 'mobile' && mobilePinOffsets[place.id]) || (profile === 'medium' && mediumPinOffsets[place.id]) || projectPinOffsets[place.id];
      if (offset) {
        button.classList.add('shifted');
        button.style.setProperty('--pin-x',`${offset[0]}px`);
        button.style.setProperty('--pin-y',`${offset[1]}px`);
        const leader=document.createElement('span');leader.className='pin-leader';leader.style.width=`${Math.hypot(...offset)}px`;leader.style.transform=`rotate(${Math.atan2(-offset[1],-offset[0])}rad)`;
        const anchor=document.createElement('span');anchor.className='pin-anchor';button.append(leader,anchor);
      }
      button.append(placeIcon(place.id));const pinNumber=document.createElement('small');pinNumber.className='pin-number';pinNumber.textContent=place.number;button.append(pinNumber);button.title = place.name;
      button.setAttribute('aria-label', `Explore ${place.name}`);
      button.addEventListener('click', () => selectById(place.id)); projectPins.append(button);
    }
  }
  function sizeProjectStage() {
    const width = project.clientWidth, height = project.clientHeight;
    if (!width || !height) return;
    const scale = Math.min(width / 1609, height / 1014) * .98;
    projectStage.style.width = `${1609 * scale}px`;
    projectStage.style.height = `${1014 * scale}px`;
  }
  function applyFilters() {
    drawFilters(); drawList();
    const allowed = new Set(visible().map(place => place.id));
    svg.querySelectorAll('.marker').forEach(marker => {marker.style.display = allowed.has(marker.dataset.id) ? '' : 'none'});
    drawProjectPins();
    if (selected && !allowed.has(selected)) cardPanel.querySelector('.card-close')?.click();
  }

  function setCredit(mode) {
    const credit = document.getElementById('map-credit'); credit.replaceChildren();
    if (mode === 'atlas') credit.textContent = 'Natural Earth boundaries, lakes and relief · public domain';
    else credit.textContent = 'Original project map · publication rights not yet confirmed';
  }
  function setMapMode(mode) {
    if (mode !== 'atlas' && mode !== 'project') return;
    window.__mapMode = mode;
    frame.classList.toggle('project-mode', mode === 'project');
    svg.toggleAttribute('hidden', mode !== 'atlas'); project.hidden = mode !== 'project';
    for (const name of ['atlas','project']) document.getElementById(`${name}-view`).setAttribute('aria-pressed', String(mode === name));
    setCredit(mode);
    if (mode === 'project') {sizeProjectStage(); drawProjectPins()}
  }

  function showSection(section) {
    document.getElementById('shell').hidden = section !== 'map';
    for (const name of ['guide','learn','quiz','about']) document.getElementById(`${name}-section`).hidden = section !== name;
    document.querySelectorAll('[data-section]').forEach(button => {
      if (button.closest('.top-nav')) {
        if (button.dataset.section === section) button.setAttribute('aria-current', 'page');
        else button.removeAttribute('aria-current');
      }
    });
    if (section !== 'map' && !cardPanel.hidden) cardPanel.querySelector('.card-close')?.click();
    if (section === 'map' && window.__mapMode === 'project') requestAnimationFrame(sizeProjectStage);
  }

  search.addEventListener('input', applyFilters);
  document.getElementById('reset').addEventListener('click', () => {category = 'all'; search.value = ''; applyFilters()});
  for (const mode of ['atlas','project']) document.getElementById(`${mode}-view`).addEventListener('click', () => setMapMode(mode));
  document.querySelectorAll('[data-section]').forEach(button => button.addEventListener('click', () => showSection(button.dataset.section)));
  document.addEventListener('atlas:select', event => {
    selected = event.detail.id;
    if (!visible().some(place => place.id === selected)) {category = 'all'; search.value = ''; applyFilters()}
    drawList(); drawProjectPins();
    if (window.__mapMode === 'project') requestAnimationFrame(sizeProjectStage);
    const sidebar = document.querySelector('.explore-panel');
    const row = document.getElementById('destination-list').querySelector(`[data-id="${selected}"]`);
    if (row) {
      const outer = sidebar.getBoundingClientRect(), inner = row.getBoundingClientRect();
      if (inner.bottom > outer.bottom - 8) sidebar.scrollTop += inner.bottom - outer.bottom + 8;
      else if (inner.top < outer.top + 8) sidebar.scrollTop -= outer.top - inner.top + 8;
    }
  });
  document.addEventListener('atlas:clear', () => {selected = null; drawList(); drawProjectPins(); if (window.__mapMode === 'project') requestAnimationFrame(sizeProjectStage)});
  document.addEventListener('keydown', event => {
    if (event.key === '/' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) {event.preventDefault(); search.focus()}
    if (event.key === 'Escape' && document.activeElement === search) {search.value = ''; applyFilters(); search.blur()}
  });
  let previousPinProfile = pinOffsetProfile();
  window.addEventListener('resize', () => {
    sizeProjectStage();
    const profile = pinOffsetProfile();
    if (profile !== previousPinProfile) {previousPinProfile = profile; drawProjectPins()}
  });
  drawGuide();
  applyFilters(); setMapMode('atlas'); showSection('map');
})();
