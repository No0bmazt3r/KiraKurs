import { test } from "vitest";
import assert from "node:assert/strict";
import data from "../src/usdmyr.json";
import { replay, WINDOWS, LOCK_PREMIUM, DAYS, HISTORY } from "../src/feeday";
import { explainChange, MISSIONS, makeVars, fill, T } from "../src/content";
import * as E from "../src/engine";
import { PRESETS } from "../src/presets";

const R = data.rates as Record<string, number>;
const S2 = PRESETS.snapshot;

test("Fee Day: windows, rates and arithmetic", () => {
  const first = replay(0, 12000, "wait");
  assert.equal(first.start, "2016-01-04");
  assert.equal(first.s0, R["2016-01-04"]);
  assert.ok(first.end >= "2016-09-30");                 // 270 days after 4 Jan 2016
  const last = replay(WINDOWS - 1, 12000, "lock");
  assert.ok(last.end <= "2026-11-06");
  assert.throws(() => replay(WINDOWS, 12000, "lock"));
  assert.ok(Math.abs(LOCK_PREMIUM - (E.parityMap({ ...S2, n: DAYS }).F / S2.S - 1)) < 1e-15);
  for (const k of [0, 500, 1000, WINDOWS - 1]) {
    const w = replay(k, 12000, "wait"), l = replay(k, 12000, "lock"), s = replay(k, 12000, "split");
    assert.equal(w.you, w.wait); assert.equal(l.you, l.lock);
    assert.ok(Math.abs(s.you - (w.wait + w.lock) / 2) < 1e-6);
    assert.ok(Math.abs(w.wait - w.s1 * 12000) < 1e-6);
    assert.ok(Math.abs(w.diff - (w.wait - w.lock)) < 1e-9);
    const days = (Date.parse(w.end) - Date.parse(w.start)) / 864e5;
    assert.ok(days >= DAYS && days <= DAYS + 4, `${w.start}→${w.end}`);  // first data day on/after +270
  }
});

test("Kira explains the direction of every change from engine output", () => {
  const up = explainChange(S2, { ...S2, piH: 0.04 })!;
  assert.equal(up.key, "piH");
  assert.match(up.text, /^You raised Malaysian inflation to 4\.00%\. Bank lock: RM 4\.0240 \(no change\)\. Prices theory: RM 4\.0[0-9]{3} \(up\)/);
  assert.match(up.why, /more ringgit per dollar/);
  const iF = explainChange(S2, { ...S2, iF: 0.05 })!;
  assert.match(iF.text, /You raised US interest to 5\.00%\. Bank lock: RM [0-9.]+ \(down\)/);
  assert.equal(explainChange(S2, { ...S2 }), null);
});

test("equal rates read correctly (panel J1 defect 1)", () => {
  const v = makeVars({ ...S2, iF: S2.iH, piF: S2.piH });
  assert.match(fill(T["map.card.fwd.s"]!, v), /because both countries pay the same interest\.$/);
  assert.match(fill(T["map.card.ppp.s"]!, v), /^Prices rise at the same pace in both countries \(1\.80%\)/);
});

test("missions start unsolved on the Snapshot and each can be solved", () => {
  const ctx = (inp: E.Inputs, linked = false, rounds = 0) => ({ inp, base: S2, linked, rounds });
  for (const m of MISSIONS) assert.equal(m.done(ctx(S2)), false, m.id);
  const by = Object.fromEntries(MISSIONS.map((m) => [m.id, m]));
  assert.ok(by.irp!.done(ctx({ ...S2, iH: 0.05 })));
  assert.ok(by.ppp!.done(ctx({ ...S2, piH: 0.05 })));
  assert.ok(by.breakeven!.done(ctx({ ...S2, piH: E.breakEvenPiH(S2) })));
  assert.ok(by.fisher!.done(ctx(E.linkRates(S2, { piH: 0.03 }), true)));
  assert.ok(by.risk!.done(ctx(S2, false, 3)));
  for (const m of MISSIONS) for (const h of [m.goal, ...m.hints, T[m.maths]!]) assert.ok(!fill(h, makeVars(S2)).includes("?"), m.id);
});

test("welcome history: month-end series spans the data and brackets every month", () => {
  const { months, first, last, lo, hi } = HISTORY;
  assert.equal(months[months.length - 1]!.d, last);
  assert.ok(first <= months[0]!.d && months.length > 100);
  for (const m of months) assert.ok(m.r >= lo.r && m.r <= hi.r);
  assert.ok(lo.r < hi.r);
});

test("extra dated snapshots: S is the ECB reference rate on the snapshot date, bands are full precision", () => {
  const rates = (data as { rates: Record<string, number> }).rates;
  for (const [id, iso] of [["snap2025", "2025-11-06"], ["snap2024", "2024-02-20"]] as const) {
    const p = PRESETS[id];
    assert.equal(p.S, rates[iso], id);
    assert.ok(p.q10! < 0 && p.q90! > 0 && String(p.q10).length > 12, id);
  }
});
