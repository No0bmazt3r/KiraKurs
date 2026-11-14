# DESIGN.md: visual and interaction system

**Direction: "calm, clear, honest money."** It aims for the clarity of a good fintech app (big readable numbers, one decision per
screen) and the momentum of a good learning app (predict → feedback → continue). The audience is undergraduates, not children:
no mascots, no claymorphism, no confetti. Inspiration and what we take from each:

| Source | What we borrow |
|---|---|
| Bret Victor, *Explorable Explanations* (2011); Nicky Case's explorable design patterns | Reactive numbers inside sentences; guide attention to one phenomenon at a time; withhold the answer until the learner predicts (a "cognitive gate"); end in a sandbox |
| Duolingo answer feedback | Commit → immediate verdict bar (correct/incorrect, colour + icon + words) → one-line why → Continue |
| Wise transfer screens | One hero amount, secondary details collapsed, fees shown explicitly, tabular figures |
| Apple/Material bottom sheets | Details and limitations open as sheets on mobile, so context is never lost |

## 1. Principles (apply in this order when in doubt)
1. **One question per screen.** Every screen answers one question, written as its `<h1>`.
2. **Hero number, then why, then details.** Each card has a big value, one plain sentence, and an expandable "Show the maths".
3. **Words before symbols.** "Malaysian inflation %", not π_MY. Symbols appear only inside "Show the maths".
4. **Never let colour carry meaning alone.** Lock vs wait, up vs down, and good vs bad always also carry an icon and words.
5. **Honesty is visible.** A data badge on every card, "theory, not prediction" in the Coach, limitations one tap away.
6. **Forgiving inputs.** Sliders for exploration, number fields for precision, and a reset on every screen.

## 2. Tokens (`styles.css` §1)
### 2.1 Colour: semantic tokens only; never put raw hex inside a component
| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#F6F8F7` | `#0B1513` | page |
| `--surface` | `#FFFFFF` | `#13201D` | cards, sheets |
| `--surface-2` | `#EEF3F1` | `#1A2B27` | input fields, table stripes, "Show the maths" block |
| `--text` | `#0F1F1C` | `#E7F0ED` | body |
| `--text-2` | `#4A5C57` | `#A8BAB4` | secondary text (≥ 4.5:1 on surface) |
| `--border` | `#D6E0DC` | `#2A3D38` | hairlines |
| `--border-strong` | `#7A8C86` | `#5E726C` | input, slider-track and chip outlines (≥ 3:1 non-text contrast) |
| `--primary` | `#0F766E` (teal 700) | `#2DD4BF` (teal 400) | **Lock / certainty**, primary buttons, links, focus ring |
| `--on-primary` | `#FFFFFF` | `#04201C` | text on primary |
| `--primary-soft` | `#CCFBF1` | `#0F3B35` | lock card tint, selected chip |
| `--risk` | `#B45309` (amber 700) | `#FBBF24` (amber 400) | **Wait / risk**, range band, warnings |
| `--risk-soft` | `#FEF3C7` | `#3A2A07` | wait card tint, range fill (with 35% opacity in the chart) |
| `--theory` | `#4338CA` (indigo 700) | `#A5B4FC` | PPP/IFE theory accents, tooltips' term colour |
| `--success` | `#15803D` | `#4ADE80` | correct answer bar |
| `--danger` | `#B91C1C` | `#F87171` | incorrect answer bar, input errors |
| `--focus` | `#0F766E` | `#5EEAD4` | 3 px focus outline + 2 px offset |
Contrast (computed, WCAG formula): text/surface 17.0 (light) · 14.4 (dark); text-2 7.1 · 8.3; white on primary 5.47; risk on white 5.02, on risk-soft 4.51; theory 7.9; success 5.0; danger 6.5; primary on primary-soft 4.86; dark-mode accents ≥ 6.0. `--border` is decorative only (1.35:1).
Dark mode: `@media (prefers-color-scheme: dark)` on `:root:not([data-theme="light"])`, plus `:root[data-theme="dark"]` for the toggle.

