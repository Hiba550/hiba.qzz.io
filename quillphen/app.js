(() => {
  'use strict';

  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('[data-header]');
  const progressBar = document.querySelector('[data-scroll-progress]');
  const heroMedia = document.querySelector('[data-hero-media]');
  const revealElements = [...document.querySelectorAll('.reveal')];
  const navLinks = [...document.querySelectorAll('[data-nav]')];
  const toast = document.querySelector('[data-toast]');
  let toastTimer = 0;
  let ticking = false;

  function showToast(message) {
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('is-visible');
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2100);
  }

  function setScrollState() {
    const scrollY = window.scrollY;
    const scrollable = Math.max(root.scrollHeight - window.innerHeight, 1);
    const progress = Math.min(Math.max(scrollY / scrollable, 0), 1);

    if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
    if (header) header.classList.toggle('is-scrolled', scrollY > 20);

    if (heroMedia && !reducedMotion.matches && window.innerWidth > 820) {
      const shift = Math.min(scrollY * 0.085, 84);
      heroMedia.style.transform = `translate3d(0, ${shift}px, 0)`;
    }

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(setScrollState);
    }
  }, { passive: true });

  setScrollState();

  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });

    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  }

  function formatCount(value, decimals) {
    return decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
  }

  function animateCounter(element) {
    const target = Number(element.dataset.count);
    if (!Number.isFinite(target)) return;

    const suffix = element.dataset.suffix || '';
    const prefix = element.dataset.prefix || '';
    const decimals = Number(element.dataset.decimals || 0);
    const duration = 1100;
    const startTime = performance.now();

    function update(now) {
      const elapsed = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - elapsed, 4);
      const value = target * eased;
      element.textContent = `${prefix}${formatCount(value, decimals)}${suffix}`;
      if (elapsed < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  const counters = [...document.querySelectorAll('[data-count]')];
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      });
    }, { threshold: 0.7 });
    counters.forEach((counter) => counterObserver.observe(counter));
  }

  const sections = navLinks
    .map((link) => document.getElementById(link.dataset.nav))
    .filter(Boolean);

  function markCurrentNav(id) {
    navLinks.forEach((link) => link.classList.toggle('is-current', link.dataset.nav === id));
  }

  if ('IntersectionObserver' in window && sections.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) markCurrentNav(visible.target.id);
    }, { rootMargin: '-30% 0px -58% 0px', threshold: [0, 0.2, 0.5] });

    sections.forEach((section) => sectionObserver.observe(section));
  }

  document.querySelectorAll('[data-video-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.videoId;
      if (!id) return;

      const frame = document.createElement('iframe');
      frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`;
      frame.title = 'Seraphic visual showcase';
      frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      frame.allowFullscreen = true;
      button.replaceWith(frame);
    });
  });

  document.querySelectorAll('[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      const value = button.dataset.copy;
      if (!value) return;
      try {
        await navigator.clipboard.writeText(value);
        const label = button.querySelector('[data-copy-label]');
        if (label) label.textContent = 'copied';
        showToast(`Discord copied: ${value}`);
        window.setTimeout(() => {
          if (label) label.textContent = 'copy';
        }, 1800);
      } catch (error) {
        showToast(`Discord: ${value}`);
      }
    });
  });

  if (!reducedMotion.matches && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('[data-tilt]').forEach((panel) => {
      panel.addEventListener('pointermove', (event) => {
        const rect = panel.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        panel.style.transform = `perspective(1100px) rotateX(${(-y * 2.4).toFixed(2)}deg) rotateY(${(x * 2.4).toFixed(2)}deg)`;
      });

      panel.addEventListener('pointerleave', () => {
        panel.style.transform = 'perspective(1100px) rotateX(0deg) rotateY(0deg)';
      });
    });
  }

  document.querySelectorAll('img').forEach((image) => {
    image.addEventListener('error', () => {
      if (image.dataset.errorHandled === 'true') return;
      image.dataset.errorHandled = 'true';
      image.classList.add('is-broken');

      const parent = image.parentElement;
      if (!parent || parent.querySelector('.media-fallback')) return;
      if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative';

      const fallback = document.createElement('div');
      fallback.className = 'media-fallback';
      fallback.textContent = 'Media preview unavailable - open the project link for the full showcase.';
      parent.appendChild(fallback);
    });
  });
})();
