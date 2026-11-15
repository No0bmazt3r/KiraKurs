// Fee Day: replay a real past 270-day period (idea-v6-addendum.md §B1). Pure; the UI supplies the random index.
// Data: ECB USD/MYR reference rates (usdmyr.json, 2016-01-04 → 2026-11-06), the same series as evidence/fx/band.py.
// Window rule matches band.py: start on a data day, end at the first data day on or after start + 270 days.
// Lock: the window's starting rate × (1 + the Snapshot 270-day forward premium). Historical interest rates are not in the
// project, so the lock is labelled illustrative (fee.label). Both legs are RM paid on payment day, so they compare directly.
import data from "./usdmyr.json";
import { parityMap } from "./engine";
import { PRESETS } from "./presets";

export const DAYS = 270;
const RATES = data.rates as Record<string, number>;
const DATES = Object.keys(RATES).sort();
const ms = (d: string) => Date.parse(d + "T00:00:00Z");
const addDays = (d: string, n: number) => new Date(ms(d) + n * 864e5).toISOString().slice(0, 10);

// Index i of DATES → index of the end date, or -1 when the window runs past the data.
function endIndex(i: number) {
  const target = addDays(DATES[i]!, DAYS);
  let lo = i, hi = DATES.length;                 // first date >= target
  while (lo < hi) { const mid = (lo + hi) >> 1; if (DATES[mid]! < target) lo = mid + 1; else hi = mid; }
  return lo < DATES.length ? lo : -1;
}

/** Number of valid start dates (every start whose window ends inside the data). */
export const WINDOWS = (() => { let n = 0; while (n < DATES.length && endIndex(n) >= 0) n++; return n; })();

/** Snapshot 270-day forward premium F/S − 1 (about −0.80%). */
export const LOCK_PREMIUM = parityMap({ ...PRESETS.snapshot, n: DAYS }).premium;

export type Choice = "lock" | "wait" | "split";
export interface Round { start: string; end: string; s0: number; s1: number; lock: number; wait: number; you: number; diff: number; choice: Choice }

/** Play window k (0 ≤ k < WINDOWS) for a bill of T foreign units. */
export function replay(k: number, T: number, choice: Choice): Round {
  if (!(k >= 0 && k < WINDOWS)) throw new RangeError("window out of range");
  const j = endIndex(k);
  const start = DATES[k]!, end = DATES[j]!, s0 = RATES[start]!, s1 = RATES[end]!;
  const lock = s0 * (1 + LOCK_PREMIUM) * T, wait = s1 * T;
  const h = choice === "lock" ? 1 : choice === "split" ? 0.5 : 0;
  return { start, end, s0, s1, lock, wait, you: h * lock + (1 - h) * wait, diff: wait - lock, choice };
}

/** Month-end USD/MYR closes over the Fee Day data (for the welcome chart), plus the lowest and highest daily rates. */
export const HISTORY = (() => {
  const months: { d: string; r: number }[] = [];
  for (const d of DATES) {
    const last = months[months.length - 1];
    if (last && last.d.slice(0, 7) === d.slice(0, 7)) last.d = d, last.r = RATES[d]!;
    else months.push({ d, r: RATES[d]! });
  }
  let lo = DATES[0]!, hi = DATES[0]!;
  for (const d of DATES) { if (RATES[d]! < RATES[lo]!) lo = d; if (RATES[d]! > RATES[hi]!) hi = d; }
  return { months, first: DATES[0]!, last: DATES[DATES.length - 1]!, lo: { d: lo, r: RATES[lo]! }, hi: { d: hi, r: RATES[hi]! } };
})();
