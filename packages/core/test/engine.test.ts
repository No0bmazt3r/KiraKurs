import { test } from "vitest";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import * as E from "../src/engine";
import { PRESETS } from "../src/presets";

const r = (x: number, dp: number) => Number(x.toFixed(dp));
const pct = (x: number, dp = 4) => r(x * 100, dp);
const close = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a / b - 1) < tol, `${a} vs ${b}`);
const C1 = PRESETS.classroom, S2 = PRESETS.snapshot;

test("G1–G7 panel golden cases", () => {
  const F = E.forward({ S: 4.5, iH: 0.03, iF: 0.045, t: 1 });
  assert.equal(r(F, 4), 4.4354);
  assert.equal(pct(E.premium(F, 4.5)), -1.4354);
  assert.equal(r(E.forwardBank({ S: 4.5, iH: 0.03, iF: 0.045, n: 90 }), 4), 4.4829);
  const e3 = E.pppChange({ piH: 0.02, piF: 0.03, t: 1 });
  assert.equal(pct(e3), -0.9709);
  assert.equal(r(4.5 * (1 + e3), 4), 4.4563);
  const e4 = E.pppChange({ piH: 0.05, piF: 0.03, t: 1 });
  assert.equal(pct(e4), 1.9417);
  assert.equal(r(4.5 * (1 + e4), 4), 4.5874);
  assert.equal(pct(E.pppChange({ piH: 0.02, piF: 0.03, t: 3 })), -2.8844);
  assert.equal(pct(E.ifeChange({ iH: 0.03, iF: 0.045, t: 1 })), -1.4354);
  assert.equal(pct(E.realRate(0.03, 0.02)), 0.9804);
});

test("Scenario 1 classroom (t = 1)", () => {
  const m = E.parityMap(C1);
  assert.equal(r(m.F, 4), 4.4354);
  assert.equal(pct(m.premium), -1.4354);
  assert.equal(pct(m.ePPP), -0.9709);
  assert.equal(r(m.EPPP, 4), 4.4563);
  assert.equal(pct(m.eIFE), -1.4354);
  assert.equal(pct(m.rH), 0.9804);
  assert.equal(pct(m.rF), 1.4563);
  assert.equal(E.coach(C1).range, null);
});

test("Scenario 2 snapshot, 1 year", () => {
  const m = E.parityMap(S2, 365);
  assert.equal(r(m.F, 4), 4.0126);
  assert.equal(pct(m.premium), -1.083);
  assert.equal(pct(m.ePPP), -1.8322);
  assert.equal(r(m.EPPP, 4), 3.9822);
  assert.equal(pct(m.eIFE), -1.083);
  assert.equal(r(m.EIFE, 4), 4.0126);
  assert.equal(pct(m.rH), 0.9332);
  assert.equal(pct(m.rF), 0.1688);
  assert.equal(r(m.parityGapPP, 4), 0.7492);
  assert.equal(r(m.realGapPP, 4), 0.7644);
  assert.equal(pct(E.breakEvenPiH(S2)), 2.5769);
});

test("Scenario 2 snapshot, 270 days", () => {
  const m = E.parityMap(S2);
  assert.equal(r(m.F, 4), 4.024);
  assert.equal(r(m.bankF, 4), 4.0221);
  assert.equal(r(m.EPPP, 4), 4.0014);
  const c = E.coach(S2);
  assert.equal(r(c.spotRef, 2), 48678);
  assert.equal(r(c.A, 2), 47328.1);
  assert.equal(r(c.B, 2), 47328.1);
  assert.equal(r(c.C.ife, 2), 47328.1);
  assert.equal(r(c.spotRef - c.A, 2), 1349.9);
  assert.equal(r(c.C.ppp, 2), 47062.68);
  assert.equal(r(c.diff.ppp, 2), -265.42);
  assert.equal(r(c.C.rw, 2), 47710.88);
  assert.equal(r(c.diff.rw, 2), 382.78);
  assert.equal(r(c.range!.lo, 2), 44291.8);
  assert.equal(r(c.range!.hi, 2), 50987.1);
  assert.equal(c.rule, "wait");
  const s = E.coach({ ...S2, h: 0.5 }).split;
  assert.equal(r(s.expected, 2), 47195.39);
  assert.equal(r(s.lo!, 2), 45809.95);
  assert.equal(r(s.hi!, 2), 49157.6);
  const mg = E.coach({ ...S2, margin: 0.0011 });
  assert.equal(r(mg.A, 2), 47380.16);
  assert.equal(r(mg.A - c.A, 2), 52.06);
  const al = E.allowance(S2, 1500);
  assert.equal(r(al.usd, 2), 1540.86);
  assert.equal(r(al.EPPP, 4), 4.0014);
  assert.equal(r(al.rmPPP, 2), 6165.58);
  assert.equal(r(al.naive, 2), 6250.5);
  assert.equal(r(al.A, 2), 6077.17);
  assert.equal(r(al.C, 2), 6043.08);
  assert.equal(r(al.diff, 2), -34.08);
});

