// Screen 3: Parity Map (docs/UX-FLOWS.md §2.3, CONTENT.md §5).
import { T, fill } from "../content.js";
import { h, card, badge, field, setText, maths, toast, arrow } from "../ui.js";
import { icon } from "../icons.js";
import { state, setRaw, setLinked, setPreset } from "../store.js";
import { nominalFromReal, realRate } from "../engine.mjs";
import { toPctInput } from "../format.js";
import * as f from "../format.js";
import { askButton } from "./ask.js";

export const title = "Parity Map";

export function mount({ maths: openMaths }) {
  const h1 = h("h1");
  const conv = h("p", { class: "small" });
  const hero = h("p", { class: "hero-value" });

  const val = () => h("div", { class: "value" });
  const sen = () => h("p", { class: "small" });
  const els = { fwdV: val(), fwdU: h("span", { class: "unit" }), fwdA: h("div"), fwdS: sen(), pppV: val(), pppA: h("div"), pppS: sen(),
    ifeV: val(), ifeS: sen(), realV: val(), realS: sen(), gap: h("p", { class: "small" }) };

  const cards = h("div", { class: "grid2" },
    card({ title: T["map.card.fwd"], variant: "lock" }, h("div", {}, els.fwdV, " ", els.fwdU), els.fwdA, els.fwdS, badge()),
    card({ title: T["map.card.ppp"], variant: "theory" }, els.pppV, els.pppA, els.pppS, badge()),
    card({ title: T["map.card.ife"], variant: "theory" }, els.ifeV, els.ifeS, badge()),
    card({ title: T["map.card.real"] }, els.realV, els.realS, badge()));
  const fixMsg = h("p", { class: "field-error", hidden: true, text: T.fixInput });
  const outputs = h("div", { class: "stack outputs" },
    h("section", { class: "card lock tint-lock hero-card" }, hero, badge()), fixMsg, cards, els.gap);

  // inputs
  const pctField = (key, slider) => field({ key, suffix: "%", slider, onInput: (x) => setRaw({ [key]: x }) });
  const F = {
    piH: pctField("piH", { min: 0, max: 10, step: 0.01 }),
    piF: pctField("piF", { min: 0, max: 10, step: 0.01 }),
    iH: pctField("iH", { min: 0, max: 10, step: 0.05 }),
    iF: pctField("iF", { min: 0, max: 10, step: 0.05 }),
    rH: pctField("rH", { min: -5, max: 8, step: 0.01 }),
    rF: pctField("rF", { min: -5, max: 8, step: 0.01 }),
    iHd: field({ key: "iHd", suffix: "%", readonly: true, onInput() {} }),
    iFd: field({ key: "iFd", suffix: "%", readonly: true, onInput() {} }),
    n: field({ key: "n", suffix: "days", onInput: (x) => setRaw({ n: x }) }),
    T: field({ key: "T", onInput: (x) => setRaw({ T: x }) }),
  };
  const linkBox = h("input", { type: "checkbox", role: "switch", onchange: (e) => setLinked(e.target.checked) });
  const banner = h("p", { class: "banner", hidden: true }, icon("info"), T["map.linkedBanner"]);
  const derivedCap = h("p", { class: "caption", hidden: true, text: T["map.derived"] });
  const resetBtn = h("button", { class: "btn ghost", type: "button", onclick: () => { setPreset(state.preset); toast(fill(T["toast.reset"], lastV)); } }, icon("reset"));
  const resetText = h("span"); resetBtn.append(resetText);
  const equalBtn = h("button", { class: "btn secondary", type: "button", onclick: setEqual }, icon("scale"), T["map.equalBtn"]);
  const inputsCard = h("section", { class: "card inputs" },
    h("h2", { class: "card-title" }, icon("sliders"), T["map.inputs"]),
    h("label", { class: "switch" }, linkBox, T["map.linked"]), banner,
    F.piH.el, F.piF.el, F.iH.el, F.iF.el, F.rH.el, F.rF.el, F.iHd.el, F.iFd.el, derivedCap, F.n.el, F.T.el,
    h("div", { class: "row" }, equalBtn, resetBtn));

  // show the maths
  const mt = { t: h("p", { class: "formula" }), fwd: h("p", { class: "formula" }), ppp: h("p", { class: "formula" }), ife: h("p", { class: "formula" }),
    fisher: h("p", { class: "formula" }), gap: h("p", { class: "formula" }), one: h("p"), bank: h("p"), tbody: h("tbody") };
  const mathsEl = maths(T["btn.showMaths"],
    h("h3", { text: T["map.m.formulas"] }), mt.t, mt.fwd, mt.ppp, mt.ife, mt.fisher, mt.gap,
    h("h3", { text: T["map.m.oneYear"] }), mt.one,
    h("h3", { text: T["map.m.bank"] }), mt.bank,
    h("h3", { text: T["map.m.forecasts"] }),
    h("div", { class: "table-wrap" }, h("table", {},
      h("caption", { class: "small", text: T["map.m.forecastsCaption"] }),
      h("thead", {}, h("tr", {}, h("th", { scope: "col", text: T["map.m.colTheory"] }), h("th", { scope: "col", class: "colRate" }), h("th", { scope: "col", text: T["map.m.colChange"] }))),
      mt.tbody)));
  if (openMaths) mathsEl.open = true;
  const explain = h("details", { class: "maths" }, h("summary", {}, icon("info"), T["map.explainQ"]), h("div", {}, h("p", { text: T["map.explainA"] })));

  const el = h("div", { class: "screen" },
    h("header", {}, h1, conv),
    h("div", { class: "map-layout" }, outputs, inputsCard),
    mathsEl, explain, askButton());

  let lastV = null, lastInp = null;
  function setEqual() {
    if (!lastInp) return;
    if (state.linked) setRaw({ rF: toPctInput(lastInp.rH ?? realRate(lastInp.iH, lastInp.piH)) });
    else setRaw({ iF: toPctInput(nominalFromReal(realRate(lastInp.iH, lastInp.piH), lastInp.piF)) });
    toast(T["map.equalToast"]);
  }

  function update(s, d) {
    const { v, inp, ok, errors, hints } = d;
    lastV = v; lastInp = inp;
    const fl = (k) => fill(T[k], v);
    setText(h1, fl("map.h1")); setText(conv, fl("convention"));
    const good = v.finite;
    setText(hero, good ? fl("map.hero") : T.outOfRange);
    const m = v.results.m;
    setText(els.fwdV, "RM " + v.s.F); setText(els.fwdU, fl("map.perUnit"));
    els.fwdA.replaceChildren(arrow(m.F >= inp.S ? "up" : "down", fl("map.fwd.arrow")));
    setText(els.fwdS, fl("map.card.fwd.s"));
    setText(els.pppV, "RM " + v.s.EPPP);
    els.pppA.replaceChildren(arrow(m.EPPP >= inp.S ? "up" : "down", fl("map.ppp.arrow")));
    setText(els.pppS, fl("map.card.ppp.s"));
    setText(els.ifeV, "RM " + v.s.EIFE); setText(els.ifeS, fl("map.card.ife.s"));
    setText(els.realV, fl("map.card.real.v")); setText(els.realS, fl("map.card.real.s"));
    setText(els.gap, Math.abs(m.parityGapPP) < 1e-9 ? T["map.gapZero"] : fl("map.gap"));
    cards.classList.toggle("dim", !ok); hero.classList.toggle("dim", !ok); fixMsg.hidden = ok;

    const r = s.raw, L = s.linked, lab = (k) => fl("lbl." + k);
    F.piH.update(r.piH, errors.piH, hints.piH, lab("piH"));
    F.piF.update(r.piF, errors.piF, hints.piF, lab("piF"));
    F.iH.el.hidden = L; F.iF.el.hidden = L; F.rH.el.hidden = !L; F.rF.el.hidden = !L; F.iHd.el.hidden = !L; F.iFd.el.hidden = !L;
    banner.hidden = !L; derivedCap.hidden = !L; linkBox.checked = L;
    if (L) {
      F.rH.update(r.rH, errors.rH, hints.rH, lab("rH")); F.rF.update(r.rF, errors.rF, hints.rF, lab("rF"));
      F.iHd.update(toPctInput(Number(inp.iH.toFixed(6))), null, null, lab("iH")); F.iFd.update(toPctInput(Number(inp.iF.toFixed(6))), null, null, lab("iF"));
    } else { F.iH.update(r.iH, errors.iH, hints.iH, lab("iH")); F.iF.update(r.iF, errors.iF, hints.iF, lab("iF")); }
    F.n.update(r.n, errors.n, hints.n, lab("n")); F.T.update(r.T, errors.T, hints.T, lab("T"));
    resetText.textContent = fl("btn.reset");

    for (const k of ["t", "fwd", "ppp", "ife", "fisher", "gap"]) setText(mt[k], fl("map.m." + k));
    setText(mt.one, fl("map.m.oneYearV")); setText(mt.bank, fl("map.m.bankNote"));
    el.querySelector(".colRate").textContent = fl("map.m.colRate");
    mt.tbody.replaceChildren(...m.forecasts.map((x) => h("tr", {},
      h("th", { scope: "row", text: T["map.m.f." + x.id] }), h("td", { text: f.fx(x.value, 4) }), h("td", { text: f.signedPct(x.value / inp.S - 1, 4) }))));
  }
  return { el, update };
}
