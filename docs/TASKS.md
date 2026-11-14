# TASKS.md: build plan (deadline 16 Nov 2026, 23:59 MYT)

Owners follow idea §1: **M1** engine + tests + numbers.xlsx · **M2** Parity Map + chart · **M3** Decision Coach + responsive/PWA ·
**M4** learning content, quiz, survey, think-aloud · **M5** AI router (stretch) + poster. When an AI agent builds a task, the
owner reviews it and must be able to explain it in a viva.

Status: `[ ]` todo · `[~]` in progress · `[x]` done (with commit hash). **Must** tasks first. Each task is one commit (or a few)
whose message starts with its ID.

## Day 1: Fri 14 Nov (evening) → Sat 15 Nov
| ID | Task | Owner | Box | Done when |
|---|---|---|---|---|
| S0 | Fill the team table in `../idea.md` §1 (names, IDs, programmes, group no., leader) | All | 15 m | No `[TO FILL]` left |
| S1 | Repo skeleton: index.html shell, styles.css §1 tokens + §2 base, empty modules per ARCHITECTURE §1, README | M1 | 45 m | `python3 -m http.server` shows the shell with header/footer, light+dark |
| E1 | `engine.mjs`: conventions, forward, forwardBank, premium, ppp, ife, Fisher, breakEven, linkRates | M1 | 1 h | G1–G7 tests pass |
| E2 | `parityMap`, `coach` (A/B/C, range, split, margin), `allowance`, `sensitivity` | M1 | 1.5 h | Every ENGINE §7.2–7.5 value asserted and passing |
| E3 | Identity tests (ENGINE §8) on a random grid; `validate()` + its tests; version guard | M1 | 1 h | `node --test` green, ≥ 40 assertions |
| E4 | `presets.js`, `format.js` (+ tests for formatting/parsing "2,75", "%", minus sign) | M1 | 45 m | Format tests pass |
| C1 | `content.js` from CONTENT.md; `content.test.mjs` wording guard + every `{{placeholder}}` resolvable | M4 | 1.5 h | Test passes; no copy outside content.js |
| U1 | `ui.js` components: Card, Badge, Tooltip, Slider, NumberField, Segmented, Sheet, Toast, Arrow | M2 | 2 h | Components page `#/dev` (removed before deploy) renders all states |
| U2 | `store.js` + `router.js` + app shell behaviour (guided vs free, progress, tab bar, focus on route change) | M3 | 1.5 h | Back/forward work; deep link `?preset=classroom#/map` works |
| P3 | Screen 3 Parity Map: beginner cards, inputs, linked mode, equal-real-rates, show the maths | M2 | 3 h | Snapshot shows F 4.0240 / PPP 4.0014 / IFE 4.0240 / real 0.93 vs 0.17 at n = 270; linked mode moves i fields |
| P4 | Screen 4 Coach: hero tiles, range bar, verdict, split slider, fees, spot line, access note | M3 | 3 h | A 47,328 · C 47,063 · range 44,292–50,987 · split 50% numbers match |
| P4b | Coach chart (`chart.js`) + allowance card | M2/M3 | 2 h | Break-even marked at 2.58%; allowance RM 6,165.58 / 6,250.50 |
| Q1 | Run the survey (Google Form, 14–15 Nov), or record "not conducted" | M4 | — | Aggregates in `../evidence/survey.md` with n and dates, or "not conducted" |

## Day 2: Sun 16 Nov (submit by 23:59)
| ID | Task | Owner | Box | Done when |
|---|---|---|---|---|
| P1 | Screen 1 Learn: steps, tooltips, completion task, skip | M4 | 2 h | Flow in UX-FLOWS §2 works by keyboard |
| P2 | Screen 2 Predict + feedback bar | M4 | 45 m | Wrong answers show their specific feedback |
| P0 | Screen 0 Pre-check + Screen 5 Check (sensitivity table, post-quiz, results, code) | M4/M2 | 2.5 h | Code `KK-A5-7` format; counterbalancing random |
| L1 | Limitations sheet + Sources sheet, reachable everywhere | M3 | 45 m | Opens from the tab bar and the footer |
| A1 | Accessibility + responsive pass (DESIGN §7 checklist) at 375 / 768 / 1280, both themes | M3 | 1 h | Checklist logged in `../evidence/test-log.md` |
| D1 | Deploy to GitHub Pages; check on a phone and a laptop | M1 | 30 m | Public URL works; G1–G7 + Snapshot comparison logged |
| X1 | `numbers.xlsx`: rebuild every ENGINE §7 number by hand in Excel, with Madura chapter/page | M1 | 2 h | Each row: name, date, match/mismatch as observed |
| T1 | Think-aloud with ≥ 5 students (UX-FLOWS §6 tasks) + quiz pre/post | M4 | 2 h | Raw notes kept by M4; aggregates in test-log, or "not conducted" |
| V1 | Screenshots for the poster (2× DPR, ≤ 500 CSS px crop) + screen recordings for the video | M2/M5 | 1 h | Files in `../evidence/media/` |
| PO | Poster PDF (A3 landscape, ≤ 650 words; idea §13) | M5 | 3 h | `pdfinfo` A3 landscape; fonts embedded |
| VI | Video ≤ 10:00 (idea §13 segments, every member on screen) | All | 3 h | MP4 or a shareable link; stopwatch log |
| R1 | Report + AI disclosure + contribution table | M1 | 2 h | Covers every R2 heading |

## Stretch (only after every must task is done)
| ID | Task | Box |
|---|---|---|
| X-PWA | manifest + sw.js + update toast | 1 h |
| X-CCY | GBP and AUD classroom presets | 45 m |
| X-AI | AI router on Cloudflare Pages Functions (idea §10) | 4 h, probably cut |

## Critical path
S0 → S1 → E1–E3 → (C1 ∥ U1 ∥ U2) → P3 → P4 → P4b → D1 → V1 → PO / VI. The poster and video need working screens, so P3/P4 must be
done by **Sat night**.
