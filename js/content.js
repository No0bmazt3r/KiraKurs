// ALL user-facing copy (mirrors docs/CONTENT.md) + the {{placeholder}} filler.
// Numbers never live here: every {{name}} is filled from engine output via makeVars().
import * as E from "./engine.mjs";
import * as f from "./format.js";
import { PRESETS } from "./presets.js";

export const T = {
  "app.name": "KiraKurs",
  "app.tagline": "See how inflation and interest rates move your ringgit before you pay abroad.",
  "footer.engine": "Engine v{{ENGINE_VERSION}}",
  "footer.rest": "Parity theory, not a prediction · Not financial advice",
  "footer.sources": "Sources",
  "footer.clear": "Clear my data",
  "convention": "MYR per {{ccy}}1 · ↑ = ringgit weaker",
  "persona.tag": "Aina is a fictional student.",
  "nav.learn": "Learn", "nav.map": "Map", "nav.coach": "Coach", "nav.check": "Check", "nav.limits": "Limits",
  "btn.continue": "Continue", "btn.back": "Back", "btn.skip": "Skip", "btn.reset": "Reset to Scenario {{k}}",
  "btn.showMaths": "Show the maths", "btn.hideMaths": "Hide the maths", "btn.start": "Start", "btn.next": "Next",
  "btn.check": "Check", "btn.copy": "Copy", "btn.close": "Close", "btn.nextStep": "Next step",
  "toast.reset": "Back to Scenario {{k}}.",
  "toast.preset": "Switched to {{presetLabel}}.",
  "toast.copied": "Copied.",
  "toast.cleared": "Your quiz answers and progress were deleted.",
  "outOfRange": "Result out of range: check the inputs.",
  "fixInput": "Fix the highlighted input to update.",
  "clearData.confirm": "Delete your quiz answers and progress from this browser?",
  "edited": "(edited)",
  "progress": "Step {{step}} of 6",
  "preset.title": "Choose the numbers",
  "theme.toggle": "Switch light or dark theme",
  "noscript": "KiraKurs needs JavaScript to calculate.",
  "notFound": "That page doesn't exist.",
  "notFound.btn": "Go to Learn",
  "copyFailed": "Couldn't copy. Select the code and copy it manually.",

  // Screen 0
  "pre.h1": "Quick check before we start (2 minutes)",
  "pre.consent": "Anonymous and optional. Nothing leaves your browser. You can stop or skip at any time.",
  "pre.lead": "Answer with your best guess; you'll see how you improve at the end. The exchange rate is shown as ringgit per {{ccy}}1.",
  "pre.confidence": "How sure are you?",
  "pre.conf1": "1 Guessing", "pre.conf2": "2 Fairly sure", "pre.conf3": "3 Certain",
  "pre.dots": "{{qn}} of {{qtotal}}",
  "pre.done": "Thanks! Now meet Aina.",
  "pre.pickTwo": "Pick two.",

  // Screen 1
  "learn.h1": "Should Aina convert now or later?",
  "learn.intro": "Aina, 21, studies computer science. Her US exchange semester needs {{ccy}}{{T}} in {{n}} days. She has ringgit.",
  "learn.objTitle": "What you'll learn",
  "learn.obj": [
    "How price rises in two countries move the exchange rate.",
    "Why a bank lock comes from interest rates and isn't a forecast.",
    "How interest, inflation and \"real\" interest connect.",
    "How to judge lock vs wait, and why waiting is risky.",
    "Why a US allowance, in ringgit, grows with Malaysian prices.",
  ],
  "learn.step1": "On 6 Nov 2026 (Snapshot), {{ccy}}{{T}} cost {{spotRef}} at RM {{S.4}} each.",
  "learn.step2": "Prices rise faster in the US ({{piF}} vs {{piH}} a year), so the [[ppp|prices theory (PPP)]] expects each dollar to cost fewer ringgit later: about RM {{EPPP.4}} by Aina's payment date.",
  "learn.step3": "US savings pay more interest ({{iF}} vs {{iH}}), so a [[forward|bank lock (forward)]] for {{n}} days is about RM {{F.4}}, below the 6 Nov rate.",
  "learn.step4": "Convert now and park the dollars in a [[fca|foreign-currency account]]. If it pays {{iF}} (the US policy rate; real accounts often pay less), the interest grows them, so you [[setAside|set aside now]] only {{A}}, not {{spotRef}}. A bank lock costs exactly the same. Waiting might cost less or more.",
  "learn.taskPrompt": "Your turn. Move \"Malaysian inflation %\" to {{target}}. Which way will the prices theory's expected rate move?",
  "learn.taskUp": "↑ More ringgit per dollar", "learn.taskDown": "↓ Fewer", "learn.taskSame": "= Same",
  "learn.taskMove": "Move the slider to {{target}} to reveal the answer.",
  "learn.revealRight": "Right: higher Malaysian prices mean each ringgit buys less, so you need more ringgit per dollar.",
  "learn.revealWrong": "It goes up: higher Malaysian prices mean each ringgit buys less, so you need more ringgit per dollar.",
  "learn.pppMini": "Prices theory (PPP) expects",
  "learn.skip": "Skip to Parity Map",

  // Screen 2
  "predict.h1": "Aina plans to wait. Malaysian inflation rises from {{piH}} to {{target}} and interest rates stay the same. If the prices theory (PPP) is right, the ringgit she must set aside now will go…",
  "predict.up": "Up", "predict.down": "Down", "predict.same": "Stay the same",
  "predict.fb.up": "Correct. Under PPP, higher Malaysian prices weaken the ringgit, so waiting costs more: {{C_at_base}} → {{C_at_target}}.",
  "predict.fb.down": "Not quite. Higher Malaysian prices mean each ringgit buys less, so PPP expects you to need more ringgit per dollar.",
  "predict.fb.same": "Not quite. PPP's expected rate is built from the two inflation rates, so when Malaysian inflation changes, it moves.",
  "predict.note": "We'll come back to this in the Decision Coach.",
  "fb.correct": "Correct", "fb.wrong": "Not quite",

  // Screen 3
  "map.h1": "What do the theories expect for Aina's {{n}} days?",
  "map.hero": "Lock: set aside {{A}} now.",
  "map.card.fwd": "Bank lock (forward)",
  "map.card.fwd.s": "A bank lock for {{n}} days is about RM {{F.2}} per dollar, {{belowAbove}} the {{rateDate}} rate of RM {{S.2}}, because {{higherRateCountry}} savings pay more interest.",
  "map.card.ppp": "Prices theory (PPP)",
  "map.card.ppp.s": "{{fasterCountry}} prices rise faster ({{fasterPi}} vs {{slowerPi}}), so this theory expects each dollar to cost {{fewerMore}} ringgit by Aina's payment date.",
  "map.card.ife": "Interest theory (IFE)",
  "map.card.ife.s": "Same number as the bank lock: this theory says higher-interest savings just make up for a currency expected to weaken. Real data often disagree.",
  "map.card.real": "After-inflation interest (real rates)",
  "map.card.real.v": "MY {{rH}} · {{country}} {{rF}}",
  "map.card.real.s": "Malaysian savings earn {{rH}} a year after inflation; {{country}} savings earn {{rF}}. The higher one decides whether waiting is expected to pay.",
  "map.perUnit": "per {{ccy}}1",
  "map.gap": "The two theories disagree by {{gapPP}} because the two countries' after-inflation interest rates differ. Make them equal and the theories agree.",
  "map.gapZero": "After-inflation interest rates are equal, so the two theories agree.",
  "map.inputs": "Change the world",
  "lbl.piH": "Malaysian inflation %", "lbl.piF": "{{country}} inflation %", "lbl.iH": "Malaysian interest rate %",
  "lbl.iF": "{{country}} interest rate %", "lbl.n": "Days until payment", "lbl.T": "Amount ({{ccy}})",
  "lbl.rH": "Malaysian real rate %", "lbl.rF": "{{country}} real rate %", "lbl.margin": "Bank margin %",
  "lbl.typeValue": "Type a value",
  "map.linked": "Link interest to inflation (Fisher)",
  "map.linkedBanner": "Assume rates rise with inflation (Fisher, real rate held): interest rates are now calculated.",
  "map.derived": "= (1 + real rate)(1 + inflation) − 1, calculated",
  "map.equalBtn": "Set equal real rates",
  "map.equalToast": "Real rates are now equal, and PPP and IFE agree.",
  "map.m.formulas": "Formulas with your numbers",
  "map.m.oneYear": "1-year view",
  "map.m.bank": "Bank convention",
  "map.m.bankNote": "Banks use simple interest with day counts (MYR Act/365, US$ Act/360): F = {{bankF.4}} vs {{F.4}}, a small difference from the day-count convention.",
  "map.m.forecasts": "Four forecasts side by side",
  "map.m.forecastsCaption": "The forward is not a reliable forecast of the future rate (Fama 1984). Each row is a theory, not a prediction.",
  "map.m.f.forward": "Bank lock (forward)", "map.m.f.ppp": "Prices theory (PPP)", "map.m.f.ife": "Interest theory (IFE)", "map.m.f.rw": "No change (random walk)",
  "map.m.colTheory": "Theory", "map.m.colRate": "RM per {{ccy}}1", "map.m.colChange": "Change",
  "map.explainQ": "Why does the news say higher rates strengthen a currency?",
  "map.explainA": "In the short run, a rise in real interest rates can attract investors' money and strengthen a currency. That is a different effect from parity, which is about inflation-driven rates over longer horizons.",

  // Screen 4
  "coach.h1": "Lock or wait: what does each cost Aina?",
  "coach.sub": "A risk decision, not a forecast.",
  "coach.lock": "Lock", "coach.lock.note": "for certain",
  "coach.lock.s": "Convert now into a dollar account, or use a bank forward: same cost.",
  "coach.wait": "Wait", "coach.wait.note": "about, if the prices theory holds",
  "coach.range": "Range {{lo}} – {{hi}}",
  "coach.rangeLegend": "Amber band: 8 of 10 past {{n}}-day moves · teal mark: lock",
  "coach.verdict": "Lock: set aside {{A}} now, for certain. Wait: about {{lessMore diff.ppp}} if the prices theory holds, {{lessMore diff.rw}} if the exchange rate stays at its {{rateDate}} level, and anywhere from {{lo}} to {{hi}} in 8 of 10 past periods. Locking buys certainty.",
  "coach.verdict.noRange": "Lock: set aside {{A}} now, for certain. Wait: about {{lessMore diff.ppp}} if the prices theory holds, {{lessMore diff.rw}} if the exchange rate stays at its {{rateDate}} level. Locking buys certainty. Illustrative numbers.",
  "rule.wait": "Malaysia's after-inflation interest is higher, so the prices theory expects waiting to cost a little less.",
  "rule.lock": "Malaysia's after-inflation interest is lower, so the prices theory expects waiting to cost more.",
  "rule.equal": "After-inflation interest is equal, so both choices are expected to cost the same.",
  "coach.split": "Lock this much now",
  "coach.split.v": "{{h}} locked",
  "coach.split.c": "Expected {{split.expected}} · range {{split.lo}} – {{split.hi}}. Splitting cuts the swing in proportion.",
  "coach.split.cNoRange": "Expected {{split.expected}}. Splitting cuts the swing in proportion.",
  "coach.staging": "Many students convert in stages: that is the split slider above.",
  "coach.al.title": "Monthly allowance: prices rise too",
  "coach.al.input": "Allowance in 6 Nov {{country}} prices ({{ccy}})",
  "coach.al.s": "Rent and food in the {{country}} rise with {{country}} prices. Under the prices theory, your allowance in ringgit grows with Malaysian inflation ({{piH}}), not {{country}} inflation ({{piF}}).",
  "coach.al.usd": "Dollars needed", "coach.al.rm": "Ringgit under PPP",
  "coach.al.naive": "A naive guess using the {{rateDate}} rate: {{al.naive}}",
  "coach.al.lw": "Lock {{al.A}} vs wait {{al.C}}",
  "coach.fees": "Fees",
  "coach.fees.help": "Fees apply to every option. The Snapshot quote was 4.0565/4.0610; enter 0.11 to see that spread.",
  "coach.fees.wise": "Wise (2023) estimates Malaysian students lose about RM 1,183 a year to fees and markups: fees can be bigger than the lock-or-wait difference.",
  "coach.spot": "Paying at spot on day one: {{spotRef}}, which is {{spotMinusA}} more than locking, because that money earns no interest meanwhile.",
  "coach.chart.title": "Waiting minus locking, as Malaysian inflation changes",
  "coach.chart.be": "Break-even {{be}}: real rates equal",
  "coach.chart.up": "Waiting costs more ↑", "coach.chart.down": "Waiting costs less ↓",
  "coach.chart.x": "Malaysian inflation %", "coach.chart.here": "You are here",
  "coach.chart.aria": "Line chart of waiting minus locking against Malaysian inflation from 0% to 6%. It crosses zero at the break-even {{be}}. At {{piH}} the difference is {{diffSigned}}.",
  "coach.access": "Bank forwards are offered by licensed onshore banks; individual access depends on the bank. Residents may convert ringgit into a foreign-currency account for overseas education with documentary proof (BNM FEP FAQs, Part 1, Q18 and Q20).",
  "coach.reveal": "You predicted \"{{yourAnswer}}\". With Malaysian inflation at {{target}}, waiting costs {{C_at_target}} vs {{C_at_base}}: it went up. {{rightWrong}}",
  "coach.reveal.right": "You were right.", "coach.reveal.wrong": "Now you know why.",
  "coach.disclaimer": "Parity theory, not a prediction. PPP holds poorly over months (Rogoff 1996). Not financial advice.",
  "coach.m.title": "The maths behind the Coach",
  "coach.m.ab": "Convert now: S·T / (1 + US$ interest)^t = {{A.2}}. Bank lock: F·T / (1 + RM interest)^t = {{B.2}}. Same cost (covered interest parity).",
  "coach.m.c": "Wait: expected rate · T / (1 + RM interest)^t. Prices theory {{C.ppp.2}} · interest theory {{C.ife.2}} · no change {{C.rw.2}}.",
  "coach.m.range": "Historical range: the no-change cost × (1 + 10th / 90th percentile of past {{n}}-day moves, 2016–2026) = {{lo.2}} – {{hi.2}}.",
  "coach.m.split": "Split: h × lock + (1 − h) × wait, with h = {{h}}.",

  // Screen 5
  "check.h1": "What if Malaysian inflation changes?",
  "check.th": ["Malaysian inflation", "After-inflation interest (MY)", "Wait cost (PPP)", "Wait minus lock"],
  "check.why": "Higher Malaysian inflation raises the prices theory's expected cost of each dollar, while Malaysian interest stays put. Once Malaysia's after-inflation interest falls below the {{country}}'s (above {{be}} inflation), waiting becomes dearer than locking.",
  "check.linked": "With interest linked to inflation (real rates held), the wait-minus-lock gap stays at {{diffLinked}}: the decision depends on real rates, not on inflation alone.",
  "check.postTitle": "Your after-check",
  "check.postIntro": "Same kind of questions as before, different numbers.",
  "check.changed": "Did this change how you'd convert?",
  "check.changedOpts": ["Yes", "No", "Not sure"],
  "check.results": "You got {{pre}}/{{max}} before and {{post}}/{{max}} after.",
  "check.resultsNoPre": "You got {{post}}/{{max}} (no pre-check).",
  "check.objTitle": "Per topic",
  "check.code": "Your anonymous result code:",
  "check.codeNote": "If you're in our class test, paste it into the form. It contains only your form letter and scores.",
  "check.startPost": "Start the after-check",
  "check.links": "How far can I trust this? · Sources",
  "check.youAreHere": "You are here",
  "check.objShort": ["Prices & FX", "Bank lock", "Real rates", "Lock vs wait", "Allowance"],

  // Sheets
  "limits.title": "How far can I trust this?",
  "limits.assumeTitle": "Assumptions",
  "limits.assume": [
    "Bank lock: no fees or capital controls.",
    "Prices theory: the same basket of goods in both countries.",
    "Interest theory: equal after-inflation interest.",
    "Recent inflation stands in for expected inflation.",
  ],
  "limits.limitsTitle": "Limits",
  "limits.list": [
    "The prices theory takes years, not months: price gaps take about 3–5 years to halve (Rogoff 1996).",
    "The interest theory often fails in the short run, and the forward is not a reliable forecast (Fama 1984). Fisher holds better over long periods (Mishkin 1991).",
    "Even the bank-lock rule has had gaps since 2008 (Du, Tepper & Verdelhan 2018).",
    "The ringgit is not traded offshore; hedging happens with onshore banks (BNM 2017).",
    "Policy rates are not deposit rates; real dollar accounts often pay less.",
    "Bank fees and spreads are ignored unless you enter them.",
    "Oil prices, risk mood and Bank Negara's actions also move the ringgit.",
    "The historical range is how often past moves happened (2016–2026), not a probability; reference rates are mid rates.",
  ],
  "sources.title": "Sources",
};

