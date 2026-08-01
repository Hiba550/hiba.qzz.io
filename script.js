(function () {
  'use strict';

  const root = document.documentElement;
  root.classList.add('js');

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ----------------------------------------------------------------
     theme
  ---------------------------------------------------------------- */

  const themeKey = 'hiba-theme';
  const themeToggle = document.querySelector('[data-theme-toggle]');

  function storedTheme() {
    try {
      return localStorage.getItem(themeKey);
    } catch (err) {
      return null;
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(themeKey, theme);
    } catch (err) {
      showToast('theme set, but your browser won’t remember it next visit');
    }
  }

  function applyTheme(theme) {
    const isDark = theme === 'dark';
    root.dataset.theme = isDark ? 'dark' : 'light';
    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', String(isDark));
      themeToggle.setAttribute(
        'aria-label',
        isDark ? 'Switch to light theme' : 'Switch to dark theme'
      );
    }
  }

  const preferred =
    storedTheme() ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(preferred);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      const swap = () => applyTheme(next);

      if (document.startViewTransition && !reducedMotion.matches) {
        document.startViewTransition(swap);
      } else {
        swap();
      }
      saveTheme(next);
    });
  }

  /* ----------------------------------------------------------------
     header border on scroll
  ---------------------------------------------------------------- */

  const header = document.querySelector('[data-header]');
  let scrollTicking = false;

  function atPageBottom() {
    return window.innerHeight + window.scrollY >= root.scrollHeight - 4;
  }

  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);

    // the ends of the page never cross the observers' bands — handle them here
    if (atPageBottom()) {
      revealElements.forEach((el) => el.classList.add('is-visible'));
      setCurrentNav('contact');
    } else if (window.scrollY < 120) {
      setCurrentNav(null);
    }

    scrollTicking = false;
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!scrollTicking) {
        scrollTicking = true;
        requestAnimationFrame(onScroll);
      }
    },
    { passive: true }
  );

  /* ----------------------------------------------------------------
     reveal on scroll
  ---------------------------------------------------------------- */

  const revealElements = document.querySelectorAll('.reveal');

  revealElements.forEach((el) => {
    const stagger = el.dataset.stagger;
    if (stagger) el.style.setProperty('--stagger', stagger);
  });

  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('is-visible'));
  }

  /* ----------------------------------------------------------------
     stat count-up
  ---------------------------------------------------------------- */

  function animateCount(el) {
    const rawTarget = el.dataset.count;
    const target = parseFloat(rawTarget);
    if (Number.isNaN(target)) return;

    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const decimals = (rawTarget.split('.')[1] || '').length;
    const duration = 900;
    let start = 0;

    function frame(now) {
      if (!start) start = now;
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      const displayValue = decimals
        ? value.toFixed(decimals)
        : String(Math.round(value));
      el.textContent = prefix + displayValue + suffix;
      if (progress < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  const counters = document.querySelectorAll('[data-count]');

  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => countObserver.observe(el));
  }

  /* ----------------------------------------------------------------
     active section in nav
  ---------------------------------------------------------------- */

  const navLinks = document.querySelectorAll('[data-nav]');
  const sections = [];

  navLinks.forEach((link) => {
    const section = document.getElementById(link.dataset.nav);
    if (section) sections.push(section);
  });

  function setCurrentNav(id) {
    navLinks.forEach((link) => {
      link.classList.toggle('is-current', link.dataset.nav === id);
    });
  }

  if ('IntersectionObserver' in window && sections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        if (atPageBottom() || window.scrollY < 120) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting) setCurrentNav(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* ----------------------------------------------------------------
     toast + copy + little messages
  ---------------------------------------------------------------- */

  const toast = document.querySelector('[data-toast]');
  let toastTimer = 0;

  function showToast(message) {
    if (!toast || !message) return;
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('is-visible');
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2000);
  }

  document.querySelectorAll('[data-message]').forEach((el) => {
    el.addEventListener('click', (event) => {
      event.preventDefault();
      showToast(el.dataset.message);
    });
  });

  document.querySelectorAll('[data-copy]').forEach((el) => {
    el.addEventListener('click', async (event) => {
      event.preventDefault();
      const value = el.dataset.copy;
      try {
        await navigator.clipboard.writeText(value);
        showToast(el.dataset.copiedMessage || 'copied — ' + value);
      } catch (err) {
        showToast('discord is ' + value);
      }
    });
  });

  /* ----------------------------------------------------------------
     graceful image failure
  ---------------------------------------------------------------- */

  onScroll();

  document.querySelectorAll('img[loading]').forEach((img) => {
    img.addEventListener('error', () => {
      if (img.dataset.errorHandled) return;
      img.dataset.errorHandled = 'true';
      img.style.display = 'none';
      const notice = document.createElement('p');
      notice.textContent = 'image could not be loaded.';
      notice.style.cssText =
        'margin:0;padding:2.5rem 1rem;color:var(--muted);font-size:0.85rem;text-align:center';
      img.parentNode.insertBefore(notice, img.nextSibling);
    });
  });
})();
