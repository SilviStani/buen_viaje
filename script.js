'use strict';

// ─── Configuración ────────────────────────────────────────────────────────────
// Reemplazá esta URL con la de tu Google Apps Script (ver CONFIGURACION_SHEETS.md)
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyr27nIEA0EV-TdgaS70ZKkhk7dS_gn35_NDWKIqu-D3ItugLbY6Tn6raGJuY_87nuo/exec';

// Fecha del evento: Domingo 6 de Septiembre 2026, 13:00 hs (UTC-3, Buenos Aires)
const EVENT_DATE = new Date('2026-09-06T13:00:00-03:00');

// ─── Datos del carrusel ───────────────────────────────────────────────────────
const POLAROIDS = [
  { src: 'images/Conferencia.jpeg',        caption: 'Conferencia' },
  { src: 'images/ReunionPrecursores.jpeg', caption: 'Reunión de Precursores' },
  { src: 'images/Asamblea.jpeg',           caption: 'Asamblea' },
  { src: 'images/boda.jpeg',               caption: 'La boda' },
  { src: 'images/boda2.jpeg',              caption: 'La boda' },
  { src: 'images/civil.jpeg',              caption: 'El civil' },
  { src: 'images/anillo.jpeg',             caption: 'El anillo' },
  { src: 'images/compromiso.jpeg',         caption: 'El compromiso' },
  { src: 'images/novios.jpeg',             caption: 'Los novios' },
];

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initFairyLights();
  initCountdown();
  buildCarousel();
  initCarousel();
  initForms();
  initScrollAnimations();
});

// ─── Nav (efecto al hacer scroll) ────────────────────────────────────────────
function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 50);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ─── Fairy Lights (canvas) ────────────────────────────────────────────────────
function initFairyLights() {
  const canvas = document.getElementById('fairy-lights');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let lights = [];
  let rafId;

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    buildLights();
  }

  function buildLights() {
    const count = Math.max(30, Math.floor((canvas.width * canvas.height) / 14000));
    lights = Array.from({ length: count }, () => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      r:     Math.random() * 2.4 + 0.8,
      speed: Math.random() * 0.018 + 0.004,
      phase: Math.random() * Math.PI * 2,
      hue:   Math.random() * 38 + 28,   // warm yellows/oranges
    }));
  }

  function draw(ts) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    lights.forEach(l => {
      const alpha = ((Math.sin(ts * l.speed + l.phase) + 1) / 2) * 0.85;
      ctx.save();
      ctx.globalAlpha  = alpha;
      ctx.fillStyle    = `hsl(${l.hue}, 92%, 74%)`;
      ctx.shadowColor  = `hsl(${l.hue}, 92%, 78%)`;
      ctx.shadowBlur   = 9;
      ctx.beginPath();
      ctx.arc(l.x, l.y, l.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    rafId = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
  rafId = requestAnimationFrame(draw);
}

// ─── Countdown ────────────────────────────────────────────────────────────────
function initCountdown() {
  const els = {
    days:    [document.getElementById('days'),         document.getElementById('hero-days')],
    hours:   [document.getElementById('hours'),        document.getElementById('hero-hours')],
    minutes: [document.getElementById('minutes'),      document.getElementById('hero-minutes')],
    seconds: [document.getElementById('seconds'),      document.getElementById('hero-seconds')],
  };

  function pad(n) { return String(n).padStart(2, '0'); }
  function set(key, val) { els[key].forEach(el => { if (el) el.textContent = val; }); }

  function tick() {
    const diff = EVENT_DATE.getTime() - Date.now();
    if (diff <= 0) {
      Object.keys(els).forEach(k => set(k, '00'));
      return;
    }
    set('days',    pad(Math.floor(diff / 86400000)));
    set('hours',   pad(Math.floor((diff % 86400000) / 3600000)));
    set('minutes', pad(Math.floor((diff % 3600000)  / 60000)));
    set('seconds', pad(Math.floor((diff % 60000)    / 1000)));
  }

  tick();
  setInterval(tick, 1000);
}

// ─── Carrusel ─────────────────────────────────────────────────────────────────
const CARD_W  = 250;
const CARD_GAP = 28;
const CARD_STEP = CARD_W + CARD_GAP;
let currentSlide = 0;
let autoTimer    = null;

function buildCarousel() {
  const track = document.getElementById('carousel-track');
  const dots  = document.getElementById('carousel-dots');
  if (!track) return;

  POLAROIDS.forEach((p, i) => {
    // Polaroid card
    const card = document.createElement('div');
    card.className = 'polaroid';

    const photo = document.createElement('div');
    photo.className = 'polaroid-photo';
    const img = document.createElement('img');
    img.src = p.src;
    img.alt = p.caption;
    photo.appendChild(img);

    const caption = document.createElement('p');
    caption.className = 'polaroid-caption';
    caption.textContent = p.caption;

    card.append(photo, caption);
    track.appendChild(card);

    // Dot indicator
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    dots.appendChild(dot);
  });
}

function initCarousel() {
  const prevBtn  = document.getElementById('prev-btn');
  const nextBtn  = document.getElementById('next-btn');
  const wrapper  = document.querySelector('.carousel-wrapper');
  const viewport = document.querySelector('.carousel-viewport');
  if (!prevBtn) return;

  prevBtn.addEventListener('click', () =>
    goTo(currentSlide === 0 ? POLAROIDS.length - 1 : currentSlide - 1)
  );
  nextBtn.addEventListener('click', () =>
    goTo((currentSlide + 1) % POLAROIDS.length)
  );

  // Touch / swipe
  let touchStartX = 0;
  if (viewport) {
    viewport.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    viewport.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 45) {
        dx < 0
          ? goTo((currentSlide + 1) % POLAROIDS.length)
          : goTo(currentSlide === 0 ? POLAROIDS.length - 1 : currentSlide - 1);
      }
    }, { passive: true });
  }

  // Pause auto-advance on hover
  if (wrapper) {
    wrapper.addEventListener('mouseenter', () => clearInterval(autoTimer));
    wrapper.addEventListener('mouseleave', startAuto);
  }

  goTo(0);
  startAuto();
}

