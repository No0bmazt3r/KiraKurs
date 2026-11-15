// Boot: read URL, init store, mount shell, hash router (docs/ARCHITECTURE.md §4, docs/UX-FLOWS.md §1).
import { state, set, setPreset, subscribe, inputs, clearData } from "./store.js";
import { T, makeVars, fill } from "./content.js";
import { PRESETS } from "./presets.js";
import { h, initSheet, openSheet, openSources, openLimits, toast } from "./ui.js";
import { icon } from "./icons.js";
import * as precheck from "./screens/precheck.js";
import * as learn from "./screens/learn.js";
import * as predict from "./screens/predict.js";
import * as map from "./screens/map.js";
import * as coach from "./screens/coach.js";
import * as check from "./screens/check.js";

const ROUTES = [
  ["precheck", precheck], ["learn", learn], ["predict", predict], ["map", map], ["coach", coach], ["check", check],
];
const ROUTE = Object.fromEntries(ROUTES.map(([k, m], i) => [k, { mod: m, step: i + 1 }]));
const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);

// ---- derived data shared by every screen ----
export function data(s = state) {
  const r = inputs(s);
  const v = makeVars(r.inp);
  return { ...r, v, preset: PRESETS[s.preset] };
}

// ---- boot ----
const presetParam = params.get("preset");
if (PRESETS[presetParam]) setPreset(presetParam);
const firstHash = location.hash.replace(/^#\//, "");
if (presetParam || (firstHash && firstHash !== "precheck")) set({ unlocked: true });   // lecturer / deep link → free mode
if (!ROUTE[firstHash]) location.replace("#/" + (state.unlocked ? "learn" : "precheck"));

applyTheme();
initSheet();
buildShell();

let current = null; // { name, view }
function route() {
  const name = location.hash.replace(/^#\//, "");
  const main = $("view");
  const r = ROUTE[name];
  if (!r) {
    main.replaceChildren(h("div", { class: "screen" }, h("h1", { tabindex: "-1", text: T.notFound }),
      h("a", { class: "btn primary", href: "#/learn", text: T["notFound.btn"] })));
    current = null; updateChrome(); return;
  }
  const view = r.mod.mount({ state, data, go, maths: params.get("maths") === "1" });
  main.replaceChildren(view.el);
  current = { name, view };
  view.update?.(state, data());
  updateChrome();
  document.title = `${r.mod.title} · KiraKurs`;
  const h1 = main.querySelector("h1");
  if (h1) { h1.setAttribute("tabindex", "-1"); h1.focus({ preventScroll: true }); }
  scrollTo(0, 0);
}
addEventListener("hashchange", route);
subscribe((s) => { updateChrome(); current?.view.update?.(s, data(s)); });
route();

export function go(name) { location.hash = "#/" + name; }

// ---- shell ----
function buildShell() {
  $("presetChip").addEventListener("click", (e) => openPresetSheet(e.currentTarget));
  $("themeBtn").addEventListener("click", () => {
    const dark = document.documentElement.dataset.theme
      ? document.documentElement.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    set({ theme: dark ? "light" : "dark" }); applyTheme();
  });
  $("themeBtn").setAttribute("aria-label", T["theme.toggle"]);

  const tabs = $("tabs");
  for (const [k, ic] of [["learn", "book"], ["map", "map"], ["coach", "scale"], ["check", "check"]])
    tabs.append(h("a", { href: "#/" + k, "data-route": k }, icon(ic), h("span", { text: T["nav." + k] })));
  tabs.append(h("button", { type: "button", onclick: (e) => openLimits(e.currentTarget) }, icon("shield"), h("span", { text: T["nav.limits"] })));

  $("backBtn").append(icon("left"), T["btn.back"]);
  $("nextBtn").append(T["btn.continue"], icon("right"));
  $("backBtn").addEventListener("click", () => history.length > 1 ? history.back() : go("learn"));
  $("nextBtn").addEventListener("click", () => {
    const name = current?.name; const i = ROUTES.findIndex(([k]) => k === name);
    if (name === "learn") set({ progress: { ...state.progress, learn: true }, unlocked: true });
    if (i >= 0 && i < ROUTES.length - 1) go(ROUTES[i + 1][0]);
  });

  const v = makeVars(PRESETS.snapshot);
  $("footer").append(
    h("p", {}, fill(T["footer.engine"], v) + " · " + T["footer.rest"] + " · ",
      h("button", { type: "button", text: T["footer.sources"], onclick: (e) => openSources(e.currentTarget) }), " · ",
      h("button", { type: "button", text: T["nav.limits"], onclick: (e) => openLimits(e.currentTarget) }), " · ",
      h("button", { type: "button", text: T["footer.clear"], onclick: () => {
        if (confirm(T["clearData.confirm"])) { clearData(); toast(T["toast.cleared"]); go("precheck"); }
      } })),
    h("p", { class: "small", text: T["persona.tag"] }));
}

function updateChrome() {
  const name = current?.name;
  const p = PRESETS[state.preset];
  const label = (p.kind === "dated" ? "Snapshot 6 Nov" : "Classroom") + (state.edited ? " " + T.edited : "");
  $("presetChip").replaceChildren(icon("calendar"), h("span", { text: label }), icon("chevron"));
  $("presetChip").setAttribute("aria-label", `${T["preset.title"]}: ${p.label}${state.edited ? " " + T.edited : ""}`);
  const th = document.documentElement.dataset.theme;
  $("themeBtn").replaceChildren(icon((th ? th === "dark" : matchMedia("(prefers-color-scheme: dark)").matches) ? "sun" : "moon"));

  document.body.classList.toggle("unlocked", state.unlocked);
  document.body.classList.toggle("guided", !state.unlocked);
  $("tabs").hidden = !state.unlocked;
  for (const a of $("tabs").querySelectorAll("a")) a.removeAttribute("aria-current");
  $("tabs").querySelector(`a[data-route="${name}"]`)?.setAttribute("aria-current", "page");

  const step = ROUTE[name]?.step;
  $("progress").hidden = state.unlocked || !step;
  if (step) { $("progressFill").style.width = (step / 6) * 100 + "%"; $("progressText").textContent = T.progress.replace("{{step}}", step); }

  $("actionbar").hidden = !step || name === "precheck";
  $("nextBtn").hidden = name === "check";

  const badgeText = p.badge + (state.edited ? " " + T.edited : "");
  for (const b of document.querySelectorAll(".badge")) {
    b.classList.toggle("illustrative", p.kind !== "dated");
    b.querySelector(".badge-text").textContent = badgeText;
  }
}

function openPresetSheet(trigger) {
  openSheet(T["preset.title"], () => h("div", { class: "options", role: "radiogroup", "aria-label": T["preset.title"] },
    Object.values(PRESETS).map((p) => h("button", {
      class: "option", type: "button", role: "radio", "aria-checked": String(state.preset === p.id),
      onclick: () => {
        setPreset(p.id);
        const url = new URL(location.href); url.searchParams.set("preset", p.id); history.replaceState(null, "", url);
        document.getElementById("sheet").close();
        toast(fill(T["toast.preset"], makeVars(p)));
      },
    }, h("span", {}, h("strong", { text: p.label }), h("br"), h("span", { class: "small", text: p.badge }))))), trigger);
}

function applyTheme() {
  const t = state.theme;
  if (t === "light" || t === "dark") document.documentElement.dataset.theme = t;
  else delete document.documentElement.dataset.theme;
}
