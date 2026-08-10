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
function toggleLang(){ isAR = !isAR; applyLang(); renderProjects(); if (window.updateAssistantLang) window.updateAssistantLang(); }
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
    // media[0] is a plain URL string for the 9 hand-built launch projects, or a richer
    // {type, role, url, poster_url} object for anything synced later by WEB_Project_Sync.
    const first = p.media && p.media[0];
    const img = typeof first === 'string' ? first : (first ? (first.poster_url || first.url || '') : '');
    // event_type is a bilingual {en, ar} object for the launch projects, or a single
    // inferred string for synced projects (folder-name inference has no language split yet).
    const evType = p.event_type ? (typeof p.event_type === 'object' ? (isAR ? p.event_type.ar : p.event_type.en) : p.event_type) : '';
    return `<a class="work-item${wide} reveal" href="/work/${p.slug}/">
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
  const SESSION_KEY = 'oneplus_chat_session';

  function getSessionId() {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = 'web-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
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