export const SOURCES = [
  ["Madura (2021) International Financial Management, 14th ed., Cengage", ""],
  ["Bernama, 6 Nov 2026, ringgit close 4.0565/0610", "https://bernama.com/en/market/news.php?id=2631031"],
  ["BNM Monetary Policy Statement, 5 Nov 2026 (OPR 2.75%)", "https://www.bnm.gov.my/-/monetary-policy-statement-05112026"],
  ["Federal Reserve FOMC statement, 28 Oct 2026 (3.75–4.00%)", "https://www.federalreserve.gov/newsevents/pressreleases/monetary20261028a.htm"],
  ["DOSM CPI Sep 2026 (1.8%)", ""],
  ["BLS CPI Sep 2026 (3.7%)", "https://www.bls.gov/news.release/archives/cpi_10142026.htm"],
  ["ECB euro reference rates USD/MYR 2016–2026 via Frankfurter (historical range)", "https://api.frankfurter.app"],
  ["Rogoff (1996) The purchasing power parity puzzle", "https://ideas.repec.org/a/aea/jeclit/v34y1996i2p647-668.html"],
  ["Fama (1984) Forward and spot exchange rates", "https://doi.org/10.1016/0304-3932(84)90046-1"],
  ["Mishkin (1991) Is the Fisher effect for real?", "https://doi.org/10.3386/w3632"],
  ["Du, Tepper & Verdelhan (2018) Deviations from covered interest rate parity", "https://doi.org/10.1111/jofi.12620"],
  ["BNM FEP FAQs Part 1: Residents (2019)", "https://www.bnm.gov.my/documents/20124/60360/FAQs_Part_1_Residents+2019.pdf"],
  ["Wise (2023) fees estimate", "https://newsroom.wise.com/en-CAS/228691-report-unfavourable-money-transfer-rates-cost-malaysian-international-students-close-to-rm70-million-each-year/"],
];

