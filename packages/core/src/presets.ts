// Preset data (docs/ENGINE.md §9). Decimals. Never edit `snapshot` in place: add a new dated id instead.
import type { Inputs } from "./engine";

export type PresetId = "classroom" | "snapshot";
export type Preset = Inputs & { id: PresetId; label: string; kind: "illustrative" | "dated"; badge: string; q10: number | null; q90: number | null };

export const PRESETS: Record<PresetId, Preset> = {
  classroom: {
    id: "classroom", label: "Scenario 1 · Classroom", kind: "illustrative", ccy: "USD",
    S: 4.50, T: 12000, n: 365, iH: 0.03, iF: 0.045, piH: 0.02, piF: 0.03, q10: null, q90: null,
    badge: "Classroom: illustrative numbers",
  },
  snapshot: {
    id: "snapshot", label: "Scenario 2 · Snapshot 6 Nov 2026", kind: "dated", ccy: "USD",
    S: 4.0565, T: 12000, n: 270, iH: 0.0275, iF: 0.03875, piH: 0.018, piF: 0.037, q10: -0.07166234059361243, q90: 0.06866828786747892, // full precision from evidence/fx/band.py
    badge: "Snapshot: FX 6 Nov · OPR 5 Nov · Fed 28 Oct · CPI Sep 2026 (released Oct) · not live",
  },
};
export const isPreset = (x: unknown): x is PresetId => x === "classroom" || x === "snapshot";
