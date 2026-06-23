document.addEventListener('DOMContentLoaded', () => {
  initBoot();
  initMobileNav();
  initScrollReveal();
});

/* ---------------------------------------------
   Boot sequence: short, auto-finishes, skippable
   by click/scroll/keypress. Never blocks content
   for more than ~1.3s on a normal pass.
--------------------------------------------- */
function initBoot() {
  const boot = document.getElementById('boot');
  if (!boot) return;

  // Skip immediately if user has seen it before in this session,
  // or prefers reduced motion.
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const seen = sessionStorage.getItem('bootSeen');

  if (reduced || seen) {
    boot.classList.add('boot-hide');
    boot.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    return;
  }

  document.body.style.overflow = 'hidden';
  const lines = boot.querySelectorAll('.boot-line');

  lines.forEach((line, i) => {
    setTimeout(() => line.classList.add('boot-show'), i * 220);
  });

  const finish = () => {
    boot.classList.add('boot-hide');
    document.body.style.overflow = '';
    sessionStorage.setItem('bootSeen', '1');
    window.removeEventListener('click', finish);
    window.removeEventListener('keydown', finish);
    window.removeEventListener('touchstart', finish);
  };

  const autoFinish = setTimeout(finish, 1300);

  // Allow user to skip early
  const skip = () => { clearTimeout(autoFinish); finish(); };
  window.addEventListener('click', skip, { once: true });
  window.addEventListener('keydown', skip, { once: true });
  window.addEventListener('touchstart', skip, { once: true });
}

/* ---------------------------------------------
   Mobile nav toggle
--------------------------------------------- */
function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('mobileNav');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------------------------------------------
   Subtle scroll-reveal for sections and cards
--------------------------------------------- */
function initScrollReveal() {
  const targets = document.querySelectorAll(
    '.project-card, .edu-item, .info-block, .contact-card, .skill-group'
  );
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach((t) => t.style.opacity = '1');
    return;
  }

  targets.forEach((t) => {
    t.style.opacity = '0';
    t.style.transform = 'translateY(12px)';
    t.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  targets.forEach((t) => observer.observe(t));
}
