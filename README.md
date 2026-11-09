# NOCTIS — The Only Light in the World

A premium, minimal, single-page scrollytelling experience for **NOCTIS**, a fictional electric automotive marque.

> *Mood: A city in total blackout at night where the car's light is the only light in the world. Quiet, expensive, and precise.*

---

## Architecture & Tech Rules

- **Zero Frameworks / Zero Dependencies**: Pure semantic HTML5, CSS3, and vanilla JavaScript (`index.html`, `styles.css`, `main.js`, `config.js`).
- **60fps Canvas Scrubbing**: Smooth scroll-scrubbed image sequences rendered on `<canvas>` with `lerp 0.15` motion smoothing and high-DPI device scaling (`devicePixelRatio` capped at 2).
- **Strict Visual Discipline**:
  - Zero gradients of any kind (linear, radial, conic).
  - Zero glassmorphism (no blur, no frosted panels).
  - Zero drop shadows or bubbly cards.
  - Flat solid colors, 1px hairlines, photography, and typography.
- **Design Tokens**:
  - `--asphalt`: `#07080A` (Page background)
  - `--graphite`: `#121418` (Structural surfaces)
  - `--fog`: `#8A8F98` (Secondary type)
  - `--bone`: `#EDEAE4` (Primary typography)
  - `--xenon`: `#CFE3FF` (Light signature accent)
  - `--taillight`: `#E1251B` (Status indicator)
  - `--hairline`: `rgba(237, 234, 228, 0.12)`
- **Typography** (Google Fonts):
  - **Display**: *Archivo* (Width axis 125% expanded, weights 300/400, uppercase).
  - **Body**: *Inter* (400, line-height 1.6).
  - **HUD**: *JetBrains Mono* (400, uppercase, letter-spacing 0.12em).

---

## Sections

1. **Preloader**: Center-expanding xenon line tracking load percentage (`000` to `100`). Priority-loads hero frames 1–40 before revealing the site, continuing remaining frames in the background.
2. **Nav**: Fixed, transparent navigation with `mix-blend-mode: difference`. Hides on scroll down, reappears on scroll up.
3. **Hero (Pinned ~600vh)**:
   - Full-screen `<canvas>` scrubbing the 600-frame joined emergence sequence.
   - 4 chapters in the upper sky with line reveals.
   - Left-edge HUD tracking velocity (`000` to `118 KM/H`), distance (`0.0` to `4.2 KM`), and active chapter tick.
   - Seamless fade to black across the final 5% of scroll.
4. **Statement (100vh)**: Centered engineering thesis with word-by-word scroll opacity reveal (`15%` to `100%`).
5. **Dismantle (Pinned ~350vh)**:
   - Mechanical disassembly and reassembly sequence scrubbed with scroll direction.
   - 4 hairline callouts (`BODY`, `BATTERY`, `DRIVE`, `LIGHT`) fading in sequentially above 70% progress.
6. **The Lineup (Horizontal Accordion, 100vh)**:
   - Five interactive models: **GT-E**, **S**, **X**, **R**, **ONE**.
   - 80ms debounced hover, 72% shared floor line, 6% slide-in animation, color swatches, keyboard arrow navigation, and vertical stacking on mobile.
7. **Reserve (100vh)**: Centered call-to-action with thin xenon outline button morphing into solid xenon on hover with taillight red tick.
8. **Footer**: 3-column atelier index with 1px hairline border.

---

## How to Run Locally

Clone and start with any simple HTTP server:

```bash
# Python
python serve.py

# or npx
npx serve .
```

Open **`http://localhost:3000`** in your browser.