function goTo(index) {
  currentSlide = index;
  const track    = document.getElementById('carousel-track');
  const viewport = document.querySelector('.carousel-viewport');
  if (!track || !viewport) return;

  const card   = track.querySelector('.polaroid');
  const cardW  = card ? card.offsetWidth : CARD_W;
  const step   = cardW + CARD_GAP;
  const viewW  = viewport.offsetWidth;
  const offset = viewW / 2 - cardW / 2 - index * step;
  track.style.transform = `translateX(${offset}px)`;

  document.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('active', i === index);
  });
}

function startAuto() {
  clearInterval(autoTimer);
  autoTimer = setInterval(() => goTo((currentSlide + 1) % POLAROIDS.length), 4500);
}

// Recalculate on resize
window.addEventListener('resize', () => goTo(currentSlide), { passive: true });

// ─── Formularios ──────────────────────────────────────────────────────────────
function initForms() {
  // RSVP
  const rsvpForm = document.getElementById('rsvp-form');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', async e => {
      e.preventDefault();
      const btn    = document.getElementById('rsvp-submit');
      const msgEl  = document.getElementById('rsvp-message');
      const name   = document.getElementById('rsvp-name').value.trim();
      const guests = document.getElementById('rsvp-guests').value;
      const radio  = rsvpForm.querySelector('input[name="attendance"]:checked');
      const attendance = radio ? radio.value : 'yes';

      if (!name) {
        showMsg(msgEl, 'error', 'Por favor ingresá tu nombre.');
        return;
      }

      setLoading(btn, true, 'Confirmando...');
      try {
        await submit({ type: 'rsvp', name, guests, attendance });
        showMsg(msgEl, 'success', '¡Gracias! Tu confirmación fue registrada. ¡Te esperamos el 6 de Septiembre! 🥂');
        rsvpForm.reset();
      } catch {
        showMsg(msgEl, 'error', 'Hubo un error. Intentá de nuevo o escribinos a silvina.stani@gmail.com');
      } finally {
        setLoading(btn, false, 'Confirmar asistencia');
      }
    });
  }

  // Notas
  const noteForm = document.getElementById('note-form');
  if (noteForm) {
    noteForm.addEventListener('submit', async e => {
      e.preventDefault();
      const btn     = document.getElementById('note-submit');
      const msgEl   = document.getElementById('note-message');
      const name    = document.getElementById('note-author').value.trim();
      const message = document.getElementById('note-body').value.trim();

      if (!name || !message) {
        showMsg(msgEl, 'error', 'Por favor completá tu nombre y tu mensaje.');
        return;
      }

      setLoading(btn, true, 'Enviando...');
      try {
        await submit({ type: 'nota', name, message });
        showMsg(msgEl, 'success', '¡Tu mensaje fue guardado! los chicos lo leerán con mucho amor 💛');
        noteForm.reset();
        launchConfetti();
      } catch {
        showMsg(msgEl, 'error', 'Hubo un error. Intentá de nuevo');
      } finally {
        setLoading(btn, false, 'Enviar mensaje ✉️');
      }
    });
  }

  // Cargar y refrescar mensajes del Sheet
  loadMessages();
  setInterval(loadMessages, 10000); // Refrescar cada 10 segundos
}

