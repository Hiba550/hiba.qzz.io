(() => {
  'use strict';

  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('[data-header]');
  const progressBar = document.querySelector('[data-scroll-progress]');
  const heroMedia = document.querySelector('[data-hero-media]');
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

  const brandTitle = document.querySelector('.brand-copy strong');
  if (brandTitle) brandTitle.style.display = 'none';

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

  const heroKicker = document.querySelector('.hero-kicker');
  if (heroKicker) heroKicker.remove();

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
      const focusRow = [...details.children]
        .find((item) => item.querySelector('dt')?.textContent.trim() === 'Focus');
      if (focusRow) details.insertBefore(row, focusRow);
      else details.appendChild(row);
    }

    const links = seraphicCard.querySelector('.person-links');
    if (links && !links.querySelector('[data-seraphic-modrinth]')) {
      const modrinth = document.createElement('a');
      modrinth.href = 'https://modrinth.com/user/Ox4a4b';
      modrinth.target = '_blank';
      modrinth.rel = 'noreferrer';
      modrinth.dataset.seraphicModrinth = 'true';
      modrinth.textContent = 'Modrinth ↗';

      const github = [...links.querySelectorAll('a')]
        .find((link) => link.textContent.includes('GitHub'));
      if (github) links.insertBefore(modrinth, github);
      else links.appendChild(modrinth);
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

  function addEvidenceStyles() {
    if (document.getElementById('portfolio-evidence-styles')) return;

    const style = document.createElement('style');
    style.id = 'portfolio-evidence-styles';
    style.textContent = `
      .public-proof {
        padding: clamp(42px, 6vw, 78px) 0;
        color: var(--paper);
        background: #0b0d0c;
        border-top: 1px solid rgba(255,255,255,.08);
        border-bottom: 1px solid rgba(255,255,255,.08);
      }
      .public-proof-heading {
        display: grid;
        grid-template-columns: minmax(0, .65fr) minmax(0, 1.35fr);
        gap: 32px;
        align-items: end;
        margin-bottom: 28px;
      }
      .public-proof-heading h2 {
        max-width: 760px;
        font-size: clamp(2rem, 4.2vw, 4.6rem);
        line-height: .96;
        letter-spacing: -.055em;
      }
      .public-proof-heading p:last-child {
        max-width: 560px;
        margin-top: 14px;
        color: rgba(242,240,232,.58);
        line-height: 1.6;
      }
      .public-proof-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        border: 1px solid rgba(255,255,255,.12);
      }
      .public-proof-card {
        min-height: 150px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 22px;
        color: inherit;
        background: rgba(255,255,255,.025);
        border-right: 1px solid rgba(255,255,255,.12);
        text-decoration: none;
        transition: background-color .2s ease;
      }
      .public-proof-card:last-child { border-right: 0; }
      .public-proof-card:hover { background: rgba(255,255,255,.055); }
      .public-proof-card small {
        color: rgba(242,240,232,.48);
        font-family: var(--mono);
        font-size: .62rem;
        letter-spacing: .08em;
        text-transform: uppercase;
      }
      .public-proof-card strong {
        display: block;
        margin-top: 22px;
        font-size: clamp(1.8rem, 3vw, 3.2rem);
        line-height: 1;
        letter-spacing: -.05em;
      }
      .public-proof-card span {
        display: block;
        margin-top: 7px;
        color: rgba(242,240,232,.68);
        font-size: .86rem;
      }
      .project-context {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 1px;
        margin: 26px 0 0;
        background: rgba(11,13,12,.12);
        border: 1px solid rgba(11,13,12,.14);
      }
      .project-context > div {
        padding: 13px 14px;
        background: rgba(255,255,255,.32);
      }
      .project-context dt {
        margin-bottom: 5px;
        color: rgba(11,13,12,.5);
        font-family: var(--mono);
        font-size: .57rem;
        letter-spacing: .08em;
        text-transform: uppercase;
      }
      .project-context dd {
        margin: 0;
        color: rgba(11,13,12,.84);
        font-size: .78rem;
        line-height: 1.45;
      }
      .player-loop {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 1px;
        margin: 24px 0 0;
        padding: 0;
        list-style: none;
        background: rgba(11,13,12,.12);
        border: 1px solid rgba(11,13,12,.14);
        counter-reset: loop;
      }
      .player-loop li {
        counter-increment: loop;
        min-height: 104px;
        padding: 14px;
        background: rgba(255,255,255,.34);
        color: rgba(11,13,12,.72);
        font-size: .74rem;
        line-height: 1.5;
      }
      .player-loop li::before {
        content: '0' counter(loop);
        display: block;
        margin-bottom: 13px;
        color: var(--cyan-dark, #2d8c91);
        font-family: var(--mono);
        font-size: .58rem;
        font-weight: 600;
      }
      .case-echo .media-frame video {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;
        background: #050706;
      }
      .project-link-row {
        display: flex;
        flex-wrap: wrap;
        gap: 18px;
        align-items: center;
      }
      .secondary-project-link {
        color: inherit;
        font-family: var(--mono);
        font-size: .68rem;
        font-weight: 600;
        text-decoration: underline;
        text-underline-offset: 4px;
      }
      .seraphic-pbr-proof {
        max-width: 820px;
        margin-top: 16px;
        color: rgba(242,240,232,.62);
        font-size: .88rem;
        line-height: 1.65;
      }
      .seraphic-pbr-proof a {
        color: inherit;
        text-decoration: underline;
        text-underline-offset: 3px;
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
      @media (max-width: 900px) {
        .public-proof-heading { grid-template-columns: 1fr; }
        .public-proof-grid { grid-template-columns: 1fr 1fr; }
        .public-proof-card:nth-child(2) { border-right: 0; }
        .public-proof-card:nth-child(-n+2) { border-bottom: 1px solid rgba(255,255,255,.12); }
        .project-context { grid-template-columns: 1fr; }
        .player-loop { grid-template-columns: 1fr 1fr; }
      }
      @media (max-width: 560px) {
        .public-proof-grid { grid-template-columns: 1fr; }
        .public-proof-card { border-right: 0; border-bottom: 1px solid rgba(255,255,255,.12); }
        .public-proof-card:last-child { border-bottom: 0; }
        .player-loop { grid-template-columns: 1fr; }
      }
    `;
    document.head.appendChild(style);
  }

  function addMinecraftCSSCredit() {
    const toolingCopy = document.querySelector('.tooling-copy');
    if (!toolingCopy || toolingCopy.querySelector('.minecraft-css-note')) return;

    const note = document.createElement('p');
    note.className = 'minecraft-css-note';
    note.innerHTML = '<strong>Minecraft-CSS is also part of 0x4a4b’s work.</strong> This portfolio uses ideas from his Minecraft UI-themed CSS framework. <a href="https://github.com/Jiyath5516F/Minecraft-CSS" target="_blank" rel="noreferrer">View Minecraft-CSS ↗</a>';

    const projectLink = toolingCopy.querySelector('.project-link');
    if (projectLink) toolingCopy.insertBefore(note, projectLink);
    else toolingCopy.appendChild(note);
  }

  function addSeraphicPBRProof() {
    const heading = document.querySelector('.visual-heading');
    if (!heading || heading.querySelector('.seraphic-pbr-proof')) return;

    const proof = document.createElement('p');
    proof.className = 'seraphic-pbr-proof reveal';
    proof.innerHTML = 'Additional PBR work: <a href="https://modrinth.com/resourcepack/seraphic-pbr" target="_blank" rel="noreferrer">Seraphic PBR for Java Edition</a> has 86K+ Modrinth downloads and includes LabPBR, AO, POM, entity PBR and emissive entities.';
    heading.appendChild(proof);

    const links = document.querySelector('.visual-links');
    if (links && !links.querySelector('[data-seraphic-pbr-link]')) {
      const modrinth = document.createElement('a');
      modrinth.className = 'text-button text-button-light';
      modrinth.href = 'https://modrinth.com/resourcepack/seraphic-pbr';
      modrinth.target = '_blank';
      modrinth.rel = 'noreferrer';
      modrinth.dataset.seraphicPbrLink = 'true';
      modrinth.innerHTML = 'Seraphic PBR on Modrinth <span aria-hidden="true">↗</span>';
      links.appendChild(modrinth);
    }
  }

  function replaceBuildEchoDemo() {
    const frame = document.querySelector('.case-echo .media-frame');
    if (!frame || frame.querySelector('video')) return;

    const image = frame.querySelector('img');
    const video = document.createElement('video');
    video.src = 'assets/buildecho-demo.mp4';
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.controls = true;
    video.preload = 'metadata';
    video.setAttribute('aria-label', 'Build Echo gameplay demonstration showing damage, holographic echoes and restoration');

    if (image) image.replaceWith(video);
    else frame.prepend(video);
  }

  function addPublicReleaseEvidence() {
    const statement = document.querySelector('.statement');
    if (!statement || document.querySelector('.public-proof')) return;

    const section = document.createElement('section');
    section.className = 'public-proof';
    section.setAttribute('aria-labelledby', 'public-proof-title');
    section.innerHTML = `
      <div class="section-shell">
        <div class="public-proof-heading reveal">
          <div>
            <p class="section-label">Current public releases</p>
            <h2 id="public-proof-title">A few projects already in players’ hands.</h2>
          </div>
          <p>These are direct links to the release pages. The larger catalogue is available through the QuillPhen and Seraphic profiles.</p>
        </div>
        <div class="public-proof-grid reveal">
          <a class="public-proof-card" href="https://www.curseforge.com/minecraft-bedrock/addons/cave-vision-bedrock" target="_blank" rel="noreferrer">
            <small>Bedrock Add-On · QuillPhen</small>
            <div><strong>730K+</strong><span>Night Vision</span></div>
          </a>
          <a class="public-proof-card" href="https://www.curseforge.com/minecraft-bedrock/addons/ores-vein-miner" target="_blank" rel="noreferrer">
            <small>Bedrock Add-On · QuillPhen</small>
            <div><strong>335K+</strong><span>Ore Vein Miner</span></div>
          </a>
          <a class="public-proof-card" href="https://www.curseforge.com/minecraft-bedrock/addons/mob-health-bar" target="_blank" rel="noreferrer">
            <small>Bedrock Add-On · QuillPhen</small>
            <div><strong>40K+</strong><span>Mob Health Bar</span></div>
          </a>
          <a class="public-proof-card" href="https://www.curseforge.com/minecraft-bedrock/addons/glowingores" target="_blank" rel="noreferrer">
            <small>Visual Pack · 0x4a4b</small>
            <div><strong>170K+</strong><span>Seraphic Glowing Ores</span></div>
          </a>
        </div>
      </div>
    `;
    statement.insertAdjacentElement('afterend', section);
  }

  function addProjectContext() {
    const oreCopy = document.querySelector('.case-ore .case-copy');
    const oreLede = oreCopy?.querySelector('.case-lede');
    if (oreCopy && oreLede && !oreCopy.querySelector('.project-context')) {
      const context = document.createElement('dl');
      context.className = 'project-context';
      context.innerHTML = `
        <div><dt>Status</dt><dd>Released and maintained on CurseForge</dd></div>
        <div><dt>Contribution</dt><dd>Gameplay design, scripting, testing, publishing and support</dd></div>
        <div><dt>Player loop</dt><dd>Crouch, mine one ore, collect the connected vein</dd></div>
      `;
      oreLede.insertAdjacentElement('afterend', context);
    }

    const echoCopy = document.querySelector('.case-echo .case-copy');
    const echoLede = echoCopy?.querySelector('.case-lede');
    if (echoCopy && echoLede && !echoCopy.querySelector('.project-context')) {
      const context = document.createElement('dl');
      context.className = 'project-context';
      context.innerHTML = `
        <div><dt>Status</dt><dd>Released Bedrock Add-On</dd></div>
        <div><dt>Contribution</dt><dd>Concept, scripting, block-state system, testing and publishing</dd></div>
        <div><dt>Technical scope</dt><dd>79 authored hologram shape and state variants</dd></div>
      `;
      echoLede.insertAdjacentElement('afterend', context);
    }

    const echoFacts = echoCopy?.querySelector('.case-facts');
    if (echoCopy && echoFacts && !echoCopy.querySelector('.player-loop')) {
      const loop = document.createElement('ol');
      loop.className = 'player-loop';
      loop.setAttribute('aria-label', 'Build Echo player loop');
      loop.innerHTML = `
        <li>An explosion destroys supported blocks the player placed.</li>
        <li>Cyan echoes appear in the exact missing positions and preserve supported block states.</li>
        <li>The player checks the required block and restores it with the matching material.</li>
        <li>The Echo Core can show totals and batch-repair using materials already in the inventory.</li>
      `;
      echoFacts.insertAdjacentElement('afterend', loop);
    }

    const echoProjectLink = echoCopy?.querySelector('.project-link');
    if (echoProjectLink && !echoCopy.querySelector('.project-link-row')) {
      const row = document.createElement('div');
      row.className = 'project-link-row';
      echoProjectLink.replaceWith(row);
      row.appendChild(echoProjectLink);

      const source = document.createElement('a');
      source.className = 'secondary-project-link';
      source.href = 'https://github.com/Hiba550/Build-Echo';
      source.target = '_blank';
      source.rel = 'noreferrer';
      source.textContent = 'Source code ↗';
      row.appendChild(source);
    }
  }

  function rewritePortfolioCopy() {
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
    setText('.hero-proof > div:nth-child(4) span', 'projects on both editions');

    setText('#statement-title', 'We each handle the part we’re best at.');
    setText('.statement-copy', 'QuillPhen builds the gameplay systems and handles testing, releases and player support. 0x4a4b builds the visual side: PBR materials, textures, RTX work and presentation. We publish our work, keep it updated, and use player feedback to fix rough edges after release.');

    setText('.case-ore .case-eyebrow', 'Bedrock Add-On · QuillPhen');
    setText('.case-ore .case-lede', 'Ore Vein Miner lets players mine connected ores by crouching and breaking one block. It keeps familiar enchantment behavior and includes limits and configuration so it fits normal survival play.');
    setHTML('.case-ore .media-caption', '<span>Gameplay</span> Mining a connected ore vein.');

    setText('.case-echo .case-eyebrow', 'Bedrock Add-On · QuillPhen');
    setText('.case-echo .case-lede', 'Build Echo remembers player-built blocks lost to creeper and TNT explosions. It leaves holographic guides in the missing positions, preserves supported block states, and lets the player repair the build with the correct materials.');
    setHTML('.case-echo .media-caption', '<span>Full gameplay demo</span> Damage, echoes and restoration.');

    setText('.visual-heading h2', 'Seraphic RTX & PBR');
    setText('.visual-heading > p:last-child', 'This section shows 0x4a4b’s released PBR and RTX work in-game: material response, height and normal maps, emissives, glass, fog and full Minecraft scenes.');
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

    setText('.platform-callout .section-label', 'Built by our team');
    setText('.platform-callout h3', 'Bedrock Graphics');
    setText('.platform-callout-copy > p:last-child', 'Bedrock Graphics is the publishing and discovery site we built for Minecraft Bedrock graphics and creator projects. It gives creators project pages, version files, galleries, release notes, comments, ratings and download analytics, with dedicated categories for texture/PBR packs, BetterRTX presets, shaders, behavior packs and utilities.');

    setText('#tooling-title', 'Tools we use and build ourselves');
    setText('.tooling-copy > p:not(.section-label)', 'Our JE2BE converter handles repetitive parts of moving resource packs from Java to Bedrock, including texture mapping, LabPBR-to-MER conversion, texture-set generation and RTX checks.');

    setText('#team-title', 'Who works on what');
    setText('.team-grid .person-card:first-child dl div:first-child dd', '6M+ CurseForge downloads');

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
    setText('.contact-copy > p:last-child', 'We’re looking for a publisher we can work with long term. We’re comfortable with review and revisions, want to learn the Marketplace process properly, and want to keep supporting our releases after they go live.');
  }

  addEvidenceStyles();
  rewritePortfolioCopy();
  replaceBuildEchoDemo();
  addPublicReleaseEvidence();
  addProjectContext();
  addMinecraftCSSCredit();
  addSeraphicPBRProof();

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

  const revealElements = [...document.querySelectorAll('.reveal')];
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

  const navLinks = [...document.querySelectorAll('[data-nav]')];
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