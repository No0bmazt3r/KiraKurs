// Screen 0: Pre-check (docs/UX-FLOWS.md §2.0, CONTENT.md §2). No right/wrong shown.
import { T, fill, makeVars } from "../content.js";
import { PRESETS } from "../presets.js";
import { h } from "../ui.js";
import { icon } from "../icons.js";
import { set, state } from "../store.js";
import { runQuiz } from "./quiz.js";

export const title = "Pre-check";

export function mount({ go }) {
  const v = makeVars(PRESETS.snapshot);
  const body = h("div", { class: "stack" });
  const finish = (pre) => {
    set({ quiz: { ...state.quiz, pre }, progress: { ...state.progress, precheck: true } });
    body.replaceChildren(h("p", { class: "value", text: T["pre.done"] }),
      h("button", { class: "btn primary", type: "button", onclick: () => go("learn") }, T["btn.continue"], icon("right")));
    body.querySelector("button").focus();
  };
  const start = () => body.replaceChildren(runQuiz({ form: state.quiz.form, withFeedback: false, onDone: finish }));

  body.append(
    h("p", { class: "banner" }, icon("shield"), T["pre.consent"]),
    h("p", { text: fill(T["pre.lead"], v) }),
    h("div", { class: "row" },
      h("button", { class: "btn primary", type: "button", onclick: start, text: T["btn.start"] }),
      h("button", { class: "btn secondary", type: "button", text: T["btn.skip"], onclick: () => {
        set({ quiz: { ...state.quiz, pre: null }, progress: { ...state.progress, precheck: true } }); go("learn");
      } })));
  return { el: h("div", { class: "screen" }, h("h1", { text: T["pre.h1"] }), body) };
}
