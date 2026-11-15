// Small DOM helpers + components (docs/DESIGN.md §5). Text goes in via textContent only.
import { icon } from "./icons.js";
import { T, TIPS, SOURCES, tipParts } from "./content.js";

export function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs ?? {})) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "text") el.textContent = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (k in el && typeof v !== "string") el[k] = v;
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) el.append(c instanceof Node ? c : String(c));
  return el;
}

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// Set text; flash the element if the value changed (not on first render).
export function setText(el, text) {
  if (el.textContent === text) return;
  const first = !el.dataset.set;
  el.textContent = text;
  el.dataset.set = "1";
  if (!first && !reduced()) { el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash"); }
}

// Copy with [[tip|text]] markup → nodes with glossary buttons. Each tip opens inline below its paragraph.
export function rich(str, tag = "p", attrs = {}) {
  const p = h(tag, attrs);
  let tipBox = null;
  for (const part of tipParts(str)) {
    if (typeof part === "string") { p.append(part); continue; }
    const id = `tip-${part.tip}-${Math.random().toString(36).slice(2, 7)}`;
    const btn = h("button", { class: "term", type: "button", "aria-expanded": "false", "aria-controls": id, text: part.text });
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") === "true";
      tipBox?.remove(); tipBox = null;
      p.querySelectorAll(".term").forEach((b) => b.setAttribute("aria-expanded", "false"));
      if (!open) {
        tipBox = h("span", { class: "tip", id, role: "note", text: TIPS[part.tip] });
        p.after(tipBox);
        btn.setAttribute("aria-expanded", "true");
      }
    });
    btn.addEventListener("keydown", (e) => { if (e.key === "Escape" && tipBox) { tipBox.remove(); tipBox = null; btn.setAttribute("aria-expanded", "false"); } });
    p.append(btn);
  }
  return p;
}

// Data badge: text is refreshed by app.js on every state change (.badge-text).
export function badge() {
  return h("button", { class: "badge", type: "button", onclick: (e) => openSources(e.currentTarget) },
    icon("calendar"), h("span", { class: "badge-text" }));
}

export function card({ title, variant = "neutral", tip }, ...kids) {
  return h("section", { class: `card ${variant}` }, h("h2", { class: "card-title" }, title), ...kids);
}

export function arrow(dir, words) {
  return h("span", { class: "arrow" }, icon(dir === "up" ? "up" : "down"), h("span", { text: words }));
}

// A labelled field that stays in sync with state.raw[key]. Returns { el, update(raw, error, hint, label) }.
let uid = 0;
export function field({ key, label, suffix, slider, readonly = false, onInput }) {
  const id = `f-${key}-${++uid}`;
  const errId = id + "-err";
  const lab = h("label", { for: id, text: label });
  const out = slider ? h("output", { for: id }) : null;
  const num = h("input", { id, type: "text", inputmode: "decimal", autocomplete: "off", readOnly: readonly, "aria-describedby": errId });
  const err = h("div", { class: "field-error", id: errId, "aria-live": "polite" });
  const wrap = h("div", { class: "input-wrap" }, num, suffix ? h("span", { class: "suffix", "aria-hidden": "true", text: suffix }) : null);
  let range = null;
  const el = h("div", { class: `field${readonly ? " readonly" : ""}` }, h("div", { class: "field-head" }, lab, out));
  if (slider) {
    range = h("input", { type: "range", min: slider.min, max: slider.max, step: slider.step, "aria-label": label, disabled: readonly });
    let raf = 0;
    range.addEventListener("input", () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => onInput(range.value)); });
    el.append(h("div", { class: "slider-row" }, range, wrap),
      h("div", { class: "minmax", "aria-hidden": "true" }, h("span", { text: slider.min + (suffix ?? "") }), h("span", { text: slider.max + (suffix ?? "") })));
  } else el.append(wrap);
  num.setAttribute("aria-label", label);
  const commit = () => onInput(num.value);
  num.addEventListener("change", commit);
  num.addEventListener("keydown", (e) => { if (e.key === "Enter") commit(); });
  el.append(err);
  return {
    el,
    update(raw, error, hint, newLabel) {
      if (newLabel) { lab.textContent = newLabel; num.setAttribute("aria-label", newLabel); range?.setAttribute("aria-label", newLabel); }
      if (document.activeElement !== num) num.value = raw;
      if (range && document.activeElement !== range) { const x = Number(raw); if (Number.isFinite(x)) range.value = x; }
      if (range) range.setAttribute("aria-valuetext", `${lab.textContent} ${raw}${suffix === "%" ? " percent" : ""}`);
      if (out) out.textContent = raw + (suffix === "%" ? "%" : "");
      el.classList.toggle("invalid", !!error);
      num.setAttribute("aria-invalid", error ? "true" : "false");
      err.className = error ? "field-error" : "field-hint";
      err.replaceChildren(...(error ? [icon("no"), error] : hint ? [hint] : []));
    },
  };
}

