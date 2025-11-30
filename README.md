# 🟦✨ CLEVER GANG CYBERPUNK DASHBOARD ✨🟦

> Official cyberpunk dashboard for the Clever Gang organization.

---

  <img src="https://count.getloli.com/@Daxxtropezz?name=Daxxtropezz&theme=gelbooru-h&padding=5&offset=100&align=center&scale=1&pixelated=1&darkmode=auto&prefix=69" alt="alt" />

## ⚡️ About

A futuristic, cyberpunk-inspired dashboard for the Clever Gang GitHub organization.  
Features a Japanese "Matrix" particle background, neon-glow stats, glitch effects, and a responsive glassmorphic UI.  
Search, filter, and explore organization repositories in style.  
_Easter eggs included for the cleverest hackers._

---

## 🚀 What's new / Key changes

- Language support expanded:
  - English (EN), Japanese (JP) and German (DE) now available.
  - Language strings were moved to a separate module: `assets/js/translations.js`.
  - Language choice persists via localStorage (`cg_lang`) and the language button cycles EN → JP → DE → EN.

- Toggle buttons placement & responsiveness:
  - Toggle buttons (sidebar, animations, language) were moved into the main controls area for better flow (`index.html`).
  - Large screens (≥901px): toggles are pinned/stacked near the sidebar for quick access.
  - Small/medium screens: toggles flow inline with the controls and wrap when space is limited.
  - Styling for responsive toggles implemented in `assets/css/main.css` (see `.toggle-buttons` rules and media queries).

- Matrix particles & fonts:
  - Particles are rendered on a canvas using Japanese glyphs (Kanji/Hiragana/Katakana) for a Matrix-like effect.
  - Canvas uses the Noto Sans JP fallback for correct glyph rendering: `assets/js/particles.js`.

- UI and JS refactors:
  - Translations moved out of `ui.js` into `assets/js/translations.js`.
  - `ui.js` now imports translations; `main.js` wires the language toggle to cycle through three locales.
  - Animation toggle controls matrix rendering via `assets/js/particles.js` API (`setMatrixEnabled`).

- Accessibility & persistence:
  - Toggle buttons keep the same IDs so JS wiring is unchanged.
  - Language and animation preferences are saved to localStorage for persistence.

---

## 🛠️ Changed / Added files (high level)

- Modified:
  - index.html — toggle buttons moved into `.controls` → `.toggle-buttons`.
  - assets/css/main.css — responsive `.toggle-buttons` styles and media queries.
  - assets/js/ui.js — imports translations, updated language handling.
  - assets/js/main.js — language toggle cycles EN → JP → DE, initializes aria-labels.
  - assets/js/particles.js — matrix canvas rendering and responsive sizing.

- New:
  - assets/js/translations.js — consolidated translation strings for `en`, `jp`, and `de`.

---

## ✅ How to test the important behaviors

- Language toggle:
  1. Click the language button (in the controls). It cycles: EN → JP → DE → EN.
  2. Labels (title, subtitle, filter labels, stat labels, loading/error text) update immediately.
  3. Choice persists across reloads (stored in `localStorage` under `cg_lang`).

- Responsive toggles:
  1. Resize your browser:
     - ≥901px: toggle buttons should be pinned and stacked beside the sidebar.
     - 601–900px: toggles inline but slightly smaller.
     - ≤600px: toggles compact; language label text hidden to save space.
  2. Use the sidebar toggle to open/close the sidebar; pinned toggle position updates accordingly.

- Animation toggle:
  1. Click the animations toggle to start/stop the matrix particle animation.
  2. When animations are off, repo card "glitch" effects and Matrix canvas stop for lower CPU.

- Easter egg:
  - Search for `daxxtropezz` in the search box to reveal the hidden flag cards.

---

## 🏁 Local Development

```bash
git clone https://github.com/clever-gang/clever-gang.github.io.git
cd clever-gang.github.io
python -m http.server 8000
```

Open your browser: http://localhost:8000

Notes:
- Ensure internet access for Google Fonts (Orbitron and Noto Sans JP).
- If GitHub API rate limits, the demo data is used (`assets/js/config.js`).

---

## 📝 License

MIT License — see [LICENSE](LICENSE)

---

## © 2025 Clever Gang

_Stay clever. Stay cyberpunk._