// Glossary (≤ 15 words each). Inline markup in copy: [[id|shown text]].
export const TIPS = {
  spot: "The exchange rate for converting right away.",
  forward: "A rate agreed now for converting on a future date. A lock, not a forecast.",
  premium: "A forward above the spot rate is a premium; below it is a discount.",
  nominal: "The interest rate as quoted, before taking inflation out.",
  real: "Interest after inflation: what your savings really gain in buying power.",
  inflation: "How fast prices rise in a year.",
  appreciate: "A currency gets stronger / weaker against another.",
  irp: "Interest rate parity: the forward rate comes from the two interest rates.",
  ppp: "Purchasing power parity: currencies adjust so baskets of goods cost the same.",
  fisher: "Interest rates rise with expected inflation, keeping the real rate steady.",
  ife: "Interest theory: higher-interest currencies are expected to weaken by the interest gap.",
  pp: "Percentage points: the gap between two percentages.",
  covered: "Covered = locked in. Unhedged = waiting, exposed to rate changes.",
  rw: "Assume the rate stays where it starts: the best simple guess in practice.",
  rule: "Waiting is expected to cost less only if Malaysia's real rate is higher.",
  breakEven: "The inflation level where locking and waiting are expected to cost the same.",
  range: "Where 8 of 10 past 270-day moves landed. History, not a forecast.",
  split: "Lock part now, wait with the rest. Less risk, less upside.",
  setAside: "Ringgit you need on day one, counting interest earned until payment.",
  fca: "A Malaysian bank account holding dollars; residents may open one for study abroad.",
  opr: "Overnight Policy Rate: Bank Negara Malaysia's main interest rate.",
};

