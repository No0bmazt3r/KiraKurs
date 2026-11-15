// Screen 5: Check: sensitivity table, post-quiz, results + code (docs/UX-FLOWS.md §2.5, CONTENT.md §8).
import { T, fill, makeVars } from "../content.js";
import { h, field, setText, choices, toast, openLimits, openSources, badge } from "../ui.js";
import { icon } from "../icons.js";
import { set, setRaw, state } from "../store.js";
import { sensitivity } from "../engine.mjs";
import * as f from "../format.js";
import { runQuiz, score, otherForm, resultCode } from "./quiz.js";

export const title = "Check";
const ROWS = [0.01, 0.018, 0.03, 0.04, 0.05];

export function mount() {
  const slider = field({ key: "piH", suffix: "%", slider: { min: 0, max: 6, step: 0.01 }, onInput: (x) => setRaw({ piH: x }) });
  const tbody = h("tbody");
  const why = h("p", { class: "small" }), linked = h("p", { class: "small" });
  const table = h("div", { class: "table-wrap" }, h("table", {},
    h("thead", {}, h("tr", {}, T["check.th"].map((t) => h("th", { scope: "col", text: t })))), tbody));

  const quizBox = h("section", { class: "card stack" });
  function renderQuiz() {
    const q = state.quiz;
    if (q.post) return renderResults();
    quizBox.replaceChildren(h("h2", { text: T["check.postTitle"] }), h("p", { text: T["check.postIntro"] }),
      h("button", { class: "btn primary", type: "button", text: T["check.startPost"], onclick: () => {
        quizBox.replaceChildren(runQuiz({ form: otherForm(q.form), withFeedback: true, onDone: (post) => {
          set({ quiz: { ...state.quiz, post }, progress: { ...state.progress, check: true } }); renderResults();
        } }));
      } }));
  }
  function renderResults() {
    const q = state.quiz;
    const pre = q.pre ? score(q.form, q.pre) : null;
    const post = score(otherForm(q.form), q.post);
    const code = resultCode(q.form, pre?.total, post.total);
    const vars = { s: { pre: String(pre?.total ?? ""), post: String(post.total), max: String(post.max) }, num: {} };
    const changed = choices({ label: T["check.changed"], cls: "seg", options: T["check.changedOpts"].map((o) => [o, o]),
      onChange: (c) => set({ quiz: { ...state.quiz, changedDecision: c } }) });
    changed.set(q.changedDecision);
    const bars = h("div", { class: "objbars" }, Object.entries(post.perObj).map(([obj, [got, max]], k) => {
      const pg = pre ? pre.perObj[obj][0] : 0;
      return h("div", { class: "objbar" }, h("span", { text: T["check.objShort"][k] }),
        h("div", { class: "bars", "aria-hidden": "true" }, h("span", { class: "pre", style: `width:${(pg / max) * 100}%` }), h("span", { class: "post", style: `width:${(got / max) * 100}%` })),
        h("span", { class: "num", text: `${pre ? pg + " → " : ""}${got}/${max}` }));
    }));
    const codeEl = h("p", { class: "code", text: code });
    quizBox.replaceChildren(
      h("h2", { text: T["check.changed"] }), changed.el,
      h("p", { class: "value", text: fill(T[pre ? "check.results" : "check.resultsNoPre"], vars) }),
      h("h3", { text: T["check.objTitle"] }), bars,
      h("p", { text: T["check.code"] }), codeEl,
      h("button", { class: "btn secondary", type: "button", onclick: async () => {
        try { await navigator.clipboard.writeText(code); toast(T["toast.copied"]); } catch { toast(T.copyFailed); }
      } }, icon("copy"), T["btn.copy"]),
      h("p", { class: "caption", text: T["check.codeNote"] }),
      h("div", { class: "row" },
        h("button", { class: "btn ghost", type: "button", text: T["limits.title"], onclick: (e) => openLimits(e.currentTarget) }),
        h("button", { class: "btn ghost", type: "button", text: T["sources.title"], onclick: (e) => openSources(e.currentTarget) })));
  }
  renderQuiz();

  const el = h("div", { class: "screen" }, h("h1", { text: T["check.h1"] }),
    h("section", { class: "card" }, slider.el, table, why, linked, badge()), quizBox);

  function update(s, d) {
    const v = makeVars(d.inp);
    slider.update(s.raw.piH, d.errors.piH, d.hints.piH, T["lbl.piH"]);
    const rows = sensitivity(d.inp, [...ROWS, d.inp.piH]);
    const live = rows.pop();
    const tr = (r, here) => h("tr", { class: here ? "here" : "" },
      h("td", {}, f.pct(r.piH, here ? 2 : 1), here ? h("span", { class: "sr-only", text: " " + T["check.youAreHere"] }) : null),
      h("td", { text: f.pct(r.rH) }), h("td", { text: f.rm(r.Cppp) }), h("td", { text: f.signedRM(r.diff) }));
    const all = rows.map((r) => [r, Math.abs(r.piH - live.piH) < 1e-9]);
    if (!all.some(([, here]) => here)) all.push([live, true]);
    all.sort((a, b) => a[0].piH - b[0].piH);
    tbody.replaceChildren(...all.map(([r, here]) => tr(r, here)));
    setText(why, fill(T["check.why"], v)); setText(linked, fill(T["check.linked"], v));
  }
  return { el, update };
}
