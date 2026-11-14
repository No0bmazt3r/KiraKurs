# AGENTS.md: read this first

You are building **KiraKurs: Convert Now or Later?**, a learning web app for the GFB3043/GEB3043 International Financial
Management FinBridge AI project. **Deadline: 16 Nov 2026, 23:59 MYT.** It will be graded against a 100-mark rubric. Finance
accuracy is worth 35 of those marks.

The product idea is `../idea.md` (v5). The documents below turn it into a build spec. When the idea and these documents
disagree, **these documents win** (they are newer and were reconciled against the idea). The single exception is any number in
`docs/ENGINE.md` §7: if one of those disagrees with your own computation, stop and report it.

## Read in this order
1. `docs/PRD.md`: what to build, for whom, must-build vs stretch, and what counts as done.
2. `docs/ENGINE.md`: every formula, the function API, validation, and the golden values the tests must assert.
3. `docs/ARCHITECTURE.md`: files, modules, state, routing, deployment.
4. `docs/UX-FLOWS.md`: the screen flow, interactions and states of each screen.
5. `docs/DESIGN.md`: visual system (tokens, type, components, layouts, accessibility).
6. `docs/CONTENT.md`: **all** user-facing words. Do not invent copy; take it from here.
7. `docs/TASKS.md`: build order, owners, time boxes, definition of done.
8. `docs/TESTING.md`: what to test, how to log results honestly.

## Non-negotiable rules
1. **Every number shown to a user comes from `js/engine.mjs`.** No number is hard-coded in HTML, CSS, copy templates or the
   AI. Copy uses `{{placeholders}}` filled from engine output (see CONTENT.md §0).
2. **Write the engine and its tests first.** `node --test` must pass before you build any screen that shows a number.
3. **Full precision inside, round only at display**, using `js/format.js` (ENGINE.md §6). Never round and then reuse.
4. **Rates are decimals inside the engine** (0.0275), **percent in the UI** (2.75). Convert only in `js/format.js` and the input
   parser. Mixing these is the single most common fatal error.
5. **Quote convention everywhere: S = MYR per 1 unit of foreign currency.** "↑ = ringgit weaker" sits beside every FX output.
6. **The Snapshot data is dated, frozen and not live.** Never write "today", "current", "latest" or "live" next to a Snapshot
   value. Say "the 6 Nov rate". "Now" appears only in "set aside now" / "convert now" (Aina's decision moment). Every card and
   chart carries the data badge (DESIGN.md §5.6). A test enforces this (CONTENT.md §0).
7. **No dependencies, no build step, no framework.** Plain HTML + CSS + ES modules. Inline SVG for the chart and icons. The only
   external request allowed is Google Fonts, and the app must look fine if fonts fail to load.
8. **Accessibility is part of done:** visible labels, keyboard operable, focus visible, contrast ≥ 4.5:1, `prefers-reduced-motion`
   honoured, works at 375 px wide with no horizontal scroll.
9. **Do not fabricate evidence.** Never write test results, survey numbers, user quotes or "verified" chips that did not come from a
   real run. If something was not done, the UI and docs say "not yet conducted". Fabrication sets the integrity mark to 0.
10. **Cut order when short of time:** AI router → PWA/offline → GBP/AUD presets → allowance card → split slider. Never cut: engine,
    tests, labels/badges, the six core screens, the limitations panel.
11. **Commits:** small, one task per commit, message starts with the task ID from TASKS.md (e.g. `E2: add coach()`).

## Run
```
python3 -m http.server 8000      # then open http://localhost:8000  (ES modules do not load from file://)
node --test                      # runs test/*.test.mjs
```

## Definition of done (whole app)
All TASKS.md "must" tasks ticked, `node --test` green, TESTING.md manual checklist run and **logged as observed**, deployed to
GitHub Pages, and the G1–G7 + Snapshot values on screen match ENGINE.md §7 on both a phone and a laptop.
