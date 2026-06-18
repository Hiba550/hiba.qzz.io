/**
 * @jest-environment jsdom
 */

'use strict';

function buildDOM() {
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.className = '';
  document.body.innerHTML = `
    <button data-theme-toggle aria-pressed="false">dark mode</button>
    <div class="tab-row">
      <button data-tab="home" class="is-active" aria-selected="true">home</button>
      <button data-tab="work" aria-selected="false">work</button>
      <button data-tab="photos" aria-selected="false">photos</button>
    </div>
    <section data-photo-view hidden>Photos</section>
    <div data-work-view hidden>Work</div>
    <p data-toast role="status"></p>
    <a href="#" data-message="hello from x" data-label="X">X link</a>
    <a href="#" data-copy="hiba6053" data-label="Discord">Discord link</a>
  `;
}

function loadScript() {
  jest.resetModules();
  return require('./script');
}

beforeEach(() => {
  jest.useFakeTimers();
  localStorage.clear();
  // Reset location hash
  window.location.hash = '';
  buildDOM();
});

afterEach(() => {
  jest.useRealTimers();
});

// ---------- Theme Management ----------

describe('readTheme', () => {
  it('returns null when nothing is stored', () => {
    const { readTheme } = loadScript();
    localStorage.removeItem('hiba-theme');
    expect(readTheme()).toBeNull();
  });

  it('returns the stored theme value', () => {
    localStorage.setItem('hiba-theme', 'dark');
    const { readTheme } = loadScript();
    expect(readTheme()).toBe('dark');
  });

  it('returns null when localStorage throws', () => {
    const { readTheme } = loadScript();
    const spy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Access denied');
    });
    expect(readTheme()).toBeNull();
    spy.mockRestore();
  });
});

describe('writeTheme', () => {
  it('persists theme to localStorage', () => {
    const { writeTheme } = loadScript();
    writeTheme('dark');
    expect(localStorage.getItem('hiba-theme')).toBe('dark');
  });

  it('does not throw when localStorage is unavailable', () => {
    const { writeTheme } = loadScript();
    const spy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() => writeTheme('dark')).not.toThrow();
    spy.mockRestore();
  });
});

