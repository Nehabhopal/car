/**
 * NOCTIS — SCROLLYTELLING ENGINE
 */
(function () {
  'use strict';

  const cfg = window.NOCTIS_CONFIG;
  const isMobile = () => window.innerWidth < 768;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --------------------------------------------------------------------------
  // 1. FILM GRAIN GENERATOR (OFFSCREEN NOISE TILE SHIFTED ~8x/sec)
  // --------------------------------------------------------------------------
  function initGrain() {
    const canvas = document.getElementById('grain-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const tile = document.createElement('canvas');
    const tileSize = 128;
    tile.width = tileSize;
    tile.height = tileSize;
    const tCtx = tile.getContext('2d');
    const imgData = tCtx.createImageData(tileSize, tileSize);
    const buffer = new Uint32Array(imgData.data.buffer);

    function createNoise() {
      for (let i = 0; i < buffer.length; i++) {
        const val = (Math.random() * 255) | 0;
        buffer[i] = (255 << 24) | (val << 16) | (val << 8) | val;
      }
      tCtx.putImageData(imgData, 0, 0);
    }

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize, { passive: true });
    resize();

    let lastTime = 0;
    function render(now) {
      if (now - lastTime > 125) { // 8 shifts per second
        lastTime = now;
        createNoise();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = ctx.createPattern(tile, 'repeat');
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  }

  // --------------------------------------------------------------------------
  // 2. CUSTOM CURSOR ("THE HEADLIGHT", DESKTOP ONLY)
  // --------------------------------------------------------------------------
  function initCursor() {
    if (prefersReduced || !window.matchMedia('(pointer: fine)').matches) return;
    const cursor = document.getElementById('cursor');
    if (!cursor) return;
    const label = cursor.querySelector('.cursor-label');

    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let currX = mouseX, currY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    window.addEventListener('mousedown', () => {
      cursor.classList.add('is-active');
      setTimeout(() => cursor.classList.remove('is-active'), 120);
    });

    document.querySelectorAll('[data-cursor]').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('is-hovered');
        label.textContent = el.getAttribute('data-cursor') || 'VIEW';
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('is-hovered');
        label.textContent = '';
      });
    });

    function loopCursor() {
      currX += (mouseX - currX) * 0.18;
      currY += (mouseY - currY) * 0.18;
      cursor.style.transform = `translate(${currX}px, ${currY}px)`;
      requestAnimationFrame(loopCursor);
    }
    requestAnimationFrame(loopCursor);
  }

  // --------------------------------------------------------------------------
  // 3. FRAME SCRUBBER ENGINE (CANVAS + PRELOADING + NEAREST FALLBACK)
  // --------------------------------------------------------------------------
  class FrameScrubber {
    constructor(canvasId, wrapperId, frameCount, getPathFn) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas.getContext('2d');
      this.wrapper = document.getElementById(wrapperId);
      this.frameCount = frameCount;
      this.getPathFn = getPathFn;
      this.images = new Array(frameCount);
      this.currentFrame = 0;
      this.targetFrame = 0;
      this.lastDrawn = -1;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    }

    loadFrame(index) {
      if (this.images[index]) return Promise.resolve(this.images[index]);
      const img = new Image();
      img.src = `${this.getPathFn()}${String(index + 1).padStart(4, '0')}.webp`;
      this.images[index] = img;
      if (img.decode) {
        return img.decode().then(() => img).catch(() => img);
      }
      return Promise.resolve(img);
    }

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = rect.width * this.dpr;
      this.canvas.height = rect.height * this.dpr;
      this.lastDrawn = -1; // force redraw
    }

    draw(frameIdx) {
      let img = this.images[frameIdx];
      // Nearest loaded fallback
      if (!img || !img.complete || img.naturalWidth === 0) {
        for (let off = 1; off < this.frameCount; off++) {
          const prev = this.images[frameIdx - off];
          if (prev && prev.complete && prev.naturalWidth > 0) {
            img = prev;
            break;
          }
          const next = this.images[frameIdx + off];
          if (next && next.complete && next.naturalWidth > 0) {
            img = next;
            break;
          }
        }
      }
      if (!img || !img.complete || img.naturalWidth === 0) return;

      const cw = this.canvas.width;
      const ch = this.canvas.height;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const isPortrait = ch > cw;

      // Solid background
      this.ctx.fillStyle = '#07080A';
      this.ctx.fillRect(0, 0, cw, ch);

      let dw, dh, dx, dy;
      if (!isPortrait) {
        // Landscape: cover-fit
        const scale = Math.max(cw / iw, ch / ih);
        dw = iw * scale;
        dh = ih * scale;
        dx = (cw - dw) / 2;
        dy = (ch - dh) / 2;
      } else {
        // Portrait: contain-fit vertically centered so car is never cropped
        const scale = Math.min(cw / iw, ch / ih);
        dw = iw * scale;
        dh = ih * scale;
        dx = (cw - dw) / 2;
        dy = (ch - dh) / 2;
      }

      this.ctx.drawImage(img, dx, dy, dw, dh);
      this.lastDrawn = frameIdx;
    }

    updateProgress() {
      const rect = this.wrapper.getBoundingClientRect();
      const scrollDist = this.wrapper.offsetHeight - window.innerHeight;
      if (scrollDist <= 0) return 0;
      const progress = Math.min(Math.max(-rect.top / scrollDist, 0), 1);
      this.targetFrame = Math.round(progress * (this.frameCount - 1));
      return progress;
    }
  }

  // --------------------------------------------------------------------------
  // 4. MAIN LIFECYCLE
  // --------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', async () => {
    initGrain();
    initCursor();

    const heroPath = () => isMobile() ? cfg.paths.heroMobile : cfg.paths.heroDesktop;
    const dismantlePath = () => isMobile() ? cfg.paths.dismantleMobile : cfg.paths.dismantleDesktop;

    const heroScrubber = new FrameScrubber('hero-canvas', 'hero-wrapper', cfg.heroFrameCount, heroPath);
    const dismantleScrubber = new FrameScrubber('dismantle-canvas', 'dismantle', cfg.dismantleFrameCount, dismantlePath);

    function onResize() {
      heroScrubber.resize();
      dismantleScrubber.resize();
    }
    window.addEventListener('resize', onResize, { passive: true });
    onResize();

    // PRELOADER: LOAD FRAMES 1–40 FIRST
    const bar = document.getElementById('preloader-bar');
    const countEl = document.getElementById('preloader-count');
    const priorityCount = Math.min(40, cfg.heroFrameCount);

    for (let i = 0; i < priorityCount; i++) {
      await heroScrubber.loadFrame(i);
      const pct = Math.round(((i + 1) / priorityCount) * 100);
      bar.style.width = `${pct}%`;
      countEl.textContent = String(pct).padStart(3, '0');
    }

    bar.classList.add('flash');
    setTimeout(() => {
      document.body.classList.remove('is-loading');
      heroScrubber.draw(0);

      // Async background load of rest of hero, then dismantle
      (async function backgroundLoad() {
        for (let i = priorityCount; i < cfg.heroFrameCount; i++) {
          await heroScrubber.loadFrame(i);
        }
        for (let i = 0; i < cfg.dismantleFrameCount; i++) {
          await dismantleScrubber.loadFrame(i);
        }
      })();
    }, 320);

    // ------------------------------------------------------------------------
    // NAVIGATION (HIDE ON SCROLL DOWN, SHOW ON SCROLL UP)
    // ------------------------------------------------------------------------
    const nav = document.getElementById('site-nav');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
      const curr = window.scrollY;
      if (curr > lastScrollY && curr > 100) {
        nav.classList.add('nav-hidden');
      } else {
        nav.classList.remove('nav-hidden');
      }
      lastScrollY = curr;
    }, { passive: true });

    // ------------------------------------------------------------------------
    // SECTION 2: STATEMENT WORD-BY-WORD REVEAL
    // ------------------------------------------------------------------------
    const quoteEl = document.getElementById('statement-quote');
    const words = quoteEl.textContent.trim().split(/\s+/);
    quoteEl.innerHTML = words.map(w => `<span class="statement-word">${w}</span>`).join(' ');
    const wordSpans = quoteEl.querySelectorAll('.statement-word');

    // ------------------------------------------------------------------------
    // SECTION 3: DISMANTLE CALLOUTS
    // ------------------------------------------------------------------------
    const calloutsLayer = document.getElementById('dismantle-callouts');
    cfg.dismantleCallouts.forEach((c) => {
      const el = document.createElement('div');
      el.className = 'callout-item';
      el.id = `callout-${c.id}`;
      el.style.left = `${c.origin.x}%`;
      el.style.top = `${c.origin.y}%`;
      el.innerHTML = `
        <div class="callout-dot"></div>
        <div class="callout-line"></div>
        <div class="callout-body">
          <div class="callout-label">${c.label}</div>
          <div class="callout-desc">${c.desc}</div>
        </div>
      `;
      calloutsLayer.appendChild(el);
    });

    // ------------------------------------------------------------------------
    // SECTION 4: LINEUP ACCORDION (HOVER, TINT, SWATCHES, ARROWS)
    // ------------------------------------------------------------------------
    const accordion = document.getElementById('lineup-accordion');
    cfg.lineup.forEach((car, idx) => {
      const slide = document.createElement('button');
      slide.className = `lineup-slide ${idx === 0 ? 'is-open' : ''}`;
      slide.setAttribute('aria-expanded', idx === 0 ? 'true' : 'false');
      slide.setAttribute('data-index', idx);
      slide.setAttribute('data-cursor', idx === 0 ? 'CONFIGURE' : 'OPEN');

      slide.innerHTML = `
        <img src="${car.image}" alt="${car.name} side profile" class="slide-img-preview" loading="lazy">
        <div class="slide-closed-view">
          <span class="hud-text slide-num-vert">${car.num}</span>
          <span class="slide-title-vert">${car.name}</span>
        </div>
        <div class="slide-open-view">
          <div class="slide-top">
            <h3 class="display-title slide-open-title">${car.name}</h3>
            <span class="hud-text">${car.num} / 05</span>
          </div>
          <div class="slide-car-container">
            <img src="${car.image}" alt="${car.name} photorealistic profile" class="slide-car-img" loading="lazy">
          </div>
          <div class="slide-bottom">
            <p class="slide-tagline">${car.tagline}</p>
            <div class="slide-specs-grid">
              <div class="spec-cell">
                <span class="hud-label">RANGE</span>
                <span class="spec-val">${car.specs.range}</span>
              </div>
              <div class="spec-cell">
                <span class="hud-label">0–100 KM/H</span>
                <span class="spec-val">${car.specs.accel}</span>
              </div>
              <div class="spec-cell">
                <span class="hud-label">POWER</span>
                <span class="spec-val">${car.specs.power}</span>
              </div>
            </div>
            <div class="slide-swatches" aria-label="Color Palette">
              ${car.colors.map((col, cIdx) => `
                <span class="swatch ${cIdx === 0 ? 'is-active' : ''}" style="background-color: ${col};" title="Color option ${cIdx + 1}"></span>
              `).join('')}
            </div>
            <div>
              <a href="#reserve" class="text-link" data-cursor="RESERVE">Configure →</a>
            </div>
          </div>
        </div>
      `;
      accordion.appendChild(slide);
    });

    const slides = accordion.querySelectorAll('.lineup-slide');
    let hoverTimer = null;

    function openSlide(index) {
      slides.forEach((s, i) => {
        const isOpen = i === index;
        s.classList.toggle('is-open', isOpen);
        s.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        s.setAttribute('data-cursor', isOpen ? 'CONFIGURE' : 'OPEN');
      });
      // Update cursor label if mouse is over open slide
      const cursor = document.getElementById('cursor');
      if (cursor && cursor.classList.contains('is-hovered')) {
        const lbl = cursor.querySelector('.cursor-label');
        if (lbl) lbl.textContent = 'CONFIGURE';
      }
    }

    slides.forEach((s, idx) => {
      s.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(() => openSlide(idx), 80); // 80ms debounce
      });
      s.addEventListener('click', () => openSlide(idx));
      s.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' && idx < slides.length - 1) {
          openSlide(idx + 1);
          slides[idx + 1].focus();
        } else if (e.key === 'ArrowLeft' && idx > 0) {
          openSlide(idx - 1);
          slides[idx - 1].focus();
        }
      });
    });

    // Swatch selection inside slides
    accordion.addEventListener('click', (e) => {
      const swatch = e.target.closest('.swatch');
      if (!swatch) return;
      const parentSwatches = swatch.parentElement.querySelectorAll('.swatch');
      parentSwatches.forEach(sw => sw.classList.remove('is-active'));
      swatch.classList.add('is-active');
    });

    // Lineup entrance intersection observer (stagger 0.08s)
    const lineupSection = document.getElementById('lineup');
    const lineupObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          lineupSection.classList.add('in-view');
          slides.forEach((s, i) => {
            s.style.transitionDelay = `${i * 0.08}s`;
          });
          lineupObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    lineupObserver.observe(lineupSection);

    // ------------------------------------------------------------------------
    // ANIMATION & SCROLL LOOP (60FPS TARGET)
    // ------------------------------------------------------------------------
    const hudChapter = document.getElementById('hud-chapter');
    const hudSpeed = document.getElementById('hud-speed');
    const hudDist = document.getElementById('hud-distance');
    const heroProgressLine = document.getElementById('hero-progress-bar');
    const heroBlackOverlay = document.getElementById('hero-fade-overlay');
    const dismantleProgressLine = document.getElementById('dismantle-progress-bar');

    const heroChapters = [
      document.getElementById('hero-ch1'),
      document.getElementById('hero-ch2'),
      document.getElementById('hero-ch3'),
      document.getElementById('hero-ch4')
    ];

    function tick() {
      // 1. Hero Scrubbing
      const heroP = heroScrubber.updateProgress();
      heroScrubber.currentFrame += (heroScrubber.targetFrame - heroScrubber.currentFrame) * 0.15;
      const roundedHero = Math.round(heroScrubber.currentFrame);
      if (roundedHero !== heroScrubber.lastDrawn) {
        heroScrubber.draw(roundedHero);
      }

      // Hero Chapters & HUD
      cfg.heroChapters.forEach((ch, idx) => {
        const active = heroP >= ch.start && heroP <= ch.end;
        heroChapters[idx]?.classList.toggle('is-active', active);
        if (active && hudChapter) {
          hudChapter.textContent = `0${idx + 1} / 04`;
        }
      });

      // Speed & distance meters
      const speed = Math.round(heroP * cfg.hud.maxSpeed);
      const dist = (heroP * cfg.hud.maxDistance).toFixed(1);
      if (hudSpeed) hudSpeed.textContent = `${String(speed).padStart(3, '0')} KM/H`;
      if (hudDist) hudDist.textContent = `${dist} KM`;

      // Hero Progress line & Black Fade at 95%
      if (heroProgressLine) heroProgressLine.style.width = `${heroP * 100}%`;
      if (heroBlackOverlay) {
        if (heroP > 0.95) {
          heroBlackOverlay.style.opacity = (heroP - 0.95) / 0.05;
        } else {
          heroBlackOverlay.style.opacity = '0';
        }
      }

      // 2. Statement word-by-word reveal
      const stmtEl = document.getElementById('statement');
      if (stmtEl) {
        const stmtRect = stmtEl.getBoundingClientRect();
        const stmtP = Math.min(Math.max((window.innerHeight - stmtRect.top) / (window.innerHeight + stmtRect.height * 0.5), 0), 1);
        const activeWordCount = Math.floor(stmtP * wordSpans.length);
        wordSpans.forEach((w, i) => {
          w.style.opacity = i <= activeWordCount ? '1' : '0.15';
        });
      }

      // 3. Dismantle Scrubbing
      const disP = dismantleScrubber.updateProgress();
      dismantleScrubber.currentFrame += (dismantleScrubber.targetFrame - dismantleScrubber.currentFrame) * 0.15;
      const roundedDis = Math.round(dismantleScrubber.currentFrame);
      if (roundedDis !== dismantleScrubber.lastDrawn) {
        dismantleScrubber.draw(roundedDis);
      }
      if (dismantleProgressLine) dismantleProgressLine.style.width = `${disP * 100}%`;

      // Dismantle Callouts (> 70%)
      cfg.dismantleCallouts.forEach((c) => {
        const item = document.getElementById(`callout-${c.id}`);
        if (item) item.classList.toggle('is-visible', disP >= c.revealAt);
      });

      requestAnimationFrame(tick);
    }

    if (!prefersReduced) {
      requestAnimationFrame(tick);
    } else {
      // Static reduced motion setup
      heroScrubber.draw(0);
      dismantleScrubber.draw(0);
      wordSpans.forEach(w => w.style.opacity = '1');
      cfg.dismantleCallouts.forEach((c) => {
        const item = document.getElementById(`callout-${c.id}`);
        if (item) item.classList.add('is-visible');
      });
    }
  });
})();
