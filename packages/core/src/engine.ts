// KiraKurs finance engine (docs/ENGINE.md). Pure: no DOM, no I/O, no randomness, no imports.
// Quote: S = MYR per 1 unit of foreign currency. Rates are decimals per annum. t = n / 365.
// Teaching model: annual effective rates compounded over t, so every identity holds at any n.

export const ENGINE_VERSION = "1.2.1";

export type Ccy = "USD" | "GBP" | "AUD";
export interface Inputs {
  S: number; T: number; n: number; iH: number; iF: number; piH: number; piF: number;
  margin?: number; h?: number; q10?: number | null; q90?: number | null; ccy?: Ccy;
  id?: string; label?: string; kind?: string;
}

const BASIS: Record<string, number> = { USD: 360, GBP: 365, AUD: 365, MYR: 365 };

export function yearFrac(n: number) { return n / 365; }

export function forward({ S, iH, iF, t }: { S: number; iH: number; iF: number; t: number }) { return S * ((1 + iH) / (1 + iF)) ** t; }

export function forwardBank({ S, iH, iF, n, basisH = 365, basisF = 360 }: { S: number; iH: number; iF: number; n: number; basisH?: number; basisF?: number }) {
  return S * (1 + iH * n / basisH) / (1 + iF * n / basisF);
}

export function premium(F: number, S: number) { return F / S - 1; }

export function pppChange({ piH, piF, t }: { piH: number; piF: number; t: number }) { return ((1 + piH) / (1 + piF)) ** t - 1; }

export function ifeChange({ iH, iF, t }: { iH: number; iF: number; t: number }) { return ((1 + iH) / (1 + iF)) ** t - 1; }

export function realRate(i: number, pi: number) { return (1 + i) / (1 + pi) - 1; }

export function nominalFromReal(r: number, pi: number) { return (1 + r) * (1 + pi) - 1; }

export function breakEvenPiH({ iH, iF, piF }: { iH: number; iF: number; piF: number }) { return (1 + iH) * (1 + piF) / (1 + iF) - 1; }

// Hold the base real rates fixed; derive new nominal rates for new inflation.
export function linkRates<I extends Inputs>(base: I, { piH = base.piH, piF = base.piF }: { piH?: number; piF?: number } = {}): I {
  const rH = realRate(base.iH, base.piH), rF = realRate(base.iF, base.piF);
  return { ...base, piH, piF, iH: nominalFromReal(rH, piH), iF: nominalFromReal(rF, piF) };
}

export function parityMap(inp: Inputs, n = inp.n) {
  const { S, iH, iF, piH, piF, ccy = "USD" } = inp;
  const t = yearFrac(n);
  const F = forward({ S, iH, iF, t });
  const ePPP = pppChange({ piH, piF, t });
  const eIFE = ifeChange({ iH, iF, t });
  const EPPP = S * (1 + ePPP), EIFE = S * (1 + eIFE);
  const rH = realRate(iH, piH), rF = realRate(iF, piF);
  return {
    t, F, premium: premium(F, S), ePPP, EPPP, eIFE, EIFE, rH, rF,
    realGapPP: (rH - rF) * 100,
    parityGapPP: (eIFE - ePPP) * 100,
    approx: { premium: iH - iF, ePPP: piH - piF, rH: iH - piH, rF: iF - piF },
    bankF: forwardBank({ S, iH, iF, n, basisH: BASIS.MYR, basisF: BASIS[ccy] ?? 365 }),
    forecasts: [
      { id: "forward", value: F }, { id: "ppp", value: EPPP }, { id: "ife", value: EIFE }, { id: "rw", value: S },
    ],
  };
}

export function coach(inp: Inputs) {
  const { S, T, n, iH, iF, piH, piF, margin = 0, h = 0, q10 = null, q90 = null } = inp;
  const t = yearFrac(n);
  const k = 1 + margin;                      // bank margin on every MYR amount
  const F = forward({ S, iH, iF, t });
  const dH = (1 + iH) ** t, dF = (1 + iF) ** t;
  const A = S * T / dF * k;
  const B = F * T / dH * k;
  const E = { ppp: S * (1 + pppChange({ piH, piF, t })), ife: S * (1 + ifeChange({ iH, iF, t })), rw: S };
  const C = { ppp: E.ppp * T / dH * k, ife: E.ife * T / dH * k, rw: E.rw * T / dH * k };
  const diff = { ppp: C.ppp - A, ife: C.ife - A, rw: C.rw - A };
  const range = q10 == null || q90 == null ? null : { lo: C.rw * (1 + q10), hi: C.rw * (1 + q90) };
  const mix = (x: number) => h * A + (1 - h) * x;
  const split = { h, expected: mix(C.ppp), lo: range ? mix(range.lo) : null, hi: range ? mix(range.hi) : null };
  const rH = realRate(iH, piH), rF = realRate(iF, piF);
  const rule: "equal" | "wait" | "lock" = Math.abs(rH - rF) < 1e-12 ? "equal" : rH > rF ? "wait" : "lock";
  return {
    t, F, spotRef: S * T * k, A, B, C, diff, range, split,
    breakEvenPiH: breakEvenPiH({ iH, iF, piF }), rH, rF, rule,
  };
}
export type Coach = ReturnType<typeof coach>;

