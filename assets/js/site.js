/* ONE+ Events — shared site behavior (lang toggle, reveal, hero canvas, portfolio, form) */

/* ---------- MEDIA PROTECTION (deter casual saving of project photos/videos) ---------- */
// Not a real DRM barrier -- nothing client-side can fully stop a determined visitor
// (devtools, screenshots, view-source). This just removes the one-click paths (right-click
// save, drag-to-desktop, the video player's native "Download" menu item) so casual
// copying/misattribution takes real effort instead of one click. Delegated on `document`
// so it also covers the homepage's #work-grid cards, which are injected by JS after this
// script runs (loadProjects() below), not present in the initial DOM.
const MEDIA_PROTECT_SELECTOR = '.project-gallery, .project-hero-img, .work-media, .work-grid';
document.addEventListener('contextmenu', e => {
  if (e.target.closest(MEDIA_PROTECT_SELECTOR)) e.preventDefault();
});
document.addEventListener('dragstart', e => {
  if (e.target.closest(MEDIA_PROTECT_SELECTOR)) e.preventDefault();
});
document.querySelectorAll('.project-gallery video, .project-hero video').forEach(v => {
  v.setAttribute('controlsList', 'nodownload noremoteplayback');
  v.disablePictureInPicture = true;
});

/* ---------- LANGUAGE TOGGLE ---------- */
let isAR = document.documentElement.getAttribute('lang') === 'ar';
function applyLang(){
  const root = document.documentElement, body = document.body;
  root.setAttribute('dir', isAR ? 'rtl' : 'ltr');
  root.setAttribute('lang', isAR ? 'ar' : 'en');
  body.classList.toggle('rtl', isAR);
  const btn = document.getElementById('lang');
  if (btn) btn.textContent = isAR ? 'EN' : 'ع';
  document.querySelectorAll('[data-en]').forEach(el => {
    const val = isAR ? el.getAttribute('data-ar') : el.getAttribute('data-en');
    if (val != null) el.innerHTML = val;
  });
}
function toggleLang(){
  isAR = !isAR;
  // Filter labels are re-translated below, so a filter selected in the old language
  // (e.g. "Conference") can never match any item's newly-rendered dataset.evtype
  // (e.g. "مؤتمر") -- every project silently got marked filtered-out (display:none),
  // which read as "switching to Arabic makes the project images disappear."
  activeFilter = 'all';
  applyLang(); renderFilters(); renderProjects(); renderArticles(); renderArticlesArchive(); renderNews(); renderNewsTicker(); renderNewsPage(); if (window.updateAssistantLang) window.updateAssistantLang();
}
applyLang();

