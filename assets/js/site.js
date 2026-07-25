/* ONE+ Events — shared site behavior (lang toggle, reveal, hero canvas, portfolio, form) */

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
function toggleLang(){ isAR = !isAR; applyLang(); renderProjects(); }
applyLang();

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
async function loadProjects(){
  const grid = document.getElementById('work-grid');
  if (!grid) return;
  try {
    const res = await fetch('/data/projects.json');
    PROJECTS = await res.json();
    renderProjects();
  } catch (e) {
    grid.innerHTML = '';
  }
}
function renderProjects(){
  const grid = document.getElementById('work-grid');
  if (!grid || !PROJECTS.length) return;
  grid.innerHTML = PROJECTS.map((p, i) => {
    const wide = p.featured ? ' wide' : '';
    const img = p.media && p.media[0] ? p.media[0] : '';
    const evType = p.event_type ? (isAR ? p.event_type.ar : p.event_type.en) : '';
    return `<a class="work-item${wide} reveal" href="/work/${p.slug}/">
      <img class="work-media" alt="${p.client}" src="${img}" loading="${i < 2 ? 'eager' : 'lazy'}" width="800" height="550"/>
      <div class="work-grad"></div>
      ${p.featured ? `<div class="work-tag" data-en="Featured" data-ar="مميّز">${isAR ? 'مميّز' : 'Featured'}</div>` : ''}
      <div class="work-meta">
        <div class="work-client">${p.client}</div>
        <div class="work-line"><span>${evType}</span></div>
      </div>
    </a>`;
  }).join('');
  observeReveals(grid);
}
loadProjects();

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
    target_event: form.querySelector('#f-ev').value,
    brief: form.querySelector('#f-br').value
  };

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

/* ---------- ASSISTANT PLACEHOLDER (disabled — activates in Phase P2) ---------- */
/* WEB_Assistant webhook is not built yet (see WEBSITE_V5_BUILD_PLAN.md §2A).
   This control is intentionally non-functional until P2. */
function assistantPlaceholder(){ /* no-op by design in P0 */ }

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