// Quiz. Correct option ids marked with `correct`. obj = objective 1–5. A7/B7 is pick-two, scored 0–2.
const PICK2 = {
  stem: "Pick two reasons the theory's expected rate could be wrong.",
  options: [
    ["slow", "PPP takes years to hold, not months", true],
    ["other", "Oil prices, risk mood and central bank action also move the ringgit", true],
    ["deposit", "Real dollar accounts often pay less than the policy rate", true],
    ["fees", "Bank fees and spreads are ignored unless entered", true],
    ["approx", "The formulas are approximations that are always wrong", false],
    ["never", "Exchange rates never change", false],
  ],
  fb: "These are the limits listed under \"How far can I trust this?\"",
};
const UDS = (u, d, s) => [["up", u], ["down", d], ["same", s]];
function form(L) { // L: words for the foreign side
  return [
    { id: 1, obj: 1, stem: `${L.adj} inflation rises. The prices theory's expected rate (ringgit per ${L.cur}1) goes…`,
      options: UDS("up", "down", "same"), correct: "down",
      fb: { up: `Faster ${L.adj} price rises make each ${L.unit} worth less.`, same: "PPP's expected rate depends on both inflation rates." } },
    { id: 2, obj: 2, stem: `${L.adj} interest rises; Malaysian interest unchanged. The forward rate goes…`,
      options: UDS("up", "down", "same"), correct: "down",
      fb: { up: "The higher-interest currency trades at a forward discount.", same: "The forward depends on the interest gap, and the gap changed." } },
    { id: 3, obj: 2, stem: "Malaysian inflation rises; interest rates unchanged. The forward rate goes…",
      options: UDS("up", "down", "same"), correct: "same",
      fb: { up: "A bank lock uses interest rates only. Inflation doesn't enter it directly, and interest rates were held fixed.",
            down: "A bank lock uses interest rates only. Inflation doesn't enter it directly, and interest rates were held fixed." } },
    { id: 4, obj: 3, stem: "Malaysian inflation rises; Malaysian interest unchanged. Malaysia's after-inflation interest goes…",
      options: UDS("up", "down", "same"), correct: "down",
      fb: { up: "Real rate ≈ interest minus inflation.", same: "Inflation changed, so the real rate changed." } },
    { id: 5, obj: 4, stem: L.q5stem, options: [["higher", "higher"], ["lower", "lower"], ["same", "same"]], correct: L.q5correct, fb: L.q5fb },
    { id: 6, obj: 3, stem: "Both countries' after-inflation interest rates are equal. The prices theory and the interest theory give…",
      options: [["same", "the same"], ["ppp", "PPP higher"], ["ife", "IFE higher"]], correct: "same",
      fb: { ppp: "Equal after-inflation interest makes the inflation gap match the interest gap, so both theories give one number.",
            ife: "Equal after-inflation interest makes the inflation gap match the interest gap, so both theories give one number." } },
    { id: 7, obj: 4, pick2: true, stem: PICK2.stem, options: PICK2.options.map(([id, t]) => [id, t]),
      correctSet: PICK2.options.filter((o) => o[2]).map((o) => o[0]), fb: PICK2.fb },
    { id: 8, obj: 5, stem: `Your ${L.adj} rent rises with ${L.adj} inflation. Under the prices theory, the ringgit cost of that rent grows with…`,
      options: [["foreign", `${L.adj} inflation`], ["my", "Malaysian inflation"], ["neither", "neither"]], correct: "my",
      fb: { foreign: `The ${L.unit} amount grows with ${L.adj} prices, but PPP says each ${L.unit} costs fewer ringgit by the same proportion.`,
            neither: `The two ${L.adj} effects cancel, which leaves Malaysian inflation.` } },
  ];
}
export const QUIZ = {
  A: form({ adj: "US", cur: "US$", unit: "dollar",
    q5stem: "Under the prices theory, Malaysia's after-inflation interest is {{q.rH}} and America's is {{q.rF}}. Compared with locking, the ringgit you must set aside to wait is expected to be…",
    q5correct: "lower",
    q5fb: { higher: "Malaysia's after-inflation interest is higher. Under PPP, the ringgit's expected gain more than makes up for the lower ringgit interest, so waiting is expected to cost less.",
            same: "Different after-inflation interest makes the choices differ." } }),
  B: form({ adj: "UK", cur: "£", unit: "pound",
    q5stem: "Under the prices theory, Malaysia's after-inflation interest is 0.93% and the UK's is 1.20% (illustrative). Compared with locking, the ringgit you must set aside to wait is expected to be…",
    q5correct: "higher",
    q5fb: { lower: "Malaysia's after-inflation interest is lower here, so PPP expects waiting to cost more.",
            same: "Different after-inflation interest makes the choices differ." } }),
};
export const OBJECTIVES = { 1: [1], 2: [2, 3], 3: [4, 6], 4: [5, 7], 5: [8] };
export const QUIZ_MAX = 9; // 7 single items + pick-two scored 0–2