/* ---------- MOBILE NAV ---------- */
(function(){
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;
  function close(){ menu.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  menu.querySelectorAll('.mobile-link').forEach(a => a.addEventListener('click', close));
})();

/* ---------- NAV SCROLL STATE (transparent-over-hero -> glass bar once scrolled) ---------- */
(function(){
  const nav = document.querySelector('.nav');
  if (!nav) return;
  function update(){ nav.classList.toggle('scrolled', window.scrollY > 40); }
  update();
  addEventListener('scroll', update, { passive: true });
})();

/* ---------- RIYADH CLOCK ---------- */
function tick(){
  const el = document.getElementById('clock');
  if (!el) return;
  const t = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Riyadh', hour: '2-digit', minute: '2-digit' });
  el.textContent = 'RUH ' + t;
}
tick(); setInterval(tick, 10000);

/* ---------- SCROLL REVEAL ---------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.12 });
function observeReveals(root){ (root || document).querySelectorAll('.reveal:not(.in)').forEach(el => io.observe(el)); }
observeReveals();

/* ---------- PORTFOLIO GRID (data/projects.json → work-grid) ---------- */
let PROJECTS = [];
let activeFilter = 'all';
// event_type is a bilingual {en, ar} object for the launch projects, or a single
// inferred string for synced projects (folder-name inference has no language split yet).
function projectEvType(p){
  return p.event_type ? (typeof p.event_type === 'object' ? (isAR ? p.event_type.ar : p.event_type.en) : p.event_type) : '';
}
async function loadProjects(){
  const grid = document.getElementById('work-grid');
  if (!grid) return;
  try {
    const res = await fetch('/data/projects.json', { cache: 'no-store' });
    PROJECTS = await res.json();
    renderFilters();
    renderProjects();
  } catch (e) {
    grid.innerHTML = '';
  }
}
function renderFilters(){
  const bar = document.getElementById('work-filters');
  if (!bar || !PROJECTS.length) return;
  const types = [...new Set(PROJECTS.map(projectEvType).filter(Boolean))];
  if (types.length < 2) { bar.innerHTML = ''; return; }
  const allLabel = isAR ? 'الكل' : 'All';
  bar.innerHTML = [allLabel === allLabel ? `<button class="work-filter${activeFilter==='all'?' active':''}" data-filter="all">${allLabel}</button>` : '']
    .concat(types.map(t => `<button class="work-filter${activeFilter===t?' active':''}" data-filter="${t.replace(/"/g,'&quot;')}">${t}</button>`))
    .join('');
  bar.querySelectorAll('.work-filter').forEach(btn => btn.addEventListener('click', () => {
    activeFilter = btn.dataset.filter;
    renderFilters();
    applyFilter();
  }));
}
function applyFilter(){
  document.querySelectorAll('#work-grid .work-item').forEach(item => {
    const match = activeFilter === 'all' || item.dataset.evtype === activeFilter;
    item.classList.toggle('filtered-out', !match);
  });
}
function renderProjects(){
  const grid = document.getElementById('work-grid');
  if (!grid || !PROJECTS.length) return;
  grid.innerHTML = PROJECTS.map((p, i) => {
    const wide = p.featured ? ' wide' : '';
    // media[0] is a plain URL string for the 9 hand-built launch projects, or a richer
    // {type, role, url, poster_url} object for anything synced later by WEB_Project_Sync.
    const first = p.media && p.media[0];
    const img = typeof first === 'string' ? first : (first ? (first.poster_url || first.url || '') : '');
    const evType = projectEvType(p);
    return `<a class="work-item${wide} reveal" href="/work/${p.slug}/" data-evtype="${evType.replace(/"/g,'&quot;')}">
      <img class="work-media" alt="${p.client}" src="${img}" loading="${i < 2 ? 'eager' : 'lazy'}" width="800" height="550"/>
      <div class="work-grad"></div>
      <svg class="work-wire" viewBox="0 0 400 300" fill="none" stroke="currentColor" stroke-width="0.75" aria-hidden="true">
        <path d="M40 240 L200 160 L360 240 L200 300 Z"/><path d="M40 240 L40 80 L200 20 L200 160"/><path d="M360 240 L360 80 L200 20"/><path d="M200 160 L200 300"/><path d="M40 80 L200 140 L360 80"/><path d="M200 140 L200 20"/>
      </svg>
      ${p.featured ? `<div class="work-tag" data-en="Featured" data-ar="مميّز">${isAR ? 'مميّز' : 'Featured'}</div>` : ''}
      <div class="work-meta">
        <div class="work-client">${p.client}</div>
        <div class="work-line"><span>${evType}</span></div>
      </div>
    </a>`;
  }).join('');
  observeReveals(grid);
  applyFilter();
}
loadProjects();

/* ---------- INSIGHTS (data/articles.json → insights-list / articles-archive-list, P4 + P4-B) ---------- */
// title/meta_description are a plain string for articles published before P4-B (Arabic-only,
// no /en/ page exists yet) or a bilingual {ar,en} object for anything published since.
let ARTICLES = [];
function articleCardHtml(a){
  const bilingual = a.title && typeof a.title === 'object';
  const title = bilingual ? ((isAR ? a.title.ar : a.title.en) || a.title.ar || a.title.en) : a.title;
  const desc = bilingual ? ((isAR ? a.meta_description.ar : a.meta_description.en) || '') : (a.meta_description || '');
  const href = '/articles/' + a.slug + '/' + (bilingual && !isAR ? 'en/' : '');
  return `<a class="insight-item reveal" href="${href}">
    <div class="insight-title">${title}</div>
    <div class="insight-desc">${desc}</div>
  </a>`;
}
async function loadArticles(){
  try {
    const res = await fetch('/data/articles.json', { cache: 'no-store' });
    ARTICLES = await res.json();
  } catch (e) {
    ARTICLES = [];
  }
  renderArticles();
  renderArticlesArchive();
}
function renderArticles(){
  const section = document.getElementById('insights');
  const list = document.getElementById('insights-list');
  if (!section || !list) return;
  if (!Array.isArray(ARTICLES) || ARTICLES.length === 0) { section.style.display = 'none'; return; }
  section.style.display = '';
  list.innerHTML = ARTICLES.slice(0, 6).map(articleCardHtml).join('');
  observeReveals(list);
}
// Full archive at /articles/ -- only that page has #articles-archive-list, so this is a
// no-op everywhere else.
function renderArticlesArchive(){
  const list = document.getElementById('articles-archive-list');
  if (!list) return;
  const count = document.getElementById('articles-archive-count');
  if (count) count.textContent = Array.isArray(ARTICLES) ? String(ARTICLES.length) : '0';
  list.innerHTML = Array.isArray(ARTICLES) ? ARTICLES.map(articleCardHtml).join('') : '';
  observeReveals(list);
}
loadArticles();

/* ---------- NEWS (data/news.json — Exhibition & Events News Intelligence, S84) ---------- */
let NEWS_ITEMS = [];
let NEWS_FILTER = 'all';
async function loadNews(){
  try {
    const res = await fetch('/data/news.json', { cache: 'no-store' });
    const j = await res.json();
    NEWS_ITEMS = Array.isArray(j) ? j : [];
  } catch (e) { NEWS_ITEMS = []; }
  renderNews();
  renderNewsTicker();
  renderNewsPage();
  wireNewsFilters();
}
function newsFields(n){
  const t = n.title || {}, s = n.summary || {};
  return {
    title: (isAR ? t.ar : t.en) || t.en || t.ar || (typeof n.title === 'string' ? n.title : ''),
    summary: (isAR ? s.ar : s.en) || s.en || s.ar || '',
    url: n.url || '#', source: n.source || '', date: n.date && n.date !== 'null' ? n.date : '',
    geo: n.geo || '', topic: n.topic || '', priority: n.priority || '', image: n.image || ''
  };
}
function newsMatches(n, f){
  if (f === 'all') return true;
  if (f === 'saudi')  return ['saudi','riyadh','jeddah'].indexOf(n.geo) >= 0;
  if (f === 'riyadh') return n.geo === 'riyadh';
  if (f === 'global') return ['global','mena'].indexOf(n.geo) >= 0;
  return n.topic === f; // exhibition | conference | industry
}
/* homepage: compact section, top 5 (hidden when empty) */
function renderNews(){
  const section = document.getElementById('news');
  const list = document.getElementById('news-list');
  if (!section || !list) return;
  if (!NEWS_ITEMS.length) { section.style.display = 'none'; return; }
  section.style.display = '';
  // homepage news links go to /news/ first — the source link lives on the /news/ page cards.
  list.innerHTML = NEWS_ITEMS.slice(0, 5).map(raw => {
    const n = newsFields(raw);
    return `<a class="insight-item reveal" href="/news/">
    <div class="insight-title">${n.title}</div>
    <div class="insight-desc">${n.summary}</div>
    <div class="insight-desc" style="opacity:.6;margin-top:8px">${n.source}${n.date ? ' &middot; ' + n.date : ''}</div>
  </a>`;
  }).join('') + `<a class="insights-more-link reveal" href="/news/" data-en="All exhibition news &rarr;" data-ar="&larr; كل أخبار المعارض">${isAR ? '← كل أخبار المعارض' : 'All exhibition news →'}</a>`;
  observeReveals(list);
}
/* homepage: scrolling industry-wire ticker (same data, sits above #work) */
function renderNewsTicker(){
  const bar = document.getElementById('newsbar');
  const track = document.getElementById('newsbar-track');
  if (!bar || !track) return;
  if (!NEWS_ITEMS.length) { bar.hidden = true; return; }
  bar.hidden = false;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const items = NEWS_ITEMS.slice(0, 10).map(newsFields).filter(n => n.title);
  if (!items.length) { bar.hidden = true; return; }
  const chip = n => {
    const src = (n.source.split('—')[0].split('·')[0]).trim() || n.source;
    // ticker headlines go to /news/ (not the source) — the source link is on the /news/ page.
    return `<a class="newsbar-item" href="/news/">`
      + `<span class="newsbar-src">${esc(src)}</span>`
      + `<span class="newsbar-headline">${esc(n.title)}</span></a>`
      + `<span class="newsbar-sep" aria-hidden="true">&#9670;</span>`;
  };
  const seq = items.map(chip).join('');
  track.innerHTML = `<div class="newsbar-seq">${seq}</div><div class="newsbar-seq" aria-hidden="true">${seq}</div>`;
  // keep scroll speed consistent (~60px/s) regardless of how many headlines there are.
  // read synchronously (forces one cheap reflow) — rAF is throttled in background tabs.
  const first = track.firstElementChild;
  const w = first && first.scrollWidth;
  if (w) track.style.setProperty('--newsbar-dur', Math.max(28, Math.round(w / 60)) + 's');
}
/* /news/ page: filterable grid with images */
function renderNewsPage(){
  const grid = document.getElementById('news-page-list');
  if (!grid) return;
  const empty = document.getElementById('news-page-empty');
  const count = document.getElementById('news-page-count');
  const items = NEWS_ITEMS.map(newsFields).filter(n => newsMatches(n, NEWS_FILTER));
  if (count) count.textContent = String(items.length);
  if (!items.length) { grid.innerHTML = ''; if (empty) empty.style.display = ''; return; }
  if (empty) empty.style.display = 'none';
  grid.innerHTML = items.map(n => `<a class="news-card reveal" href="${n.url}" target="_blank" rel="noopener noreferrer">
    ${n.image ? `<div class="news-card-img" style="background-image:url('${n.image.replace(/'/g, "%27")}')"></div>` : '<div class="news-card-img news-card-img--none"></div>'}
    <div class="news-card-body">
      ${n.priority === 'P1' ? '<span class="news-tag" data-en="Key" data-ar="مهم">' + (isAR ? 'مهم' : 'Key') + '</span>' : ''}
      <div class="news-card-title">${n.title}</div>
      <div class="news-card-summary">${n.summary}</div>
      <div class="news-card-meta">${n.source}${n.date ? ' &middot; ' + n.date : ''}<span class="news-card-more" data-en="Read more &rarr;" data-ar="&larr; اقرأ المزيد">${isAR ? '← اقرأ المزيد' : 'Read more →'}</span></div>
    </div>
  </a>`).join('');
  observeReveals(grid);
}
function wireNewsFilters(){
  const bar = document.getElementById('news-filters');
  if (!bar || bar.dataset.wired) return;
  bar.dataset.wired = '1';
  bar.querySelectorAll('.news-chip').forEach(chip => chip.addEventListener('click', () => {
    NEWS_FILTER = chip.dataset.filter || 'all';
    bar.querySelectorAll('.news-chip').forEach(c => c.classList.toggle('is-active', c === chip));
    renderNewsPage();
  }));
}
loadNews();

/* ---------- PAGEVIEW + ENGAGEMENT BEACON (P4/S77, enriched S82 — anonymous, no PII) ----------
   Sends: a "view" on load, then an "engage" (time-on-page + max scroll depth) on the way out.
   No IP, no raw User-Agent, no cookie — session id is an ephemeral sessionStorage value shared
   with the assistant widget so a visit's pages+chat can be tied together (anonymously). */
(function(){
  try {
    var EP = 'https://n8n.oneplusevents.com/webhook/web-pageview';
    var sid = sessionStorage.getItem('op_sid');
    if (!sid) {
      sid = 'sid-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem('op_sid', sid);
    }
    var pvid = 'pv-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    var t0 = Date.now(), maxScroll = 0, engageSent = false;

    function trackScroll(){
      var el = document.documentElement, b = document.body;
      var st = window.pageYOffset || el.scrollTop || b.scrollTop || 0;
      var h = (el.scrollHeight || b.scrollHeight || 0) - window.innerHeight;
      var pct = h > 0 ? Math.round((st / h) * 100) : 100;
      if (pct < 0) pct = 0; if (pct > 100) pct = 100;
      if (pct > maxScroll) maxScroll = pct;
    }
    window.addEventListener('scroll', trackScroll, { passive: true });
    trackScroll();

    /* ---- A/B experiment assignment (P8/S87) — data/experiments.json is n8n-published;
       [] most of the time = pure no-op. Deterministic bucket per (session, experiment). ---- */
    var assignedExp = null, assignedVariant = null;
    function hashStr(s){ var h = 0; for (var i = 0; i < s.length; i++){ h = ((h << 5) - h + s.charCodeAt(i)) | 0; } return Math.abs(h); }
    function applyExperiments(list){
      if (!Array.isArray(list)) return;
      for (var i = 0; i < list.length; i++){
        var e = list[i]; if (!e || !e.slug) continue;
        var scope = e.scope || '/';
        var match = scope === '/' ? true : (location.pathname === scope || location.pathname.indexOf(scope) === 0);
        if (!match) continue;
        var v = (hashStr(sid + '|' + e.slug) % 100) < (e.split || 50) ? 'B' : 'A';
        assignedExp = e.slug; assignedVariant = v;
        if (v === 'B' && Array.isArray(e.changes)){
          e.changes.forEach(function(ch){
            try {
              document.querySelectorAll(ch.selector).forEach(function(el){
                if (ch.op === 'text') el.textContent = ch.value;
                else if (ch.op === 'html') el.innerHTML = ch.value;
                else if (ch.op === 'attr' && ch.attr) el.setAttribute(ch.attr, ch.value);
                else if (ch.op === 'addClass') el.classList.add(ch.value);
              });
            } catch (e2){}
          });
        }
      }
    }
    var viewSent = false;
    function sendView(){
      if (viewSent) return; viewSent = true;
      // text/plain keeps this a CORS "simple" request (no preflight); body is JSON, parsed server-side.
      fetch(EP, {
        method: 'POST', headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          event: 'view', path: location.pathname, query: location.search || '',
          referrer: document.referrer || '', session_id: sid, client_pv_id: pvid,
          exp: assignedExp, variant: assignedVariant
        }),
        keepalive: true
      }).catch(function(){});
    }
    var viewCap = setTimeout(sendView, 1200); // never let a slow experiments.json delay the view beacon
    fetch('/data/experiments.json', { cache: 'default' })
      .then(function(r){ return r.ok ? r.json() : []; })
      .then(function(list){ applyExperiments(list); })
      .catch(function(){})
      .then(function(){ clearTimeout(viewCap); sendView(); });

    function sendEngage(){
      if (engageSent) return;
      engageSent = true;
      trackScroll();
      var payload = JSON.stringify({
        event: 'engage', client_pv_id: pvid, session_id: sid,
        duration_ms: Date.now() - t0, max_scroll: maxScroll
      });
      try {
        if (navigator.sendBeacon) {
          navigator.sendBeacon(EP, new Blob([payload], { type: 'text/plain' }));
        } else {
          fetch(EP, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: payload, keepalive: true }).catch(function(){});
        }
      } catch (e) {
        try { fetch(EP, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: payload, keepalive: true }).catch(function(){}); } catch (e2) {}
      }
    }
    document.addEventListener('visibilitychange', function(){ if (document.visibilityState === 'hidden') sendEngage(); });
    window.addEventListener('pagehide', sendEngage);
  } catch (e) { /* tracking must never break the page */ }
})();