### 2.2 Type
- **Headings:** `Plus Jakarta Sans` 600/700. **Body/UI:** `Inter` 400/500/600. Fallback: `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.
- Load: `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700&display=swap`.
- Numbers: `font-variant-numeric: tabular-nums` on every amount, rate and table.
| Token | Size / line-height | Use |
|---|---|---|
| `--fs-hero` | clamp(2.25rem, 8vw, 3rem) / 1.1, 700 | the one hero amount per screen |
| `--fs-h1` | 1.5rem / 1.25, 700 | screen question |
| `--fs-h2` | 1.125rem / 1.3, 600 | card titles |
| `--fs-value` | 1.75rem / 1.15, 600 | card values |
| `--fs-body` | 1rem / 1.55 | body (never below 16 px on inputs: avoids iOS zoom) |
| `--fs-small` | 0.875rem / 1.45 | helper text, badges, captions (minimum) |
Measure: max 65ch for paragraphs. `text-wrap: balance` on h1/h2.

### 2.3 Space, radius, elevation, motion
- Space scale (4-pt): `--s1 4px · --s2 8px · --s3 12px · --s4 16px · --s5 24px · --s6 32px · --s7 48px`. Page gutter 16 px (mobile), 24 px (≥ 768).
- Radius: `--r-sm 8px` (inputs, chips) · `--r-md 14px` (cards) · `--r-lg 20px` (sheets) · `--r-pill 999px`.
- Elevation: cards `0 1px 2px rgb(0 0 0 / .06), 0 1px 1px rgb(0 0 0 / .04)`; sheets `0 -8px 24px rgb(0 0 0 / .12)`. Dark mode: borders, not shadows.
- Motion: `--t-fast 120ms` (press), `--t-base 200ms` (reveal), `--t-slow 320ms` (sheet). Easing `cubic-bezier(.2,.8,.2,1)`. Exits are faster than
  entrances. Animate only `opacity` and `transform`. Value changes: a 200 ms highlight flash on the changed number (background
  `--primary-soft` fading out), **not** a counting animation. Under `prefers-reduced-motion: reduce`, all durations are 0 and there is no flash.

## 3. Layout
- **Mobile first (375 × 667 baseline).** Breakpoints: `768px` (two-column cards), `1024px` (content + side panel for "Show the maths"
  and the limitations), `1280px` max content width 1120 px.
- **App shell:**
```
┌───────────────────────────────────────┐
│ KiraKurs        [Snapshot 6 Nov ▾] ◐  │  top bar 56px: logo · preset chip (opens preset sheet) · theme toggle
│ ▓▓▓▓▓▓▓░░░░░░  Step 3 of 6            │  progress (guided mode only)
├───────────────────────────────────────┤
│ H1: the screen's one question         │
│ … cards …                             │  <main>, scrolls
│                                       │
├───────────────────────────────────────┤
│ [ Back ]              [ Continue → ]  │  sticky action bar (guided mode), safe-area padding
│ Learn · Map · Coach · Check   ⓘ Limits│  tab bar (free mode, after Learn), ≤ 5 items, icon + label
└───────────────────────────────────────┘
```
- ≥ 1024 px: the tab bar moves into the top bar as text tabs, and "Show the maths" opens in a right panel (360 px) instead of inline.
- Footer (end of the scroll, not sticky): `Engine v1.0.0 · Not financial advice · Sources · Clear my data`.

## 4. Iconography
Lucide icons, inline SVG, 24 px, 2 px stroke, `currentColor`. Set: `lock` (lock option), `hourglass` (wait), `scale` (compare),
`trending-up`/`trending-down` (directions), `info` (tooltip), `shield-alert` (limitations), `sliders-horizontal`, `calculator`
(show the maths), `rotate-ccw` (reset), `check-circle`, `x-circle`, `sun`/`moon`. Decorative icons next to text get `aria-hidden="true"`.
**No emoji as icons.**

## 5. Components
### 5.1 Buttons
Primary (filled `--primary`), secondary (outline `--border`, text `--text`), ghost (text `--primary`). Height 48 px, padding 0 20 px,
radius `--r-sm`, label 600. Press: `transform: scale(.98)` 120 ms. Disabled: 40% opacity plus the `disabled` attribute.

### 5.2 Number card (the core unit)
```
┌ Forward (bank lock) ────────── ⓘ ┐
│ RM 4.02  per US$1                │  value (--fs-value) + unit (--text-2)
│ ↓ below the 6 Nov rate of 4.06   │  Arrow with words + "MYR per US$1 · ↑ = ringgit weaker"
│ A bank lock for 270 days is …    │  sentence (CONTENT.md), ≤ 30 words
│ [Snapshot · 6 Nov · not live]    │  badge
│ ▸ Show the maths                 │  disclosure: formula + substituted numbers (mono-ish, tabular)
└──────────────────────────────────┘
```
Variants: `lock` (left border 4 px `--primary`, tint `--primary-soft`), `wait` (border `--risk`, tint `--risk-soft`), `theory` (border
`--theory`), `neutral`.

### 5.3 Decision hero (Coach)
Two side-by-side tiles at ≥ 375 px (stacked below 360): **Lock** (lock icon, certain amount) | **Wait** (hourglass, expected amount
plus a range bar). Below them is the verdict sentence. The range bar is a horizontal track from lo to hi, with a tick at the
expected value and a teal tick at the lock amount: you *see* that the lock sits inside a wide amber band.

### 5.4 Slider
Native `<input type="range">` styled (track 6 px, thumb 28 px, hit area 44 px). Above it: label left and live value right
(`<output>`). Below: min/max labels. Paired with − / + step buttons for fine control and a "Type a value" toggle that reveals a
number field. Keyboard: arrows = step, PageUp/PageDown = 10 steps. `aria-valuetext="Malaysian inflation 1.8 percent"`.

### 5.5 Inputs
Visible label above; unit as a suffix inside the field ("%", "days", "US$"); helper text below; error text below in `--danger` with
an `x-circle` icon, linked by `aria-describedby`; validate on blur. `inputmode="decimal"`. Derived (linked-mode) fields are read-only,
with a `--surface-2` fill, a lock-link icon and the caption "= (1 + real rate)(1 + inflation) − 1, calculated".

### 5.6 Data badge
A pill with `--fs-small` text. Snapshot: teal outline + calendar icon, text from the preset `badge`. Classroom: indigo outline +
"Illustrative". Always on cards and charts. Tapping it opens the Sources sheet.

### 5.7 Tooltip / glossary term
A dotted underline in `--theory`. Tap or focus opens a small popover (≤ 15 words, from CONTENT.md §6), and Esc closes it. Built
on `<button aria-expanded>` + a popover `div`, not on hover alone.

### 5.8 Answer feedback bar (Predict, quizzes)
After "Check": a bar slides up from the bottom (200 ms) — correct: `--success` tint, `check-circle`, "Correct", the why sentence,
[Continue]; incorrect: `--danger` tint, `x-circle`, "Not quite", the misconception-specific sentence, [Continue]. The bar has
`role="status"`. Options lock after Check.

### 5.9 Option buttons (quiz)
Full-width 56 px rows with radio semantics (`role="radiogroup"`), plus a 1–3 confidence segmented control below the stem.
Selected: `--primary-soft` with a 2 px `--primary` border.

### 5.10 Sheet
`<dialog>` bottom sheet: drag handle, title, close button (44 px), scrollable content, max height 85vh. Focus is trapped inside,
and on close focus returns to the trigger. Used for: preset picker, Sources, Limitations, Show the maths (mobile).

### 5.11 Toast
Bottom-centre, 4 s, `role="status"`. Used for "Copied", "Reset to Scenario 2", and "Update available".

### 5.12 Tables
Sensitivity and forecast tables: zebra rows `--surface-2`, numbers right-aligned, the current row highlighted with `--primary-soft`
plus a "you are here" marker; horizontal scroll inside the card only (never the page).

## 6. Screen layouts (mobile; desktop widens into 2 columns where noted)
**0 Pre-check**: h1 "Quick check before we start (2 minutes)"; consent line; 8 question cards one at a time; progress dots; "Skip".
**1 Learn**: Aina's card (avatar initials "A", "fictional"); 4 numbered steps, each a short paragraph with inline reactive numbers and
tooltips; step 4 shows the Lock hero mini-tile; the completion step has a slider + "Predict the arrow" (↑/↓/=), then the reveal.
Desktop: the story on the left, a sticky mini Parity Map on the right.
**2 Predict**: h1 is the question; 3 option rows; Check; feedback bar; the note "We'll revisit this in the Coach".
**3 Parity Map**: hero card "Lock: set aside RM 47,328 now"; a 2×2 grid (Forward, PPP, IFE, Real rates); below it an inputs card with
sliders (Malaysian inflation, US inflation, Malaysian interest, US interest) and a "Linked mode" switch; the "Set equal real rates"
button; "Show the maths". Desktop: inputs in a left column, outputs on the right.
**4 Decision Coach**: decision hero (5.3) + verdict; split slider ("Lock __% now"); allowance card; bank margin field (collapsed under
"Fees"); chart; forecast table under "Show the maths"; the predict reveal callout if Predict was answered.
**5 Check**: inflation slider + before/after table; then the post-quiz (other form); "Did this change your decision?" (Yes/No/Not sure);
results: pre → post score per objective, the result code with a Copy button, and links to Limitations and Sources.

## 7. Accessibility checklist (part of done)
- [ ] Landmarks: header, nav, main, footer; one h1 per screen; logical h2s.
- [ ] Every input has a visible `<label>`; errors are linked via `aria-describedby`; there are no placeholder-only labels.
- [ ] Keyboard: full flow without a mouse; visible focus; no traps except an open dialog; Esc closes sheets and popovers.
- [ ] Live region (`aria-live="polite"`) announces the Coach verdict sentence when inputs change (debounced 500 ms).
- [ ] Touch targets ≥ 44 × 44 px with ≥ 8 px spacing.
- [ ] Contrast ≥ 4.5:1 text, ≥ 3:1 UI boundaries, checked in **both** themes.
- [ ] Reduced motion honoured. Text zoom 200% without loss. 375 px wide with no horizontal scroll.
- [ ] The chart has a text alternative (aria-label + hidden table).

## 8. Anti-patterns (reject in review)
Emoji icons · walls of numbers without hierarchy (> 4 numbers in the beginner view) · bare arrows without words · "today" next to
Snapshot data · colour-only meaning · hover-only tooltips · modal on modal · counting/rolling number animations · gradients on
text · fonts below 14 px · centred long paragraphs · any number typed into HTML instead of computed.