// "Ask KiraKurs" explanations (stretch). The AI only returns one of these ids; numbers come from makeVars().
export const ASK = {
  why_forward_below_spot: { q: "Why is the bank lock below the 6 Nov rate?", a: "The bank lock is RM {{F.4}} vs RM {{S.4}} because {{higherRateCountry}} savings pay more interest ({{iF}} vs {{iH}}). The bank builds that gap into the lock: interest rate parity." },
  forward_not_forecast: { q: "Is the bank lock a forecast?", a: "No. The bank lock (RM {{F.4}}) comes only from the two interest rates. It is a price you can lock, not a guess about the future (Fama 1984)." },
  why_ppp_down: { q: "Why does the prices theory expect fewer ringgit per dollar?", a: "{{fasterCountry}} prices rise faster ({{fasterPi}} vs {{slowerPi}}). The prices theory says the faster-inflating currency loses value by about that gap, so it expects RM {{EPPP.4}}." },
  why_ife_equals_forward: { q: "Why are the interest theory and the bank lock the same number?", a: "Both use only the two interest rates over the same {{n}} days, so the interest theory's expected rate equals the bank lock: RM {{F.4}}." },
  what_real_rate: { q: "What is a real interest rate?", a: "Interest after inflation. Malaysia: {{rH}} a year; {{country}}: {{rF}}. Roughly interest minus inflation; the exact Fisher formula is (1 + interest)/(1 + inflation) − 1." },
  why_wait_cheaper_ppp: { q: "Why is waiting expected to cost less or more?", a: "{{ruleSentence}} Under the prices theory, waiting costs about {{lessMore diff.ppp}} than locking ({{C.ppp}} vs {{A}})." },
  real_rate_rule: { q: "What decides lock vs wait?", a: "Compare after-inflation interest: Malaysia {{rH}} vs {{country}} {{rF}}. Waiting is expected to cost less only if Malaysia's is higher. The break-even Malaysian inflation is {{be}}." },
  break_even: { q: "What is the break-even inflation?", a: "At Malaysian inflation of {{be}}, both countries' after-inflation interest is equal, so locking and waiting are expected to cost the same." },
  why_set_aside_less: { q: "Why set aside less than the spot cost?", a: "Paying at spot on day one costs {{spotRef}}. If you convert now into a dollar account earning {{iF}}, interest grows the dollars, so you set aside {{A}}: {{spotMinusA}} less." },
  lock_equals_convert: { q: "Why do convert-now and the bank lock cost the same?", a: "Covered interest parity: convert now and earn {{country}} interest, or keep ringgit earning Malaysian interest and lock the forward. Both cost {{A}}." },
  why_range_wide: { q: "Why is the waiting range so wide?", a: "In 8 of 10 past {{n}}-day periods (2016–2026), the ringgit moved enough to make waiting cost between {{lo}} and {{hi}}. That swing is far bigger than the expected difference." },
  what_split: { q: "What does splitting do?", a: "Lock part of the bill and wait with the rest. Locking half gives an expected {{split50}} and shrinks the swing by half. Less risk, less upside." },
  allowance_inflation: { q: "Why does my allowance follow Malaysian inflation?", a: "{{country}} prices push the dollar amount up, but under the prices theory each dollar costs fewer ringgit by the same proportion. What is left is Malaysian inflation ({{piH}})." },
  linked_mode: { q: "What does linking interest to inflation do?", a: "It holds real rates fixed (Fisher), so interest rises with inflation. The lock and the prices theory then move together, and wait minus lock stays at {{lessMore diff.ppp}}." },
  fisher_effect: { q: "What is the Fisher effect?", a: "Interest rates rise with expected inflation, so the real rate stays steady: interest = (1 + real rate)(1 + inflation) − 1. It holds better over long periods (Mishkin 1991)." },
  news_rates_strengthen: { q: "Why does the news say higher rates strengthen a currency?", a: "In the short run, a rise in real interest rates can attract investors' money and strengthen a currency. Parity is about inflation-driven rates over longer horizons." },
  fees_matter: { q: "Do fees matter?", a: "Yes. A bank margin raises every option. Wise (2023) estimates Malaysian students lose about RM 1,183 a year to fees and markups, often more than the lock-or-wait difference." },
  how_reliable: { q: "How reliable is this?", a: "It is parity theory, not a prediction. PPP takes years to hold (Rogoff 1996), the forward is a poor forecast (Fama 1984), and oil, risk mood and Bank Negara also move the ringgit." },
  data_dates: { q: "Where do the numbers come from?", a: "Snapshot: exchange rate 6 Nov 2026, OPR 5 Nov, Fed 28 Oct, CPI September 2026. Frozen and not live. The Classroom scenario is illustrative." },
  random_walk: { q: "What if the rate does not change?", a: "If the rate stays at its {{rateDate}} level, waiting costs {{C.rw}}, which is {{lessMore diff.rw}} than locking. In practice no-change is a hard guess to beat." },
};
export const ASK_UI = {
  title: "Ask KiraKurs", btn: "Ask a question",
  label: "Your question (max 300 characters)",
  notice: "Don't type names or personal details. Questions are sent to Groq's API. We store nothing. Groq may keep logs for up to 30 days.",
  send: "Ask", menu: "Pick a topic:", pii: "That looks like personal information. Please remove it and ask again.",
  chip: "Explanation checked by the engine",
};

