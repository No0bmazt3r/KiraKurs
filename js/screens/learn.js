// Screen 1: Learn, Aina's story (docs/UX-FLOWS.md §2.1, CONTENT.md §3). Always uses the Snapshot preset.
import { T, fill, makeVars } from "../content.js";
import { PRESETS } from "../presets.js";
import { h, rich, setText, choices, field, arrow } from "../ui.js";
import { icon } from "../icons.js";
import { set, state } from "../store.js";
import { parsePct } from "../format.js";
import * as f from "../format.js";

export const title = "Learn";
const TARGET = 0.04;

export function mount({ go }) {
  const base = PRESETS.snapshot;
  const v = makeVars(base, { target: TARGET });
  const fl = (k) => fill(T[k], v);
  let shown = state.progress.learn ? 4 : 1;

  const skip = h("button", { class: "btn ghost", type: "button", onclick: () => { set({ unlocked: true }); go("map"); } }, T["learn.skip"], icon("right"));
  const intro = h("div", { class: "card row", style: "flex-wrap:nowrap;align-items:flex-start" },
    h("div", { class: "avatar", "aria-hidden": "true", text: "A" }),
    h("div", { class: "stack" }, h("p", { text: fl("learn.intro") }), h("p", { class: "caption", text: T["persona.tag"] })));
  const objectives = h("details", { class: "maths" }, h("summary", {}, icon("book"), T["learn.objTitle"]),
    h("div", {}, h("ol", {}, T["learn.obj"].map((o) => h("li", { text: o })))));

  const steps = [1, 2, 3, 4].map((k) => h("li", { hidden: k > shown }, rich(fl("learn.step" + k))));
  const nextStep = h("button", { class: "btn secondary", type: "button", onclick: () => {
    shown++; steps[shown - 1].hidden = false; steps[shown - 1].querySelector("p")?.focus?.();
    nextStep.hidden = shown >= 4; task.hidden = shown < 4;
  } }, T["btn.nextStep"]);
  nextStep.hidden = shown >= 4;

  // completion task: commit to a direction, then move the slider
  let committed = null, piH = base.piH;
  const miniV = h("div", { class: "value", text: "?" });
  const miniA = h("div");
  const reveal = h("p", { role: "status" });
  const slider = field({ key: "learnPiH", suffix: "%", slider: { min: 0, max: 6, step: 0.1 }, onInput: (x) => {
    const d = parsePct(x); if (Number.isFinite(d)) { piH = d; renderTask(); }
  } });
  const pick = choices({ label: fl("learn.taskPrompt"), options: [["up", T["learn.taskUp"]], ["down", T["learn.taskDown"]], ["same", T["learn.taskSame"]]],
    onChange: (id) => { if (committed) return; committed = id; pick.lock("up"); renderTask(); } });
  const task = h("section", { class: "card theory", hidden: shown < 4 },
    h("p", { class: "label", text: fl("learn.taskPrompt") }), pick.el, slider.el,
    h("div", { class: "card" }, h("p", { class: "small", text: T["learn.pppMini"] }), miniV, miniA), reveal);

  function renderTask() {
    slider.update(String(Number((piH * 100).toFixed(1))), null, null, T["lbl.piH"]);
    if (!committed) { miniV.textContent = "?"; reveal.textContent = fill(T["learn.taskMove"], v); return; }
    const vv = makeVars({ ...base, piH }, { target: TARGET });
    setText(miniV, "RM " + vv.s["EPPP.4"]);
    miniA.replaceChildren(arrow(vv.results.m.EPPP >= v.results.m.EPPP ? "up" : "down", `${f.signedPct(vv.results.m.EPPP / v.results.m.EPPP - 1)} · ${fill(T.convention, v)}`));
    reveal.textContent = T[committed === "up" ? "learn.revealRight" : "learn.revealWrong"];
  }
  renderTask();

  const el = h("div", { class: "screen" },
    h("header", {}, h("h1", { text: T["learn.h1"] }), skip), intro, objectives,
    h("ol", { class: "steps card" }, steps), nextStep, task);
  return { el };
}
