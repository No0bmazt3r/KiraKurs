// Shared by the web app and the API (apps/api): the allowed explanation ids and the PII guard (idea.md §10).
export const MAX_LEN = 300;

export const ASK_IDS = [
  "why_forward_below_spot", "forward_not_forecast", "why_ppp_down", "why_ife_equals_forward", "what_real_rate",
  "why_wait_cheaper_ppp", "real_rate_rule", "break_even", "why_set_aside_less", "lock_equals_convert",
  "why_range_wide", "what_split", "allowance_inflation", "linked_mode", "fisher_effect",
  "news_rates_strengthen", "fees_matter", "how_reliable", "data_dates", "random_walk",
] as const;
export type AskId = (typeof ASK_IDS)[number];
export const CONCEPTS = ["IRP", "PPP", "Fisher", "IFE", "decision", "limitations", "other"];

const PII = [
  /[^\s@]+@[^\s@]+\.[^\s@]+/,                                                   // email
  /(?<!\d)\d{6}-?\d{2}-?\d{4}(?!\d)/,                                           // Malaysian IC
  /(?<![\d.])(?:\+?60[\s-]?|0)1\d[\s-]?\d{3,4}[\s-]?\d{4}(?![\d.])/,            // mobile
  /(?<![\d.])(?:\+?60[\s-]?|0)[3-9][\s-]?\d{3,4}[\s-]?\d{4}(?![\d.])/,          // landline
  /\b[A-Z]\d{8}\b/i,                                                            // passport
  /(?<![\d.])\d{10,16}(?![\d.])/,                                               // account number
];
export const piiBlocked = (q: string) => PII.some((re) => re.test(q));

// ---- AI feature 2: "Explain your thinking" (Predict). The model picks one reasoning id; the team wrote every reply. ----
export const REASON_IDS = [
  "ppp_right", "expects_rate_hike", "inflation_strengthens", "quote_flip", "forward_forecast", "us_side", "unclear",
] as const;
export type ReasonId = (typeof REASON_IDS)[number];

// ---- AI feature 3: "Describe your bill" (Coach). The model only copies numbers out of the learner's text. ----
export const PERIOD_UNITS = ["days", "weeks", "months", "years"] as const;
export const BILL_CCYS = ["USD", "GBP", "AUD", "MYR", "other"] as const;
const UNIT_DAYS: Record<string, number> = { days: 1, weeks: 7, months: 365 / 12, years: 365 };
const WORDS: Record<string, number> = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, half: 0.5 };

/** Every number written in the text: "12,000" → 12000, "8.5k" → 8500, "six" → 6. */
export function numbersIn(text: string): number[] {
  const out: number[] = [];
  for (const m of text.matchAll(/(\d[\d,]*(?:\.\d+)?)\s*(k\b|thousand)?/gi)) out.push(Number(m[1]!.replace(/,/g, "")) * (m[2] ? 1000 : 1));
  for (const w of text.toLowerCase().match(/[a-z]+/g) ?? []) if (w in WORDS) out.push(WORDS[w]!);
  return out;
}

export interface BillParse { amount: number | null; period_value: number | null; period_unit: string | null; currency: string | null }
export type Bill = { T: number | null; n: number | null; ccy: (typeof BILL_CCYS)[number] | null };

/** Deterministic guard on the model's reply: each number must appear in the learner's own text; days are computed here, not by the model. */
export function billFromParse(text: string, p: BillParse): Bill | null {
  const seen = numbersIn(text);
  const literal = (x: unknown): x is number => typeof x === "number" && Number.isFinite(x) && seen.some((s) => Math.abs(s - x) < 1e-9);
  const T = literal(p.amount) && p.amount > 0 && p.amount <= 1e8 ? p.amount : null;
  let n: number | null = null;
  if (literal(p.period_value) && p.period_unit && p.period_unit in UNIT_DAYS) {
    const d = Math.round(p.period_value * UNIT_DAYS[p.period_unit]!);
    if (d >= 1 && d <= 3650) n = d;
  }
  const ccy = (BILL_CCYS as readonly string[]).includes(p.currency ?? "") ? (p.currency as Bill["ccy"]) : null;
  return T == null && n == null ? null : { T, n, ccy };
}