// Price-indexed bill: T0 foreign-currency at 6 Nov prices, growing with foreign inflation.
export function allowance(inp: Inputs, T0: number) {
  const { S, n, iH, iF, piH, piF, margin = 0 } = inp;
  const t = yearFrac(n), k = 1 + margin;
  const usd = T0 * (1 + piF) ** t;
  const EPPP = S * (1 + pppChange({ piH, piF, t }));
  const rmPPP = usd * EPPP * k;
  const A = S * usd / (1 + iF) ** t * k;
  const C = rmPPP / (1 + iH) ** t;
  return { usd, EPPP, rmPPP, naive: S * usd * k, A, C, diff: C - A };
}

export function sensitivity(inp: Inputs, piHList: number[]) {
  return piHList.map((piH) => {
    const c = coach({ ...inp, piH });
    return { piH, rH: c.rH, Cppp: c.C.ppp, diff: c.diff.ppp };
  });
}

// ---- validation: raw strings from the UI, rates in percent ----
const RATE_LABEL: Record<string, string> = { iH: "Interest rate", iF: "Interest rate", piH: "Inflation", piF: "Inflation", rH: "Real rate", rF: "Real rate" };
const PCT = new Set(["iH", "iF", "piH", "piF", "rH", "rF", "margin", "h"]);

export function parseNumber(str: unknown): number {
  if (typeof str === "number") return str;
  let s = String(str ?? "").replace(/[\s%]/g, "").replace(/−/g, "-");
  if (s === "") return NaN;
  const commas = (s.match(/,/g) || []).length;
  // "2,75" → 2.75 (single comma, no dot, not a thousands group); "12,000" → 12000
  if (commas === 1 && !s.includes(".") && !/,\d{3}$/.test(s)) s = s.replace(",", ".");
  else if (commas && !/^[+-]?\d{1,3}(,\d{3})+(\.\d*)?$/.test(s)) return NaN;   // "3,5,0" is a typo, not 350
  else s = s.replace(/,/g, "");
  return /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(s) ? Number(s) : NaN;
}

export type Msgs = Record<string, string | undefined>;
export function validate(raw: Record<string, string>) {
  const errors: Msgs = {}, hints: Msgs = {}, values: Record<string, number> = {};
  for (const [field, str] of Object.entries(raw)) {
    const x = parseNumber(str);
    if (!Number.isFinite(x)) { errors[field] = "Enter a number."; continue; }
    if (field === "S" && !(x > 0 && x <= 1000)) errors[field] = "Exchange rate must be above 0 and at most 1,000.";
    else if (field === "T" && !(x > 0 && x <= 1e8)) errors[field] = "Amount must be above 0 and at most 100,000,000.";
    else if (field === "n" && !(Number.isInteger(x) && x >= 1 && x <= 3650)) errors[field] = "Days must be a whole number from 1 to 3,650.";
    else if (field === "margin" && !(x >= 0 && x <= 10)) errors[field] = "Bank margin must be between 0% and 10%.";
    else if (field === "h" && !(x >= 0 && x <= 100)) errors[field] = "Split must be between 0% and 100%.";
    else if (RATE_LABEL[field]) {
      if (!(x > -100)) errors[field] = `${RATE_LABEL[field]} must be above −100%.`;
      else if (x > 100) errors[field] = "Above 100% a year is outside this teaching model.";
      else if (x !== 0 && Math.abs(x) < 0.5) hints[field] = `Did you mean ${+(x * 100).toFixed(4)}%? (Ignore if you meant it.)`;
      else if (x < -10 || x > 50) hints[field] = "This is far outside normal rates, so results may be extreme.";
    }
    if (!errors[field]) values[field] = PCT.has(field) ? Number((x / 100).toPrecision(15)) : x; // 1.8/100 → 0.018, not 0.018000000000000002
  }
  const ok = Object.keys(errors).length === 0;
  return { ok, values: ok ? values : undefined, errors, hints };
}

// True when every number in a result object is finite (else the card shows "Result out of range").
export function allFinite(obj: unknown): boolean {
  if (obj == null) return true;
  if (typeof obj === "number") return Number.isFinite(obj);
  if (typeof obj === "object") return Object.values(obj).every(allFinite);
  return true;
}