/* ---------- CUSTOM CURSOR OVER PORTFOLIO CARDS (desktop pointer only) ---------- */
(function(){
  if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  const grid = document.getElementById('work-grid');
  if (!grid) return;
  const cursor = document.createElement('div');
  cursor.className = 'work-cursor';
  // outer div = position only (no CSS transition); inner div = the circle that pops in.
  // data-en/data-ar so a later toggleLang() (re-runs applyLang() over every [data-en]) keeps the label synced.
  cursor.innerHTML =
    '<div class="work-cursor-inner">' +
    '<svg class="work-cursor-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M17 7H8M17 7v9"/></svg>' +
    '<span data-en="View" data-ar="عرض">' + (isAR ? 'عرض' : 'View') + '</span>' +
    '</div>';
  document.body.appendChild(cursor);

  // light lerp toward the pointer: smooth, but catches up in ~3 frames (no perceptible lag,
  // no spring overshoot). The rAF loop only runs while the cursor is visible and still moving.
  const reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  const EASE = reduce ? 1 : 0.45;   // snappy follow — barely a trail, no spring/overshoot
  let tx = -200, ty = -200, cx = -200, cy = -200, raf = null;
  function draw(){ cursor.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)'; }
  function loop(){
    cx += (tx - cx) * EASE; cy += (ty - cy) * EASE;
    draw();
    if (Math.abs(tx - cx) > 0.2 || Math.abs(ty - cy) > 0.2) { raf = requestAnimationFrame(loop); }
    else { cx = tx; cy = ty; draw(); raf = null; }
  }
  function kick(){ if (!raf && cursor.classList.contains('show')) raf = requestAnimationFrame(loop); }
  document.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; kick(); }, { passive: true });
  grid.addEventListener('mouseover', (e) => {
    if (!e.target.closest('.work-item')) return;
    tx = e.clientX; ty = e.clientY; cx = tx; cy = ty; draw();   // appear exactly under the pointer
    cursor.classList.add('show');
  });
  grid.addEventListener('mouseout', (e) => {
    if (e.target.closest('.work-item') && !e.relatedTarget?.closest?.('.work-item')) cursor.classList.remove('show');
  });
})();

