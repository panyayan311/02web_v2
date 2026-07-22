# VX Philosophy Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved A-02 standalone Philosophy page with Heat Circuit Motion, connect it to the existing homepage, and verify responsive, accessible, dependency-free behavior.

**Architecture:** Keep the current homepage and shared `main.js` stable. Add a semantic `/philosophy/` document plus page-scoped CSS, orchestration JavaScript, and a small WebGL heat-field module; all content exists before JavaScript so motion is progressive enhancement. Add a dependency-free Node verification script for copy, navigation, forbidden names, asset budgets, and reduced-motion hooks, followed by real-browser responsive checks.

**Tech Stack:** Static HTML5, CSS custom properties and container-safe responsive layouts, vanilla JavaScript, IntersectionObserver, WebGL 1 / GLSL, Node.js built-in assertions, local Python HTTP server.

## Global Constraints

- Preserve the warm paper, cobalt, coral, ink, editorial grid, and Paper Circuit design language.
- Do not introduce a framework or third-party animation dependency.
- Do not mention GoatFamilia or 株式会社ギアーズ anywhere in public site files.
- Keep `年商2億円規模` and `¥200M` on the homepage.
- Use the approved Core Value, Mission, five Values, 0→1→2 method, and Founder’s Principle copy exactly.
- Desktop WebGL target is at most 24fps with device-pixel-ratio capped at 1.25.
- Mobile WebGL target is at most 18fps with render density capped at 0.9.
- `prefers-reduced-motion: reduce`, WebGL failure, disabled JavaScript, and missing IntersectionObserver must show complete usable content.
- Validate 320, 360, 375, 390, 680, 681, 767, 768, 980, 981, 1024, and 1440px without overlap or horizontal overflow.
- Keep new uncompressed Philosophy JavaScript below approximately 30KB total.
- The contact form remains in design-preview mode until a production endpoint is configured.
- This directory is not a Git repository, so each task ends with a verification checkpoint instead of a commit.

---

### Task 1: Add the Philosophy contract test

**Files:**
- Create: `tests/verify-philosophy.mjs`

**Interfaces:**
- Consumes: public site files relative to the site root.
- Produces: a zero-dependency command, `node tests/verify-philosophy.mjs`, that exits non-zero when the approved page contract is broken.

- [x] **Step 1: Create the verification script**

Use Node built-ins to assert the exact page contract:

```js
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const philosophy = read("philosophy/index.html");
const home = read("index.html");
const css = read("assets/css/philosophy.css");
const motion = read("assets/js/philosophy-motion.js");
const field = read("assets/js/vx-field.js");
const sitemap = read("sitemap.xml");

const requiredCopy = [
  "VX — Vibes Transformation",
  "変革は、熱で完成する。",
  "「やらされる変革」を、",
  "「やりたくなる変革」へ。",
  "現場に入る。",
  "まず、動かす。",
  "人が動く理由まで、設計する。",
  "仕組みとして残す。",
  "根づくまで、やり切る。",
  "求めよ！さらば与えられん。",
  "尋ねよ！さらば見出さん。",
  "扉を叩け！さらば開かれん。",
];
requiredCopy.forEach((copy) => assert.ok(philosophy.includes(copy), `missing copy: ${copy}`));

assert.match(philosophy, /<h1[\s>]/, "Philosophy needs one h1");
assert.equal((philosophy.match(/<h1[\s>]/g) || []).length, 1, "Philosophy needs exactly one h1");
["why-vx", "evolution", "mission", "values", "method", "founder-principle", "philosophy-contact"].forEach((id) => {
  assert.ok(philosophy.includes(`id="${id}"`), `missing section: ${id}`);
});
assert.ok(home.includes('href="/philosophy/"'), "homepage must link to Philosophy");
assert.ok(sitemap.includes("https://zerotwo.tokyo/philosophy/"), "sitemap must include Philosophy");
assert.ok(css.includes("prefers-reduced-motion: reduce"), "CSS needs reduced-motion fallback");
assert.ok(motion.includes("IntersectionObserver"), "motion needs viewport orchestration");
assert.ok(field.includes("1000 / 18") && field.includes("1000 / 24"), "WebGL fps budgets must be explicit");
assert.ok(Buffer.byteLength(motion) + Buffer.byteLength(field) < 30 * 1024, "Philosophy JS exceeds 30KB");

const publicExtensions = new Set([".html", ".css", ".js", ".xml", ".md"]);
const collect = (dir) => readdirSync(new URL(`../${dir}`, import.meta.url), { withFileTypes: true }).flatMap((entry) => {
  const relative = join(dir, entry.name);
  if (relative.startsWith("docs/") || relative.startsWith("tests/")) return [];
  return entry.isDirectory() ? collect(relative) : publicExtensions.has(extname(entry.name)) ? [relative] : [];
});
const publicText = collect(".").map((file) => read(file)).join("\n");
assert.ok(!publicText.includes("GoatFamilia"), "ended business name found");
assert.ok(!publicText.includes("株式会社ギアーズ"), "forbidden company name found");
assert.ok(home.includes("年商2億円規模") && home.includes("¥200M"), "confirmed achievement was removed");

console.log("Philosophy contract verified.");
```

