/* Fixed JS: GSAP + AOS + interactions
   - Removed the generic ".rounded-3xl" animation that caused disappearance
   - Animate only .hero-stats-card for the hero card
   - Intersection observer animations do not overwrite unintended targets
   - Defensive checks for missing elements
*/

AOS.init({ duration: 600, once: true, easing: 'ease-out-cubic' });

/* footer year (defensive) */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* mobile menu toggle (defensive) */
const mobileBtn = document.getElementById('mobileBtn');
const mobileMenu = document.getElementById('mobileMenu');
if (mobileBtn && mobileMenu) {
  mobileBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    mobileMenu.classList.toggle('show');
  });
}

/* smooth anchor scroll */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (!href || href === '#') return;
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) mobileMenu.classList.add('hidden');
  });
});

/* GSAP setup */
gsap.registerPlugin();

/* HERO TIMELINE - animate only elements with [data-anim] (safe) and hero-stats-card separately */
const heroTL = gsap.timeline();
heroTL.from("[data-anim]", { y: 24, opacity: 0, stagger: 0.12, duration: 0.7, ease: "power4.out" });

// Animate hero stats card specifically (only once, safe)
if (document.querySelector('.hero-stats-card')) {
  heroTL.from(".hero-stats-card", { y: 40, opacity: 0, duration: 0.9, ease: "power3.out" }, "-=100");
}

/* Intersection-driven section animations (slide + fade + stagger children)
   Use fromTo without `overwrite:true` to avoid clobbering styles on other elements.
*/
const sections = document.querySelectorAll('[data-section]');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const targets = el.querySelectorAll('[data-anim]');
      if (targets.length) {
        // animate child targets with a gentle stagger
        gsap.fromTo(Array.from(targets), 
          { y: 30, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: "power3.out" }
        );
      } else {
        // animate section container if no data-anim children
        gsap.fromTo(el, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" });
      }
      sectionObserver.unobserve(el);
    }
  });
}, { threshold: 0.15 });

sections.forEach(s => sectionObserver.observe(s));

/* Chief guest image tilt micro-parallax (defensive) */
const chiefPhoto = document.getElementById('chiefPhoto');
if (chiefPhoto) {
  chiefPhoto.addEventListener('mousemove', (e) => {
    const r = chiefPhoto.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (py - 0.5) * 8; // tilt range
    const ry = (px - 0.5) * -8;
    gsap.to(chiefPhoto, { rotateX: rx, rotateY: ry, duration: 0.4, ease: "power2.out", transformPerspective: 900, transformOrigin: "center" });
  });
  chiefPhoto.addEventListener('mouseleave', () => {
    gsap.to(chiefPhoto, { rotateX: 0, rotateY: 0, duration: 0.6, ease: "power3.out" });
  });
}

/* Sponsor & Gallery hover micro-animations (strong pop) */
document.querySelectorAll('.sponsor-card, .gallery-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    gsap.to(card, { scale: 1.02, y: -6, boxShadow: "0 30px 80px rgba(15,15,15,0.14)", duration: 0.36, ease: "power3.out" });
  });
  card.addEventListener('mouseleave', () => {
    gsap.to(card, { scale: 1, y: 0, boxShadow: "0 8px 24px rgba(15,15,15,0.04)", duration: 0.36, ease: "power3.out" });
  });
});

/* Lightbox for gallery (defensive) */
const galleryCards = document.querySelectorAll('.gallery-card');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');

if (galleryCards.length && lightbox && lightboxImg) {
  galleryCards.forEach(card => {
    card.setAttribute('tabindex', '0');
    card.addEventListener('click', () => openLightbox(card));
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter') openLightbox(card); });
  });
}

function openLightbox(card) {
  const img = card.querySelector('img');
  if (!img || !lightbox || !lightboxImg) return;
  lightboxImg.src = img.src;
  if (lightboxCaption) lightboxCaption.textContent = card.getAttribute('data-caption') || img.alt || '';
  lightbox.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  gsap.fromTo('#lightbox .max-w-5xl', { scale: 0.96, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.32 });
}

if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightbox) lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && lightbox && !lightbox.classList.contains('hidden')) closeLightbox(); });
function closeLightbox() { if (!lightbox) return; lightbox.classList.add('hidden'); document.body.style.overflow = ''; }

/* FAQ accordion (strong open animation) */
document.querySelectorAll('.faq-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const parent = btn.closest('.faq');
    if (!parent) return;
    const body = parent.querySelector('.faq-body');
    const icon = btn.querySelector('.faq-icon');
    if (!body) return;
    const isHidden = body.classList.contains('hidden');

    // close other items
    document.querySelectorAll('.faq .faq-body').forEach(b => { if (b !== body) b.classList.add('hidden'); });
    document.querySelectorAll('.faq .faq-icon').forEach(i => { if (i !== icon) i.style.transform = 'rotate(0deg)'; });

    if (isHidden) {
      body.classList.remove('hidden');
      gsap.fromTo(body, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.34, ease: 'power3.out' });
      if (icon) icon.style.transform = 'rotate(180deg)';
      body.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      gsap.to(body, { height: 0, opacity: 0, duration: 0.26, onComplete: () => body.classList.add('hidden') });
      if (icon) icon.style.transform = 'rotate(0deg)';
    }
  });
});

/* Performance: lazy load images */
document.querySelectorAll('img').forEach(img => { img.loading = 'lazy'; });


function updateCountdown() {
    const eventDate = new Date("December 5, 2025 09:00:00").getTime();
    const now = new Date().getTime();
    const diff = eventDate - now;

    if (diff <= 0) return;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById("days").innerText = days;
    document.getElementById("hours").innerText = hours;
    document.getElementById("minutes").innerText = minutes;
    document.getElementById("seconds").innerText = seconds;
}

setInterval(updateCountdown, 1000);
updateCountdown();