// Radio-like option list. options: [[id, text]]. multi: max picks (pick-two).
export function choices({ options, label, multi = 1, onChange, cls = "option" }) {
  const group = h("div", { class: cls === "option" ? "options" : "segmented", role: multi > 1 ? "group" : "radiogroup", "aria-label": label });
  let picked = [];
  const btns = options.map(([id, text]) => h("button", {
    class: cls === "option" ? "option" : "", type: "button", role: multi > 1 ? "checkbox" : "radio", "aria-checked": "false", "data-id": id, text,
    onclick: () => {
      if (multi > 1) picked = picked.includes(id) ? picked.filter((x) => x !== id) : [...picked, id].slice(-multi);
      else picked = [id];
      sync(); onChange?.(multi > 1 ? picked : id);
    },
  }));
  const sync = () => btns.forEach((b) => b.setAttribute("aria-checked", String(picked.includes(b.dataset.id))));
  if (multi === 1) group.addEventListener("keydown", (e) => {   // arrow keys move within a radio group
    const i = btns.indexOf(document.activeElement); if (i < 0) return;
    const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]; if (!d) return;
    e.preventDefault(); btns[(i + d + btns.length) % btns.length].focus();
  });
  group.append(...btns);
  return {
    el: group, btns,
    set(v) { picked = v == null ? [] : [].concat(v); sync(); },
    lock(correct) {
      btns.forEach((b) => { b.disabled = true; const id = b.dataset.id;
        if ([].concat(correct).includes(id)) b.classList.add("correct"); else if (picked.includes(id)) b.classList.add("wrong"); });
    },
  };
}

export function feedback(ok, sentence, onContinue, continueText = T["btn.continue"]) {
  const btn = onContinue ? h("button", { class: "btn primary", type: "button", onclick: onContinue }, continueText, icon("right")) : null;
  const el = h("div", { class: `feedback ${ok ? "ok" : "no"}`, role: "status" },
    h("div", { class: "fb-head" }, icon(ok ? "ok" : "no"), T[ok ? "fb.correct" : "fb.wrong"]),
    h("p", { text: sentence }), btn);
  return { el, btn };
}

export function maths(summaryText, ...kids) {
  return h("details", { class: "maths" }, h("summary", {}, icon("calc"), summaryText), h("div", {}, ...kids));
}

// ---- sheet (single <dialog>) ----
let sheetTrigger = null;
export function openSheet(title, build, trigger) {
  const dlg = document.getElementById("sheet");
  sheetTrigger = trigger ?? document.activeElement;
  document.getElementById("sheetTitle").textContent = title;
  const body = document.getElementById("sheetBody");
  body.replaceChildren(...[].concat(build()));
  if (!dlg.open) dlg.showModal();
  body.scrollTop = 0;
}
export function initSheet() {
  const dlg = document.getElementById("sheet");
  const close = document.getElementById("sheetClose");
  close.append(icon("x", T["btn.close"]));
  close.addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });   // backdrop
  dlg.addEventListener("close", () => sheetTrigger?.focus?.());
}

export function openSources(trigger) {
  openSheet(T["sources.title"], () => h("ol", {}, SOURCES.map(([t, url]) =>
    h("li", {}, url ? h("a", { href: url, target: "_blank", rel: "noopener", text: t }) : t))), trigger);
}

export function openLimits(trigger) {
  openSheet(T["limits.title"], () => [
    h("h3", { text: T["limits.assumeTitle"] }), h("ul", {}, T["limits.assume"].map((x) => h("li", { text: x }))),
    h("h3", { text: T["limits.limitsTitle"] }), h("ol", {}, T["limits.list"].map((x) => h("li", { text: x }))),
    h("button", { class: "btn ghost", type: "button", text: T["sources.title"], onclick: () => openSources(trigger) }),
  ], trigger);
}

let toastTimer = 0;
export function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 4000);
}
