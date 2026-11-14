# ENGINE.md: finance engine spec (`js/engine.mjs`)

The engine is the only place where finance is computed. It is a pure ES module: no DOM, no I/O, no randomness, no dependencies.
The browser imports it and `node --test` imports it. Everything here is checked against `verify_finance.py` and
`../evidence/fx/band.py`.

## 1. Conventions
| Item | Rule |
|---|---|
| Quote | **S = MYR per 1 unit of foreign currency (FC)**. S ↑ = FC appreciates = ringgit weaker. |
| Home / foreign | H = Malaysia (MYR), F = foreign (USD in the Snapshot) |
| Rates | **Decimals per annum** inside the engine: 2.75% → `0.0275`. Negative allowed (> −1). |
| Horizon | `n` = whole days (1–3650). `t = n / 365`. |
| Teaching model | **All rates are annual effective, compounded over t.** One basis for every formula, so the identities hold exactly at any n. |
| Bank model (advanced view only) | Simple interest money-market convention: MYR Act/365, USD Act/360, GBP and AUD Act/365. |
| Amounts | MYR results are "ringgit set aside now" (present value at day 0), unless named `spotRef` or `naive`. |
| Precision | Full float64 everywhere. Never round inside the engine. |

## 2. Formulas
| Name | Formula | Notes |
|---|---|---|
| Forward (covered IRP) | `F = S · ((1+iH)/(1+iF))^t` | A lock, **not** a forecast |
| Forward, bank convention | `F_bank = S · (1 + iH·n/BH) / (1 + iF·n/BF)` | Advanced view; golden G2 |
| Forward premium | `p = F/S − 1` | p < 0: FC at a forward discount |
| Relative PPP | `e_ppp = ((1+πH)/(1+πF))^t − 1`, `E_ppp = S(1+e_ppp)` | |
| IFE / UIP | `e_ife = ((1+iH)/(1+iF))^t − 1`, `E_ife = S(1+e_ife)` | so `E_ife = F` exactly |
| Random walk | `E_rw = S` | |
| Fisher (exact) | `r = (1+i)/(1+π) − 1`; inverse `i = (1+r)(1+π) − 1` | Show "≈ i − π" separately, labelled |
| Parity gap (pp) | `gap = (e_ife − e_ppp) × 100` | ≈ real-rate gap, **not equal** (0.7492 vs 0.7644 at 1 yr) |
| Break-even πH | `πH* = (1+iH)(1+πF)/(1+iF) − 1` | where rH = rF; C_ppp = A here |
| Coach A (convert now, FC account) | `A = S·T / (1+iF)^t` | |
| Coach B (bank forward) | `B = F·T / (1+iH)^t` | ≡ A (covered IRP) |
| Coach C (wait) | `C_x = E_x·T / (1+iH)^t` for x ∈ {ppp, ife, rw} | C_ife ≡ A |
| Spot reference | `spotRef = S·T` | pay at spot on day 0, no interest earned |
| Historical range | `C_rw · (1+q10)` to `C_rw · (1+q90)` | q from Snapshot preset; "history, not a forecast" |
| Split h ∈ [0,1] | `exp = h·A + (1−h)·C_ppp`; `lo = h·A + (1−h)·rangeLo`; `hi = h·A + (1−h)·rangeHi` | h = 1: no range |
| Margin m (decimal) | every MYR option × `(1+m)`; spotRef too | default 0 |
| Allowance (price-indexed bill) | `usd = T0(1+πF)^t`; `rmPPP = usd·E_ppp = S·T0·(1+πH)^t`; `naive = S·usd`; `A_al = S·usd/(1+iF)^t`; `C_al = S·T0(1+πH)^t/(1+iH)^t` | |
| Linked mode | hold `rH, rF` from the base inputs; for a new πH (or πF): `iH = (1+rH)(1+πH)−1` (same for F) | i fields become read-only |

## 3. Public API (named exports)
```js
export const ENGINE_VERSION = "1.0.0";           // bump on ANY change to this file (test enforces it)

export function yearFrac(n)                       // n/365
export function forward({ S, iH, iF, t })         // number
export function forwardBank({ S, iH, iF, n, basisH = 365, basisF = 360 })
export function premium(F, S)                     // decimal
export function pppChange({ piH, piF, t })        // decimal e_ppp
export function ifeChange({ iH, iF, t })          // decimal e_ife
export function realRate(i, pi)                   // decimal
export function nominalFromReal(r, pi)            // decimal
export function breakEvenPiH({ iH, iF, piF })     // decimal
export function linkRates(base, { piH, piF })     // -> { ...base, piH, piF, iH, iF } with base real rates held

export function parityMap(inp, n)                 // see §4
export function coach(inp)                        // see §4
export function allowance(inp, T0)                // see §4
export function sensitivity(inp, piHList)         // -> [{ piH, rH, Cppp, diff }]
export function validate(raw)                     // see §5
```
`inp` (all decimals): `{ S, T, n, iH, iF, piH, piF, margin = 0, h = 0, q10, q90, ccy = "USD" }`.

