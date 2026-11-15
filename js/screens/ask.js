// "Ask KiraKurs" (stretch, idea.md §10). The Worker returns only an explanation id; we fill our own template.
import { T, ASK, ASK_UI, fill, makeVars } from "../content.js";
import { ASK_URL, MAX_LEN, piiBlocked } from "../ask-core.js";
import { h, openSheet } from "../ui.js";
import { icon } from "../icons.js";
import { inputs } from "../store.js";

export function askButton() {
  if (!ASK_URL) return null;
  return h("button", { class: "btn secondary", type: "button", onclick: (e) => openSheet(ASK_UI.title, body, e.currentTarget) }, icon("ask"), ASK_UI.btn);
}

function body() {
  const v = makeVars(inputs().inp);
  const answer = h("div", { class: "stack", "aria-live": "polite" });
  const ta = h("textarea", { id: "askQ", maxlength: MAX_LEN, "aria-describedby": "askNotice" });
  const show = (id) => {
    if (id === "menu" || !ASK[id]) {
      answer.replaceChildren(h("p", { class: "label", text: ASK_UI.menu }), h("div", { class: "options" },
        Object.entries(ASK).map(([k, x]) => h("button", { class: "option", type: "button", text: x.q, onclick: () => show(k) }))));
      return;
    }
    answer.replaceChildren(h("div", { class: "callout" }, h("h3", { text: ASK[id].q }), h("p", { text: fill(ASK[id].a, v) }),
      h("p", { class: "caption" }, icon("ok"), " " + ASK_UI.chip)));
  };
  const send = h("button", { class: "btn primary", type: "submit", text: ASK_UI.send });
  const form = h("form", { class: "stack", onsubmit: async (e) => {
    e.preventDefault();
    const q = ta.value.trim().slice(0, MAX_LEN);
    if (!q) return show("menu");
    if (piiBlocked(q)) { answer.replaceChildren(h("p", { class: "field-error", text: ASK_UI.pii })); return; }
    send.disabled = true;
    let id = "menu";
    try {
      const res = await fetch(ASK_URL, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question: q }),
        signal: AbortSignal.timeout(10000) });
      if (res.ok) id = (await res.json()).explanation_id;
    } catch { /* offline, timeout: menu */ }
    send.disabled = false;
    show(id);
  } },
  h("label", { for: "askQ", class: "label", text: ASK_UI.label }), ta,
  h("p", { class: "caption", id: "askNotice", text: ASK_UI.notice }), send);
  return [form, answer];
}
