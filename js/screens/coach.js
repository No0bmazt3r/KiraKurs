// Screen 4: Decision Coach (docs/UX-FLOWS.md §2.4, CONTENT.md §7).
import { T, fill, makeVars } from "../content.js";
import { h, badge, field, setText, maths } from "../ui.js";
import { icon } from "../icons.js";
import { set, setRaw } from "../store.js";
import { parseNumber } from "../engine.mjs";
import { chart, chartTable } from "../chart.js";
import { askButton } from "./ask.js";

export const title = "Decision Coach";

export function mount({ maths: openMaths }) {
  const h1 = h("h1", { text: T["coach.h1"] });
  const T0f = { raw: "1500", err: null };

  const lockV = h("div", { class: "value" }), waitV = h("div", { class: "value" });
  const rangeTxt = h("p", { class: "small" });
  const bar = h("div", { class: "rangebar", "aria-hidden": "true" }, h("div", { class: "track" }), h("div", { class: "band" }), h("div", { class: "tick exp" }), h("div", { class: "tick lockt" }));
  const legend = h("p", { class: "caption" });
  const verdict = h("p", {});
  const live = h("p", { class: "sr-only", "aria-live": "polite" });
  const rule = h("p", { class: "small" });
  const reveal = h("div", { class: "callout", hidden: true });

  const tiles = h("div", { class: "decision" },
    h("div", { class: "tile lock" }, h("div", { class: "tile-head" }, icon("lock"), T["coach.lock"]), lockV, h("p", { class: "small", text: T["coach.lock.note"] }), h("p", { class: "caption", text: T["coach.lock.s"] })),
    h("div", { class: "tile wait" }, h("div", { class: "tile-head" }, icon("hourglass"), T["coach.wait"]), waitV, h("p", { class: "small", text: T["coach.wait.note"] }), rangeTxt));

  const split = field({ key: "h", suffix: "%", slider: { min: 0, max: 100, step: 10 }, onInput: (x) => setRaw({ h: x }) });
  const splitCap = h("p", { class: "small" });

  const alField = field({ key: "T0", onInput: (x) => { T0f.raw = x; rerender(); } });
  const al = { s: h("p", { class: "small" }), usd: h("div", { class: "value" }), rm: h("div", { class: "value" }), naive: h("p", { class: "small" }), lw: h("p", {}) };
  const margin = field({ key: "margin", suffix: "%", onInput: (x) => setRaw({ margin: x }) });
  const spot = h("p", { class: "small" });
  const chartBox = h("div", { class: "chart" });
  const chartTitle = h("h2", { class: "card-title", text: T["coach.chart.title"] });
  const mt = { ab: h("p", { class: "formula" }), c: h("p", { class: "formula" }), range: h("p", { class: "formula" }), split: h("p", { class: "formula" }) };
  const mathsEl = maths(T["btn.showMaths"], mt.ab, mt.c, mt.range, mt.split);
  if (openMaths) mathsEl.open = true;

  const el = h("div", { class: "screen" },
    h("header", {}, h1, h("p", { class: "muted", text: T["coach.sub"] })),
    reveal,
    h("section", { class: "card" }, tiles, bar, legend, verdict, live, rule, badge()),
    h("section", { class: "card wait" }, split.el, splitCap, h("p", { class: "caption", text: T["coach.staging"] })),
    h("section", { class: "card" }, chartTitle, chartBox, badge()),
    h("section", { class: "card theory" }, h("h2", { class: "card-title", text: T["coach.al.title"] }), alField.el, al.s,
      h("div", { class: "grid2" }, h("div", {}, h("p", { class: "small", text: T["coach.al.usd"] }), al.usd), h("div", {}, h("p", { class: "small", text: T["coach.al.rm"] }), al.rm)),
      al.naive, al.lw, badge()),
    h("details", { class: "maths" }, h("summary", {}, icon("info"), T["coach.fees"]),
      h("div", {}, margin.el, h("p", { text: T["coach.fees.help"] }), h("p", { text: T["coach.fees.wise"] }))),
    h("p", { class: "small" }, spot),
    mathsEl,
    h("p", { class: "caption", text: T["coach.access"] }),
    h("p", { class: "caption", text: T["coach.disclaimer"] }),
    askButton());

  let last = null, liveTimer = 0;
  const rerender = () => last && update(...last);

  function update(s, d) {
    last = [s, d];
    const T0 = parseNumber(T0f.raw);
    const T0ok = Number.isFinite(T0) && T0 > 0 && T0 <= 1e8;
    const v = makeVars(d.inp, { T0: T0ok ? T0 : 1500 });
    const c = v.results.c, fl = (k) => fill(T[k], v);
    if (!v.finite) { setText(verdict, T.outOfRange); return; }

    setText(lockV, v.s.A); setText(waitV, v.s.C_ppp);
    const hasRange = !!c.range;
    rangeTxt.hidden = !hasRange; bar.hidden = !hasRange; legend.hidden = !hasRange;
    if (hasRange) {
      setText(rangeTxt, fl("coach.range")); setText(legend, fl("coach.rangeLegend"));
      const lo = Math.min(c.range.lo, c.A), hi = Math.max(c.range.hi, c.A), P = (x) => ((x - lo) / (hi - lo)) * 100 + "%";
      const [band, exp, lk] = bar.querySelectorAll(".band, .tick.exp, .tick.lockt");
      band.style.left = P(c.split.lo); band.style.width = `calc(${P(c.split.hi)} - ${P(c.split.lo)})`;
      exp.style.left = P(c.split.expected); lk.style.left = P(c.A);
    }
    const vt = fl(hasRange ? "coach.verdict" : "coach.verdict.noRange");
    setText(verdict, vt);
    clearTimeout(liveTimer); liveTimer = setTimeout(() => (live.textContent = vt), 500);
    setText(rule, v.s.ruleSentence);

    split.update(s.raw.h, d.errors.h, null, T["coach.split"]);
    setText(splitCap, fl(hasRange ? "coach.split.c" : "coach.split.cNoRange"));

    alField.update(T0f.raw, T0ok ? null : T["err.number"], null, fl("coach.al.input"));
    setText(al.s, fl("coach.al.s")); setText(al.usd, v.s["al.usd"]); setText(al.rm, v.s["al.rmPPP"]);
    setText(al.naive, fl("coach.al.naive")); setText(al.lw, fl("coach.al.lw"));
    margin.update(s.raw.margin, d.errors.margin, null, T["lbl.margin"]);
    setText(spot, fl("coach.spot"));

    chartBox.replaceChildren(chart(d.inp, v, chartBox.clientWidth || Math.min(innerWidth - 64, 640)), chartTable(d.inp));
    for (const k of ["ab", "c", "range", "split"]) setText(mt[k], fl("coach.m." + k));
    mt.range.hidden = !hasRange;

    const pr = s.progress.predict;
    reveal.hidden = !pr || s.dismissedReveal;
    if (pr) {
      const yv = makeVars(d.inp, { s: { yourAnswer: T["predict." + pr], rightWrong: T[pr === "up" ? "coach.reveal.right" : "coach.reveal.wrong"] } });
      reveal.replaceChildren(h("p", { text: fill(T["coach.reveal"], yv) }),
        h("button", { class: "btn ghost", type: "button", text: T["btn.close"], onclick: () => set({ dismissedReveal: true }) }));
    }
  }
  return { el, update };
}
