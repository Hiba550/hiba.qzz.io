(function () {
  'use strict';

  const root = document.documentElement;
  const toast = document.querySelector('[data-toast]');
  const tabButtons = document.querySelectorAll('[data-tab]');
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const photoView = document.querySelector('[data-photo-view]');
  const workView = document.querySelector('[data-work-view]');
  const views = { home: null, photos: photoView, work: workView };
  const themeKey = 'hiba-theme';

  let toastTimer = 0;
  let storageAvailable = true;

  function readTheme() {
    try {
      return localStorage.getItem(themeKey);
    } catch (err) {
      storageAvailable = false;
      console.warn('Could not read theme preference from localStorage:', err);
      return null;
    }
  }

  function writeTheme(theme) {
    try {
      localStorage.setItem(themeKey, theme);
    } catch (err) {
      storageAvailable = false;
      console.warn('Could not save theme preference to localStorage:', err);
      showToast('theme set, but your browser won\u2019t remember it next visit');
    }
  }

  function applyTheme(theme) {
    const nextTheme = theme === 'dark' ? 'dark' : 'light';
    root.dataset.theme = nextTheme;

    if (themeToggle) {
      const isDark = nextTheme === 'dark';
      themeToggle.textContent = isDark ? 'light mode' : 'dark mode';
      themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    }
  }

  applyTheme(readTheme());

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      writeTheme(nextTheme);
    });
  }

  function showToast(message) {
    if (!toast || !message) return;
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('is-visible');
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 1900);
  }

  document.querySelectorAll('[data-message]').forEach((element) => {
    element.addEventListener('click', (event) => {
      event.preventDefault();
      showToast(element.dataset.message);
    });
  });

  document.querySelectorAll('[data-copy]').forEach((element) => {
    element.addEventListener('click', async (event) => {
      event.preventDefault();
      const originalLabel = element.dataset.label || '';

      try {
        await navigator.clipboard.writeText(element.dataset.copy);
        element.dataset.label = 'Copied';
        element.classList.add('is-copied');
        showToast('discord copied. hiba6053');
        setTimeout(() => {
          element.dataset.label = originalLabel;
          element.classList.remove('is-copied');
        }, 1300);
      } catch {
        element.dataset.label = element.dataset.copy;
        element.classList.add('is-copied');
        showToast('discord is hiba6053');
        setTimeout(() => {
          element.dataset.label = originalLabel;
          element.classList.remove('is-copied');
        }, 1600);
      }
    });
  });

  function showTab(target, pushUrl) {
    const next = Object.prototype.hasOwnProperty.call(views, target) ? target : 'home';

    tabButtons.forEach((button) => {
      const active = button.dataset.tab === next;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    root.classList.toggle('is-photos', next === 'photos');
    root.classList.toggle('is-work', next === 'work');

    Object.entries(views).forEach(([name, view]) => {
      if (!view) return;

      if (name === next) {
        view.hidden = false;
      } else {
        view.hidden = true;
      }
    });

    if (pushUrl) {
      try {
        history.replaceState(null, '', next === 'home' ? location.pathname : `#${next}`);
      } catch (err) {
        console.warn('Could not update URL for tab "' + next + '":', err);
      }
    }
  }

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => showTab(button.dataset.tab, true));
  });

  showTab(location.hash.replace('#', ''), false);

  document.querySelectorAll('img[loading]').forEach(function (img) {
    img.addEventListener('error', function () {
      if (img.dataset.errorHandled) return;
      img.dataset.errorHandled = 'true';
      console.warn('Image failed to load:', img.src);
      img.alt = (img.alt || 'Image') + ' (failed to load)';
      img.style.display = 'none';
      var notice = document.createElement('p');
      notice.textContent = 'image could not be loaded.';
      notice.style.cssText = 'padding:1rem;color:var(--muted);font:0.9rem/1.4 "Courier New",monospace;text-align:center';
      img.parentNode.insertBefore(notice, img.nextSibling);
    });
  });

  window.addEventListener('error', function (event) {
    console.error('Uncaught error:', event.error || event.message);
    showToast('something went wrong. check the console for details.');
  });

  window.addEventListener('unhandledrejection', function (event) {
    console.error('Unhandled promise rejection:', event.reason);
    showToast('something went wrong. check the console for details.');
  });
})();