## 4. Return shapes
```js
parityMap(inp, n) => {
  t, F, premium, ePPP, EPPP, eIFE, EIFE, rH, rF, realGapPP, parityGapPP,
  approx: { premium: inp.iH - inp.iF, ePPP: inp.piH - inp.piF, rH: inp.iH - inp.piH, rF: inp.iF - inp.piF },
  bankF: forwardBank({ ... n }),            // advanced view only
  forecasts: [ { id:"forward", value:F }, { id:"ppp", value:EPPP }, { id:"ife", value:EIFE }, { id:"rw", value:S } ]
}
coach(inp) => {
  t, F, spotRef, A, B,
  C: { ppp, ife, rw }, diff: { ppp, ife, rw },      // diff = C - A (negative = waiting cheaper)
  range: { lo, hi } | null,                          // null when q10/q90 absent (Classroom preset)
  split: { h, expected, lo, hi },
  breakEvenPiH, rH, rF, rule: "wait" | "lock" | "equal"   // rule from rH vs rF (|rH-rF|<1e-12 → "equal")
}
allowance(inp, T0) => { usd, EPPP, rmPPP, naive, A, C, diff }
```

## 5. Validation (`validate(raw)`)
`raw` holds the strings typed in the UI, in **percent** for rates. Returns
`{ ok, values /* decimals, only if ok */, errors: {field: msg}, hints: {field: msg} }`.

| Field | Rule | Error message |
|---|---|---|
| S | number, 0 < S ≤ 1000 | "Exchange rate must be above 0 and at most 1,000." |
| T | number, 0 < T ≤ 100,000,000 | "Amount must be above 0 and at most 100,000,000." |
| n | integer 1–3650 | "Days must be a whole number from 1 to 3,650." |
| iH, iF, piH, piF, r | number, > −100 and ≤ 100 (percent) | "Inflation must be above −100%." / "Above 100% a year is outside this teaching model." (use "Interest rate" for i) |
| margin | 0–10 (percent) | "Bank margin must be between 0% and 10%." |
| h | 0–100 (percent) | slider only, so no error |
| any | empty, NaN, non-numeric | "Enter a number." |

- **Hint (non-blocking):** a rate with 0 < |x| < 0.5 → "Did you mean {{x×100}}%? (Ignore if you meant it.)"
- Accept "2,75" → treat a single comma as a decimal point **only** if there is no dot; strip spaces and "%".
- After compute: if any output is not `Number.isFinite`, the card shows "Result out of range: check the inputs."

## 6. Formatting (`js/format.js`, not the engine)
| Kind | Beginner view | "Show the maths" |
|---|---|---|
| MYR amount | `RM 47,328` (0 dp) | `RM 47,328.10` (2 dp) |
| FX rate | `RM 4.02` per US$1 (2 dp) | `4.0240` (4 dp) |
| % change / rate | `1.83%` (2 dp) | `−1.8322%` (4 dp) |
| pp | `0.75 pp` | `0.7492 pp` |
| Sign | Use a true minus "−" (U+2212); differences always signed: `+RM 383`, `−RM 265` | |

Use `Intl.NumberFormat("en-MY", …)` and the CSS `font-variant-numeric: tabular-nums`.

## 7. Golden values (tests assert these; relative tolerance 1e-9 for identities, display-rounded equality for values)
### 7.1 Panel golden cases
| # | Inputs | Expected |
|---|---|---|
| G1 | S 4.50, iH 3%, iF 4.5%, t = 1 | F = 4.4354; premium −1.4354% |
| G2 | same, n = 90, bank convention (365/360) | F_bank = 4.4829 |
| G3 | πH 2%, πF 3%, t = 1 | e_ppp −0.9709%; E 4.4563 |
| G4 | πH 5%, πF 3% | e_ppp +1.9417%; E 4.5874 |
| G5 | πH 2%, πF 3%, t = 3 | e_ppp −2.8844% |
| G6 | iH 3%, iF 4.5% | e_ife −1.4354% |
| G7 | i 3%, π 2% | r 0.9804% |

### 7.2 Scenario 1: Classroom (illustrative), S 4.50, iH 3%, iUS 4.5%, πH 2%, πUS 3%, t = 1
F 4.4354 · premium −1.4354% · e_ppp −0.9709% · E_ppp 4.4563 · e_ife −1.4354% · rH 0.9804% · rUS 1.4563%

