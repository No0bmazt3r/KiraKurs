# UX-FLOWS.md: flows, interactions and states

## 1. The two modes
```
First visit (guided)                                        Return / lecturer link (free)
Pre-check → Learn → Predict → Parity Map → Coach → Check     Tab bar: Learn · Map · Coach · Check · Limits
   ▲ progress bar "Step k of 6", sticky Back / Continue       no progress bar; any screen; deep links work
```
- Guided mode switches to free mode (`state.unlocked = true`) when Learn is finished **or** the learner presses "Skip to Parity Map".
  From then on the tab bar shows and Continue buttons stay (they don't hurt).
- A URL with `?preset=` or a route other than `#/precheck` on first load opens **free mode** directly (lecturer demo).
- Pre-check is optional: "Skip" goes to Learn and records `pre = null` (the results then say "no pre-check").

## 2. Screen by screen
### 0 Pre-check
1. Consent line + "Start" / "Skip".
2. One item per view: stem → options → confidence → Next (enabled once an option is picked; confidence defaults to 2).
3. No right/wrong shown. 8 items. Progress dots "3 of 8".
4. End → "Thanks! Now meet Aina." → Learn.

### 1 Learn
1. Aina card, then the steps revealed **one at a time** with a "Next step" button (cognitive load: one idea per view). Numbers in the
   steps are live from the Snapshot preset. Tapping a dotted term opens its tooltip.
2. After step 4: the completion task. The slider starts at 1.8%, the prompt asks the learner to move it to 4.0% **and** pick ↑ / ↓ / =
   first. The arrow on the PPP mini-card stays hidden (shown as "?") until they commit, then reveals with a 200 ms flash plus the
   reveal sentence.
3. Continue → Predict. "Skip to Parity Map" is visible from the top of Learn.

### 2 Predict
1. Question + 3 options; "Check" is disabled until one is chosen.
2. Check → feedback bar (DESIGN.md §5.8) with misconception-specific text; options lock.
3. The answer is stored in `progress.predict`; Continue → Parity Map.

### 3 Parity Map
1. Beginner view: hero + 4 cards. The inputs card sits below on mobile and on the left on desktop.
2. Moving any slider recomputes everything live; the changed values flash.
3. **Linked mode on:** banner appears; the two interest fields become read-only derived fields; the "real rate" fields appear
   as the editable inputs (prefilled with the current real rates). Moving inflation now moves interest, the forward, PPP and IFE together.
   Turning linked mode off keeps the last derived interest values as editable values.
4. "Set equal real rates": sets the foreign interest so rF = rH (keeps the Malaysian side), with a toast, so PPP and IFE now show the
   same number.
5. "Show the maths": inline expansion (mobile) / side panel (≥ 1024): formulas with substituted values, the 1-year view, the bank
   convention, and the 4-forecast table.
6. Invalid input: a field error under the field; cards keep the **last valid** results, dimmed to 50%, with the caption "Fix the
   highlighted input to update."

### 4 Decision Coach
1. Hero tiles (Lock / Wait + range bar) and the verdict sentence. The verdict is announced via `aria-live` (debounced) when inputs change.
2. Split slider 0–100% in 10% steps (snap); the tiles show the blended expected value and range; the range bar shrinks.
3. Allowance card: one number field (default 1,500); results update live.
4. "Fees" disclosure → bank-margin field (0–10%).
5. Chart: tap or focus a point → tooltip with the inflation % and the wait-minus-lock difference; the break-even is labelled. Moving
   the inflation slider (shared state with the Map) moves the "you are here" dot.
6. If Predict was answered: the predict reveal callout appears at the top (dismissible).
7. "Show the maths": all three forecasts (PPP, IFE, random walk), A = B shown side by side, the historical-range method, and the
   split formula.

### 5 Check
1. Inflation slider + the 5-row table (fixed rows 1, 1.8, 3, 4, 5%) + the live row for the slider value; the why sentence; the
   linked comparison line.
2. Post-quiz: the **other** form; feedback after each item this time (it's a learning moment now).
3. "Did this change how you'd convert?" (single tap).
4. Results: pre → post per objective (5 small bars), the result code, Copy, and links to Limitations and Sources.
   - Code format: `KK-{firstForm}{pre}-{post}` e.g. `KK-A5-7`; pre = `x` if skipped.

## 3. Presets
- The preset chip in the top bar opens a sheet: Scenario 1 · Classroom (illustrative), Scenario 2 · Snapshot 6 Nov 2026 (dated),
  plus (stretch) GBP/AUD classroom.
- Switching preset replaces **all** inputs, turns linked mode off, updates the badge everywhere and the URL (`history.replaceState`),
  and shows a toast. Every screen with inputs has "Reset to Scenario k" (resets to the active preset).
- Changing any input marks the badge "Snapshot (edited)" / "Classroom (edited)", so edited numbers are never passed off as source data.

## 4. Global states
| State | Behaviour |
|---|---|
| Loading | Static HTML shell renders instantly; JS mounts in < 100 ms; no spinners needed |
| JS disabled | `<noscript>`: "KiraKurs needs JavaScript to calculate." |
| Storage blocked | Works; progress not remembered |
| Out-of-range result | Card shows "Result out of range: check the inputs." |
| Offline | Works after first load (fonts fall back); PWA stretch adds a true offline cache |
| Wide screens | Max width 1120 px, centred |
| Print (lecturer) | `@media print`: hide nav and sliders; show cards and badges; black on white |

## 5. Micro-interactions
- Buttons: press scale .98 (120 ms). Chips: selected fill. Sliders: thumb grows 1.1× while dragging.
- Value change flash: 200 ms `--primary-soft` background fade on the changed number only.
- Feedback bar: slides up 200 ms; exits in 120 ms.
- Sheets: slide up 320 ms, backdrop fade; swipe down or Esc to close.
- Reduced motion: none of the above move; state changes are instant.

## 6. Think-aloud tasks (used in TESTING.md)
T1 "How much must Aina set aside if she locks? Is waiting cheaper?" (U1) · T2 "Make Malaysian inflation 4%. What happened to the
wait cost, and why?" (U3) · T3 "Switch to the classroom example." (U4) · T4 "Find one reason not to trust the number." (U6).
