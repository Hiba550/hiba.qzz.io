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

  function addPortfolioPolishStyles() {
    if (document.getElementById('portfolio-polish')) return;

    const style = document.createElement('style');
    style.id = 'portfolio-polish';
    style.textContent = `
      .hero-kicker {
        width: fit-content;
        letter-spacing: .1em;
      }

      .bg-showcase {
        position: relative;
        display: grid;
        grid-template-columns: minmax(0, .86fr) minmax(430px, 1.14fr);
        gap: clamp(38px, 6vw, 92px);
        align-items: center;
        margin-top: 1px;
        padding: clamp(44px, 7vw, 94px);
        overflow: hidden;
        color: #f5f5ee;
        background:
          radial-gradient(circle at 85% 18%, rgba(89, 220, 255, .18), transparent 28%),
          radial-gradient(circle at 16% 83%, rgba(123, 228, 97, .12), transparent 31%),
          linear-gradient(135deg, #0b1112 0%, #0d1718 48%, #101315 100%);
        border: 1px solid rgba(255,255,255,.12);
        isolation: isolate;
      }

      .bg-showcase::before {
        content: '';
        position: absolute;
        z-index: -1;
        inset: 0;
        opacity: .22;
        background-image:
          linear-gradient(rgba(255,255,255,.055) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,.055) 1px, transparent 1px);
        background-size: 34px 34px;
        mask-image: linear-gradient(90deg, transparent, #000 36%, #000);
      }

      .bg-copy { max-width: 680px; }
      .bg-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 9px;
        color: #8feeff;
        font-family: var(--mono);
        font-size: .68rem;
        font-weight: 600;
        letter-spacing: .1em;
        text-transform: uppercase;
      }
      .bg-eyebrow::before {
        content: '';
        width: 8px;
        height: 8px;
        background: #7de35f;
        box-shadow: 0 0 0 5px rgba(125,227,95,.12);
      }
      .bg-copy h3 {
        margin-top: 18px;
        font-size: clamp(3.2rem, 6.2vw, 6.8rem);
        line-height: .9;
        letter-spacing: -.07em;
      }
      .bg-copy > p {
        max-width: 650px;
        margin-top: 26px;
        color: rgba(245,245,238,.68);
        font-size: 1.02rem;
        line-height: 1.72;
      }
      .bg-points {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 30px;
      }
      .bg-points span {
        padding: 8px 10px;
        color: rgba(245,245,238,.72);
        background: rgba(255,255,255,.05);
        border: 1px solid rgba(255,255,255,.13);
        font-family: var(--mono);
        font-size: .61rem;
        letter-spacing: .05em;
        text-transform: uppercase;
      }
      .bg-actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 22px;
        margin-top: 34px;
      }

      .bg-browser {
        position: relative;
        overflow: hidden;
        background: #0a0c0e;
        border: 1px solid rgba(255,255,255,.2);
        box-shadow: 22px 26px 0 rgba(69,180,200,.08), 0 38px 100px rgba(0,0,0,.45);
        transform: rotate(.6deg);
      }
      .bg-browser-bar {
        min-height: 48px;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 16px;
        background: #171b1d;
        border-bottom: 1px solid rgba(255,255,255,.11);
      }
      .bg-browser-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,.34); }
      .bg-browser-url {
        flex: 1;
        margin-left: 7px;
        padding: 7px 10px;
        color: rgba(255,255,255,.52);
        background: #0e1112;
        border: 1px solid rgba(255,255,255,.1);
        font-family: var(--mono);
        font-size: .58rem;
      }
      .bg-screen {
        padding: clamp(24px, 3vw, 38px);
        background:
          radial-gradient(circle at 76% 12%, rgba(92,220,250,.12), transparent 27%),
          linear-gradient(180deg, #101719, #0b0f10 65%);
      }
      .bg-screen-top {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        align-items: start;
      }
      .bg-wordmark {
        color: #fff;
        font-size: clamp(1.3rem, 2vw, 2rem);
        font-weight: 800;
        letter-spacing: -.04em;
      }
      .bg-screen-tag {
        color: #8feeff;
        font-family: var(--mono);
        font-size: .56rem;
        letter-spacing: .08em;
        text-transform: uppercase;
      }
      .bg-screen h4 {
        max-width: 560px;
        margin-top: 44px;
        color: #fff;
        font-size: clamp(1.9rem, 3.2vw, 3.6rem);
        line-height: .98;
        letter-spacing: -.05em;
      }
      .bg-screen > p {
        max-width: 520px;
        margin-top: 16px;
        color: rgba(255,255,255,.58);
        font-size: .87rem;
        line-height: 1.6;
      }
      .bg-categories {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
        margin-top: 30px;
      }
      .bg-category {
        min-height: 74px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 13px;
        background: rgba(255,255,255,.045);
        border: 1px solid rgba(255,255,255,.11);
      }
      .bg-category b { color: #fff; font-size: .72rem; }
      .bg-category small { color: rgba(255,255,255,.42); font-family: var(--mono); font-size: .5rem; text-transform: uppercase; }
      .bg-studio-row {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1px;
        margin-top: 24px;
        background: rgba(255,255,255,.12);
        border: 1px solid rgba(255,255,255,.12);
      }
      .bg-studio-row span {
        padding: 13px 10px;
        color: rgba(255,255,255,.68);
        background: #101516;
        font-family: var(--mono);
        font-size: .52rem;
        text-align: center;
        text-transform: uppercase;
      }

      .minecraft-css-note {
        margin-top: 34px;
        padding: 18px 20px;
        color: rgba(11,13,12,.72);
        background: rgba(255,255,255,.42);
        border-left: 4px solid var(--green-dark);
        font-size: .86rem;
        line-height: 1.6;
      }
      .minecraft-css-note strong { color: var(--ink); }
      .minecraft-css-note a {
        color: var(--green-dark);
        font-family: var(--mono);
        font-size: .78rem;
        font-weight: 600;
        text-decoration: underline;
        text-underline-offset: 3px;
      }

      @media (max-width: 1000px) {
        .bg-showcase { grid-template-columns: 1fr; }
        .bg-browser { max-width: 820px; transform: none; }
      }
      @media (max-width: 620px) {
        .bg-showcase { padding: 30px 20px; }
        .bg-categories { grid-template-columns: 1fr 1fr; }
        .bg-studio-row { grid-template-columns: 1fr 1fr; }
        .bg-actions { align-items: stretch; flex-direction: column; }
        .bg-actions .pixel-button, .bg-actions .text-button { width: 100%; justify-content: center; }
      }
    `;
    document.head.appendChild(style);
  }

  function rewritePortfolioCopy() {
    setHTML('.hero-kicker', '<span class="status-light"></span>QuillPhen + Seraphic');

    setText('#hero-title span', 'Minecraft Add-Ons,');
    setText('#hero-title em', 'PBR packs & creator tools.');
    setText('.hero-intro', 'We’re brothers who make Minecraft projects together. QuillPhen handles add-ons and gameplay; 0x4a4b handles Seraphic’s PBR/RTX visuals, texture work and graphics tools.');

    const combinedDownloads = document.querySelector('.hero-proof > div:first-child strong');
    if (combinedDownloads) {
      combinedDownloads.dataset.count = '11';
      combinedDownloads.dataset.decimals = '0';
      combinedDownloads.dataset.suffix = 'M+';
      combinedDownloads.textContent = '11M+';
    }
    setText('.hero-proof > div:first-child span', 'combined downloads');
    setText('.hero-proof > div:nth-child(4) span', 'projects across both editions');

    setText('#statement-title', 'We each handle the part we’re best at.');
    setText('.statement-copy', 'QuillPhen builds the gameplay systems and handles testing, releases and player support. 0x4a4b builds the visual side: PBR materials, textures, RTX work and presentation. When a project needs both, we work on it together.');

    setText('.case-ore .case-eyebrow', 'Bedrock Add-On · QuillPhen');
    setText('.case-ore .case-lede', 'Ore Vein Miner lets players mine connected ores by crouching and breaking one block. It keeps familiar enchantment behavior and includes limits and configuration so it fits normal survival play.');
    setHTML('.case-ore .media-caption', '<span>Gameplay</span> Mining a connected ore vein.');

    setText('.case-echo .case-eyebrow', 'Bedrock Add-On · QuillPhen');
    setText('.case-echo .case-lede', 'Build Echo remembers blocks lost to explosions and leaves a holographic guide showing what used to be there. Players can gather the materials and restore the build instead of guessing or rolling back the whole area.');
    setHTML('.case-echo .media-caption', '<span>Gameplay</span> Holographic blocks show what was destroyed.');

    setText('.visual-heading h2', 'Seraphic RTX & PBR');
    setText('.visual-heading > p:last-child', '0x4a4b has spent years working on Bedrock PBR materials and RTX visuals: height and normal maps, emissives, glass, fog and material response. These are real screenshots and videos from that work.');
    setText('.cinema-label', 'Watch Seraphic RTX showcase');

    document.querySelectorAll('.visual-tile figcaption').forEach((caption, index) => {
      const captions = [
        'PBR materials and surface detail in-game.',
        'Emissive ore textures in a dark cave.',
        'Normal maps adding depth to vanilla blocks.'
      ];
      if (captions[index]) caption.textContent = captions[index];
    });

    setText('.catalogue-heading h2', 'More released projects');
    setText('.catalogue-heading > p:last-child', 'A few other projects we’ve released and still maintain.');

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

    setText('#tooling-title', 'Tools we use and build ourselves');
    setText('.tooling-copy > p:not(.section-label)', 'Our JE2BE converter handles repetitive parts of moving resource packs from Java to Bedrock, including texture mapping, LabPBR-to-MER conversion, texture-set generation and RTX checks.');

    setText('#team-title', 'Who works on what');

    setText('#direction-title', 'What we want to make for Marketplace');
    setText('.direction-intro', 'We want to keep making the kind of Minecraft work we already enjoy: useful Bedrock add-ons, complete visual packs, and projects where the gameplay and graphics are built together.');

    const directionItems = [...document.querySelectorAll('.direction-item')];
    directionItems.forEach((item, index) => {
      const heading = item.querySelector('h3');
      const copy = item.querySelector('p');
      if (!heading || !copy) return;
      if (index === 0) {
        heading.textContent = 'Useful Add-Ons';
        copy.textContent = 'Gameplay ideas that work cleanly in normal survival worlds, including multiplayer and sensible configuration.';
      }
      if (index === 1) {
        heading.textContent = 'PBR & texture packs';
        copy.textContent = 'Complete visual packs with consistent materials across the game, not just a few showcase textures.';
      }
      if (index === 2) {
        heading.textContent = 'Projects we build together';
        copy.textContent = 'Content where QuillPhen’s gameplay work and Seraphic’s visual work are designed as one project from the start.';
      }
    });

    setText('#contact-title', 'We’d like to publish on Minecraft Marketplace.');
    setText('.contact-copy > p:last-child', 'We’re looking for a publisher we can work with long term, learn the Marketplace process from, and keep making and supporting good Minecraft projects with.');
  }

  function enhanceBedrockGraphics() {
    const callout = document.querySelector('.platform-callout');
    if (!callout) return;

    callout.className = 'bg-showcase reveal';
    callout.setAttribute('aria-label', 'Bedrock Graphics publishing platform');
    callout.innerHTML = `
      <div class="bg-copy">
        <div class="bg-eyebrow">Built and run by our team</div>
        <h3>Bedrock Graphics</h3>
        <p>Bedrock Graphics is our site for Minecraft Bedrock graphics and creator projects. People can browse texture and PBR packs, RTX content, BetterRTX presets and utilities, while creators get proper project pages, version files, galleries, release notes, comments, moderation and download analytics.</p>
        <div class="bg-points" aria-label="Bedrock Graphics features">
          <span>Creator Studio</span>
          <span>Project versions</span>
          <span>File & gallery uploads</span>
          <span>Analytics</span>
          <span>Comments & ratings</span>
          <span>Moderation tools</span>
        </div>
        <div class="bg-actions">
          <a class="pixel-button" href="https://bedrockgraphics.com/" target="_blank" rel="noreferrer">Open Bedrock Graphics <span aria-hidden="true">↗</span></a>
          <a class="text-button text-button-light" href="https://bedrockgraphics.com/texture-packs/seraphic-rtx" target="_blank" rel="noreferrer">See Seraphic RTX there <span aria-hidden="true">↗</span></a>
        </div>
      </div>

      <a class="bg-browser" href="https://bedrockgraphics.com/" target="_blank" rel="noreferrer" aria-label="Visit Bedrock Graphics">
        <div class="bg-browser-bar" aria-hidden="true">
          <i class="bg-browser-dot"></i><i class="bg-browser-dot"></i><i class="bg-browser-dot"></i>
          <span class="bg-browser-url">bedrockgraphics.com</span>
        </div>
        <div class="bg-screen">
          <div class="bg-screen-top">
            <strong class="bg-wordmark">Bedrock Graphics</strong>
            <span class="bg-screen-tag">Creator platform</span>
          </div>
          <h4>Discover and publish Bedrock graphics.</h4>
          <p>Texture packs, PBR, Vibrant Visuals, RTX, BetterRTX presets and creator utilities.</p>
          <div class="bg-categories" aria-hidden="true">
            <div class="bg-category"><b>Texture Packs</b><small>Browse</small></div>
            <div class="bg-category"><b>RTX / PBR</b><small>Graphics</small></div>
            <div class="bg-category"><b>Vibrant Visuals</b><small>Bedrock</small></div>
            <div class="bg-category"><b>BetterRTX</b><small>Presets</small></div>
            <div class="bg-category"><b>Utilities</b><small>Creator tools</small></div>
            <div class="bg-category"><b>Creator Studio</b><small>Publish</small></div>
          </div>
          <div class="bg-studio-row" aria-hidden="true">
            <span>Drafts</span><span>Versions</span><span>Analytics</span><span>Moderation</span>
          </div>
        </div>
      </a>
    `;
  }

  function addMinecraftCSSCredit() {
    const toolingCopy = document.querySelector('.tooling-copy');
    if (!toolingCopy || toolingCopy.querySelector('.minecraft-css-note')) return;

    const note = document.createElement('p');
    note.className = 'minecraft-css-note';
    note.innerHTML = '<strong>This portfolio also uses design ideas from Minecraft-CSS</strong>, a Minecraft UI-themed CSS framework built by 0x4a4b. <a href="https://github.com/Jiyath5516F/Minecraft-CSS" target="_blank" rel="noreferrer">View Minecraft-CSS ↗</a>';

    const projectLink = toolingCopy.querySelector('.project-link');
    if (projectLink) toolingCopy.insertBefore(note, projectLink);
    else toolingCopy.appendChild(note);
  }

  addPortfolioPolishStyles();
  rewritePortfolioCopy();
  enhanceBedrockGraphics();
  addMinecraftCSSCredit();

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

    [...document.querySelectorAll('.reveal')].forEach((element) => revealObserver.observe(element));
  } else {
    [...document.querySelectorAll('.reveal')].forEach((element) => element.classList.add('is-visible'));
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