test("Sensitivity 1 (unlinked, n = 270)", () => {
  const rows = E.sensitivity(S2, [0.01, 0.018, 0.03, 0.04, 0.05]);
  const want = [
    [1.7327, 46788.82, -539.28], [0.9332, 47062.68, -265.42], [-0.2427, 47472.43, 144.33],
    [-1.2019, 47812.94, 484.84], [-2.1429, 48152.6, 824.5],
  ];
  rows.forEach((row, k) => {
    assert.equal(pct(row.rH), want[k][0]);
    assert.equal(r(row.Cppp, 2), want[k][1]);
    assert.equal(r(row.diff, 2), want[k][2]);
  });
});

test("Sensitivity 2 (linked, πH 1.8% → 4.0%)", () => {
  const L = E.linkRates(S2, { piH: 0.04 });
  assert.equal(pct(L.iH), 4.9705);
  assert.equal(pct(E.realRate(L.iH, L.piH)), 0.9332);
  const m1 = E.parityMap(L, 365);
  assert.equal(r(m1.F, 4), 4.0993);
  assert.equal(pct(m1.premium), 1.0547);
  assert.equal(pct(m1.ePPP), 0.2893);
  assert.equal(r(m1.EPPP, 4), 4.0682);
  assert.equal(pct(m1.eIFE), 1.0547);
  assert.equal(r(m1.parityGapPP, 4), 0.7654);
  assert.equal(r(E.coach(L).diff.ppp, 2), -265.42);
});

// Seeded PRNG so the identity grid is reproducible.
function mulberry32(a: number) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const rand = mulberry32(42);
const u = (lo: number, hi: number) => lo + (hi - lo) * rand();
const GRID = Array.from({ length: 200 }, () => ({
  S: u(0.5, 10), T: u(100, 100000), n: 0, iH: u(-0.01, 0.15), iF: u(-0.01, 0.15),
  piH: u(-0.02, 0.12), piF: u(-0.02, 0.12), q10: -0.07, q90: 0.07, margin: u(0, 0.02), h: 0,
}));
const NS = [1, 90, 270, 365, 1000];

test("ENGINE §8 identities on 200 random inputs × 5 horizons", () => {
  let checks = 0;
  for (const base of GRID) for (const n of NS) {
    const inp = { ...base, n };
    const m = E.parityMap(inp), c = E.coach(inp);
    close(c.A, c.B);                                                       // 1
    close(m.EIFE, m.F);                                                    // 2
    const eq = { ...inp, iF: E.nominalFromReal(E.realRate(inp.iH, inp.piH), inp.piF) };
    const me = E.parityMap(eq); close(me.EPPP, me.EIFE);                   // 3
    close((1 + m.eIFE) / (1 + m.ePPP), ((1 + m.rH) / (1 + m.rF)) ** m.t);  // 4
    if (Math.abs(m.rH - m.rF) > 1e-6)
      assert.equal(Math.sign(c.diff.ppp), -Math.sign(m.rH - m.rF));        // 5
    const be = E.coach({ ...inp, piH: E.breakEvenPiH(inp) }); close(be.C.ppp, be.A);
    const al = E.allowance(inp, 1500);                                     // 6
    close(al.rmPPP, inp.S * al.usd * (1 + E.pppChange({ ...inp, t: m.t })) * (1 + inp.margin));
    close(al.rmPPP / (1 + inp.margin), inp.S * 1500 * (1 + inp.piH) ** m.t);
    if (Math.abs(m.rH - m.rF) > 1e-6) assert.equal(Math.sign(al.diff), -Math.sign(m.rH - m.rF));
    const s0 = E.coach({ ...inp, h: 0 }).split, s1 = E.coach({ ...inp, h: 1 }).split;  // 7
    const sh = E.coach({ ...inp, h: 0.3 }).split;
    close(s0.expected, c.C.ppp); close(s1.lo!, c.A); close(s1.hi!, c.A);
    close(sh.hi! - sh.lo!, 0.7 * (s0.hi! - s0.lo!));
    const L = E.linkRates(inp, { piH: inp.piH + 0.02 });                  // 8
    close(E.coach(L).diff.ppp, c.diff.ppp, 1e-7);
    if (n < 365) assert.notEqual(E.forwardBank({ ...inp, n }), m.F);      // 9
    assert.ok(E.allFinite(c) && E.allFinite(m));
    checks++;
  }
  assert.equal(checks, 1000);
});