// ---------- placeholder filling ----------
const COUNTRY = { USD: ["US$", "US"], GBP: ["£", "UK"], AUD: ["A$", "Australian"] };

// Build every placeholder value for one input set. `num` keeps raw numbers for helpers like lessMore.
export function makeVars(inp, extra = {}) {
  const ok = (o) => E.allFinite(o);
  const m = E.parityMap(inp), c = E.coach(inp), al = E.allowance(inp, extra.T0 ?? 1500);
  const target = extra.target ?? 0.04;
  const sens = E.sensitivity(inp, [inp.piH, target]);
  const half = E.coach({ ...inp, h: 0.5 }).split;
  const linked = E.coach(E.linkRates(inp, { piH: target }));
  const [ccy, country] = COUNTRY[inp.ccy ?? "USD"];
  const kind = inp.kind ?? "dated";
  const fFaster = inp.piF > inp.piH;
  const s = {
    ENGINE_VERSION: E.ENGINE_VERSION, ccy, country,
    rateDate: kind === "dated" ? "6 Nov" : "starting",
    T: f.amount(inp.T), n: String(inp.n), k: inp.id === "classroom" ? "1" : "2", presetLabel: inp.label ?? "",
    "S.2": f.fx(inp.S), "S.4": f.fx(inp.S, 4),
    iH: f.pct(inp.iH), iF: f.pct(inp.iF), piH: f.pct(inp.piH), piF: f.pct(inp.piF), target: f.pct(target, 1),
    F: f.fx(m.F), "F.2": f.fx(m.F), "F.4": f.fx(m.F, 4), "bankF.4": f.fx(m.bankF, 4),
    EPPP: f.fx(m.EPPP), "EPPP.4": f.fx(m.EPPP, 4), EIFE: f.fx(m.EIFE), "EIFE.4": f.fx(m.EIFE, 4),
    premium: f.signedPct(m.premium), ePPP: f.signedPct(m.ePPP), eIFE: f.signedPct(m.eIFE),
    rH: f.pct(m.rH), rF: f.pct(m.rF), gapPP: f.pp(Math.abs(m.parityGapPP)),
    belowAbove: m.F < inp.S ? "below" : m.F > inp.S ? "above" : "equal to",
    higherRateCountry: inp.iF >= inp.iH ? country : "Malaysian",
    fasterCountry: fFaster ? country : "Malaysian", fasterPi: f.pct(fFaster ? inp.piF : inp.piH), slowerPi: f.pct(fFaster ? inp.piH : inp.piF),
    fewerMore: m.EPPP < inp.S ? "slightly fewer" : m.EPPP > inp.S ? "slightly more" : "the same",
    spotRef: f.rm(c.spotRef), A: f.rm(c.A), "A.2": f.rm(c.A, 2), "B.2": f.rm(c.B, 2),
    "C.ppp": f.rm(c.C.ppp), "C.ppp.2": f.rm(c.C.ppp, 2), "C.ife.2": f.rm(c.C.ife, 2), "C.rw": f.rm(c.C.rw), "C.rw.2": f.rm(c.C.rw, 2),
    C_ppp: f.rm(c.C.ppp),
    lo: c.range ? f.rm(c.range.lo) : "", hi: c.range ? f.rm(c.range.hi) : "",
    "lo.2": c.range ? f.rm(c.range.lo, 2) : "", "hi.2": c.range ? f.rm(c.range.hi, 2) : "",
    h: f.pct(inp.h ?? 0, 0),
    "split.expected": f.rm(c.split.expected), "split.lo": c.split.lo == null ? "" : f.rm(c.split.lo), "split.hi": c.split.hi == null ? "" : f.rm(c.split.hi),
    split50: f.rm(half.expected),
    be: f.pct(c.breakEvenPiH), spotMinusA: f.rm(c.spotRef - c.A), diffSigned: f.signedRM(c.diff.ppp),
    ruleSentence: T["rule." + c.rule],
    "al.usd": ccy + f.amount(al.usd, 2), "al.rmPPP": f.rm(al.rmPPP, 2), "al.naive": f.rm(al.naive, 2), "al.A": f.rm(al.A, 2), "al.C": f.rm(al.C, 2),
    C_at_base: f.rm(sens[0].Cppp), C_at_target: f.rm(sens[1].Cppp), diffLinked: f.signedRM(linked.diff.ppp),
    "q.rH": f.pct(E.realRate(PRESETS.snapshot.iH, PRESETS.snapshot.piH)), "q.rF": f.pct(E.realRate(PRESETS.snapshot.iF, PRESETS.snapshot.piF)),
    // screen-supplied values (defaults keep every template resolvable)
    step: "", qn: "", qtotal: "8", yourAnswer: "", rightWrong: "", pre: "", post: "", max: "9",
    ...extra.s,
  };
  return { s, num: { "diff.ppp": c.diff.ppp, "diff.rw": c.diff.rw }, results: { m, c, al, sens, half, linked }, finite: ok(m) && ok(c) && ok(al) };
}

const HELPERS = {
  lessMore: (x) => (Math.abs(x) < 0.5 ? "the same" : `${f.rm(Math.abs(x))} ${x < 0 ? "less" : "more"}`),
};

// Replace {{name}} and {{helper name}}. Unknown names become "?" and are reported via onMissing.
export function fill(str, vars, onMissing) {
  return str.replace(/\{\{\s*([\w.]+)(?:\s+([\w.]+))?\s*\}\}/g, (_, a, b) => {
    if (b) { if (HELPERS[a] && b in vars.num) return HELPERS[a](vars.num[b]); }
    else if (a in vars.s) return vars.s[a];
    onMissing?.(b ? `${a} ${b}` : a);
    return "?";
  });
}

// Split "[[id|text]]" glossary markup into parts: strings and {tip, text}.
export function tipParts(str) {
  const out = []; let last = 0;
  for (const mt of str.matchAll(/\[\[(\w+)\|([^\]]+)\]\]/g)) {
    out.push(str.slice(last, mt.index), { tip: mt[1], text: mt[2] });
    last = mt.index + mt[0].length;
  }
  out.push(str.slice(last));
  return out.filter((p) => p !== "");
}

export const t = (key, vars) => (vars ? fill(T[key], vars) : T[key]);
