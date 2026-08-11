/* ═══════════════════════════════════════════════════════════════════
   NADA PORTFOLIO — app.js
   Handles: particles, QR code, language toggle, scroll effects,
            counter animation, intersection observers
   ═══════════════════════════════════════════════════════════════════ */

'use strict';

// ════════════════════════════════════
// 1. LANGUAGE TOGGLE (EN ↔ AR)
// ════════════════════════════════════
const langBtn = document.getElementById('lang-btn');
let isArabic  = false;

function getDisplayType(el) {
  // Determine appropriate display value based on tag
  const tag = el.tagName.toLowerCase();
  if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'ul', 'li', 'section', 'article'].includes(tag)) return 'block';
  if (tag === 'span') return 'inline';
  return 'block';
}

function setLanguage(arabic) {
  isArabic = arabic;
  const body = document.body;

  // Hide/show English text
  document.querySelectorAll('.en-text').forEach(el => {
    el.style.display = arabic ? 'none' : getDisplayType(el);
  });

  // Hide/show Arabic text
  document.querySelectorAll('.ar-text').forEach(el => {
    el.style.display = arabic ? getDisplayType(el) : 'none';
  });

  // Hero role Arabic row (needs flex)
  const heroRoleAr = document.getElementById('hero-role-ar');
  if (heroRoleAr) heroRoleAr.style.display = arabic ? 'flex' : 'none';

  // English hero role row
  const heroRoleEn = document.querySelector('.hero-role:not(#hero-role-ar)');
  if (heroRoleEn) heroRoleEn.style.display = arabic ? 'none' : 'flex';

  if (arabic) {
    body.classList.add('rtl');
    body.setAttribute('dir', 'rtl');
    body.setAttribute('lang', 'ar');
    document.documentElement.setAttribute('lang', 'ar');
    document.documentElement.setAttribute('dir', 'rtl');
    langBtn.querySelector('.lang-current').textContent = 'English';
  } else {
    body.classList.remove('rtl');
    body.setAttribute('dir', 'ltr');
    body.setAttribute('lang', 'en');
    document.documentElement.setAttribute('lang', 'en');
    document.documentElement.setAttribute('dir', 'ltr');
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
// 4. QR CODE (disabled — no QR section in current HTML)
// ════════════════════════════════════
// QR elements are not present in this version of the portfolio.

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
