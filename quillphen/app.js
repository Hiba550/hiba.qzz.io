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

  const studioLogo = 'https://raw.githubusercontent.com/Jiyath5516F/Seraphic-RTX/main/assets/img/logo/header-logo.png';

  const favicon = document.querySelector('link[rel~="icon"]');
  if (favicon) {
    favicon.href = studioLogo;
    favicon.type = 'image/png';
  }

  const headerLogo = document.querySelector('.brand img');
  if (headerLogo) {
    headerLogo.src = studioLogo;
    headerLogo.alt = 'Seraphic Studio';
    headerLogo.removeAttribute('width');
    headerLogo.removeAttribute('height');
    headerLogo.style.width = 'clamp(104px, 10vw, 150px)';
    headerLogo.style.height = 'auto';
    headerLogo.style.maxHeight = '42px';
    headerLogo.style.objectFit = 'contain';
  }

  const brandCopy = document.querySelector('.brand-copy strong');
  if (brandCopy) brandCopy.style.display = 'none';

  const footerBrand = document.querySelector('.footer-brand');
  const footerLogo = footerBrand?.querySelector('img');
  if (footerLogo) {
    footerLogo.src = studioLogo;
    footerLogo.alt = 'Seraphic Studio';
    footerLogo.removeAttribute('width');
    footerLogo.removeAttribute('height');
    footerLogo.style.width = '132px';
    footerLogo.style.height = 'auto';
    footerLogo.style.maxHeight = '36px';
    footerLogo.style.objectFit = 'contain';
  }
  const footerBrandText = footerBrand?.querySelector('span');
  if (footerBrandText) footerBrandText.style.display = 'none';

  const seraphicCard = [...document.querySelectorAll('.person-card')]
    .find((card) => card.textContent.includes('0x4a4b / Seraphic'));

  if (seraphicCard) {
    const mark = seraphicCard.querySelector('.person-mark');
    if (mark) mark.textContent = '0x';

    const details = seraphicCard.querySelector('dl');
    if (details && !details.querySelector('[data-seraphic-discord]')) {
      const row = document.createElement('div');
      row.dataset.seraphicDiscord = 'true';
      row.innerHTML = '<dt>Discord</dt><dd>0x4a4b</dd>';
      const focusRow = [...details.children].find((item) => item.querySelector('dt')?.textContent.trim() === 'Focus');
      if (focusRow) details.insertBefore(row, focusRow);
      else details.appendChild(row);
    }
  }

  const contactActions = document.querySelector('.contact-actions');
  if (contactActions && !contactActions.querySelector('[data-copy="0x4a4b"]')) {
    const discordButton = document.createElement('button');
    discordButton.className = 'text-button copy-button';
    discordButton.type = 'button';
    discordButton.dataset.copy = '0x4a4b';
    discordButton.innerHTML = 'Discord: 0x4a4b <span data-copy-label>copy</span>';
    contactActions.appendChild(discordButton);
  }

  function setText(selector, text) {
    const element = document.querySelector(selector);
    if (element) element.textContent = text;
  }

  function setHTML(selector, html) {
    const element = document.querySelector(selector);
    if (element) element.innerHTML = html;
  }

  function rewritePortfolioCopy() {
    setText('#hero-title span', 'Minecraft Add-Ons,');
    setText('#hero-title em', 'PBR packs & creator tools.');
    setText('.hero-intro', 'We are two brothers who have been building and publishing Minecraft projects for years. QuillPhen focuses on gameplay and add-ons; 0x4a4b focuses on PBR/RTX visuals, textures and Bedrock graphics tools.');

    setText('#statement-title', 'We work on different parts of the same Minecraft experience.');
    setText('.statement-copy', 'QuillPhen handles gameplay systems, scripting, testing, releases and player support. 0x4a4b handles PBR materials, textures, visual technology and presentation. When a project needs both, we build it together.');

    setText('.case-ore .case-eyebrow', 'Bedrock Add-On · QuillPhen');
    setText('.case-ore .case-lede', 'Ore Vein Miner lets players mine connected ores by crouching and breaking one block. It keeps familiar enchantment behavior and includes limits and configuration so it fits normal survival play.');
    setHTML('.case-ore .media-caption', '<span>Gameplay preview</span> Mining a connected ore vein.');

    setText('.case-echo .case-eyebrow', 'Bedrock Add-On · QuillPhen');
    setText('.case-echo .case-lede', 'Build Echo remembers blocks lost to explosions and leaves a holographic guide showing what used to be there. Players can gather the materials and restore the build instead of guessing or rolling back the whole area.');
    setHTML('.case-echo .media-caption', '<span>Gameplay preview</span> Holographic blocks mark what was destroyed.');

    setText('.visual-heading h2', 'Seraphic RTX & PBR');
    setText('.visual-heading > p:last-child', '0x4a4b has spent years working on Minecraft Bedrock PBR materials and RTX visuals, including height and normal maps, emissive textures, glass, fog and material response. The videos and screenshots below are from that work.');
    setText('.cinema-label', 'Watch Seraphic RTX showcase');

    setText('.catalogue-heading h2', 'More released projects');
    setText('.catalogue-heading > p:last-child', 'A few smaller releases that show the range of what we build, publish and continue to maintain.');

    const productDescriptions = [...document.querySelectorAll('.product-card')];
    productDescriptions.forEach((card) => {
      const title = card.querySelector('h3')?.textContent.trim();
      const copy = card.querySelector('.product-copy p');
      if (!copy) return;
      if (title === 'Waypoints Teleport') copy.textContent = 'Save named locations and teleport through a simple menu, with optional XP costs, cooldowns and limits for survival worlds.';
      if (title === 'Mob Health Bar') copy.textContent = 'Shows mob health above entities so players can read combat at a glance without adding a large HUD.';
      if (title === 'Seraphic Glowing Ores') copy.textContent = 'Adds emissive ore textures for RTX/PBR worlds, making ores easier to spot while keeping caves dark.';
      if (title === 'Seraphic RTX Normals') copy.textContent = 'Adds normal-map depth across vanilla textures to improve surface detail under RTX/PBR lighting.';
    });

    setText('.platform-callout .section-label', 'Built by our team');
    setText('.platform-callout h3', 'Bedrock Graphics');
    setText('.platform-callout-copy > p:last-child', 'Bedrock Graphics is a Minecraft Bedrock publishing hub we built for graphics-focused creators and players. Creators can make profiles, publish and version packs, upload files and galleries, write release notes, manage project links, receive comments and ratings, and track downloads and project analytics. It covers texture and PBR packs, BetterRTX presets, shaders, behaviour packs and creator utilities.');

    setText('#tooling-title', 'Tools we built for our own workflow');
    setText('.tooling-copy > p:not(.section-label)', 'Our JE2BE converter handles repetitive parts of moving resource packs from Java to Bedrock, including texture mapping, LabPBR-to-MER conversion, texture-set generation and RTX checks.');

    setText('#team-title', 'Who works on what');

    setText('#direction-title', 'What we want to build for Marketplace');
    setText('.direction-intro', 'We want to keep making the same kinds of projects we already enjoy building, but at Marketplace scale: useful Bedrock add-ons, complete visual packs and projects where gameplay and graphics are designed together.');

    const directionItems = [...document.querySelectorAll('.direction-item')];
    directionItems.forEach((item, index) => {
      const heading = item.querySelector('h3');
      const copy = item.querySelector('p');
      if (!heading || !copy) return;
      if (index === 0) {
        heading.textContent = 'Add-Ons for real worlds';
        copy.textContent = 'Useful mechanics that work cleanly in existing survival worlds, with sensible configuration and multiplayer support.';
      }
      if (index === 1) {
        heading.textContent = 'Complete visual packs';
        copy.textContent = 'Consistent PBR and texture work across the game rather than one-off showcase assets.';
      }
      if (index === 2) {
        heading.textContent = 'Gameplay + visuals';
        copy.textContent = 'Projects where the mechanic and the art direction are planned together from the start.';
      }
    });

    setText('#contact-title', 'We are looking for a long-term Marketplace publishing partner.');
    setText('.contact-copy > p:last-child', 'We want to publish original Add-Ons and texture packs, learn the Marketplace production process properly, and keep supporting the products after release.');
  }

  rewritePortfolioCopy();

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