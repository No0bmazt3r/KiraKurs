// Quiz runner shared by Pre-check and Check (docs/UX-FLOWS.md §2.0, §2.5). Scoring is pure and tested.
import { T, QUIZ, OBJECTIVES, QUIZ_MAX, fill, makeVars } from "../content.js";
import { PRESETS } from "../presets.js";
import { h, choices, feedback } from "../ui.js";
import { icon } from "../icons.js";

export function itemScore(q, answer) {
  if (answer == null) return 0;
  if (q.pick2) {
    const good = answer.filter((a) => q.correctSet.includes(a)).length;
    return Math.max(0, Math.min(2, good - (answer.length - good)));
  }
  return answer === q.correct ? 1 : 0;
}

// answers: { [id]: { answer, confidence } } → { total, perObj: {1..5: [got, max]} }
export function score(form, answers) {
  const items = QUIZ[form];
  const per = {};
  let total = 0;
  for (const [obj, ids] of Object.entries(OBJECTIVES)) {
    let got = 0, max = 0;
    for (const id of ids) {
      const q = items.find((x) => x.id === id);
      const sc = itemScore(q, answers?.[id]?.answer);
      got += sc; max += q.pick2 ? 2 : 1;
    }
    per[obj] = [got, max]; total += got;
  }
  return { total, max: QUIZ_MAX, perObj: per };
}

export const otherForm = (f) => (f === "A" ? "B" : "A");
export const resultCode = (firstForm, pre, post) => `KK-${firstForm}${pre == null ? "x" : pre}-${post}`;

// Mounts one item per view. withFeedback: show right/wrong after each item (post-check only).
export function runQuiz({ form, withFeedback, onDone }) {
  const items = QUIZ[form];
  const v = makeVars(PRESETS.snapshot);
  const ccy = form === "B" ? "£" : "US$";
  const box = h("div", { class: "stack" });
  const answers = {};
  let i = 0;

  function show() {
    const q = items[i];
    let answer = null, confidence = 2;
    const dots = h("div", { class: "row" },
      h("div", { class: "dots", "aria-hidden": "true" }, items.map((_, k) => h("span", { class: k <= i ? "on" : "" }))),
      h("span", { class: "small", text: fill(T["pre.dots"], { s: { qn: String(i + 1), qtotal: String(items.length) }, num: {} }) }));
    const stem = h("h2", { text: fill(q.stem, v).replace("US$1", ccy + "1") });
    const opts = choices({ label: stem.textContent, options: q.options, multi: q.pick2 ? 2 : 1,
      onChange: (a) => { answer = a; next.disabled = q.pick2 ? a.length !== 2 : false; } });
    const conf = choices({ label: T["pre.confidence"], cls: "seg", options: [["1", T["pre.conf1"]], ["2", T["pre.conf2"]], ["3", T["pre.conf3"]]],
      onChange: (c) => (confidence = Number(c)) });
    conf.set("2");
    const fbBox = h("div");
    const next = h("button", { class: "btn primary", type: "button", disabled: true, onclick: () => {
      answers[q.id] = { answer, confidence };
      if (withFeedback && !next.dataset.checked) {
        next.dataset.checked = "1";
        const ok = itemScore(q, answer) === (q.pick2 ? 2 : 1);
        opts.lock(q.pick2 ? q.correctSet : q.correct);
        const msg = q.pick2 ? q.fb : ok ? T["fb.correct"] + "." : q.fb[answer] ?? "";
        fbBox.replaceChildren(feedback(ok, msg).el);
        next.replaceChildren(T["btn.next"], icon("right"));
        return;
      }
      i++;
      if (i < items.length) show(); else onDone(answers);
    } }, withFeedback ? T["btn.check"] : T["btn.next"], withFeedback ? null : icon("right"));
    box.replaceChildren(dots, stem, q.pick2 ? h("p", { class: "small", text: T["pre.pickTwo"] }) : null, opts.el,
      h("p", { class: "label", text: T["pre.confidence"] }), conf.el, fbBox, next);
    stem.setAttribute("tabindex", "-1"); stem.focus?.();
  }
  show();
  return box;
}
