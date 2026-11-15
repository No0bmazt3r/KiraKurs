# ARCHITECTURE.md

The app is a single-page static web app built with Vite + React + TypeScript, in a pnpm workspace with a small API. The guiding
rule is the fewest files that keep the engine, the copy and the UI separate. `pnpm dev` runs the web app and the API together.

## 1. File tree
```
KiraKurs/
├── package.json  pnpm-workspace.yaml  tsconfig.base.json  vitest.config.ts
├── packages/core/             pure TypeScript, shared by web and API, no runtime deps
│   ├── src/engine.ts          finance only (ENGINE.md). Pure. No imports.
│   ├── src/presets.ts         PRESETS data (ENGINE.md §9)
│   ├── src/format.ts          Intl formatting, % ↔ decimal, signed values
│   ├── src/content.ts         ALL user-facing copy and templates (mirrors CONTENT.md) + makeVars/fill
│   ├── src/quiz.ts            quiz scoring and result code
│   ├── src/ask.ts             Ask ids + PII guard (shared with the API)
│   └── test/                  engine / content / format tests (Vitest) + engine.version.json
├── apps/web/                  Vite + React
│   ├── index.html  public/favicon.svg  vite.config.ts (proxy /api → :8787)
│   ├── src/main.tsx           boot: legacy ?preset= links, free mode, TanStack Router (hash history)
│   ├── src/Shell.tsx          top bar, tabs, progress, action bar, footer
│   ├── src/store.ts           Zustand store + persist (localStorage, try/catch), raw → engine inputs, useData()
│   ├── src/ui.tsx             Icon, Field, Choices, Feedback, Badge, Rich (glossary), Sheet, Toast
│   ├── src/chart.tsx          inline-SVG chart "C − A against Malaysian inflation"
│   ├── src/icons.ts           Lucide SVG bodies (ISC licence)
│   ├── src/styles.css         tokens · base · layout · components (DESIGN.md)
│   ├── src/screens/           Precheck Learn Predict Map Coach Check Quiz Ask (.tsx)
│   └── e2e/smoke.ts          headless-Chrome smoke test (`pnpm e2e`)
├── apps/api/                  Cloudflare Worker: src/index.ts, test.ts, wrangler.toml, .dev.vars.example
├── .github/workflows/pages.yml  typecheck + test + build → GitHub Pages
├── AGENTS.md  README.md  LICENSE
└── docs/                      these specs
```
**Size targets:** engine ≤ 300 lines, each screen ≤ 250 lines, styles.css ≤ 900 lines.

## 2. Data flow
```
user input ─→ ui.js (parse via format.js) ─→ store.set(patch)
                                               │
                    engine.validate(raw) ─ errors ─→ field messages
                                               │ ok
                    engine.parityMap/coach/allowance(values)  (pure, ~µs)
                                               │
                    screen.render(state, results) ─→ DOM (textContent only)
```
- **Recompute everything on every change.** The engine is cheap, so there are no caches and no partial updates.
- Slider `input` events update live (throttled with `requestAnimationFrame`). Number fields validate on `blur` and on Enter.
- Render with `textContent` and `setAttribute` only. **Never use `innerHTML` with any user or AI string.** Static SVG icon strings
  from icons.js are the only `innerHTML` use.

## 3. State (`store.js`)
```js
state = {
  preset: "snapshot",            // "classroom" | "snapshot" | custom
  raw:    { S:"4.0565", T:"12000", n:"270", iH:"2.75", iF:"3.875", piH:"1.8", piF:"3.7", margin:"0", h:"0" }, // strings, percent
  linked: false,
  showMaths: { map:false, coach:false },
  progress: { precheck:false, learn:false, predict:null /* "up"|"down"|"same" */, check:false },
  quiz: { form:"A" | "B", pre: {q1:{answer, confidence}, …}, post: {…}, changedDecision: null },
  theme: "system" | "light" | "dark",
  unlocked: false                // true after Learn is done or skipped → tab bar appears
}
```
- Persist `progress`, `quiz`, `theme` and `unlocked` to `localStorage["kirakurs:v1"]`, inside try/catch. The app must work with storage
  blocked.
- `raw` is **not** persisted. A reload restores the preset from the URL, so lecturers always get a clean demo.
- Quiz form order: on first visit pick A or B at random (`crypto.getRandomValues`), so the counterbalancing is automatic.

## 4. Routing and URLs
| Route | Screen | Guard |
|---|---|---|
| `#/precheck` | 0 Pre-check | first visit default |
| `#/learn` | 1 Learn | |
| `#/predict` | 2 Predict | |
| `#/map` | 3 Parity Map | always reachable ("Skip to Parity Map") |
| `#/coach` | 4 Decision Coach | always reachable |
| `#/check` | 5 Sensitivity + post-check | |
- Query parameters: `?preset=classroom|snapshot` and `&maths=1` (open "Show the maths"). Example lecturer link:
  `…/KiraKurs/?preset=classroom#/map`.
- Back and forward buttons work (hash routing). Focus moves to the screen `<h1>` on every route change, and the document title
  updates to "Parity Map · KiraKurs".

## 5. Components (`ui.js`), all framework-free functions returning elements
`h(tag, attrs, ...children)` · `Card({title, value, unit, sentence, badge, details})` · `Badge(preset)` · `Tooltip(termId)` ·
`Slider({id, label, min, max, step, value, unit, onInput})` · `NumberField({...})` · `Segmented({options, value})` ·
`Sheet({title, content})` (bottom sheet on mobile, side panel ≥ 1024 px, uses `<dialog>`) · `Toast(msg)` · `Arrow(dir, meaning)`.
See DESIGN.md §5 for the look and the states of each.

## 6. Chart (`chart.js`)
One chart: **C − A (y, RM) against Malaysian inflation % (x, 0–6%)**, for the current inputs.
- 61 points from engine `sensitivity()`; a zero line; the break-even marked with a dashed vertical line and the label "Break-even
  2.58%: real rates equal"; the current πH marked with a dot.
- Region above zero shaded "waiting costs more", below zero "waiting costs less" (with text labels, not colour alone).
- `role="img"` + `aria-label` summary + a visually-hidden `<table>` of the 5 sensitivity rows.

## 7. Deployment
- GitHub Pages via GitHub Actions (`.github/workflows/pages.yml`): on push to `main` it runs typecheck, tests and `pnpm build`,
  then publishes `apps/web/dist`. Vite `base: "./"` + hash routing, so it works under `/KiraKurs/`. Settings → Pages → Source:
  "GitHub Actions".
- Before each push: `pnpm test` and `pnpm e2e` pass, `ENGINE_VERSION` bumped if the engine changed.
- (Stretch) PWA: `sw.js` caches the app shell named `kirakurs-${ENGINE_VERSION}`; a new version shows the toast
  "Update available, reload".
- (Stretch) AI router: the Cloudflare Worker in `apps/api` (`pnpm --filter api deploy`), calling Groq. See idea §10. Set the repo
  variable `VITE_ASK_URL` to the Worker URL; while it is empty the production Ask button is hidden (in `pnpm dev` it uses `/api/ask`). The client gets `{explanation_id}` only, and renders the
  template from content.ts as React text (never `dangerouslySetInnerHTML`).

## 8. Security and privacy
No accounts, no analytics, no cookies, no network calls (except Google Fonts, and the optional Ask Worker, which receives only the typed question). Quiz answers stay in localStorage. A "Clear my data"
link sits in the footer. The result code is shown and copied, never sent.