### 7.3 Scenario 2: Snapshot 2026-11-06, S 4.0565, iH 2.75%, iUS 3.875%, πH 1.8%, πUS 3.7%
1 year: F 4.0126 (−1.0830%) · e_ppp −1.8322%, E_ppp 3.9822 · e_ife −1.0830%, E_ife 4.0126 · rH 0.9332% · rUS 0.1688% ·
parity gap 0.7492 pp · real gap 0.7644 pp · break-even πH 2.5769%

270 days (t = 0.739726…), T = US$12,000:
| Quantity | Value |
|---|---|
| F₂₇₀ (teaching) | 4.0240 |
| F₂₇₀ (bank convention) | 4.0221 |
| E_ppp₂₇₀ | 4.0014 |
| spotRef | RM 48,678.00 |
| A = B = C_ife | RM 47,328.10 |
| spotRef − A | RM 1,349.90 |
| C_ppp, diff | RM 47,062.68, −RM 265.42 |
| C_rw, diff | RM 47,710.88, +RM 382.78 |
| range (q10 −7.1662%, q90 +6.8668%) | RM 44,291.80 – 50,987.10 |
| split h = 0.5 | expected RM 47,195.39; range RM 45,809.95 – 49,157.60 |
| margin 0.11% on A | RM 47,380.16 (+RM 52.06) |
| allowance T0 = US$1,500 | usd 1,540.86 · E_ppp 4.0014 · rmPPP RM 6,165.58 · naive RM 6,250.50 · A RM 6,077.17 · C RM 6,043.08 · diff −RM 34.08 |

### 7.4 Sensitivity 1 (unlinked, n = 270): πH varies, rates fixed
| πH | rH | C_ppp | diff |
|---|---|---|---|
| 1.0% | +1.7327% | 46,788.82 | −539.28 |
| 1.8% | +0.9332% | 47,062.68 | −265.42 |
| 3.0% | −0.2427% | 47,472.43 | +144.33 |
| 4.0% | −1.2019% | 47,812.94 | +484.84 |
| 5.0% | −2.1429% | 48,152.60 | +824.50 |

### 7.5 Sensitivity 2 (linked): πH 1.8% → 4.0%, rH held at 0.9332%
iH 4.9705% · F₁ 4.0993 (+1.0547%) · e_ppp +0.2893%, E_ppp 4.0682 · e_ife +1.0547% · gap 0.7654 pp · **diff (n = 270) stays −RM 265.42**

## 8. Identities (each is a test, relative tolerance 1e-9, over a grid of random valid inputs and n ∈ {1, 90, 270, 365, 1000})
1. `A == B`
2. `EIFE == F`
3. If `rH == rF` (set via `nominalFromReal`), `EPPP == EIFE` at every n
4. `(1+eIFE)/(1+ePPP) == ((1+rH)/(1+rF))^t`
5. `sign(C_ppp − A) == −sign(rH − rF)` (the real-rate rule); at `piH = breakEvenPiH`, `C_ppp == A`
6. Allowance: `rmPPP == S·T0·(1+piH)^t`, and `sign(C_al − A_al) == −sign(rH − rF)`
7. Split: `h=0 → expected == C_ppp`; `h=1 → lo == hi == A`; width scales by `(1−h)`
8. Linked mode: changing πH leaves `C_ppp − A` unchanged
9. `forwardBank` ≠ `forward` for n < 365 (difference shown, not hidden)

## 9. Presets (`js/presets.js`, data only)
```js
export const PRESETS = {
  classroom: { id:"classroom", label:"Scenario 1 · Classroom", kind:"illustrative", ccy:"USD",
    S:4.50, T:12000, n:365, iH:0.03, iF:0.045, piH:0.02, piF:0.03, q10:null, q90:null,
    badge:"Classroom: illustrative numbers" },
  snapshot: { id:"snapshot", label:"Scenario 2 · Snapshot 6 Nov 2026", kind:"dated", ccy:"USD",
    S:4.0565, T:12000, n:270, iH:0.0275, iF:0.03875, piH:0.018, piF:0.037, q10:-0.071662, q90:0.068668,
    badge:"Snapshot: FX 6 Nov · OPR 5 Nov · Fed 28 Oct · CPI Sep 2026 (released Oct) · not live",
    sources:[ /* ref ids from CONTENT.md §9 */ ] },
  // stretch: gbpClassroom, audClassroom (illustrative, from idea §3)
};
```
Changing a preset value requires a new dated preset id. **Never edit `snapshot` in place.**

## 10. Version guard
`test/engine.version.json` = `{ "version": "1.0.0", "sha256": "<hash of js/engine.mjs>" }`. The test recomputes the hash and fails
if the hash changed but the version did not. Update both together. The footer shows `ENGINE_VERSION`.
