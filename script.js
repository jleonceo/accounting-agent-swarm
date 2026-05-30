// ===== LANGUAGE TOGGLE =====
let currentLang = 'es';

function toggleLang() {
  currentLang = currentLang === 'es' ? 'en' : 'es';
  const btn = document.querySelector('.lang-toggle');
  btn.textContent = currentLang === 'es' ? 'EN' : 'ES';
  applyLang();
}

function applyLang() {
  document.querySelectorAll('[data-es]').forEach(el => {
    const text = el.getAttribute('data-' + currentLang);
    if (text) el.innerHTML = text;
  });
}

// ===== SCORE COUNTER =====
let counterDone = false;

function animateCounter() {
  if (counterDone) return;
  counterDone = true;
  const el = document.getElementById('scoreCounter');
  if (!el) return;
  const target = 97.0;
  const duration = 2200;
  const start = performance.now();
  function update(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
    el.textContent = (target * eased).toFixed(1);
    if (t < 1) requestAnimationFrame(update);
    else el.textContent = '97.0';
  }
  requestAnimationFrame(update);
}

// ===== DOT GRID =====
function generateDotGrid() {
  const grid = document.getElementById('dotGrid');
  if (!grid) return;
  // 57 asientos (blue) + 6 extractos (green)
  for (let i = 0; i < 63; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot ' + (i < 57 ? 'dot-asiento' : 'dot-ext');
    grid.appendChild(dot);
  }
}

let dotsLit = false;
function lightUpDots() {
  if (dotsLit) return;
  dotsLit = true;
  document.querySelectorAll('.dot').forEach((dot, i) => {
    setTimeout(() => dot.classList.add('lit'), i * 28);
  });
}

// ===== CHART ANIMATION =====
function animateBars() {
  document.querySelectorAll('.run-fill').forEach((bar, i) => {
    const h = bar.closest('.run-bar').style.getPropertyValue('--h');
    bar.style.height = '0%';
    setTimeout(() => {
      bar.style.transition = `height 0.6s ease ${i * 0.1}s`;
      bar.style.height = h;
    }, 200);
  });
}

// ===== INTERSECTION OBSERVER =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    if (entry.target.classList.contains('runs-chart')) animateBars();
    if (entry.target.id === 'dotGrid') lightUpDots();
    entry.target.classList.add('visible');
    observer.unobserve(entry.target);
  });
}, { threshold: 0.15 });

document.querySelectorAll('.runs-chart, .axis, .pipe-step, .road-step').forEach(el => observer.observe(el));

const dotGrid = document.getElementById('dotGrid');
if (dotGrid) observer.observe(dotGrid);

// ===== DOT NAV — active section tracking =====
const NAV_SECTIONS = ['problema', 'arquitectura', 'eval', 'resultados', 'horizonte'];

function updateDotNav() {
  const dots = document.querySelectorAll('.dot-nav-item');
  let activeIndex = 0;
  NAV_SECTIONS.forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.getBoundingClientRect().top <= window.innerHeight * 0.55) activeIndex = i;
  });
  dots.forEach((dot, i) => dot.classList.toggle('active', i === activeIndex));
}

window.addEventListener('scroll', updateDotNav, { passive: true });

// ===== INIT =====
generateDotGrid();
setTimeout(animateCounter, 800); // counter starts shortly after page load
applyLang();
updateDotNav();
