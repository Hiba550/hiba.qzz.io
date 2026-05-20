(function () {
  const root = document.documentElement;
  const hero = document.querySelector("[data-hero]");
  const canvas = document.querySelector("[data-ambient]");
  const toast = document.querySelector("[data-toast]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  requestAnimationFrame(() => root.classList.add("is-loaded"));

  let pointerFrame = 0;
  let cursorFrame = 0;
  let cursorX = window.innerWidth / 2;
  let cursorY = window.innerHeight / 2;

  function moveCursor() {
    root.style.setProperty("--cx", `${cursorX}px`);
    root.style.setProperty("--cy", `${cursorY}px`);
    cursorFrame = 0;
  }

  function movePointer(event) {
    cursorX = event.clientX;
    cursorY = event.clientY;

    if (finePointer.matches && !cursorFrame) {
      cursorFrame = requestAnimationFrame(moveCursor);
    }

    if (pointerFrame) {
      return;
    }

    pointerFrame = requestAnimationFrame(() => {
      const x = event.clientX;
      const y = event.clientY;
      const tiltX = (x / window.innerWidth - 0.5) * 10;
      const tiltY = (y / window.innerHeight - 0.5) * 8;

      root.style.setProperty("--mx", `${x}px`);
      root.style.setProperty("--my", `${y}px`);
      root.style.setProperty("--tilt-x", tiltX.toFixed(2));
      root.style.setProperty("--tilt-y", tiltY.toFixed(2));
      pointerFrame = 0;
    });
  }

  function resetTilt() {
    root.style.setProperty("--tilt-x", "0");
    root.style.setProperty("--tilt-y", "0");
  }

  window.addEventListener("pointermove", movePointer, { passive: true });
  window.addEventListener("pointerenter", () => root.classList.remove("is-cursor-hidden"), { passive: true });
  window.addEventListener("pointerleave", () => {
    resetTilt();
    root.classList.add("is-cursor-hidden");
  }, { passive: true });

  document.addEventListener("pointerover", (event) => {
    if (!finePointer.matches) {
      return;
    }

    if (event.target.closest("a, button")) {
      root.classList.add("is-cursor-active");
    }
  });

  document.addEventListener("pointerout", (event) => {
    if (!finePointer.matches) {
      return;
    }

    if (event.target.closest("a, button")) {
      root.classList.remove("is-cursor-active");
    }
  });

  let toastTimer = 0;

  function showToast(message) {
    if (!toast || !message) {
      return;
    }

    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");

    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 1900);
  }

  document.querySelectorAll("[data-message]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      showToast(link.dataset.message);
    });
  });

  document.querySelectorAll("[data-copy]").forEach((link) => {
    link.addEventListener("click", async (event) => {
      event.preventDefault();
      const originalLabel = link.dataset.label || "";

      try {
        await navigator.clipboard.writeText(link.dataset.copy);
        link.dataset.label = "Copied";
        link.classList.add("is-copied");
        showToast("discord copied. hiba6053");
        window.setTimeout(() => {
          link.dataset.label = originalLabel;
          link.classList.remove("is-copied");
        }, 1300);
      } catch {
        link.dataset.label = link.dataset.copy;
        link.classList.add("is-copied");
        showToast("discord is hiba6053");
        window.setTimeout(() => {
          link.dataset.label = originalLabel;
          link.classList.remove("is-copied");
        }, 1600);
      }
    });
  });

  const tabButtons = document.querySelectorAll("[data-tab]");
  const photoView = document.querySelector("[data-photo-view]");
  let photoHideTimer = 0;

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.tab;
      const showPhotos = target === "photos";

      tabButtons.forEach((item) => {
        const selected = item === button;
        item.classList.toggle("is-active", selected);
        item.setAttribute("aria-selected", selected ? "true" : "false");
      });

      if (!photoView) {
        return;
      }

      window.clearTimeout(photoHideTimer);

      if (showPhotos) {
        root.classList.add("is-photos");
        photoView.hidden = false;
        requestAnimationFrame(() => photoView.classList.add("is-visible"));
      } else {
        photoView.classList.remove("is-visible");
        root.classList.remove("is-photos");
        photoHideTimer = window.setTimeout(() => {
          photoView.hidden = true;
        }, 180);
      }
    });
  });

  if (!canvas) {
    return;
  }

  const context = canvas.getContext("2d", { alpha: true });
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let particles = [];
  let animationId = 0;

  function makeParticle() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      radius: (Math.random() * 1.2 + 0.25) * pixelRatio,
      alpha: Math.random() * 0.17 + 0.035,
      vx: (Math.random() - 0.5) * 0.095 * pixelRatio,
      vy: (Math.random() - 0.5) * 0.075 * pixelRatio,
      drift: Math.random() * Math.PI * 2
    };
  }

  function resizeCanvas() {
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.floor(window.innerWidth * pixelRatio);
    height = Math.floor(window.innerHeight * pixelRatio);

    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const particleCount = Math.min(86, Math.max(42, Math.floor(window.innerWidth / 18)));
    particles = Array.from({ length: particleCount }, makeParticle);
  }

  function drawParticle(particle) {
    context.beginPath();
    context.fillStyle = `rgba(244, 241, 234, ${particle.alpha})`;
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    context.fill();
  }

  function draw() {
    context.clearRect(0, 0, width, height);

    for (const particle of particles) {
      particle.drift += 0.002;
      particle.x += particle.vx + Math.cos(particle.drift) * 0.018 * pixelRatio;
      particle.y += particle.vy + Math.sin(particle.drift) * 0.014 * pixelRatio;

      if (particle.x < -10) particle.x = width + 10;
      if (particle.x > width + 10) particle.x = -10;
      if (particle.y < -10) particle.y = height + 10;
      if (particle.y > height + 10) particle.y = -10;

      drawParticle(particle);
    }

    if (!reducedMotion.matches) {
      animationId = requestAnimationFrame(draw);
    }
  }

  function startCanvas() {
    cancelAnimationFrame(animationId);
    resizeCanvas();
    draw();
  }

  startCanvas();
  window.addEventListener("resize", startCanvas, { passive: true });
  reducedMotion.addEventListener("change", startCanvas);

  if (hero) {
    hero.addEventListener("focusout", resetTilt);
  }
})();