async function loadMessages() {
  if (SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
    return; // No cargar en modo demo
  }
  
  try {
    const response = await fetch(SCRIPT_URL);
    const data = await response.json();
    const container = document.getElementById('messages-container');
    
    if (!data.messages || data.messages.length === 0) {
      container.innerHTML = '<p class="messages-empty">Aún no hay mensajes... ¡Sé el primero! 💛</p>';
      return;
    }
    
    container.innerHTML = data.messages.map(msg => `
      <div class="message-card" data-animate>
        <p class="message-text">"${msg.mensaje}"</p>
        <p class="message-author">— ${msg.nombre}</p>
        <!-- <p class="message-date">${msg.fecha}</p> -->
      </div>
    `).join('');
    
    // Aplicar animación a las nuevas tarjetas
    container.querySelectorAll('[data-animate]').forEach(el => {
      el.classList.add('visible');
    });
    
  } catch (err) {
    console.error('Error cargando mensajes:', err);
  }
}

async function submit(data) {
  // Modo demo: si la URL no fue configurada, simulamos el envío
  if (SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
    await new Promise(r => setTimeout(r, 900));
    return;
  }
  // Enviamos con no-cors (compatible con Google Apps Script sin configuración extra)
  await fetch(SCRIPT_URL, {
    method:  'POST',
    mode:    'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams(data).toString(),
  });
}

function setLoading(btn, loading, text) {
  btn.disabled = loading;
  btn.textContent = text;
}

function showMsg(el, type, text) {
  el.textContent = text;
  el.className   = `form-message ${type}`;
  el.classList.remove('hidden');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.add('hidden'), 7000);
}

// ─── Confetti ─────────────────────────────────────────────────────────────────
function launchConfetti() {
  if (typeof confetti === 'undefined') return;
  const colors = ['#D97706', '#F59E0B', '#EA580C', '#FCD34D', '#FFFFFF'];
  confetti({ particleCount: 80,  spread: 60,  origin: { x: 0.3, y: 0.6 }, colors });
  setTimeout(() =>
    confetti({ particleCount: 80, spread: 60, origin: { x: 0.7, y: 0.6 }, colors }), 150
  );
}

// ─── Animaciones al hacer scroll ──────────────────────────────────────────────
function initScrollAnimations() {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        // Escalonar hijos del mismo contenedor padre
        const siblings = Array.from(
          entry.target.parentElement.querySelectorAll('[data-animate]')
        );
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => entry.target.classList.add('visible'), idx * 90);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -36px 0px' }
  );

  document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
}
