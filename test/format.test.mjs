import { test } from "node:test";
import assert from "node:assert/strict";
import * as f from "../js/format.js";

test("parsing percent strings", () => {
  assert.equal(f.parsePct("2,75"), 0.0275);
  assert.equal(f.parsePct("3.875%"), 0.03875);
  assert.equal(f.parsePct(" 1.8 "), 0.018);
  assert.equal(f.parsePct("−1"), -0.01);
  assert.ok(Number.isNaN(f.parsePct("abc")));
  assert.equal(f.toPctInput(0.03875), "3.875");
  assert.equal(f.toPctInput(0.049705), "4.9705");
});

test("RM grouping, decimals and signs", () => {
  assert.equal(f.rm(47328.1), "RM 47,328");
  assert.equal(f.rm(47328.1, 2), "RM 47,328.10");
  assert.equal(f.signedRM(382.78), "+RM 383");
  assert.equal(f.signedRM(-265.42), "−RM 265");
  assert.equal(f.signedRM(-265.42, 2), "−RM 265.42");
  assert.equal(f.signedRM(0.2), "RM 0");
  assert.equal(f.rm(-34.08, 2), "−RM 34.08");
});

test("rates, percentages, pp", () => {
  assert.equal(f.fx(4.02399), "4.02");
  assert.equal(f.fx(4.02399, 4), "4.0240");
  assert.equal(f.pct(-0.018322), "−1.83%");
  assert.equal(f.pct(-0.018322, 4), "−1.8322%");
  assert.equal(f.signedPct(0.010547), "+1.05%");
  assert.equal(f.pct(-0.00001), "0.00%");
  assert.equal(f.pp(0.7492, 4), "0.7492 pp");
  assert.equal(f.pp(0.7492), "0.75 pp");
});
