/* ═══════════════════════════════════════════════════════════════════
   NADA PORTFOLIO — app.js
   Handles: particles, QR code, language toggle, scroll effects,
            counter animation, intersection observers
   ═══════════════════════════════════════════════════════════════════ */

'use strict';

// ════════════════════════════════════
// 1. LANGUAGE TOGGLE (EN ↔ AR)
// ════════════════════════════════════
const langBtn   = document.getElementById('lang-btn');
let isArabic    = false;

function setLanguage(arabic) {
  isArabic = arabic;
  const body = document.body;

  document.querySelectorAll('.en-text').forEach(el => {
    el.style.display = arabic ? 'none' : '';
  });
  document.querySelectorAll('.ar-text').forEach(el => {
    el.style.display = arabic ? '' : 'none';
  });

  // Hero role special rows
  const heroRoleAr = document.getElementById('hero-role-ar');
  if (heroRoleAr) heroRoleAr.style.display = arabic ? 'flex' : 'none';

  if (arabic) {
    body.classList.add('rtl');
    body.setAttribute('dir', 'rtl');
    body.setAttribute('lang', 'ar');
    langBtn.querySelector('.lang-current').textContent = 'English';
  } else {
    body.classList.remove('rtl');
    body.setAttribute('dir', 'ltr');
    body.setAttribute('lang', 'en');
    langBtn.querySelector('.lang-current').textContent = 'عربي';
  }
}

langBtn.addEventListener('click', () => setLanguage(!isArabic));

// ════════════════════════════════════
// 2. MOBILE MENU
// ════════════════════════════════════
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu    = document.getElementById('mobile-menu');

mobileMenuBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// ════════════════════════════════════
// 3. NAVBAR SCROLL EFFECT
// ════════════════════════════════════
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ════════════════════════════════════
// 4. QR CODE GENERATOR
// ════════════════════════════════════
const QR_CONTAINER = document.getElementById('qr-code');
const urlDisplay   = document.getElementById('current-url-display');
const urlInput     = document.getElementById('qr-url-input');
const updateQRBtn  = document.getElementById('update-qr-btn');
const downloadBtn  = document.getElementById('download-qr-btn');

let currentQRUrl   = window.location.href;
let qrInstance     = null;

function generateQR(url) {
  QR_CONTAINER.innerHTML = '';
  qrInstance = new QRCode(QR_CONTAINER, {
    text: url,
    width: 200,
    height: 200,
    colorDark: '#1a1040',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H
  });
  urlDisplay.textContent = url.length > 45 ? url.substring(0, 45) + '...' : url;
  currentQRUrl = url;
}

// Initialize QR on load
window.addEventListener('load', () => {
  generateQR(currentQRUrl);
  urlInput.value = currentQRUrl;
});

// Update QR on button click
updateQRBtn.addEventListener('click', () => {
  const newUrl = urlInput.value.trim();
  if (!newUrl) return;
  if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
    urlInput.value = 'https://' + newUrl;
    return generateQR('https://' + newUrl);
  }
  generateQR(newUrl);

  // Flash feedback
  updateQRBtn.textContent = '✓ Updated!';
  updateQRBtn.style.background = 'rgba(34,211,165,0.15)';
  setTimeout(() => {
    updateQRBtn.innerHTML = isArabic
      ? '<span class="ar-text">تحديث QR</span>'
      : '<span class="en-text">Update QR</span>';
    updateQRBtn.style.background = '';
  }, 1800);
});

urlInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') updateQRBtn.click();
});

// Download QR as PNG
downloadBtn.addEventListener('click', () => {
  const canvas = QR_CONTAINER.querySelector('canvas');
  const img    = QR_CONTAINER.querySelector('img');

  if (canvas) {
    const link = document.createElement('a');
    link.download = 'nada-portfolio-qr.png';
    link.href     = canvas.toDataURL('image/png');
    link.click();
  } else if (img) {
    const link = document.createElement('a');
    link.download = 'nada-portfolio-qr.png';
    link.href     = img.src;
    link.click();
  }
});

// ════════════════════════════════════
// 5. ANIMATED COUNTERS (HERO STATS)
// ════════════════════════════════════
function animateCounter(el, target, duration = 1800) {
  let start = null;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  };
  requestAnimationFrame(step);
}

// Trigger on first view
const statsSection = document.querySelector('.hero-stats');
let countersDone   = false;

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !countersDone) {
      countersDone = true;
      document.querySelectorAll('.stat-num[data-count]').forEach(el => {
        animateCounter(el, parseInt(el.dataset.count), 1600);
      });
    }
  });
}, { threshold: 0.5 });

if (statsSection) statsObserver.observe(statsSection);

// ════════════════════════════════════
// 6. SCROLL REVEAL ANIMATIONS
// ════════════════════════════════════
const revealEls = document.querySelectorAll(
  '.pcard-featured, .ccard, .contact-card, .stat-card, .res-item, .qr-card, .qr-info, .skill-group'
);

revealEls.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

// ════════════════════════════════════
// 7. PARTICLE CANVAS BACKGROUND
// ════════════════════════════════════
(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  const ctx    = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const COLORS = ['rgba(108,99,255,', 'rgba(62,198,224,', 'rgba(167,139,250,'];

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x     = Math.random() * canvas.width;
      this.y     = Math.random() * canvas.height;
      this.size  = Math.random() * 1.5 + 0.3;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.color  = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.alpha  = Math.random() * 0.5 + 0.1;
      this.life   = 0;
      this.maxLife = Math.random() * 300 + 200;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.life++;
      if (this.life > this.maxLife ||
          this.x < 0 || this.x > canvas.width ||
          this.y < 0 || this.y > canvas.height) {
        this.reset();
      }
    }
    draw() {
      const fadeIn  = Math.min(this.life / 30, 1);
      const fadeOut = Math.min((this.maxLife - this.life) / 30, 1);
      const a       = this.alpha * Math.min(fadeIn, fadeOut);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color + a + ')';
      ctx.fill();
    }
  }

  // Connection lines between close particles
  function drawConnections(particles) {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          const alpha = (1 - dist / 100) * 0.07;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(108,99,255,${alpha})`;
          ctx.lineWidth   = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  const particles = Array.from({ length: 90 }, () => new Particle());

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawConnections(particles);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }
  animate();
})();

// ════════════════════════════════════
// 8. ACTIVE NAV LINK ON SCROLL
// ════════════════════════════════════
const sections  = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(link => {
        link.style.color = link.getAttribute('href') === `#${id}`
          ? 'var(--clr-text)'
          : 'var(--clr-text-muted)';
      });
    }
  });
}, { threshold: 0.3 });

sections.forEach(s => sectionObserver.observe(s));

// ════════════════════════════════════
// 9. GITHUB LINK CLICK (placeholder)
// ════════════════════════════════════
const githubLink = document.getElementById('senssystem-github');
if (githubLink) {
  githubLink.addEventListener('click', (e) => {
    // Update href here once you have the real GitHub URL
    // githubLink.href = 'https://github.com/yourusername/senssystem';
    if (githubLink.href === '#' || githubLink.getAttribute('href') === '#') {
      e.preventDefault();
      alert('GitHub URL coming soon! Update the href in the HTML to your real repo link.');
    }
  });
}

console.log('%c✨ Portfolio by Nada / نادة — Software Engineer', 
  'color:#6c63ff;font-size:14px;font-weight:bold;background:#0d1126;padding:8px 16px;border-radius:6px;');