test("validate(): rules, messages, hints", () => {
  const ok = E.validate({ S: "4.0565", T: "12,000", n: "270", iH: "2,75", iF: "3.875%", piH: "1.8", piF: "−1", margin: "0.11", h: "50" });
  assert.equal(ok.ok, true);
  assert.deepEqual(ok.values, { S: 4.0565, T: 12000, n: 270, iH: 0.0275, iF: 0.03875, piH: 0.018, piF: -0.01, margin: 0.0011, h: 0.5 });
  const bad = (raw: Record<string, string>) => E.validate(raw).errors[Object.keys(raw)[0]!];
  for (const s of ["", "abc", "1.2.3", "NaN", "Infinity"]) assert.equal(bad({ iH: s }), "Enter a number.");
  assert.equal(bad({ S: "0" }), "Exchange rate must be above 0 and at most 1,000.");
  assert.equal(bad({ S: "1001" }), "Exchange rate must be above 0 and at most 1,000.");
  assert.equal(bad({ T: "-150" }), "Amount must be above 0 and at most 100,000,000.");
  assert.equal(bad({ n: "270.5" }), "Days must be a whole number from 1 to 3,650.");
  assert.equal(bad({ n: "3651" }), "Days must be a whole number from 1 to 3,650.");
  assert.equal(bad({ piH: "-100" }), "Inflation must be above −100%.");
  assert.equal(bad({ iF: "-150" }), "Interest rate must be above −100%.");
  assert.equal(bad({ iH: "101" }), "Above 100% a year is outside this teaching model.");
  assert.equal(bad({ margin: "11" }), "Bank margin must be between 0% and 10%.");
  const h = E.validate({ iH: "0.03" });
  assert.equal(h.ok, true);
  assert.equal(h.hints.iH, "Did you mean 3%? (Ignore if you meant it.)");
  assert.equal(E.validate({ iH: "0" }).hints.iH, undefined);
  assert.equal(bad({ h: "150" }), "Split must be between 0% and 100%.");
  assert.equal(bad({ h: "-10" }), "Split must be between 0% and 100%.");
  assert.equal(E.validate({ h: "100" }).values?.h, 1);
  assert.equal(E.validate({ iF: "-99.99" }).hints.iF, "This is far outside normal rates, so results may be extreme.");
  assert.equal(E.validate({ piH: "60" }).hints.piH, "This is far outside normal rates, so results may be extreme.");
  assert.equal(E.validate({ piH: "4" }).hints.piH, undefined);
  assert.equal(E.validate({ iH: "-150", S: "4" }).values, undefined);
});

test("version guard: engine hash changes need a version bump", () => {
  const url = new URL("../src/engine.ts", import.meta.url);
  const sha256 = createHash("sha256").update(readFileSync(url)).digest("hex");
  const pinned = JSON.parse(readFileSync(new URL("./engine.version.json", import.meta.url), "utf8"));
  assert.equal(pinned.version, E.ENGINE_VERSION, "engine.version.json version must equal ENGINE_VERSION");
  assert.equal(pinned.sha256, sha256, "engine.ts changed: bump ENGINE_VERSION and update engine.version.json");
});
