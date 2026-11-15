import { test } from "vitest";
import assert from "node:assert/strict";
import { T, L, TIPS, QUIZ, ASK, ASK_UI, SOURCES, MISSIONS, makeVars, fill, tipParts } from "../src/content";
import { PRESETS } from "../src/presets";

// Every copy string, with its key, flattened.
const all: [string, string][] = [];
const walk = (key: string, v: unknown): void => {
  if (typeof v === "string") all.push([key, v]);
  else if (Array.isArray(v)) v.forEach((x, i) => walk(`${key}[${i}]`, x));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) walk(`${key}.${k}`, x);
};
walk("T", T); walk("L", L); walk("MISSIONS", MISSIONS.map(({ done, ...m }) => m)); walk("TIPS", TIPS); walk("QUIZ", QUIZ); walk("ASK", ASK); walk("ASK_UI", ASK_UI); walk("SOURCES", SOURCES);

test("wording guard: no today/current/latest/live (except 'not live')", () => {
  for (const [k, s] of all) {
    const bad = s.replace(/not live/gi, "").match(/\b(today|today's|current|currently|latest|live)\b/i);
    assert.equal(bad, null, `${k}: "${s}"`);
  }
});

test("wording guard: 'now' near Snapshot values only as 'set aside now' / 'convert now'", () => {
  for (const [k, s] of all) {
    if (!s.includes("{{")) continue; // only strings that can show a Snapshot value
    const rest = s.replace(/set aside (\{\{\s*\w+\s*\}\} )?now/gi, "").replace(/convert now/gi, "");
    assert.ok(!/\bnow\b/i.test(rest), `${k}: "${s}"`);
  }
});

test("every {{placeholder}} resolves for both presets", () => {
  for (const p of Object.values(PRESETS)) {
    const v = makeVars({ ...p, h: 0.5 });
    for (const [k, s] of all) {
      if (/coach\.(verdict|split\.c)$|\.lo|hi/.test(k) && !p.q10) continue; // range copy is not used without a range
      const out = fill(s, v, (name) => assert.fail(`${p.id} ${k}: unresolved {{${name}}}`));
      assert.ok(!out.includes("{{"), k);
      if (s.includes("{{")) assert.ok(!/NaN|undefined|Infinity/.test(out), `${p.id} ${k}: ${out}`);
    }
  }
});

test("tooltips ≤ 15 words; card sentences ≤ 30 words", () => {
  for (const [id, s] of Object.entries(TIPS)) assert.ok(s.split(/\s+/).length <= 15, `tip ${id}`);
  for (const [k, s] of Object.entries(T)) {
    if (!/^map\.card\..*\.s$/.test(k)) continue;
    const v = makeVars(PRESETS.snapshot);
    for (const sentence of fill(s, v).split(/(?<=[.!?])\s+/)) assert.ok(sentence.split(/\s+/).length <= 30, `${k}: ${sentence}`);
  }
});

test("glossary markup points at real tooltips", () => {
  for (const [k, s] of all) for (const p of tipParts(s)) if (typeof p === "object") assert.ok(TIPS[p.tip], `${k}: ${p.tip}`);
});

test("snapshot copy shows the golden numbers", () => {
  const v = makeVars(PRESETS.snapshot);
  assert.equal(fill("{{A}} {{C_ppp}} {{lo}} {{hi}} {{F.4}} {{EPPP.4}}", v), "RM 47,328 RM 47,063 RM 44,292 RM 50,987 4.0240 4.0014");
  assert.equal(fill("{{lessMore diff.ppp}} / {{lessMore diff.rw}}", v), "RM 265 less / RM 383 more");
  assert.equal(fill("{{rH}} {{rF}} {{be}}", v), "0.93% 0.17% 2.58%");
  assert.equal(fill("{{rateDate}}", makeVars(PRESETS.classroom)), "starting");
});

test("quiz forms are complete", () => {
  for (const F of ["A", "B"] as const) {
    assert.equal(QUIZ[F].length, 8);
    for (const q of QUIZ[F]) {
      const ids = q.options.map((o) => o[0]);
      if (q.pick2) assert.ok(q.correctSet!.every((c) => ids.includes(c)));
      else {
        assert.ok(ids.includes(q.correct!), `${F}${q.id}`);
        for (const id of ids) if (id !== q.correct) assert.ok((q.fb as Record<string, string>)[id], `${F}${q.id} feedback for ${id}`);
      }
    }
  }
});
