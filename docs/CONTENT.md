# CONTENT.md: every word on screen

`js/content.js` mirrors this file exactly. Do not write copy anywhere else.

## 0. Rules
- `{{name}}` = a value from the engine, formatted by `format.js` (ENGINE.md §6). `{{A}}` → "RM 47,328". `{{A.2}}` → "RM 47,328.10".
- `{{lessMore x}}` → "RM 265 less" if x < 0, "RM 383 more" if x > 0, "the same" if |x| < 0.5.
- `{{rateDate}}` → "6 Nov" (Snapshot) or "starting" (Classroom). E.g. "the {{rateDate}} rate" → "the 6 Nov rate" / "the starting rate".
- `{{ccy}}` → "US$" / "£" / "A$"; `{{country}}` → "US" / "UK" / "Australian".
- **Wording guard:** a string that can show a Snapshot value must not contain `today`, `today's`, `current`, `currently`,
  `latest` or `live`. The badge's "not live" is the only exception. "Now" is allowed only in "set aside now" and "convert now"
  (these refer to Aina's decision moment). `test/content.test.mjs` enforces this.
- Voice: second person, plain words, ≤ 30 words per card sentence, no Greek letters or acronyms outside "Show the maths".
  Name each theory in words the first time: "the prices theory (PPP)".

## 1. Global
| Key | Text |
|---|---|
| app.name | KiraKurs |
| app.tagline | See how inflation and interest rates move your ringgit before you pay abroad. |
| footer | Engine v{{ENGINE_VERSION}} · Parity theory, not a prediction · Not financial advice · Sources · Clear my data |
| convention | MYR per {{ccy}}1 · ↑ = ringgit weaker |
| badge.snapshot | Snapshot: FX 6 Nov · OPR 5 Nov · Fed 28 Oct · CPI Sep 2026 (released Oct) · not live |
| badge.classroom | Classroom: illustrative numbers |
| persona.tag | Aina is a fictional student. |
| nav | Learn · Map · Coach · Check · Limits |
| btn.continue / back / skip / reset / showMaths / hideMaths | Continue · Back · Skip · Reset to Scenario {{k}} · Show the maths · Hide the maths |
| toast.reset | Back to Scenario {{k}}. |
| toast.copied | Copied. |
| outOfRange | Result out of range: check the inputs. |
| clearData.confirm | Delete your quiz answers and progress from this browser? |

## 2. Screen 0: Pre-check
- **h1:** Quick check before we start (2 minutes)
- **consent:** Anonymous and optional. Nothing leaves your browser. You can stop or skip at any time.
- **lead:** Answer with your best guess; you'll see how you improve at the end. The exchange rate is shown as ringgit per {{ccy}}1.
- **confidence label:** How sure are you? 1 Guessing · 2 Fairly sure · 3 Certain
- No feedback is shown during the pre-check (to keep it a fair baseline). On finish: "Thanks! Now meet Aina."

## 3. Screen 1: Learn, Aina's story
- **h1:** Should Aina convert now or later?
- **intro:** Aina, 21, studies computer science. Her US exchange semester needs **US$12,000 in 270 days**. She has ringgit.
  *(Aina is a fictional student.)*
- **objectives (collapsible "What you'll learn"):** the 5 objectives from PRD.md §3, in plain words:
  1. How price rises in two countries move the exchange rate. 2. Why a bank lock comes from interest rates and isn't a forecast.
  3. How interest, inflation and "real" interest connect. 4. How to judge lock vs wait, and why waiting is risky.
  5. Why a US allowance, in ringgit, grows with Malaysian prices.
- **Step 1:** On 6 Nov 2026 (Snapshot), US$12,000 cost **{{spotRef}}** at **RM {{S.4}}** each.
- **Step 2:** Prices rise faster in the US ({{piF}} vs {{piH}} a year), so the [prices theory (PPP)] expects each dollar to cost
  *fewer* ringgit later: about **RM {{EPPP270}}** by Aina's payment date.
- **Step 3:** US savings pay more interest ({{iF}} vs {{iH}}), so a [bank lock (forward)] for 270 days is about **RM {{F270}}**,
  below the 6 Nov rate.
- **Step 4:** Convert now and park the dollars in a [foreign-currency account]. If it pays {{iF}} (the US policy rate; real accounts
  often pay less), the interest grows them, so you [set aside now] only **{{A}}**, not {{spotRef}}. A bank lock costs exactly
  the same. Waiting might cost less or more.
- **Completion step, prompt:** Your turn. Move "Malaysian inflation %" to {{target}}%. Which way will the prices theory's
  expected rate move? [↑ More ringgit per dollar] [↓ Fewer] [= Same]
  - reveal correct: Right: higher Malaysian prices mean each ringgit buys less, so you need more ringgit per dollar.
  - reveal wrong: It goes up: higher Malaysian prices mean each ringgit buys less, so you need more ringgit per dollar.
- **skip link:** Skip to Parity Map

## 4. Screen 2: Predict
- **h1:** Aina plans to **wait**. Malaysian inflation rises from 1.8% to 4.0% and interest rates stay the same. If the prices theory
  (PPP) is right, the ringgit she must set aside now will go…
- **options:** Up · Down · Stay the same
- **feedback.up (correct):** Correct. Under PPP, higher Malaysian prices weaken the ringgit, so waiting costs more: {{C_at_1.8}} → {{C_at_4.0}}.
- **feedback.down:** Not quite. Higher Malaysian prices mean each ringgit buys less, so PPP expects you to need *more* ringgit per dollar.
- **feedback.same:** Not quite. PPP's expected rate is built from the two inflation rates, so when Malaysian inflation changes, it moves.
- **note:** We'll come back to this in the Decision Coach.

## 5. Screen 3: Parity Map
- **h1:** What do the theories expect for Aina's 270 days?
- **hero:** Lock: set aside {{A}} now.
- **cards (beginner view; ≤ 4 numbers):**
| Card | Value | Sentence |
|---|---|---|
| Bank lock (forward) | RM {{F}} per {{ccy}}1 | A bank lock for {{n}} days is about RM {{F.2}} per dollar, {{belowAbove}} the {{rateDate}} rate of RM {{S.2}}, because {{higherRateCountry}} savings pay more interest. |
| Prices theory (PPP) | RM {{EPPP}} | {{fasterCountry}} prices rise faster ({{piF}} vs {{piH}}), so this theory expects each dollar to cost {{slightlyFewerMore}} ringgit by Aina's payment date. |
| Interest theory (IFE) | RM {{EIFE}} | Same number as the bank lock: this theory says higher {{country}} interest just makes up for a weaker dollar later. Real data often disagree. |
| After-inflation interest (real rates) | MY {{rH}} · {{country}} {{rF}} | Malaysian savings earn {{rH}} a year after inflation; {{country}} savings earn {{rF}}. The higher one decides whether waiting is expected to pay. |
- **parity gap line (under the cards):** The two theories disagree by {{gapPP}} points because the two countries' after-inflation
  interest rates differ. Make them equal and the theories agree.
- **inputs card title:** Change the world · **labels:** Malaysian inflation % · {{country}} inflation % · Malaysian interest rate % ·
  {{country}} interest rate % · Days until payment · Amount ({{ccy}})
- **linked switch:** Link interest to inflation (Fisher)
- **linked banner:** Assume rates rise with inflation (Fisher, real rate held): interest rates are now calculated.
- **derived caption:** = (1 + real rate)(1 + inflation) − 1, calculated
- **button:** Set equal real rates · **toast:** Real rates are now equal, and PPP and IFE agree.
- **show the maths (headers):** Formulas with your numbers · 1-year view · Bank convention · Four forecasts side by side
  - bank-convention note: Banks use simple interest with day counts (MYR Act/365, USD Act/360): F = {{bankF}} vs {{F.4}}, a small
    difference from the day-count convention.
  - forecasts caption: The forward is not a reliable forecast of the future rate (Fama 1984). Each row is a theory, not a prediction.
- **explainer link:** Why do the news say higher rates strengthen a currency? → In the short run, a rise in *real* interest rates can
  attract investors' money and strengthen a currency. That is a different effect from parity, which is about inflation-driven rates
  over longer horizons.

## 6. Glossary tooltips (≤ 15 words each; first use only, then plain text)
| Term | Tooltip |
|---|---|
| spot rate | The exchange rate for converting right away. |
| forward / bank lock | A rate agreed now for converting on a future date. A lock, not a forecast. |
| premium / discount | A forward above the spot rate is a premium; below it is a discount. |
| nominal rate | The interest rate as quoted, before taking inflation out. |
| real rate | Interest after inflation: what your savings really gain in buying power. |
| inflation | How fast prices rise in a year. |
| appreciate / depreciate | A currency gets stronger / weaker against another. |
| IRP | Interest rate parity: the forward rate comes from the two interest rates. |
| PPP | Purchasing power parity: currencies adjust so baskets of goods cost the same. |
| Fisher effect | Interest rates rise with expected inflation, keeping the real rate steady. |
| IFE / UIP | Interest theory: higher-interest currencies are expected to weaken by the interest gap. |
| pp | Percentage points: the gap between two percentages. |
| covered / unhedged | Covered = locked in. Unhedged = waiting, exposed to rate changes. |
| random walk | Assume the rate stays where it starts: the best simple guess in practice. |
| real-rate rule | Waiting is expected to cost less only if Malaysia's real rate is higher. |
| break-even | The inflation level where locking and waiting are expected to cost the same. |
| historical range | Where 8 of 10 past 270-day moves landed. History, not a forecast. |
| split conversion | Lock part now, wait with the rest. Less risk, less upside. |
| set aside now | Ringgit you need on day one, counting interest earned until payment. |
| foreign-currency account | A Malaysian bank account holding dollars; residents may open one for study abroad. |
| OPR | Overnight Policy Rate: Bank Negara Malaysia's main interest rate. |

## 7. Screen 4: Decision Coach
- **h1:** Lock or wait: what does each cost Aina?
- **subtitle:** A risk decision, not a forecast.
- **tile.lock:** Lock · {{A}} · for certain · "Convert now into a dollar account, or use a bank forward: same cost."
- **tile.wait:** Wait · about {{C_ppp}} · if the prices theory holds · range bar {{lo}} – {{hi}}
- **verdict template (beginner, Snapshot):** Lock: set aside {{A}} now, for certain. Wait: about {{lessMore diff.ppp}} if the prices
  theory holds, {{lessMore diff.rw}} if the exchange rate stays at its {{rateDate}} level, and anywhere from {{lo}} to {{hi}} in 8 of
  10 past periods. Locking buys certainty.
- **verdict template (Classroom, no range):** same, without the range clause and with "Illustrative numbers." appended.
- **rule line:** {{ruleSentence}} where wait → "Malaysia's after-inflation interest is higher, so the prices theory expects waiting to
  cost a little less." · lock → "Malaysia's after-inflation interest is lower, so the prices theory expects waiting to cost more." ·
  equal → "After-inflation interest is equal, so both choices are expected to cost the same."
- **split slider:** label "Lock this much now" · value "{{h}}% locked" · caption "Expected {{split.expected}} · range {{split.lo}} –
  {{split.hi}}. Splitting cuts the swing in proportion."
- **allowance card:** title "Monthly allowance: prices rise too" · input "Allowance in 6 Nov US prices ({{ccy}})", default 1,500 ·
  sentence: "Rent and food in the {{country}} rise with {{country}} prices. Under the prices theory, your allowance in ringgit grows
  with **Malaysian** inflation ({{piH}}), not {{country}} inflation ({{piF}})." · numbers: dollars needed {{al.usd}} · ringgit under
  PPP {{al.rmPPP}} (a naive guess using the {{rateDate}} rate: {{al.naive}}) · lock {{al.A}} vs wait {{al.C}}.
- **fees (collapsed):** "Bank margin %" helper: "Fees apply to every option. The Snapshot quote was 4.0565/4.0610; enter 0.11 to see
  that spread." Second line: "Wise (2023) estimates Malaysian students lose about RM 1,183 a year to fees and markups: fees can
  be bigger than the lock-or-wait difference."
- **spot reference line:** Paying at spot on day one: {{spotRef}}, which is {{spotMinusA}} more than locking, because that money
  earns no interest meanwhile.
- **chart title:** Waiting minus locking, as Malaysian inflation changes · **break-even label:** Break-even {{be}}: real rates equal
  · **regions:** Waiting costs more ↑ / Waiting costs less ↓
- **access note:** Bank forwards are offered by licensed onshore banks; individual access depends on the bank. Residents may convert
  ringgit into a foreign-currency account for overseas education with documentary proof (BNM FEP FAQs, Part 1, Q18 and Q20).
- **predict reveal callout:** You predicted "{{yourAnswer}}". With Malaysian inflation at 4.0%, waiting costs {{C_at_4.0}} vs
  {{C_at_1.8}}: it went **up**. {{rightWrong}}
- **disclaimer:** Parity theory, not a prediction. PPP holds poorly over months (Rogoff 1996). Not financial advice.
- **staging note:** Many students convert in stages: that is the split slider above.

## 8. Screen 5: Check
- **h1:** What if Malaysian inflation changes?
- **slider label:** Malaysian inflation % · **table headers:** Malaysian inflation · After-inflation interest (MY) · Wait cost (PPP) · Wait minus lock
- **why sentence:** Higher Malaysian inflation raises the prices theory's expected cost of each dollar, while Malaysian interest
  stays put. Once Malaysia's after-inflation interest falls below the {{country}}'s (above {{be}} inflation), waiting becomes dearer
  than locking.
- **linked comparison line:** With interest linked to inflation (real rates held), the wait-minus-lock gap stays at {{diffLinked}}:
  the decision depends on *real* rates, not on inflation alone.
- **post-quiz intro:** Same kind of questions as before, different numbers.
- **changed decision:** Did this change how you'd convert? Yes · No · Not sure
- **results:** You got {{pre}}/8 before and {{post}}/8 after. Per topic: … · **result code:** Your anonymous result code:
  **{{code}}** [Copy]. "If you're in our class test, paste it into the form. It contains only your form letter and scores."

## 9. Quiz items
Every closed item has: stem · 3 options · confidence 1–3. Stems say "MYR per {{ccy}}1, the {{rateDate}} exchange rate unchanged
unless stated". The correct answer is in **bold**. Feedback is shown only in the post-check and on the results screen.

### Form A (USD, Snapshot context)
| # | Stem | Options | Feedback per wrong option |
|---|---|---|---|
| A1 | US inflation rises. The prices theory's expected rate (ringgit per US$1) goes… | up · **down** · same | up: Faster US price rises make each dollar worth less. · same: PPP's expected rate depends on both inflation rates. |
| A2 | US interest rises; Malaysian interest unchanged. The forward rate goes… | up · **down** · same | up: The higher-interest currency trades at a forward discount. · same: The forward depends on the interest gap, and the gap changed. |
| A3 | Malaysian inflation rises; interest rates unchanged. The forward rate goes… | up · down · **same** | up/down: A bank lock uses interest rates only. Inflation doesn't enter it directly, and interest rates were held fixed. |
| A4 | Malaysian inflation rises; Malaysian interest unchanged. Malaysia's after-inflation interest goes… | up · **down** · same | up: Real rate ≈ interest minus inflation. · same: Inflation changed, so the real rate changed. |
| A5 | Under the prices theory, Malaysia's after-inflation interest is 0.93% and America's is 0.17%. Compared with locking, the ringgit you must set aside to wait is expected to be… | higher · **lower** · same | higher: Malaysia's after-inflation interest is higher. Under PPP, the ringgit's expected gain more than makes up for the lower ringgit interest, so waiting is expected to cost less. · same: Different after-inflation interest makes the choices differ. |
| A6 | Both countries' after-inflation interest rates are equal. The prices theory and the interest theory give… | **the same** · PPP higher · IFE higher | Equal after-inflation interest makes the inflation gap match the interest gap, so both theories give one number. |
| A7 | Pick **two** reasons the theory's expected rate could be wrong. | **PPP takes years to hold, not months** · **Oil prices, risk mood and central bank action also move the ringgit** · **Real dollar accounts often pay less than the policy rate** · **Bank fees and spreads are ignored unless entered** · The formulas are approximations that are always wrong · Exchange rates never change | Scored 0–2 (1 per correct pick, max 2; a distractor cancels one). Feedback: These are the limits listed under "How far can I trust this?" |
| A8 | Your US rent rises with US inflation. Under the prices theory, the ringgit cost of that rent grows with… | US inflation · **Malaysian inflation** · neither | US inflation: The dollar amount grows with US prices, but PPP says each dollar costs fewer ringgit by the same proportion. · neither: The two US effects cancel, which leaves Malaysian inflation. |

### Form B (GBP, Classroom: illustrative)
Same concepts, UK wording, ringgit per £1. B1: UK inflation rises → **down**. B2: UK interest rises → **down**. B3: Malaysian inflation
rises, rates fixed → **same**. B4: Malaysian inflation rises → MY real rate **down**. B5: "Malaysia's after-inflation interest is 0.93%
and the UK's is 1.20% (illustrative)…" → wait expected to be **higher**. B6: equal real rates → **the same**. B7: identical to A7.
B8: "Your UK rent rises with UK inflation…" → **Malaysian inflation**. The feedback is A's with "US" → "UK", "dollar" → "pound";
B5's feedback.lower: "Malaysia's after-inflation interest is *lower* here, so PPP expects waiting to cost more."

Objective mapping: Obj1 → Q1 · Obj2 → Q2, Q3 · Obj3 → Q4, Q6 · Obj4 → Q5, Q7 · Obj5 → Q8.

## 10. "How far can I trust this?" (Limitations sheet)
- **Assumptions (one per theory):** Bank lock: no fees or capital controls. Prices theory: the same basket of goods in both
  countries. Interest theory: equal after-inflation interest. Recent inflation stands in for expected inflation.
- **Limits:**
  1. The prices theory takes years, not months: price gaps take about 3–5 years to halve (Rogoff 1996).
  2. The interest theory often fails in the short run, and the forward is not a reliable forecast (Fama 1984). Fisher holds better over long periods (Mishkin 1991).
  3. Even the bank-lock rule has had gaps since 2008 (Du, Tepper & Verdelhan 2018).
  4. The ringgit is not traded offshore; hedging happens with onshore banks (BNM 2017).
  5. Policy rates are not deposit rates; real dollar accounts often pay less.
  6. Bank fees and spreads are ignored unless you enter them.
  7. Oil prices, risk mood and Bank Negara's actions also move the ringgit.
  8. The historical range is how often past moves happened (2016–2026), not a probability; reference rates are mid rates.

## 11. Sources sheet (short form; full APA in the report)
Madura (2021) International Financial Management, 14th ed. · Bernama, 6 Nov 2026, ringgit close 4.0565/0610 · BNM Monetary Policy
Statement, 5 Nov 2026 (OPR 2.75%) · Federal Reserve FOMC statement, 28 Oct 2026 (3.75–4.00%) · DOSM CPI Sep 2026 (1.8%) · BLS CPI Sep
2026 (3.7%) · ECB euro reference rates USD/MYR 2016–2026 via Frankfurter (historical range) · Rogoff (1996) · Fama (1984) · Mishkin
(1991) · Du, Tepper & Verdelhan (2018) · BNM FEP FAQs Part 1 (2019) · Wise (2023) fees estimate. Each item is a link (URLs in
`../idea.md` §12).

## 12. Errors and empty states
- Field errors: exactly as ENGINE.md §5.
- Hint: Did you mean {{x}}%? (Ignore if you meant it.)
- Storage blocked: (silent; the app works, progress is not remembered).
- Copy failed: "Couldn't copy. Select the code and copy it manually."
- 404 route: "That page doesn't exist." [Go to Learn]
