# PRD: KiraKurs, Convert Now or Later?

*Kira* = calculate, *kurs* = exchange rate. Tagline: **"See how inflation and interest rates move your ringgit before you pay abroad."**

## 1. Problem
Malaysian students who must pay a foreign-currency bill on a known future date (exchange semester, postgraduate deposit, exam fee,
monthly allowance) do not know **why** the ringgit cost changes, how Malaysian vs foreign inflation and interest rates feed into it,
or that **locking removes risk while waiting is a bet**. The same US$12,000 cost RM 57,570 on 20 Feb 2024 and RM 46,632 on
26 Feb 2026 (ECB reference rates; `../evidence/fx/`).

## 2. Users
| | Who | Context | What they need |
|---|---|---|---|
| Primary | Non-finance undergraduate (IT/IS/CS etc.), 19–24 | On a phone, 5–15 minutes, between classes or at a pre-departure briefing | One clear answer (lock vs wait), why, and how risky waiting is |
| Secondary | Lecturer / briefing facilitator | Laptop + projector | One-click presets, "show the maths", a story they can walk through |
| Tertiary | Parent sending an allowance | Phone | The allowance card in plain words |

**Persona (fictional, always labelled):** *Aina, 21, CS student with a US exchange semester. She needs US$12,000 in 270 days
and holds ringgit.*

## 3. Learning objectives (shown on the Learn screen and the poster)
After using KiraKurs, a learner can:
1. state how relative inflation moves the expected exchange rate (PPP);
2. explain why a forward follows from interest rates and is a lock, not a forecast (IRP);
3. relate nominal rates to inflation and real rates (Fisher), and say when PPP and IFE agree;
4. use the real-rate rule to judge lock vs wait, see that waiting carries risk, and name two limitations;
5. explain why, under PPP, a foreign living allowance in ringgit grows at **Malaysian** inflation.

## 4. Scope
### 4.1 Must-build (graded; without these the project is capped)
| ID | Feature | Notes |
|---|---|---|
| M-E | Engine `js/engine.mjs` + `test/engine.test.mjs` | ENGINE.md. Zero dependencies. |
| M-0 | Screen 0: Pre-check quiz (form A/B, counterbalanced) | 8 items, ~2 min, skippable |
| M-1 | Screen 1: Learn, Aina's story (4-step worked example + completion step) | "Skip to Parity Map" link |
| M-2 | Screen 2: Predict (direction question, misconception feedback, revealed in the Coach) | |
| M-3 | Screen 3: Parity Map (beginner 4 numbers; "Show the maths"; linked mode; equal-real-rates button) | |
| M-4 | Screen 4: Decision Coach (A/B/C, three forecasts, historical range, split slider, margin, chart, allowance card) | Hedging extension |
| M-5 | Screen 5: Sensitivity + post-check (inflation slider + table, form B/A, "did this change your decision?") | |
| M-P | Presets: Scenario 1 Classroom (illustrative), Scenario 2 Snapshot 2026-11-06 (dated) | One-click, badge switches |
| M-L | "How far can I trust this?" limitations panel, reachable from every screen | |
| M-T | Jargon tooltips at first use | CONTENT.md §6 |
| M-D | Deploy to GitHub Pages; `ENGINE_VERSION` in the footer | |

### 4.2 Stretch (in cut order: cut the first one first)
1. **AI router "Ask KiraKurs"**: enum-only explanation picker (idea §10). Needs Cloudflare Pages Functions. **Default: cut.**
2. **PWA**: manifest + service worker + "Update available" prompt.
3. **GBP and AUD Classroom presets.**
4. (Never cut below this line without telling the team.) Allowance card, split slider.

### 4.3 Out of scope
Accounts/login, any backend or database, live rates, sending quiz answers anywhere, Bahasa Malaysia UI, SME invoice mode,
teacher dashboard. (These are listed as future work on the poster.)

## 5. Key user stories and acceptance criteria
| # | Story | Acceptance |
|---|---|---|
| U1 | As Aina, I see in under 60 s what locking costs vs waiting | Coach beginner view shows the lock amount, the PPP wait amount, the difference and the one-sentence verdict above the fold at 375×667 |
| U2 | As Aina, I can predict before I'm told | The Predict screen hides the answer until a choice is made; the wrong choice gets its own specific feedback |
| U3 | As a learner, I can see inflation flow into exchange rates | Moving "Malaysian inflation %" updates PPP immediately; in linked mode it also updates the interest rates, the forward and IFE, with a visible "calculated" marker on the derived fields |
| U4 | As a lecturer, I can switch between Classroom and Snapshot in one click | Preset chips; the badge text changes; all numbers update; URL `?preset=` deep-links |
| U5 | As a sceptic, I can check the maths | "Show the maths" reveals formulas with substituted numbers; values match ENGINE.md §7 |
| U6 | As anyone, I know the limits | The limitations panel opens from every screen; each parity card names its assumption |
| U7 | As a test participant, I get an anonymous result code | Post-check shows e.g. `KK-A-5-7` (form-first, pre score, post score), copyable; nothing is transmitted |
| U8 | As a keyboard / screen-reader user, I can complete the flow | Tab order follows visual order; sliders have labels + live value text; result changes are announced politely |

## 6. Success measures (report what is observed, or "not conducted")
- Engine: all golden tests pass (`node --test`).
- Learning: pre vs post % correct per quiz item, with confidence; n reported; no inferential claims.
- Usability: think-aloud with ≥ 5 students; task success for U1, U3, U4; issues logged.
- Parity: phone and laptop show identical G1–G7 and Snapshot values.

## 7. Constraints
- Plain HTML/CSS/JS ES modules, no build, no npm dependencies (Node ≥ 20 only for `node --test`).
- Works offline-ish (no network calls except fonts); loads in < 1 s on 4G; total JS < 60 KB unminified.
- English only. Currency formatting `en-MY`.
- Repository: `github.com/No0bmazt3r/KiraKurs`, deployed from `main` with GitHub Pages.
