// Display formatting and the % ↔ decimal boundary (docs/ENGINE.md §6). Round only here.
import { parseNumber } from "./engine.mjs";

const MINUS = "−";
const nf = {};
const num = (x, dp) => (nf[dp] ??= new Intl.NumberFormat("en-MY", { minimumFractionDigits: dp, maximumFractionDigits: dp })).format(x);
const neg = (s) => s.replace("-", MINUS);
const zero = (x, dp) => Math.abs(x) < 0.5 * 10 ** -dp;   // avoid "−0"

export const rm = (x, dp = 0) => neg((zero(x, dp) ? "" : x < 0 ? "-" : "") + "RM " + num(Math.abs(x), dp));
export const signedRM = (x, dp = 0) => (zero(x, dp) ? "RM " + num(0, dp) : (x > 0 ? "+" : MINUS) + "RM " + num(Math.abs(x), dp));
export const fx = (x, dp = 2) => num(x, dp);
export const pct = (dec, dp = 2) => neg(num(zero(dec * 100, dp) ? 0 : dec * 100, dp)) + "%";
export const signedPct = (dec, dp = 2) => (dec > 0 && !zero(dec * 100, dp) ? "+" : "") + pct(dec, dp);
export const pp = (x, dp = 2) => neg(num(zero(x, dp) ? 0 : x, dp)) + " pp";
export const amount = (x, dp = 0) => num(x, dp);

// UI percent string → engine decimal. "2,75" → 0.0275, "3.875%" → 0.03875.
export function parsePct(str) {
  const x = parseNumber(str);
  return Number.isFinite(x) ? Number((x / 100).toPrecision(15)) : NaN;
}
// Engine decimal → UI percent string for an input field (no rounding beyond float noise).
export const toPctInput = (dec) => String(Number((dec * 100).toPrecision(12)));
