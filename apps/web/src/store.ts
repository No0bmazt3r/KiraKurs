// App state (Zustand) + localStorage (docs/ARCHITECTURE.md §3). Also turns raw input strings into engine inputs.
import { useMemo, type ReactNode, useDeferredValue } from "react";
import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import { validate, nominalFromReal, parityMap, realRate, type Inputs } from "@kirakurs/core/engine";
import { PRESETS, type Preset, type PresetId } from "@kirakurs/core/presets";
import { toPctInput } from "@kirakurs/core/format";
import { makeVars, T } from "@kirakurs/core/content";
import type { Answers, Form } from "@kirakurs/core/quiz";
import type { Round } from "@kirakurs/core/feeday";

export type RawKey = "S" | "T" | "n" | "iH" | "iF" | "piH" | "piF" | "margin" | "h" | "rH" | "rF";
export type Raw = Record<RawKey, string>;
export type Dir = "up" | "down" | "same";

export const rawFromPreset = (p: Preset): Raw => ({
  S: String(p.S), T: String(p.T), n: String(p.n), iH: toPctInput(p.iH), iF: toPctInput(p.iF),
  piH: toPctInput(p.piH), piF: toPctInput(p.piF), margin: "0", h: "0", rH: "", rF: "",
});

function randomForm(): Form {
  try { return crypto.getRandomValues(new Uint8Array(1))[0]! % 2 ? "B" : "A"; } catch { return Math.random() < 0.5 ? "A" : "B"; }
}

export interface State {
  preset: PresetId; raw: Raw; edited: boolean; linked: boolean;
  progress: { precheck: boolean; learn: boolean; predict: Dir | null; check: boolean };
  quiz: { form: Form; pre: Answers | null; post: Answers | null; changedDecision: string | null };
  theme: "system" | "light" | "dark"; unlocked: boolean; dismissedReveal: boolean;
  missions: string[]; rounds: Round[];
  sheet: { title: string; Body: () => ReactNode; trigger: Element | null } | null;
  toast: { msg: string; n: number } | null;
  quizInView: boolean;   // Check's post-quiz is on screen: the Ask bubble steps aside
}

const fresh = () => ({
  progress: { precheck: false, learn: false, predict: null, check: false },
  quiz: { form: randomForm(), pre: null, post: null, changedDecision: null },
  unlocked: false,
  missions: [] as string[],
  rounds: [] as Round[],
});

// Storage blocked (private mode, sandbox): the app works, it just doesn't remember.
const safe: StateStorage = {
  getItem: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  setItem: (k, v) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
  removeItem: (k) => { try { localStorage.removeItem(k); } catch { /* ignore */ } },
};

export const useApp = create<State>()(persist(() => ({
  preset: "snapshot", raw: rawFromPreset(PRESETS.snapshot), edited: false, linked: false,
  ...fresh(), theme: "system", dismissedReveal: false, sheet: null, toast: null, quizInView: false,
} as State), {
  name: "kirakurs:v2",
  storage: createJSONStorage(() => safe),
  partialize: (s) => ({ progress: s.progress, quiz: s.quiz, theme: s.theme, unlocked: s.unlocked, missions: s.missions, rounds: s.rounds }),
}));

export const set = useApp.setState;
const get = useApp.getState;

export const setRaw = (patch: Partial<Raw>) => set((s) => ({ raw: { ...s.raw, ...patch }, edited: true }));
export const setPreset = (id: PresetId) => set({ preset: id, raw: rawFromPreset(PRESETS[id]), edited: false, linked: false });

export function setLinked(on: boolean) {
  const s = get(), r = s.raw, out = { ...r };
  if (on) {
    const v = validate({ iH: r.iH, iF: r.iF, piH: r.piH, piF: r.piF });
    if (!v.ok) return;
    out.rH = toPctInput(realRate(v.values!.iH!, v.values!.piH!));
    out.rF = toPctInput(realRate(v.values!.iF!, v.values!.piF!));
  } else {
    const cur = inputs(s);
    out.iH = toPctInput(cur.inp.iH); out.iF = toPctInput(cur.inp.iF);   // keep the last derived values as editable
  }
  set({ linked: on, raw: out });
}

export function clearData() {
  useApp.persist.clearStorage();
  set(fresh());
}

export const openSheet = (title: string, Body: () => ReactNode, trigger: Element | null = document.activeElement) =>
  set({ sheet: { title, Body, trigger } });
export const toast = (msg: string) => set((s) => ({ toast: { msg, n: (s.toast?.n ?? 0) + 1 } }));

// raw strings → validated engine input. Keeps the last valid input so cards stay visible (dimmed) on errors.
let lastValid: (Inputs & Preset) | null = null;
export function inputs(s: Pick<State, "preset" | "raw" | "linked">) {
  const p = PRESETS[s.preset];
  const keys: RawKey[] = ["S", "T", "n", "piH", "piF", "margin", "h", ...(s.linked ? ["rH", "rF"] as const : ["iH", "iF"] as const)];
  const v = validate(Object.fromEntries(keys.map((k) => [k, s.raw[k]])));
  let ok = v.ok;
  const errors: Record<string, string | undefined> = v.errors;
  if (ok) {
    const x = v.values!;
    const inp = { ...p, ...x } as Inputs & Preset;
    if (s.linked) { inp.iH = nominalFromReal(x.rH!, x.piH!); inp.iF = nominalFromReal(x.rF!, x.piF!); }
    // Each input can be valid on its own yet combine into nonsense (100% interest for 10 years): every reference rate
    // must stay within 0.01×–100× the spot rate, else keep the last sensible result and say why.
    const m = parityMap(inp);
    if ([m.F, m.EPPP, m.EIFE].every((r) => Number.isFinite(r) && r / inp.S > 0.01 && r / inp.S < 100)) lastValid = inp;
    else { ok = false; errors.range = T.outOfRange; }
  }
  return { ok, inp: lastValid ?? { ...p }, errors, hints: v.hints };
}

// Derived data shared by every screen.
// Results are computed from a *deferred* copy of the inputs: sliders and their text boxes (which read the store
// directly) move instantly, while the engine, charts and sentences re-render in the background and are skipped
// if the learner keeps dragging (React 19 useDeferredValue). `pending` is true while results catch up.
export function useData() {
  const now = useApp(useShallow((s) => ({ preset: s.preset, raw: s.raw, linked: s.linked })));
  const s = useDeferredValue(now);
  const pending = s !== now;
  const data = useMemo(() => {
    const r = inputs(s);
    return { ...r, v: makeVars(r.inp), preset: PRESETS[s.preset] };
  }, [s.preset, s.raw, s.linked]);
  return { ...data, pending };
}
export type Data = ReturnType<typeof useData>;
