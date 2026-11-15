// Preset data (docs/ENGINE.md §9). Decimals. Never edit a dated preset in place: add a new dated id instead.
// Every dated value is sourced in docs/SOURCES.md §F; q10/q90 come from ../evidence/fx/band.py (full precision).
import type { Inputs } from "./engine";

export type PresetId = "classroom" | "snapshot" | "snap2025" | "snap2024";
export type Preset = Inputs & {
  id: PresetId; label: string; kind: "illustrative" | "dated"; badge: string; q10: number | null; q90: number | null;
  k: number;            // scenario number shown to learners
  date: string;         // short date used in copy ("the 6 Nov rate"); "starting" for illustrative
  chip: string;         // top-bar chip
  blurb: string;        // one line in the picker: why this scenario is worth looking at
};

export const PRESETS: Record<PresetId, Preset> = {
  classroom: {
    id: "classroom", k: 1, label: "Scenario 1 · Classroom", kind: "illustrative", ccy: "USD",
    S: 4.50, T: 12000, n: 365, iH: 0.03, iF: 0.045, piH: 0.02, piF: 0.03, q10: null, q90: null,
    badge: "Classroom: illustrative numbers", date: "starting", chip: "Classroom",
    blurb: "Round, made-up numbers for practising the formulas by hand.",
  },
  snapshot: {
    id: "snapshot", k: 2, label: "Scenario 2 · Snapshot 6 Nov 2026", kind: "dated", ccy: "USD",
    S: 4.0565, T: 12000, n: 270, iH: 0.0275, iF: 0.03875, piH: 0.018, piF: 0.037, q10: -0.07166234059361243, q90: 0.06866828786747892, // full precision from evidence/fx/band.py
    badge: "Snapshot: FX 6 Nov · OPR 5 Nov · Fed 28 Oct · CPI Sep 2026 (released Oct) · not live", date: "6 Nov", chip: "Snapshot 6 Nov 2026",
    blurb: "Aina's decision on the latest frozen data. US prices rise faster than Malaysia's.",
  },
  snap2025: {
    id: "snap2025", k: 3, label: "Scenario 3 · Snapshot 6 Nov 2025", kind: "dated", ccy: "USD",
    // FX: ECB reference cross 6 Nov 2025. OPR 2.75% (BNM MPS 6 Nov 2025). Fed 3.75–4.00% (FOMC 29 Oct 2025).
    // CPI Sep 2025: Malaysia 1.5% (DOSM, 22 Oct 2025), US 3.0% (BLS, 24 Oct 2025). Band: windows ended by 6 Nov 2025.
    S: 4.183, T: 12000, n: 270, iH: 0.0275, iF: 0.03875, piH: 0.015, piF: 0.03, q10: -0.06678927065578188, q90: 0.07069540672312047,
    badge: "Snapshot: FX 6 Nov 2025 (ECB) · OPR 6 Nov · Fed 29 Oct · CPI Sep 2025 (released Oct) · not live", date: "6 Nov 2025", chip: "Snapshot 6 Nov 2025",
    blurb: "The same day one year earlier: same interest rates, but the ringgit was weaker (RM 4.18).",
  },
  snap2024: {
    id: "snap2024", k: 4, label: "Scenario 4 · Snapshot 20 Feb 2024", kind: "dated", ccy: "USD",
    // FX: ECB reference cross 20 Feb 2024, the weakest ringgit in the 2016–2026 data. OPR 3.00% (BNM MPS 24 Jan 2024).
    // Fed 5.25–5.50% (FOMC 31 Jan 2024). CPI: Malaysia Dec 2023 1.5% (DOSM, 22 Jan 2024), US Jan 2024 3.1% (BLS, 13 Feb 2024).
    S: 4.7975, T: 12000, n: 270, iH: 0.03, iF: 0.05375, piH: 0.015, piF: 0.031, q10: -0.06370023419203763, q90: 0.07589400565989202,
    badge: "Snapshot: FX 20 Feb 2024 (ECB) · OPR 24 Jan · Fed 31 Jan · CPI MY Dec 2023, US Jan 2024 · not live", date: "20 Feb 2024", chip: "Snapshot 20 Feb 2024",
    blurb: "The weakest ringgit in ten years, when US interest was far above Malaysia's.",
  },
};
export const PRESET_IDS = Object.keys(PRESETS) as PresetId[];
export const isPreset = (x: unknown): x is PresetId => typeof x === "string" && x in PRESETS;
