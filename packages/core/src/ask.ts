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
