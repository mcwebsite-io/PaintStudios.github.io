// --- 3D Canvas Background Logic ---
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

let width = 0;
let height = 0;
let angleX = 0;
let angleY = 0;

const mouse = { x: 0, y: 0, targetX: 0, targetY: 0, pulse: 0 };

function resize() {
  width = canvas.width = window.innerWidth || 800;
  height = canvas.height = window.innerHeight || 600;
}

window.addEventListener('resize', resize);
window.addEventListener('mousemove', (e) => {
  if (width > 0 && height > 0) {
    mouse.targetX = (e.clientX - width / 2) * 0.00015;
    mouse.targetY = (e.clientY - height / 2) * 0.00015;
  }
  mouse.pulse = Math.min(mouse.pulse + 0.05, 1);
});

resize();

// 3D Polyhedron Core Vertices
const phi = (1 + Math.sqrt(5)) / 2;
const baseVertices = [
  [-1,  phi, 0], [ 1,  phi, 0], [-1, -phi, 0], [ 1, -phi, 0],
  [0, -1,  phi], [0,  1,  phi], [0, -1, -phi], [0,  1, -phi],
  [ phi, 0, -1], [ phi, 0,  1], [-phi, 0, -1], [-phi, 0,  1]
];

const scale = 150;

// Build Edge Connections
const edges = [];
for (let i = 0; i < baseVertices.length; i++) {
  for (let j = i + 1; j < baseVertices.length; j++) {
    const dx = baseVertices[i][0] - baseVertices[j][0];
    const dy = baseVertices[i][1] - baseVertices[j][1];
    const dz = baseVertices[i][2] - baseVertices[j][2];
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist < 2.3) {
      edges.push([i, j]);
    }
  }
}

// Background Floating Particles
const particles = Array.from({ length: 50 }, () => ({
  x: (Math.random() - 0.5) * 800,
  y: (Math.random() - 0.5) * 800,
  z: (Math.random() - 0.5) * 800,
  size: Math.random() * 2 + 1
}));

function rotateX(v, a) {
  const cos = Math.cos(a), sin = Math.sin(a);
  return [v[0], v[1] * cos - v[2] * sin, v[1] * sin + v[2] * cos];
}

function rotateY(v, a) {
  const cos = Math.cos(a), sin = Math.sin(a);
  return [v[0] * cos + v[2] * sin, v[1], -v[0] * sin + v[2] * cos];
}

function project(v) {
  const fov = 400;
  const distance = 500;
  const denominator = distance + v[2];
  const factor = denominator > 1 ? fov / denominator : 1;
  
  return {
    x: width / 2 + v[0] * factor,
    y: height / 2 + v[1] * factor,
    scale: factor
  };
}

function animate() {
  mouse.x += (mouse.targetX - mouse.x) * 0.05;
  mouse.y += (mouse.targetY - mouse.y) * 0.05;
  mouse.pulse *= 0.95;

  if (isNaN(mouse.x)) mouse.x = 0;
  if (isNaN(mouse.y)) mouse.y = 0;

  angleX += 0.0012 + mouse.y;
  angleY += 0.0018 + mouse.x;

  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
  ctx.lineWidth = 1;
  const gridSpacing = 50;

  for (let x = 0; x < width; x += gridSpacing) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSpacing) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
  }

  const currentScale = scale + (mouse.pulse || 0) * 25;
  const transformed = baseVertices.map(v => {
    const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    const scaled = [ (v[0] / len) * currentScale, (v[1] / len) * currentScale, (v[2] / len) * currentScale ];
    let r = rotateX(scaled, angleX);
    r = rotateY(r, angleY);
    return { pos3d: r, projected: project(r) };
  });

  edges.forEach(([i, j]) => {
    const p1 = transformed[i].projected;
    const p2 = transformed[j].projected;
    const depth = (transformed[i].pos3d[2] + transformed[j].pos3d[2]) / 2;
    const alpha = Math.max(0.15, Math.min(0.9, (depth + 200) / 300));

    if (!isNaN(p1.x) && !isNaN(p1.y) && !isNaN(p2.x) && !isNaN(p2.y)) {
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = 1.2 + mouse.pulse;
      ctx.stroke();
    }
  });

  particles.forEach(pt => {
    let r = rotateX([pt.x, pt.y, pt.z], angleX * 0.5);
    r = rotateY(r, angleY * 0.5);
    const p = project(r);

    if (!isNaN(p.x) && !isNaN(p.y)) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, pt.size * p.scale, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fill();
    }
  });

  requestAnimationFrame(animate);
}

animate();

// --- October 2026 Countdown Logic ---
const targetDate = new Date('October 1, 2026 00:00:00').getTime();

function updateCountdown() {
  const now = new Date().getTime();
  const difference = targetDate - now;

  if (difference <= 0) {
    const container = document.getElementById('countdown');
    if (container) {
      container.innerHTML = '<span class="released-text">GAME IS LIVE NOW!</span>';
    }
    return;
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  if (daysEl) daysEl.innerText = String(days).padStart(2, '0');
  if (hoursEl) hoursEl.innerText = String(hours).padStart(2, '0');
  if (minutesEl) minutesEl.innerText = String(minutes).padStart(2, '0');
  if (secondsEl) secondsEl.innerText = String(seconds).padStart(2, '0');
}

setInterval(updateCountdown, 1000);
updateCountdown();

// --- Sidebar Expand/Collapse Toggle ---
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');

if (sidebarToggle && sidebar) {
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('expanded');
  });
}

// --- Dynamic Scroll Active State (Scrollspy Fixed) ---
const navItems = document.querySelectorAll('.sidebar-item');

function updateActiveNav() {
  const scrollPosition = window.scrollY + window.innerHeight / 3;
  
  if (window.scrollY < 100) {
    navItems.forEach(item => item.classList.remove('active'));
    const homeItem = document.querySelector('.sidebar-item[href="#hero"]');
    if (homeItem) homeItem.classList.add('active');
    return;
  }

  const sections = document.querySelectorAll('main[id], section[id]');
  let currentSectionId = '';

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const sectionTop = rect.top + window.scrollY;
    const sectionHeight = section.offsetHeight;

    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      currentSectionId = section.getAttribute('id');
    }
  });

  if (currentSectionId) {
    navItems.forEach((item) => {
      item.classList.remove('active');
      if (item.getAttribute('href') === `#${currentSectionId}`) {
        item.classList.add('active');
      }
    });
  }
}

window.addEventListener('scroll', updateActiveNav);
window.addEventListener('resize', updateActiveNav);
updateActiveNav();

// --- Smooth Click Navigation for Sidebar ---
document.querySelectorAll('.sidebar-item').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    
    if (targetId === '#hero') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
    }
  });
});