- [x] **Step 2: Run the contract test and confirm the expected initial failure**

Run:

```bash
node tests/verify-philosophy.mjs
```

Expected: failure because `philosophy/index.html` and the page-scoped assets do not exist yet.

---

### Task 2: Build the semantic page and connect navigation

**Files:**
- Create: `philosophy/index.html`
- Modify: `index.html`
- Modify: `sitemap.xml`

**Interfaces:**
- Consumes: `/assets/css/style.css`, `/assets/js/main.js`, existing font and favicon assets.
- Produces: the section IDs consumed by `philosophy-motion.js`: `why-vx`, `evolution`, `mission`, `values`, `method`, `founder-principle`, and `philosophy-contact`.

- [x] **Step 1: Create the page shell and metadata**

Use the canonical URL `https://zerotwo.tokyo/philosophy/`, one `h1`, the existing sticky header structure, and these page assets in this order:

```html
<link rel="stylesheet" href="/assets/css/style.css?v=20260722-vx1">
<link rel="stylesheet" href="/assets/css/philosophy.css?v=20260722-vx1">
<script src="/assets/js/main.js?v=20260722-vx1" defer></script>
<script src="/assets/js/philosophy-motion.js?v=20260722-vx1" defer></script>
<script src="/assets/js/vx-field.js?v=20260722-vx1" defer></script>
```

Set `body` class to `philosophy-page` and place the WebGL canvas first inside the hero:

```html
<section class="vx-hero" id="top" aria-labelledby="vx-title">
  <canvas class="vx-field" data-vx-field data-vx-field-state="idle" aria-hidden="true"></canvas>
  <div class="vx-hero-mark" aria-hidden="true"><span>V</span><span>X</span></div>
  <div class="vx-hero-copy">
    <p class="vx-label">CORE VALUE / VX</p>
    <h1 id="vx-title"><span>VIBES</span><span>TRANSFORMATION</span></h1>
    <p class="vx-statement">変革は、熱で完成する。</p>
  </div>
</section>
```

- [x] **Step 2: Add all approved editorial sections in final reading order**

Use semantic sections in this exact order: the hero with `id="top"`, Why VX with `id="why-vx"`, DX→AX→VX with `id="evolution"`, Mission with `id="mission"`, Values with `id="values"`, How We Work with `id="method"`, Founder’s Principle with `id="founder-principle"`, and the closing CTA with `id="philosophy-contact"`. Give each section an `aria-labelledby` that points to its visible heading.

The Values are an ordered list of five full-width rows, each with number, approved action title, and approved explanatory copy. The 0→1→2 method is an ordered list with Discover, Build, and Grow. The founder quote is a `blockquote` with three separate `span` elements and the approved attribution in `cite`.

- [x] **Step 3: Update homepage links without changing homepage content hierarchy**

Change desktop, mobile, and footer Philosophy links from `#philosophy` to `/philosophy/`. Add this CTA after the homepage Philosophy framework:

```html
<a class="philosophy-read-more button" href="/philosophy/">
  Philosophyを読む <span aria-hidden="true">→</span>
</a>
```

- [x] **Step 4: Add Philosophy to the sitemap**

Insert:

```xml
<url>
  <loc>https://zerotwo.tokyo/philosophy/</loc>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>
```

- [x] **Step 5: Run the contract test**

Run `node tests/verify-philosophy.mjs`.

Expected: failure at the first missing CSS or JavaScript asset, proving the HTML and navigation stage progressed while the next contract remains red.

---

### Task 3: Implement the A-02 Paper Circuit layout

**Files:**
- Create: `assets/css/philosophy.css`
- Modify: `assets/css/style.css`