describe('applyTheme', () => {
  it('sets data-theme to dark when given "dark"', () => {
    const { applyTheme } = loadScript();
    applyTheme('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('sets data-theme to light for any non-dark value', () => {
    const { applyTheme } = loadScript();
    applyTheme('light');
    expect(document.documentElement.dataset.theme).toBe('light');

    applyTheme(null);
    expect(document.documentElement.dataset.theme).toBe('light');

    applyTheme('random');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('updates toggle button text to "light mode" for dark theme', () => {
    const { applyTheme } = loadScript();
    applyTheme('dark');
    const toggle = document.querySelector('[data-theme-toggle]');
    expect(toggle.textContent).toBe('light mode');
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
  });

  it('updates toggle button text to "dark mode" for light theme', () => {
    const { applyTheme } = loadScript();
    applyTheme('light');
    const toggle = document.querySelector('[data-theme-toggle]');
    expect(toggle.textContent).toBe('dark mode');
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
  });
});

describe('theme toggle click', () => {
  it('toggles from light to dark on click', () => {
    loadScript(); // initializes to light (no stored theme)
    const toggle = document.querySelector('[data-theme-toggle]');
    expect(document.documentElement.dataset.theme).toBe('light');
    toggle.click();
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('hiba-theme')).toBe('dark');
  });

  it('toggles from dark to light on click', () => {
    localStorage.setItem('hiba-theme', 'dark');
    loadScript(); // initializes to dark
    expect(document.documentElement.dataset.theme).toBe('dark');
    const toggle = document.querySelector('[data-theme-toggle]');
    toggle.click();
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem('hiba-theme')).toBe('light');
  });

  it('updates toggle button text after toggling', () => {
    loadScript();
    const toggle = document.querySelector('[data-theme-toggle]');
    // Initially light, so button says "dark mode"
    expect(toggle.textContent).toBe('dark mode');
    toggle.click();
    // Now dark, so button says "light mode"
    expect(toggle.textContent).toBe('light mode');
    toggle.click();
    expect(toggle.textContent).toBe('dark mode');
  });
});

// ---------- Toast ----------

describe('showToast', () => {
  it('displays a message in the toast element', () => {
    const { showToast } = loadScript();
    const toast = document.querySelector('[data-toast]');
    showToast('Hello');
    expect(toast.textContent).toBe('Hello');
    expect(toast.classList.contains('is-visible')).toBe(true);
  });

  it('removes the toast after 1900ms', () => {
    const { showToast } = loadScript();
    const toast = document.querySelector('[data-toast]');
    showToast('Timeout');
    expect(toast.classList.contains('is-visible')).toBe(true);
    jest.advanceTimersByTime(1900);
    expect(toast.classList.contains('is-visible')).toBe(false);
  });

  it('does nothing when message is empty', () => {
    const { showToast } = loadScript();
    const toast = document.querySelector('[data-toast]');
    showToast('');
    expect(toast.classList.contains('is-visible')).toBe(false);
  });

  it('does nothing when message is null/undefined', () => {
    const { showToast } = loadScript();
    const toast = document.querySelector('[data-toast]');
    showToast(null);
    expect(toast.classList.contains('is-visible')).toBe(false);
    showToast(undefined);
    expect(toast.classList.contains('is-visible')).toBe(false);
  });

  it('resets timer when called again quickly', () => {
    const { showToast } = loadScript();
    const toast = document.querySelector('[data-toast]');
    showToast('First');
    expect(toast.textContent).toBe('First');
    jest.advanceTimersByTime(1000);
    showToast('Second');
    expect(toast.textContent).toBe('Second');
    jest.advanceTimersByTime(1000);
    expect(toast.classList.contains('is-visible')).toBe(true);
    jest.advanceTimersByTime(900);
    expect(toast.classList.contains('is-visible')).toBe(false);
  });
});

// ---------- Tab Navigation ----------

describe('showTab', () => {
  it('activates the home tab by default on load', () => {
    loadScript();
    const homeBtn = document.querySelector('[data-tab="home"]');
    expect(homeBtn.classList.contains('is-active')).toBe(true);
    expect(homeBtn.getAttribute('aria-selected')).toBe('true');
  });

  it('switches to the work tab', () => {
    const { showTab } = loadScript();
    showTab('work', false);
    const workBtn = document.querySelector('[data-tab="work"]');
    const homeBtn = document.querySelector('[data-tab="home"]');
    expect(workBtn.classList.contains('is-active')).toBe(true);
    expect(workBtn.getAttribute('aria-selected')).toBe('true');
    expect(homeBtn.classList.contains('is-active')).toBe(false);
    expect(homeBtn.getAttribute('aria-selected')).toBe('false');
  });

  it('switches to the photos tab and shows photo view', () => {
    const { showTab } = loadScript();
    showTab('photos', false);
    const photoView = document.querySelector('[data-photo-view]');
    const workView = document.querySelector('[data-work-view]');
    expect(photoView.hidden).toBe(false);
    expect(workView.hidden).toBe(true);
    expect(document.documentElement.classList.contains('is-photos')).toBe(true);
    expect(document.documentElement.classList.contains('is-work')).toBe(false);
  });

  it('shows work view and hides photos when switching to work', () => {
    const { showTab } = loadScript();
    showTab('work', false);
    const photoView = document.querySelector('[data-photo-view]');
    const workView = document.querySelector('[data-work-view]');
    expect(workView.hidden).toBe(false);
    expect(photoView.hidden).toBe(true);
    expect(document.documentElement.classList.contains('is-work')).toBe(true);
    expect(document.documentElement.classList.contains('is-photos')).toBe(false);
  });

  it('hides all views when switching to home', () => {
    const { showTab } = loadScript();
    showTab('work', false);
    showTab('home', false);
    const photoView = document.querySelector('[data-photo-view]');
    const workView = document.querySelector('[data-work-view]');
    expect(workView.hidden).toBe(true);
    expect(photoView.hidden).toBe(true);
    expect(document.documentElement.classList.contains('is-work')).toBe(false);
    expect(document.documentElement.classList.contains('is-photos')).toBe(false);
  });

  it('falls back to home for unknown targets', () => {
    const { showTab } = loadScript();
    showTab('nonexistent', false);
    const homeBtn = document.querySelector('[data-tab="home"]');
    expect(homeBtn.classList.contains('is-active')).toBe(true);
  });

  it('updates the URL hash when pushUrl is true', () => {
    const { showTab } = loadScript();
    const spy = jest.spyOn(history, 'replaceState');
    showTab('photos', true);
    expect(spy).toHaveBeenCalledWith(null, '', '#photos');
    spy.mockRestore();
  });

  it('removes hash for home when pushUrl is true', () => {
    const { showTab } = loadScript();
    const spy = jest.spyOn(history, 'replaceState');
    showTab('home', true);
    expect(spy).toHaveBeenCalledWith(null, '', location.pathname);
    spy.mockRestore();
  });

  it('does not update the URL when pushUrl is false', () => {
    const { showTab } = loadScript();
    const spy = jest.spyOn(history, 'replaceState');
    showTab('photos', false);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('tab button click', () => {
  it('switches tab when a tab button is clicked', () => {
    loadScript();
    const workBtn = document.querySelector('[data-tab="work"]');
    workBtn.click();
    expect(workBtn.classList.contains('is-active')).toBe(true);
    expect(workBtn.getAttribute('aria-selected')).toBe('true');
    const workView = document.querySelector('[data-work-view]');
    expect(workView.hidden).toBe(false);
  });

  it('updates URL hash on tab button click', () => {
    loadScript();
    const spy = jest.spyOn(history, 'replaceState');
    const photosBtn = document.querySelector('[data-tab="photos"]');
    photosBtn.click();
    expect(spy).toHaveBeenCalledWith(null, '', '#photos');
    spy.mockRestore();
  });
});

// ---------- data-message click handler ----------

describe('data-message click handler', () => {
  it('shows a toast with the element data-message on click', () => {
    loadScript();
    const msgLink = document.querySelector('[data-message]');
    const toast = document.querySelector('[data-toast]');
    msgLink.click();
    expect(toast.textContent).toBe('hello from x');
    expect(toast.classList.contains('is-visible')).toBe(true);
  });

  it('prevents default navigation', () => {
    loadScript();
    const msgLink = document.querySelector('[data-message]');
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    const prevented = !msgLink.dispatchEvent(event);
    expect(prevented).toBe(true);
  });
});

// ---------- data-copy click handler ----------

describe('data-copy click handler', () => {
  it('copies text and shows success toast when clipboard works', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
    });
    loadScript();
    const copyLink = document.querySelector('[data-copy]');
    const toast = document.querySelector('[data-toast]');

    copyLink.click();
    // Allow the async handler to resolve.
    await Promise.resolve();
    await Promise.resolve();

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hiba6053');
    expect(copyLink.dataset.label).toBe('Copied');
    expect(copyLink.classList.contains('is-copied')).toBe(true);
    expect(toast.textContent).toBe('discord copied. hiba6053');

    jest.advanceTimersByTime(1300);
    expect(copyLink.dataset.label).toBe('Discord');
    expect(copyLink.classList.contains('is-copied')).toBe(false);
  });

  it('falls back gracefully when clipboard rejects', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockRejectedValue(new Error('denied')) },
    });
    loadScript();
    const copyLink = document.querySelector('[data-copy]');
    const toast = document.querySelector('[data-toast]');

    copyLink.click();
    // Allow the async handler and catch to resolve.
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(copyLink.dataset.label).toBe('hiba6053');
    expect(copyLink.classList.contains('is-copied')).toBe(true);
    expect(toast.textContent).toBe('discord is hiba6053');

    jest.advanceTimersByTime(1600);
    expect(copyLink.dataset.label).toBe('Discord');
    expect(copyLink.classList.contains('is-copied')).toBe(false);
  });

  it('restores original label even if empty', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
    });
    buildDOM();
    // Remove the label attribute to test fallback to ''
    const copyLink = document.querySelector('[data-copy]');
    delete copyLink.dataset.label;
    loadScript();

    const link = document.querySelector('[data-copy]');
    link.click();
    await Promise.resolve();
    await Promise.resolve();

    jest.advanceTimersByTime(1300);
    expect(link.dataset.label).toBe('');
  });
});

// ---------- Initialization ----------

describe('initialization', () => {
  it('reads hash on load and activates the corresponding tab', () => {
    window.location.hash = '#work';
    buildDOM();
    loadScript();
    const workBtn = document.querySelector('[data-tab="work"]');
    expect(workBtn.classList.contains('is-active')).toBe(true);
    expect(workBtn.getAttribute('aria-selected')).toBe('true');
  });

  it('applies stored dark theme on load', () => {
    localStorage.setItem('hiba-theme', 'dark');
    buildDOM();
    loadScript();
    expect(document.documentElement.dataset.theme).toBe('dark');
    const toggle = document.querySelector('[data-theme-toggle]');
    expect(toggle.textContent).toBe('light mode');
  });

  it('defaults to light when no theme is stored', () => {
    buildDOM();
    loadScript();
    expect(document.documentElement.dataset.theme).toBe('light');
    const toggle = document.querySelector('[data-theme-toggle]');
    expect(toggle.textContent).toBe('dark mode');
  });

  it('handles missing hash gracefully (defaults to home)', () => {
    window.location.hash = '';
    buildDOM();
    loadScript();
    const homeBtn = document.querySelector('[data-tab="home"]');
    expect(homeBtn.classList.contains('is-active')).toBe(true);
  });
});
