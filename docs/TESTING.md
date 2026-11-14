# TESTING.md

**Rule: log results exactly as observed, including failures.** Never pre-write a result. If a test was not run, write "not conducted".
The log lives in `../evidence/test-log.md` (date, who, what, command/device, result).

## 1. Automated (`node --test`)
| File | Covers |
|---|---|
| `test/engine.test.mjs` | G1–G7 · Scenario 1 · Scenario 2 (1-yr and 270-day) · Sensitivity 1 (5 rows) · Sensitivity 2 (linked) · range, split, margin, allowance · identities ENGINE §8 on ≥ 200 random valid input sets × n ∈ {1, 90, 270, 365, 1000} · validation (each rule + hint + out-of-range) · version guard |
| `test/content.test.mjs` | Wording guard (CONTENT §0) on every Snapshot-capable string · every `{{placeholder}}` has a resolver · tooltips ≤ 15 words · card sentences ≤ 30 words |
| `test/format.test.mjs` | "2,75" → 0.0275 · "3.875%" → 0.03875 · minus sign U+2212 · RM grouping `en-MY` · 0 dp vs 2 dp |

Test style: `node:test` + `node:assert/strict`. Values: `assert.equal(round(x, dp), expected)` using the display precision in
ENGINE §7. Identities: `assert.ok(Math.abs(a/b − 1) < 1e-9)`. Record the pass line (e.g. `# pass 63`) in the test log and show it in
the video.

## 2. Manual checklist (run on a phone **and** a laptop; log each)
| # | Check | Expected |
|---|---|---|
| M1 | Preset Scenario 1, Parity Map, n = 365 | F 4.4354 · PPP 4.4563 · IFE 4.4354 · real 0.98% vs 1.46% |
| M2 | Preset Scenario 2, Parity Map (n = 270) | F 4.0240 · PPP 4.0014 · IFE 4.0240 |
| M3 | Scenario 2, Coach | Lock RM 47,328 · Wait RM 47,063 · range RM 44,292 – 50,987 · random walk +RM 383 |
| M4 | Split 50% | Expected RM 47,195 · range 45,810 – 49,158 |
| M5 | Margin 0.11 | Lock RM 47,380 |
| M6 | Malaysian inflation 2.58% (unlinked; slider step 0.01) | Wait − lock ≈ +RM 1 (exactly 0 only at 2.5769%); chart dot on the break-even line; "Show the maths" shows break-even 2.5769% |
| M7 | Linked mode, inflation 1.8 → 4.0 | Malaysian interest 4.97%; wait − lock stays −RM 265 |
| M8 | Enter "abc", "-150", "0.03", "" in rate fields | Correct error / hint text; no NaN anywhere |
| M9 | Badge on every card and chart; switching preset changes it | Pass |
| M10 | Search the visible UI text for "today" / "current" near Snapshot values | None |
| M11 | Keyboard-only full flow; Esc closes sheets; focus visible | Pass |
| M12 | 375 px width, 200% text zoom, dark mode, reduced motion | No horizontal scroll; contrast holds; no animation |
| M13 | Phone vs laptop: M1–M3 values identical | Logged side by side |

## 3. Excel cross-check (human verification, M1)
`../evidence/numbers.xlsx`: one row per ENGINE §7 value. Columns: quantity · Excel formula · Madura chapter/page · app value ·
Excel value · match? · checked by · date. This is the human check of the AI-assisted engine. It must be finished before the video
is recorded.

## 4. Learning test (M4)
- Pre-check → use the app → post-check (forms counterbalanced automatically). Participants paste their result code into a form.
- Report per item: % correct pre vs post, mean confidence, n, dates. No significance claims.
- Q7 (pick two) is scored 0–2 automatically.
- Ethics: idea §4 (consent line, no names, a code number to withdraw, M4 is the custodian, aggregates only, no data into AI tools).

## 5. Think-aloud (≥ 5 students, ~15 min each)
Tasks T1–T4 (UX-FLOWS §6). Record: task success (yes / with help / no), time, where they hesitated, quotes (anonymised). Fix the
top 3 issues if time allows, and report what was fixed vs not.

## 6. Poster acceptance (idea §13)
`pdfinfo` A3 landscape 1191×842 pt · `pdffonts` all embedded · viewed at 100% from 1 m · no text < 10 pt · ≤ 650 words.