**Interfaces:**
- Consumes: the semantic classes and `data-*` hooks from `philosophy/index.html`.
- Produces: complete static presentation, responsive state below 681px, current-page navigation, and class states `.motion-ready`, `.is-visible`, `.is-active`, `.is-complete` used by JavaScript.

- [x] **Step 1: Define page-scoped layout tokens and the hero**

Create tokens scoped to `.philosophy-page` and keep the approved palette:

```css
.philosophy-page {
  --vx-paper: #f4f0e8;
  --vx-ink: #151515;
  --vx-blue: #3157d7;
  --vx-blue-dark: #17338f;
  --vx-coral: #ff6049;
  --vx-grid: rgba(21, 21, 21, .08);
  background: var(--vx-paper);
}
.vx-hero {
  position: relative;
  min-height: calc(100svh - 5rem);
  overflow: clip;
  border-inline: 1px solid rgba(21, 21, 21, .15);
  background-image: linear-gradient(var(--vx-grid) 1px, transparent 1px), linear-gradient(90deg, var(--vx-grid) 1px, transparent 1px);
  background-size: 2rem 2rem;
}
.vx-field { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; mix-blend-mode: multiply; }
```

Use large condensed hero typography, outlined `V`, coral `X`, a text-safe maximum width, and z-index ordering that keeps the canvas and decorative letters behind copy.

- [x] **Step 2: Style the editorial story and evolution circuit**

Build `Why VX` as an asymmetric two-column spread. Build `.evolution-list` as three connected columns on desktop with a coral `.evolution-pulse`; `.evolution-step.is-active` uses cobalt/coral emphasis and must not move layout when activated.

- [x] **Step 3: Style Mission and Values**

Mission uses an ink field with paper text and a coral transformation underline. Values use full-width bordered rows with grid columns `number / title / description`; `.value-row::after` is a transform-only heat band and hover/focus-within share the same visible state.

- [x] **Step 4: Style 0→1→2, founder quote, and CTA**

The method uses a horizontal circuit with three circular nodes on desktop. Founder’s Principle uses a cobalt field, three oversized quote lines, and a restrained CSS door outline attached to the third line. CTA uses a coral field, black border, and the existing offset-shadow button language.

- [x] **Step 5: Add responsive rules at the approved boundary**

At `max-width: 680px`, switch the story, evolution, Values, and method to one column; change circuit paths from horizontal to vertical; keep semantic DOM order unchanged; ensure decorative V/X use `clamp()` and do not force overflow. At `max-width: 380px`, reduce padding and quote type without hiding copy.

- [x] **Step 6: Add motion-safe defaults and reduced-motion completion**

Static content is visible by default. Only hide revealable parts under `.motion-ready`. Complete every state under reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  .philosophy-page *, .philosophy-page *::before, .philosophy-page *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: .01ms !important;
  }
  .vx-reveal, .value-row, .quote-line { opacity: 1 !important; transform: none !important; }
  .evolution-pulse, .method-path, .mission-shift { transform: none !important; }
}
```

- [x] **Step 7: Add the shared homepage CTA and current-page header state**

Add only `.philosophy-read-more` and `.desktop-nav a[aria-current="page"]` / `.mobile-menu a[aria-current="page"]` rules to `style.css`; do not move existing homepage sections.

- [x] **Step 8: Run the contract test**

Run `node tests/verify-philosophy.mjs`.

Expected: failure at the first missing JavaScript asset; CSS reduced-motion contract now passes.

---

### Task 4: Implement Heat Circuit Motion and WebGL lifecycle

**Files:**
- Create: `assets/js/philosophy-motion.js`
- Create: `assets/js/vx-field.js`

**Interfaces:**
- Consumes: `[data-vx-reveal]`, `[data-evolution]`, `[data-value-row]`, `[data-method]`, `[data-founder-quote]`, and `[data-vx-field]` hooks.
- Produces: CSS state classes and `data-vx-field-state` values `running`, `paused`, `static`, `unsupported`, and `lost`.

- [x] **Step 1: Implement progressive reveal orchestration**

Initialize only after DOM availability, add `.motion-ready` when reduced motion is not requested, and use one observer:

```js
const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const revealItems = [...document.querySelectorAll("[data-vx-reveal]")];
if (!reduceQuery.matches && "IntersectionObserver" in window) {
  document.documentElement.classList.add("motion-ready");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: .18, rootMargin: "0px 0px -8%" });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
