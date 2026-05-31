(function () {
  'use strict';

  const root          = document.documentElement;
  const hero          = document.querySelector('[data-hero]');
  const canvas        = document.querySelector('[data-ambient]');
  const toast         = document.querySelector('[data-toast]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer   = window.matchMedia('(hover: hover) and (pointer: fine)');

  requestAnimationFrame(() => root.classList.add('is-loaded'));

  // ─── POINTER TRACKING ────────────────────────────────────────────────────

  let cursorX = window.innerWidth  / 2;
  let cursorY = window.innerHeight / 2;
  let pointerFrame = 0;

  function resetTilt() {
    root.style.setProperty('--tilt-x', '0');
    root.style.setProperty('--tilt-y', '0');
  }

  window.addEventListener('pointermove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
    if (pointerFrame) return;
    pointerFrame = requestAnimationFrame(() => {
      root.style.setProperty('--mx', `${e.clientX}px`);
      root.style.setProperty('--my', `${e.clientY}px`);
      root.style.setProperty('--tilt-x', ((e.clientX / window.innerWidth  - 0.5) * 10).toFixed(2));
      root.style.setProperty('--tilt-y', ((e.clientY / window.innerHeight - 0.5) *  8).toFixed(2));
      pointerFrame = 0;
    });
  }, { passive: true });

  window.addEventListener('pointerenter', () => root.classList.remove('is-cursor-hidden'), { passive: true });
  window.addEventListener('pointerleave', () => { resetTilt(); root.classList.add('is-cursor-hidden'); }, { passive: true });
  if (hero) hero.addEventListener('focusout', resetTilt);

  // ─── CURSOR ───────────────────────────────────────────────────────────────

  const ringEl = document.querySelector('[data-cursor-ring]');
  const dotEl  = document.querySelector('[data-cursor-dot]');

  document.addEventListener('pointerover', (e) => {
    if (!finePointer.matches) return;
    if (e.target.closest('a, button')) root.classList.add('is-cursor-active');
  });
  document.addEventListener('pointerout', (e) => {
    if (!finePointer.matches) return;
    if (e.target.closest('a, button')) root.classList.remove('is-cursor-active');
  });

  let refreshMag = () => {};

  if (finePointer.matches && ringEl && dotEl) {
    window.addEventListener('pointermove', (e) => {
      const t = `translate3d(${e.clientX}px,${e.clientY}px,0) translate(-50%,-50%)`;
      ringEl.style.transform = t;
      dotEl.style.transform  = t;
    }, { passive: true });
  }

  // ─── TOAST ───────────────────────────────────────────────────────────────

  let toastTimer = 0;
  function showToast(msg) {
    if (!toast || !msg) return;
    clearTimeout(toastTimer);
    toast.textContent = msg;
    toast.classList.add('is-visible');
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 1900);
  }

  document.querySelectorAll('[data-message]').forEach(el =>
    el.addEventListener('click', e => { e.preventDefault(); showToast(el.dataset.message); })
  );

  document.querySelectorAll('[data-copy]').forEach(el => {
    el.addEventListener('click', async e => {
      e.preventDefault();
      const orig = el.dataset.label || '';
      try {
        await navigator.clipboard.writeText(el.dataset.copy);
        el.dataset.label = 'Copied'; el.classList.add('is-copied');
        showToast('discord copied. hiba6053');
        setTimeout(() => { el.dataset.label = orig; el.classList.remove('is-copied'); }, 1300);
      } catch {
        el.dataset.label = el.dataset.copy; el.classList.add('is-copied');
        showToast('discord is hiba6053');
        setTimeout(() => { el.dataset.label = orig; el.classList.remove('is-copied'); }, 1600);
      }
    });
  });

  // ─── TAB NAVIGATION ──────────────────────────────────────────────────────

  const tabButtons = document.querySelectorAll('[data-tab]');
  const photoView  = document.querySelector('[data-photo-view]');
  const workView   = document.querySelector('[data-work-view]');
  const views      = { home: null, photos: photoView, work: workView };
  const hideTimers = new Map();

  function showTab(target, pushUrl) {
    const next = Object.prototype.hasOwnProperty.call(views, target) ? target : 'home';

    tabButtons.forEach(b => {
      const on = b.dataset.tab === next;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });

    root.classList.toggle('is-photos', next === 'photos');
    root.classList.toggle('is-work',   next === 'work');

    Object.entries(views).forEach(([name, view]) => {
      if (!view) return;
      clearTimeout(hideTimers.get(name));
      if (name === next) {
        view.hidden = false;
        view.scrollTop = 0;
        requestAnimationFrame(() => view.classList.add('is-visible'));
      } else {
        view.classList.remove('is-visible');
        hideTimers.set(name, setTimeout(() => { view.hidden = true; }, 180));
      }
    });

    if (next === 'home') resetTilt();
    if (pushUrl) history.replaceState(null, '', next === 'home' ? location.pathname : `#${next}`);
    refreshMag();
  }

  tabButtons.forEach(b => b.addEventListener('click', () => showTab(b.dataset.tab, true)));
  showTab(location.hash.replace('#', ''), false);

  // ─── AMBIENT · WEBGL2 DEPTH SHADER ───────────────────────────────────────

  if (!canvas) return;

  const gl = canvas.getContext('webgl2', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    powerPreference: 'low-power'
  });

  if (gl) {
    startWebGL(gl);
  } else {
    startParticles();
  }

  // Domain-warped FBM shader.
  // Renders at 50 % resolution — the blur reads as atmospheric softness.
  // Alpha is pre-multiplied: dark areas are fully transparent, revealing the
  // CSS body gradient. Bright noise patches are semi-transparent luminance.
  function startWebGL(g) {
    const VS = `#version 300 es
in vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }`;

    const FS = `#version 300 es
precision highp float;
uniform vec2  u_res;
uniform vec2  u_cursor;
uniform float u_time;
out vec4 o;

float h(vec2 p) {
  p  = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}
float vn(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h(i), h(i+vec2(1,0)), f.x),
             mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.52;
  mat2  m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) { v += a * vn(p); p = m * p; a *= 0.45; }
  return v;
}

void main() {
  vec2  uv = gl_FragCoord.xy / u_res;
  float t  = u_time * 0.065;

  // Domain warp: fbm(fbm(uv)) — organic non-repeating nebula depth
  vec2 q = vec2(
    fbm(uv * 2.6 + vec2(t,              t * 0.70)),
    fbm(uv * 2.6 + vec2(3.2 + t * 0.5, 1.8 + t * 0.42))
  );
  float n   = fbm(uv * 1.9 + 2.1 * q + vec2(t * 0.22, 0.0));
  float lum = pow(n, 1.85) * 0.08;

  // Cursor depth lens: subtle brightening — depth, not spotlight
  vec2  cp  = vec2(u_cursor.x / u_res.x, 1.0 - u_cursor.y / u_res.y);
  lum += smoothstep(0.55, 0.0, length(uv - cp)) * 0.030;

  // Barely-cool tint harmonises with the warm-white fg (#f4f1ea)
  vec3  col   = vec3(lum * 0.87, lum * 0.91, lum);
  float alpha = min(lum * 12.0, 0.26);

  o = vec4(col * alpha, alpha); // pre-multiplied
}`;

    function sh(type, src) {
      const s = g.createShader(type);
      g.shaderSource(s, src);
      g.compileShader(s);
      return s;
    }

    const prog = g.createProgram();
    g.attachShader(prog, sh(g.VERTEX_SHADER,   VS));
    g.attachShader(prog, sh(g.FRAGMENT_SHADER, FS));
    g.linkProgram(prog);

    if (!g.getProgramParameter(prog, g.LINK_STATUS)) {
      startParticles();
      return;
    }

    g.useProgram(prog);

    const vbo = g.createBuffer();
    g.bindBuffer(g.ARRAY_BUFFER, vbo);
    g.bufferData(g.ARRAY_BUFFER,
      new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]),
      g.STATIC_DRAW);

    const aLoc    = g.getAttribLocation(prog,  'a');
    const uRes    = g.getUniformLocation(prog, 'u_res');
    const uCursor = g.getUniformLocation(prog, 'u_cursor');
    const uTime   = g.getUniformLocation(prog, 'u_time');

    g.enableVertexAttribArray(aLoc);
    g.vertexAttribPointer(aLoc, 2, g.FLOAT, false, 0, 0);
    g.enable(g.BLEND);
    g.blendFunc(g.ONE, g.ONE_MINUS_SRC_ALPHA);
    g.clearColor(0, 0, 0, 0);

    const SCALE = 0.5;
    let W = 0, H = 0, rafId = 0;

    function resize() {
      W = Math.floor(window.innerWidth  * SCALE);
      H = Math.floor(window.innerHeight * SCALE);
      canvas.width  = W; canvas.height = H;
      canvas.style.width  = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      g.viewport(0, 0, W, H);
    }

    function frame(t) {
      g.clear(g.COLOR_BUFFER_BIT);
      g.uniform2f(uRes,    W, H);
      g.uniform2f(uCursor, cursorX * SCALE, cursorY * SCALE);
      g.uniform1f(uTime,   t * 0.001);
      g.drawArrays(g.TRIANGLES, 0, 6);
      if (!reducedMotion.matches) rafId = requestAnimationFrame(frame);
    }

    resize();
    rafId = requestAnimationFrame(frame);

    window.addEventListener('resize', () => {
      cancelAnimationFrame(rafId);
      resize();
      rafId = requestAnimationFrame(frame);
    }, { passive: true });

    reducedMotion.addEventListener('change', () => {
      if (reducedMotion.matches) {
        cancelAnimationFrame(rafId);
        // One static frame for reduced-motion users
        g.clear(g.COLOR_BUFFER_BIT);
        g.uniform2f(uRes,    W, H);
        g.uniform2f(uCursor, W * 0.5, H * 0.5);
        g.uniform1f(uTime,   0);
        g.drawArrays(g.TRIANGLES, 0, 6);
      } else {
        rafId = requestAnimationFrame(frame);
      }
    });
  }

  // Canvas 2D fallback: floating particles (no WebGL2 support)
  function startParticles() {
    const ctx = canvas.getContext('2d', { alpha: true });
    let W = 0, H = 0, PR = 1, pts = [], rafId = 0;

    function mkPt() {
      return {
        x: Math.random() * W, y: Math.random() * H,
        r: (Math.random() * 1.2 + 0.25) * PR,
        a: Math.random() * 0.14 + 0.025,
        vx: (Math.random() - 0.5) * 0.095 * PR,
        vy: (Math.random() - 0.5) * 0.075 * PR,
        d:  Math.random() * Math.PI * 2
      };
    }

    function resize() {
      PR = Math.min(window.devicePixelRatio || 1, 2);
      W  = Math.floor(window.innerWidth  * PR);
      H  = Math.floor(window.innerHeight * PR);
      canvas.width  = W; canvas.height = H;
      canvas.style.width  = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      pts = Array.from({ length: Math.min(86, Math.max(42, Math.floor(window.innerWidth / 18))) }, mkPt);
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        p.d  += 0.002;
        p.x  += p.vx + Math.cos(p.d) * 0.018 * PR;
        p.y  += p.vy + Math.sin(p.d) * 0.014 * PR;
        if (p.x < -10)    p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10)    p.y = H + 10;
        if (p.y > H + 10) p.y = -10;
        ctx.beginPath();
        ctx.fillStyle = `rgba(244,241,234,${p.a})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reducedMotion.matches) rafId = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener('resize', () => { cancelAnimationFrame(rafId); resize(); draw(); }, { passive: true });
    reducedMotion.addEventListener('change', () => { if (!reducedMotion.matches) rafId = requestAnimationFrame(draw); });
  }

})();

