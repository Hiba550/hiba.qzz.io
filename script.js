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

  function updateHeader() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
    scrollTicking = false;
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!scrollTicking) {
        scrollTicking = true;
        requestAnimationFrame(updateHeader);
      }
    },
    { passive: true }
  );
  updateHeader();

  /* ----------------------------------------------------------------
     tabs — sliding indicator, animated view switch, hash routing
  ---------------------------------------------------------------- */

  const tablist = document.querySelector('[data-tablist]');
  const indicator = document.querySelector('[data-tab-indicator]');
  const tabs = Array.from(document.querySelectorAll('[data-tab]'));
  const views = {};

  document.querySelectorAll('[data-view]').forEach((view) => {
    views[view.dataset.view] = view;
    // stagger order for the entrance animation
    view.querySelectorAll('.reveal').forEach((el, i) => {
      el.style.setProperty('--stagger', String(Math.min(i, 8)));
    });
  });

  let activeName = 'home';
  let pendingCommit = null;
  let pendingTimer = 0;

  function moveIndicator() {
    if (!indicator || !tablist) return;
    const current = tabs.find((tab) => tab.dataset.tab === activeName);
    if (!current) return;
    indicator.style.width = current.offsetWidth + 'px';
    indicator.style.transform = 'translateX(' + current.offsetLeft + 'px)';
    tablist.classList.add('is-ready');
  }

  function setTabState(name) {
    tabs.forEach((tab) => {
      const selected = tab.dataset.tab === name;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    moveIndicator();
  }

  function finalizePending() {
    if (pendingCommit) {
      clearTimeout(pendingTimer);
      const commit = pendingCommit;
      pendingCommit = null;
      commit();
    }
  }

  function enterView(view, animate) {
    view.classList.add('is-active');
    window.scrollTo(0, 0);
    if (animate && !reducedMotion.matches) {
      view.classList.remove('is-entering');
      void view.offsetWidth; // restart the entrance animation
      view.classList.add('is-entering');
    }
  }

  function showView(name, options) {
    const opts = options || {};
    const next = views[name] ? name : 'home';

    finalizePending();
    if (next === activeName) {
      setTabState(next);
      return;
    }

    if (opts.push !== false) {
      try {
        const url = next === 'home' ? location.pathname + location.search : '#' + next;
        history.pushState(null, '', url);
      } catch (err) {
        /* sandboxed contexts may refuse; tab still switches */
      }
    }

    document.title = next === 'home' ? 'Hiba' : 'Hiba — ' + next;

    const current = views[activeName];
    activeName = next;
    setTabState(next);

    const commit = () => {
      pendingCommit = null;
      current.classList.remove('is-active', 'is-leaving');
      enterView(views[next], opts.animate !== false);
    };

    if (opts.animate === false || reducedMotion.matches) {
      commit();
    } else {
      current.classList.add('is-leaving');
      pendingCommit = commit;
      pendingTimer = setTimeout(commit, 160);
    }
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => showView(tab.dataset.tab));
  });

  document.querySelectorAll('[data-tab-link]').forEach((el) => {
    el.addEventListener('click', () => showView(el.dataset.tabLink));
  });

  // roving focus per the ARIA tabs pattern
  if (tablist) {
    tablist.addEventListener('keydown', (event) => {
      const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
      if (!keys.includes(event.key)) return;
      event.preventDefault();

      const index = tabs.findIndex((tab) => tab.dataset.tab === activeName);
      let nextIndex = index;
      if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = tabs.length - 1;

      tabs[nextIndex].focus();
      showView(tabs[nextIndex].dataset.tab);
    });
  }

  window.addEventListener('popstate', () => {
    showView(location.hash.replace('#', '') || 'home', { push: false });
  });

  let resizeTicking = false;
  window.addEventListener('resize', () => {
    if (!resizeTicking) {
      resizeTicking = true;
      requestAnimationFrame(() => {
        moveIndicator();
        resizeTicking = false;
      });
    }
  });

  // initial view: honor a #work / #photos deep link, no leave animation
  const initial = location.hash.replace('#', '');
  if (views[initial] && initial !== 'home') {
    showView(initial, { push: false, animate: false });
    enterView(views[initial], true);
  } else {
    setTabState('home');
    if (!reducedMotion.matches) views.home.classList.add('is-entering');
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(moveIndicator);
  }

  /* ----------------------------------------------------------------
     stat count-up
  ---------------------------------------------------------------- */

  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    if (Number.isNaN(target)) return;

    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 900;
    let start = 0;

    function frame(now) {
      if (!start) start = now;
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

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
    document.querySelectorAll('[data-count]').forEach((el) => countObserver.observe(el));
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