/* ---------- WEB3FORMS CONTACT SUBMISSION ---------- */
const WEB3FORMS_KEY = '6ad498c4-171c-4e81-9cb8-3c7c0ccff212';
async function submitForm(e){
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('.submit');
  const note = form.querySelector('.form-note');
  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = isAR ? 'يُرسَل…' : 'Sending…';
  if (note) { note.textContent = ''; note.className = 'form-note'; }

  const payload = {
    access_key: WEB3FORMS_KEY,
    subject: 'New brief — ONE+ Events website',
    from_name: 'ONE+ Events site',
    company: form.querySelector('#f-co').value,
    email: form.querySelector('#f-em').value,
    phone: form.querySelector('#f-ph').value,
    target_event: form.querySelector('#f-ev').value,
    area: form.querySelector('#f-ar').value,
    brief: form.querySelector('#f-br').value
  };

  // Best-effort lead qualification -- never blocks or affects the real Web3Forms
  // submission below. A failure here (webhook down, network) is silently ignored.
  fetch('https://n8n.oneplusevents.com/webhook/web-lead-qualify', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      company: payload.company, event: payload.target_event, phone: payload.phone,
      area: payload.area, email: payload.email, channel: 'form'
    })
  }).catch(() => {});

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      btn.textContent = isAR ? 'تم الاستلام ✓' : 'Received ✓';
      if (note) { note.textContent = isAR ? 'نردّ خلال ٢٤ ساعة.' : "We'll reply within 24 hours."; note.className = 'form-note ok'; }
      form.reset();
    } else {
      throw new Error(data.message || 'submit failed');
    }
  } catch (err) {
    btn.textContent = original;
    if (note) { note.textContent = isAR ? 'تعذّر الإرسال. جرّب واتساب مباشرة.' : 'Something went wrong. Try WhatsApp instead.'; note.className = 'form-note err'; }
  } finally {
    setTimeout(() => { btn.disabled = false; if (btn.textContent !== original) btn.textContent = original; }, 3500);
  }
  return false;
}

