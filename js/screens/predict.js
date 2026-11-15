// Screen 2: Predict (docs/UX-FLOWS.md §2.2, CONTENT.md §4).
import { T, fill } from "../content.js";
import { h, choices, feedback } from "../ui.js";
import { set, state } from "../store.js";

export const title = "Predict";

export function mount({ go, data }) {
  const v = data().v;
  let pickedId = state.progress.predict;
  const fbBox = h("div");
  const opts = choices({ label: T["predict.h1"], options: ["up", "down", "same"].map((k) => [k, T["predict." + k]]),
    onChange: (id) => { pickedId = id; checkBtn.disabled = false; } });
  const checkBtn = h("button", { class: "btn primary", type: "button", disabled: !pickedId, text: T["btn.check"], onclick: check });

  function check() {
    set({ progress: { ...state.progress, predict: pickedId }, dismissedReveal: false });
    opts.lock("up"); checkBtn.hidden = true;
    const fb = feedback(pickedId === "up", fill(T["predict.fb." + pickedId], v), () => { set({ unlocked: true }); go("map"); });
    fbBox.replaceChildren(fb.el); fb.btn.focus();
  }
  if (pickedId) { opts.set(pickedId); check(); }

  const el = h("div", { class: "screen" },
    h("h1", { text: fill(T["predict.h1"], v) }), opts.el, checkBtn, fbBox, h("p", { class: "caption", text: T["predict.note"] }));
  return { el };
}
