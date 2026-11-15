// App state + subscribe + localStorage (docs/ARCHITECTURE.md §3). Also turns raw input strings into engine inputs.
import { validate, nominalFromReal, realRate } from "./engine.mjs";
import { PRESETS } from "./presets.js";
import { toPctInput } from "./format.js";

const KEY = "kirakurs:v1";
const PERSIST = ["progress", "quiz", "theme", "unlocked"];

export function rawFromPreset(p) {
  return { S: String(p.S), T: String(p.T), n: String(p.n), iH: toPctInput(p.iH), iF: toPctInput(p.iF),
    piH: toPctInput(p.piH), piF: toPctInput(p.piF), margin: "0", h: "0", rH: "", rF: "" };
}

function randomForm() {
  try { return crypto.getRandomValues(new Uint8Array(1))[0] % 2 ? "B" : "A"; } catch { return Math.random() < 0.5 ? "A" : "B"; }
}

export const state = {
  preset: "snapshot",
  raw: rawFromPreset(PRESETS.snapshot),
  edited: false,
  linked: false,
  progress: { precheck: false, learn: false, predict: null, check: false },
  quiz: { form: randomForm(), pre: null, post: null, changedDecision: null },
  theme: "system",
  unlocked: false,
  dismissedReveal: false,
};

try {
  const saved = JSON.parse(localStorage.getItem(KEY) || "null");
  if (saved) for (const k of PERSIST) if (saved[k] !== undefined) state[k] = saved[k];
} catch { /* storage blocked: works, not remembered */ }

const subs = new Set();
export const subscribe = (fn) => (subs.add(fn), () => subs.delete(fn));

export function set(patch) {
  Object.assign(state, patch);
  try { localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(PERSIST.map((k) => [k, state[k]])))); } catch { /* ignore */ }
  for (const fn of subs) fn(state);
}

export function setRaw(patch) { set({ raw: { ...state.raw, ...patch }, edited: true }); }

export function setPreset(id) {
  set({ preset: id, raw: rawFromPreset(PRESETS[id]), edited: false, linked: false });
}

export function setLinked(on) {
  const r = state.raw, out = { ...r };
  if (on) {
    const v = validate({ iH: r.iH, iF: r.iF, piH: r.piH, piF: r.piF });
    if (!v.ok) return;
    out.rH = toPctInput(realRate(v.values.iH, v.values.piH));
    out.rF = toPctInput(realRate(v.values.iF, v.values.piF));
  } else {
    const cur = inputs();
    out.iH = toPctInput(cur.inp.iH); out.iF = toPctInput(cur.inp.iF);   // keep the last derived values as editable
  }
  set({ linked: on, raw: out });
}

export function clearData() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  set({ progress: { precheck: false, learn: false, predict: null, check: false },
    quiz: { form: randomForm(), pre: null, post: null, changedDecision: null }, unlocked: false });
}

// raw strings → validated engine input. Keeps the last valid input so cards can stay visible (dimmed) on errors.
let lastValid = null;
export function inputs(s = state) {
  const p = PRESETS[s.preset];
  const keys = ["S", "T", "n", "piH", "piF", "margin", "h", ...(s.linked ? ["rH", "rF"] : ["iH", "iF"])];
  const v = validate(Object.fromEntries(keys.map((k) => [k, s.raw[k]])));
  if (v.ok) {
    const x = v.values;
    const inp = { ...p, ...x, kind: p.kind, ccy: p.ccy, q10: p.q10, q90: p.q90 };
    if (s.linked) { inp.iH = nominalFromReal(x.rH, x.piH); inp.iF = nominalFromReal(x.rF, x.piF); }
    lastValid = inp;
  }
  return { ok: v.ok, inp: lastValid ?? { ...p }, errors: v.errors, hints: v.hints };
}