/* ---------- ASSISTANT WIDGET (P2, WEBSITE_V5_BUILD_PLAN.md §2A) ---------- */
(function () {
  const WEBHOOK_URL = 'https://n8n.oneplusevents.com/webhook/web-assistant';
  // S82: share the pageview beacon's session id so a visit's pages + chat correlate (anonymously)
  const SESSION_KEY = 'op_sid';

  function getSessionId() {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = 'sid-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  }

  const T = {
    title: { en: 'ONE+ Assistant', ar: 'مساعد ONE+' },
    subtitle: { en: 'Online', ar: 'متصل' },
    welcome: {
      en: "Hi! I'm the ONE+ Events assistant. Ask me about our services, process, or how to request a proposal.",
      ar: 'مرحبًا! أنا مساعد ONE+ Events. اسألني عن خدماتنا أو منهجيتنا أو كيفية طلب عرض.'
    },
    placeholder: { en: 'Type a message…', ar: 'اكتب رسالتك…' },
    waLabel: { en: 'Prefer WhatsApp?', ar: 'تفضّل واتساب؟' },
    genericError: {
      en: 'Something went wrong. Please try again or reach us on WhatsApp.',
      ar: 'حدث خلل ما. برجاء المحاولة مرة أخرى أو التواصل عبر واتساب.'
    }
  };
  function tr(key) { return isAR ? T[key].ar : T[key].en; }

  let fab, panel, body, input, sendBtn, headTitle, headSub, waLabel, attachBtn, fileInput, previewBar, previewThumb, previewRemove;
  let isOpen = false;
  let hasWelcomed = false;
  let userHasSent = false;
  let welcomeEl = null;
  let sending = false;
  let pendingImage = null; // { base64, mime } -- ephemeral, cleared after send

  const IMAGE_MAX_DIM = 1280;
  const IMAGE_JPEG_QUALITY = 0.72;

  function loadImageFile(file) {
    return new Promise((resolve, reject) => {
      if (!file || !/^image\/(jpeg|png|webp|gif)$/.test(file.type)) { reject(new Error('unsupported_type')); return; }
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const scale = Math.min(1, IMAGE_MAX_DIM / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', IMAGE_JPEG_QUALITY);
        resolve({ base64: dataUrl.split(',')[1], mime: 'image/jpeg', previewUrl: dataUrl });
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('decode_failed')); };
      img.src = url;
    });
  }

  function setPendingImage(data) {
    pendingImage = data ? { base64: data.base64, mime: data.mime } : null;
    if (!previewBar) return;
    if (data) {
      previewThumb.src = data.previewUrl;
      previewBar.classList.add('show');
    } else {
      previewBar.classList.remove('show');
      previewThumb.src = '';
    }
  }

  function build() {
    fab = document.createElement('button');
    fab.className = 'chat-fab';
    fab.setAttribute('aria-label', 'ONE+ Assistant');
    fab.innerHTML =
      '<svg class="chat-fab-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>' +
      '<svg class="chat-fab-x" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';

    panel = document.createElement('div');
    panel.className = 'chat-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'ONE+ Assistant chat');
    panel.innerHTML =
      '<div class="chat-head">' +
        '<div><div class="chat-head-title"></div><div class="chat-head-sub"><span class="dot"></span><span></span></div></div>' +
        '<button class="chat-close" aria-label="Close">×</button>' +
      '</div>' +
      '<div class="chat-body"></div>' +
      '<div class="chat-foot">' +
        '<div class="chat-preview"><img class="chat-preview-img" alt="" /><button class="chat-preview-remove" type="button" aria-label="Remove image">×</button></div>' +
        '<div class="chat-inputrow">' +
          '<button class="chat-attach" type="button" aria-label="Attach image"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg></button>' +
          '<input type="file" class="chat-file-input" accept="image/jpeg,image/png,image/webp,image/gif" hidden />' +
          '<textarea class="chat-input" rows="1" maxlength="1000"></textarea>' +
          '<input type="text" class="chat-honeypot" name="website" tabindex="-1" autocomplete="off" />' +
          '<button class="chat-send" aria-label="Send"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7z"/></svg></button>' +
        '</div>' +
        '<a class="chat-wa" href="https://wa.me/966566369163" target="_blank" rel="noopener"><span class="wa-label"></span> <bdi class="ltr-num">+966 566 369 163</bdi></a>' +
      '</div>';

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    body = panel.querySelector('.chat-body');
    input = panel.querySelector('.chat-input');
    sendBtn = panel.querySelector('.chat-send');
    headTitle = panel.querySelector('.chat-head-title');
    headSub = panel.querySelector('.chat-head-sub span:last-child');
    waLabel = panel.querySelector('.wa-label');
    attachBtn = panel.querySelector('.chat-attach');
    fileInput = panel.querySelector('.chat-file-input');
    previewBar = panel.querySelector('.chat-preview');
    previewThumb = panel.querySelector('.chat-preview-img');
    previewRemove = panel.querySelector('.chat-preview-remove');

    fab.addEventListener('click', toggle);
    panel.querySelector('.chat-close').addEventListener('click', () => setOpen(false));
    sendBtn.addEventListener('click', send);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    });
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 88) + 'px';
    });
    attachBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async () => {
      const file = fileInput.files && fileInput.files[0];
      fileInput.value = '';
      if (!file) return;
      try {
        const data = await loadImageFile(file);
        setPendingImage(data);
      } catch (e) {
        addMessage('error', tr('genericError'));
      }
    });
    previewRemove.addEventListener('click', () => setPendingImage(null));

    updateAssistantLang();
  }

  function toggle() { setOpen(!isOpen); }
  function setOpen(open) {
    isOpen = open;
    fab.classList.toggle('open', open);
    panel.classList.toggle('open', open);
    if (open) {
      if (!hasWelcomed) { welcomeEl = addMessage('assistant', tr('welcome')); hasWelcomed = true; }
      setTimeout(() => input.focus(), 320);
    }
  }

  // Wraps LTR runs (phone numbers, emails, URLs) in <bdi> so Arabic replies don't
  // scramble embedded numbers/links (site-wide bdi.ltr-num pattern, see site.css FIX-1).
  // Escapes everything else first -- reply text is model-generated, never trust it as HTML.
  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  const LTR_RUN_RE = /(\+?\d[\d\s\-()]{5,}\d|[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}|https?:\/\/[^\s]+|www\.[^\s]+)/g;
  function renderMessageHtml(text) {
    return escapeHtml(text).split(LTR_RUN_RE).map((part, i) =>
      i % 2 === 1 ? '<bdi class="ltr-num">' + part + '</bdi>' : part
    ).join('');
  }

  function addMessage(role, text) {
    const el = document.createElement('div');
    el.className = 'chat-msg ' + role;
    el.innerHTML = renderMessageHtml(text);
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'chat-typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  }

  async function send() {
    if (sending) return;
    const text = input.value.trim();
    const image = pendingImage;
    if (!text && !image) return;
    sending = true;
    userHasSent = true;
    sendBtn.disabled = true;
    addMessage('user', text || (isAR ? '(صورة مرفقة)' : '(Image attached)'));
    input.value = '';
    input.style.height = 'auto';
    setPendingImage(null);
    const typingEl = showTyping();

    try {
      const payload = {
        message: text,
        session_id: getSessionId(),
        lang: isAR ? 'ar' : 'en',
        website: panel.querySelector('.chat-honeypot').value
      };
      if (image) { payload.image_base64 = image.base64; payload.image_mime = image.mime; }
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      typingEl.remove();
      if (res.status === 429) {
        addMessage('error', data.reply || tr('genericError'));
      } else if (data && data.reply) {
        addMessage('assistant', data.reply);
      } else {
        addMessage('error', tr('genericError'));
      }
    } catch (err) {
      typingEl.remove();
      addMessage('error', tr('genericError'));
    } finally {
      sending = false;
      sendBtn.disabled = false;
    }
  }

  function updateAssistantLang() {
    if (!panel) return;
    headTitle.textContent = tr('title');
    headSub.textContent = tr('subtitle');
    input.placeholder = tr('placeholder');
    waLabel.textContent = tr('waLabel');
    if (welcomeEl && !userHasSent) welcomeEl.textContent = tr('welcome');
  }
  window.updateAssistantLang = updateAssistantLang;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();

/* ---------- RENDER-TO-REALITY SLIDER (UX-1) ---------- */
// Generic: works for any .rtr-frame on the page, driven purely by pointer position along
// the frame's own width. RTL-aware -- the CSS itself decides which side the reveal starts
// from, this only ever reports "how far across the frame, 0-100%", never a direction.
document.querySelectorAll('.rtr-frame').forEach(frame => {
  function setPos(clientX){
    const rect = frame.getBoundingClientRect();
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    frame.style.setProperty('--rtr-pos', pct + '%');
  }
  let dragging = false;
  frame.addEventListener('pointerdown', e => { dragging = true; frame.setPointerCapture(e.pointerId); setPos(e.clientX); });
  frame.addEventListener('pointermove', e => { if (dragging) setPos(e.clientX); });
  frame.addEventListener('pointerup', () => { dragging = false; });
  frame.addEventListener('pointercancel', () => { dragging = false; });
});

/* ---------- SHARE BUTTON (Web Share API + copy-link fallback, UX-4) ---------- */
document.querySelectorAll('.share-btn').forEach(btn => {
  const label = btn.querySelector('span');
  const defaultHtml = label ? label.innerHTML : '';
  let resetTimer = null;
  btn.addEventListener('click', async () => {
    const title = btn.dataset.shareTitle || document.title;
    const text = btn.dataset.shareText || '';
    const url = location.href;
    if (navigator.share) {
      try { await navigator.share({ title, text, url }); return; }
      catch (e) { if (e.name === 'AbortError') return; } // fall through to copy-link on real errors
    }
    try {
      await navigator.clipboard.writeText(url);
      if (label) {
        clearTimeout(resetTimer);
        label.textContent = isAR ? 'تم النسخ ✓' : 'Copied ✓';
        btn.classList.add('copied');
        resetTimer = setTimeout(() => { label.innerHTML = defaultHtml; btn.classList.remove('copied'); }, 2200);
      }
    } catch (e) { /* clipboard blocked (insecure context/permission) -- button stays clickable, no-op */ }
  });
});

/* ---------- LIGHTWEIGHT CANVAS HERO (no Three.js — P0/P1 scope) ---------- */
(function(){
  const c = document.getElementById('hero-canvas'); if (!c) return;
  const ctx = c.getContext('2d'); let w, h, pts = [], raf;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const reduced = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  function resize(){ w = c.width = innerWidth * DPR; h = c.height = innerHeight * DPR; c.style.width = innerWidth + 'px'; c.style.height = innerHeight + 'px'; }
  function init(){
    resize();
    const n = Math.min(70, Math.floor(innerWidth / 22));
    pts = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * 0.25 * DPR, vy: (Math.random() - .5) * 0.25 * DPR }));
  }
  function draw(){
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(120,200,240,0.6)'; ctx.strokeStyle = 'rgba(120,200,240,0.14)'; ctx.lineWidth = DPR;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i]; p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1; if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.3 * DPR, 0, 6.283); ctx.fill();
      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy, max = (150 * DPR) ** 2;
        if (d < max) { ctx.globalAlpha = 1 - d / max; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); ctx.globalAlpha = 1; }
      }
    }
    raf = requestAnimationFrame(draw);
  }
  init(); c.classList.add('in');
  if (!reduced) draw(); else { draw(); cancelAnimationFrame(raf); }
  let to; addEventListener('resize', () => { clearTimeout(to); to = setTimeout(init, 200); });
})();
