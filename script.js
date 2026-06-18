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
  let pauseGallery = function () {};

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

  function flashLabel(element, tempLabel, message, duration) {
    const originalLabel = element.dataset.label || '';
    element.dataset.label = tempLabel;
    element.classList.add('is-copied');
    showToast(message);
    setTimeout(() => {
      element.dataset.label = originalLabel;
      element.classList.remove('is-copied');
    }, duration);
  }

  document.querySelectorAll('[data-copy]').forEach((element) => {
    element.addEventListener('click', async (event) => {
      event.preventDefault();

      try {
        await navigator.clipboard.writeText(element.dataset.copy);
        flashLabel(element, 'Copied', 'discord copied. hiba6053', 1300);
      } catch {
        flashLabel(element, element.dataset.copy, 'discord is hiba6053', 1600);
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

    if (next !== 'photos') pauseGallery();

    Object.entries(views).forEach(([name, view]) => {
      if (view) view.hidden = name !== next;
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

  function setupGallery() {
    if (!photoView) return;

    const mainImg = photoView.querySelector('[data-photo-main]');
    const nameEl = photoView.querySelector('[data-photo-name]');
    const indexEl = photoView.querySelector('[data-photo-index]');
    const totalEl = photoView.querySelector('[data-photo-total]');
    const prevBtn = photoView.querySelector('[data-photo-prev]');
    const nextBtn = photoView.querySelector('[data-photo-next]');
    const playBtn = photoView.querySelector('[data-photo-play]');
    const picks = Array.prototype.slice.call(
      photoView.querySelectorAll('[data-photo-pick]')
    );

    if (!mainImg || picks.length === 0) return;

    const slides = picks.map(function (button) {
      const img = button.querySelector('img');
      return {
        button: button,
        src: img ? img.getAttribute('src') : '',
        title: button.dataset.photoTitle || (img ? img.alt : ''),
      };
    });

    let current = 0;
    let timer = 0;

    function setPhoto(index) {
      current = (index + slides.length) % slides.length;
      const slide = slides[current];
      mainImg.src = slide.src;
      mainImg.alt = slide.title;
      if (nameEl) nameEl.textContent = slide.title;
      if (indexEl) indexEl.textContent = String(current + 1);

      slides.forEach(function (entry, position) {
        const active = position === current;
        entry.button.classList.toggle('is-active', active);
        if (active) entry.button.setAttribute('aria-current', 'true');
        else entry.button.removeAttribute('aria-current');
      });
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = 0;
      }
      if (playBtn) {
        playBtn.textContent = 'play';
        playBtn.setAttribute('aria-pressed', 'false');
      }
    }

    function start() {
      stop();
      timer = setInterval(function () {
        setPhoto(current + 1);
      }, 3200);
      if (playBtn) {
        playBtn.textContent = 'pause';
        playBtn.setAttribute('aria-pressed', 'true');
      }
    }

    pauseGallery = stop;

    if (totalEl) totalEl.textContent = String(slides.length);

    if (prevBtn) prevBtn.addEventListener('click', function () {
      stop();
      setPhoto(current - 1);
    });

    if (nextBtn) nextBtn.addEventListener('click', function () {
      stop();
      setPhoto(current + 1);
    });

    if (playBtn) playBtn.addEventListener('click', function () {
      if (timer) stop();
      else start();
    });

    mainImg.addEventListener('click', function () {
      stop();
      setPhoto(current + 1);
    });

    picks.forEach(function (button, position) {
      button.addEventListener('click', function () {
        stop();
        setPhoto(position);
      });
    });

    document.addEventListener('keydown', function (event) {
      if (!root.classList.contains('is-photos') || photoView.hidden) return;
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        stop();
        setPhoto(current - 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        stop();
        setPhoto(current + 1);
      }
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
    });

    setPhoto(0);
  }

  setupGallery();

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