```

- [x] **Step 2: Add one-shot semantic sequences**

On first visibility, mark DX, AX, and VX active at 0ms, 420ms, and 840ms; keep VX active. Apply 100ms Values stagger through CSS custom property `--value-index`. Mark the method `.is-complete` once. Reveal founder lines at 0ms, 260ms, and 520ms, then add `.door-open` at 760ms. Clear pending timers if reduced motion becomes active.

- [x] **Step 3: Add pointer and focus heat response**

For pointer-capable devices only, set `--heat-x` and `--heat-y` on the hero and CTA from normalized pointer coordinates. Values respond through `pointerenter`, `pointerleave`, `focusin`, and `focusout`; pointer behavior never changes DOM order or text.

- [x] **Step 4: Implement the lightweight WebGL field**

Create a WebGL 1 context with alpha and antialiasing, generate a small fixed set of paper-circuit line and point vertices, and render ink/coral passes. The coral shader pulse uses a time uniform and distance along each path; pointer attraction is applied only when `(hover: hover) and (pointer: fine)` matches.

- [x] **Step 5: Enforce lifecycle and performance budgets**

Use these explicit limits:

```js
const mobileQuery = window.matchMedia("(max-width: 680px)");
const minimumFrameTime = mobileQuery.matches ? 1000 / 18 : 1000 / 24;
const maxDpr = mobileQuery.matches ? 0.9 : 1.25;
```

Pause requestAnimationFrame when the hero is outside an IntersectionObserver, when `document.hidden` is true, and after `webglcontextlost`. Reduced motion draws exactly one completed frame. Failed initialization hides the canvas and sets `data-vx-field-state="unsupported"`.

- [x] **Step 6: Run the complete contract test**

Run:

```bash
node tests/verify-philosophy.mjs
```

Expected: `Philosophy contract verified.`

---

### Task 5: Browser QA, documentation, and preview artifacts

**Files:**
- Modify: `README.md`
- Create: `../zerotwo-philosophy-desktop.png`
- Create: `../zerotwo-philosophy-mobile.png`
- Create: `../zerotwo-site.zip`

**Interfaces:**
- Consumes: the completed static site served from `http://127.0.0.1:4175/`.
- Produces: verified local pages and handoff artifacts in `outputs/`.

- [x] **Step 1: Start or reuse the local HTTP server**

Run from the site directory:

```bash
python3 -m http.server 4175
```

Expected: homepage at `http://127.0.0.1:4175/` and Philosophy at `http://127.0.0.1:4175/philosophy/` return HTTP 200.

- [x] **Step 2: Run automated structural and HTTP checks**

Run:

```bash
node tests/verify-philosophy.mjs
curl -I http://127.0.0.1:4175/
curl -I http://127.0.0.1:4175/philosophy/
curl -I http://127.0.0.1:4175/privacy/
```

Expected: contract verified and all responses `HTTP/1.0 200 OK`.

- [x] **Step 3: Check responsive layout in a real browser**

At 320, 360, 375, 390, 680, 681, 767, 768, 980, 981, 1024, and 1440px, assert `document.documentElement.scrollWidth === window.innerWidth`, inspect hero/quote/CTA for collision, and confirm DX→AX→VX and 0→1→2 switch at 681px. At mobile widths, open the menu, tab through links, press Escape, and confirm body scroll unlocks.

- [x] **Step 4: Check motion, reduced motion, and fallback states**

Confirm normal mode shows one-shot evolution, Values cascade, method draw, three quote beats, and door motion. Emulate reduced motion and confirm complete static content with no continuous animation. Disable WebGL or force context failure and confirm all text remains legible and canvas is hidden. Scroll the hero offscreen and switch tabs to confirm the field reports `paused`.

- [x] **Step 5: Check accessibility and console quality**

Confirm one `h1`, sequential headings, visible focus, current-page `aria-current`, keyboard-reachable CTA, decorative assets hidden from accessibility, WCAG AA contrast, and zero console errors or warnings on homepage, Philosophy, Privacy, and 404.

- [x] **Step 6: Update README and understanding checklist**

Document the new page files, local URL, motion budgets, fallback behavior, verification command, and why Core Value, Mission, Values, How We Work, and Founder’s Principle are separated. Add checklist items for VX vs Values and semantic motion.

- [x] **Step 7: Capture previews and rebuild the ZIP**

Capture one 1440px desktop full-page image and one 390px mobile full-page image, then archive the site directory without temporary browser files. The final ZIP path is `outputs/zerotwo-site.zip`.

- [x] **Step 8: Final verification checkpoint**

Run the contract test once more, search public files for forbidden names, report JavaScript byte size, and provide clickable links to the local page, implementation plan, preview images, and ZIP.
