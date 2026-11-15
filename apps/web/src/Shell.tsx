// App shell: top bar, tabs, progress, action bar, footer, sheet, toast (docs/UX-FLOWS.md §1).
import { useEffect } from "react";
import { Link, Outlet, useNavigate, useRouterState, useSearch } from "@tanstack/react-router";
import { T, makeVars, fill } from "@kirakurs/core/content";
import { PRESETS, PRESET_IDS, type Preset } from "@kirakurs/core/presets";
import { fx, pct } from "@kirakurs/core/format";
import { useApp, set, setPreset, clearData, toast, openSheet } from "./store";
import { Icon, Sheet, Tip, useSlide, Toast, closeSheet, cx, openLimits, openSources } from "./ui";
import type { IconName } from "./icons";

export const SCREENS = ["precheck", "learn", "predict", "map", "coach", "play", "check"] as const;
export type Screen = (typeof SCREENS)[number] | "welcome";
const TITLES: Record<Screen, string> = {
  welcome: "Welcome",
  precheck: "Pre-check", learn: "Learn", predict: "Predict", map: "Parity Map", coach: "Decision Coach", play: "Play", check: "Check",
};
const TABS: [Screen, IconName][] = [["learn", "book"], ["map", "map"], ["coach", "scale"], ["play", "flag"], ["check", "check"]];

export function useGo() {
  const nav = useNavigate();
  return (s: Screen) => nav({ to: "/" + s, search: true });
}
export const useMaths = () => (useSearch({ strict: false }) as { maths?: 1 }).maths === 1;

const footerVars = makeVars(PRESETS.snapshot);
const prefersDark = () => matchMedia("(prefers-color-scheme: dark)").matches;

export function Shell() {
  const go = useGo();
  const nav = useNavigate();
  const name = useRouterState({ select: (s) => s.location.pathname.slice(1) }) as Screen;
  const { preset, edited, unlocked, theme } = useApp();
  const tabsRef = useSlide<HTMLElement>('[aria-current="page"]', name + String(unlocked));
  const p = PRESETS[preset];
  const step = (SCREENS as readonly string[]).indexOf(name) + 1;

  useEffect(() => {
    if (theme === "light" || theme === "dark") document.documentElement.dataset.theme = theme;
    else delete document.documentElement.dataset.theme;
  }, [theme]);
  useEffect(() => {
    document.body.classList.toggle("unlocked", unlocked);
    document.body.classList.toggle("guided", !unlocked);
  }, [unlocked]);
  useEffect(() => {
    document.title = `${TITLES[name] ?? "KiraKurs"} · KiraKurs`;
    const h1 = document.querySelector<HTMLElement>("main h1");
    if (h1) { h1.tabIndex = -1; h1.focus({ preventScroll: true }); }
    scrollTo(0, 0);
  }, [name]);

  const dark = theme === "system" ? prefersDark() : theme === "dark";
  const chip = p.chip + (edited ? " " + T.edited : "");

  const presetSheet = (trigger: Element) => openSheet(T["preset.title"]!, function PresetPicker() {
    const cur = useApp((s) => s.preset);
    const pick = (x: Preset) => {
      setPreset(x.id);
      nav({ to: ".", search: (s: object) => ({ ...s, preset: x.id }) });
      closeSheet();
      toast(fill(T["toast.preset"]!, makeVars(x)));
    };
    const groups: [string, Preset[]][] = [
      [T["preset.groupDated"]!, PRESET_IDS.map((id) => PRESETS[id]).filter((x) => x.kind === "dated")],
      [T["preset.groupPractice"]!, PRESET_IDS.map((id) => PRESETS[id]).filter((x) => x.kind !== "dated")],
    ];
    return <div className="stack gap-5" role="radiogroup" aria-label={T["preset.title"]}>
      <p className="small">{T["preset.hint"]}</p>
      {groups.map(([title, list]) => <div key={title} className="stack gap-2">
        <h3 className="preset-group">{title}</h3>
        {list.map((x) => <div key={x.id} className="preset-opt">
          <button className="preset-main" type="button" role="radio" aria-checked={cur === x.id} onClick={() => pick(x)}>
            <span className="preset-top"><span className="preset-name">{x.label}</span>
              <span className="preset-check" aria-hidden="true">{cur === x.id && <Icon name="ok" />}</span></span>
            <span className="preset-blurb">{x.blurb}</span>
            <span className="preset-facts">
              <span><span className="preset-k">{T["preset.fx"]}</span><span className="preset-v">{"RM " + fx(x.S, 4)}</span></span>
              <span><span className="preset-k">{T["preset.int"]}</span><span className="preset-v">{pct(x.iH) + " / " + pct(x.iF)}</span></span>
              <span><span className="preset-k">{T["preset.inf"]}</span><span className="preset-v">{pct(x.piH, 1) + " / " + pct(x.piF, 1)}</span></span>
            </span>
          </button>
          <div className="grid gap-2 px-4 pb-4">
            {x.sources.length > 0 && <ul className="m-0! grid list-none! grid-cols-2 gap-x-4 gap-y-2 p-0! text-xs" aria-label={T["sources.title"]}>
              {x.sources.map((src) => <li key={src.k} className="min-w-0"><Tip tip={src.by} className="max-w-full">
                <span tabIndex={0} className="grid cursor-help rounded-sm outline-offset-2">
                  <span className="truncate text-muted">{src.k}</span>
                  <span className="font-semibold underline decoration-line-strong decoration-dotted underline-offset-4">{src.date}</span>
                </span></Tip></li>)}
            </ul>}
            <Tip tip={T[x.kind === "dated" ? "preset.frozenTip" : "preset.practiceTip"]!} className="justify-self-start">
              <span tabIndex={0} className={cx("inline-flex cursor-help items-center gap-1.5 rounded-sm px-2 py-1 text-xs font-semibold outline-offset-2 [&_svg]:size-3.5",
                x.kind === "dated" ? "bg-primary-soft text-primary-ink" : "bg-surface-2 text-muted")}>
                <Icon name={x.kind === "dated" ? "calendar" : "info"} />{x.kind === "dated" ? T["preset.frozen"] : T["preset.tagPractice"]}</span>
            </Tip>
          </div>
        </div>)}
      </div>)}
    </div>;
  }, trigger);

  const next = () => {
    if (name === "learn") set((s) => ({ progress: { ...s.progress, learn: true }, unlocked: true }));
    if (step > 0 && step < SCREENS.length) go(SCREENS[step]!);
  };

  return <>
    <a className="skip-link" href="#view" onClick={(e) => { e.preventDefault(); document.getElementById("view")?.focus(); }}>Skip to content</a>
    <header className="topbar">
      <div className="topbar-inner">
        <Link className="logo" to="/welcome" search={true} aria-label="KiraKurs home"><span className="logo-mark" aria-hidden="true" /><span>KiraKurs</span></Link>
        <nav ref={tabsRef} className="tabs" id="tabs" aria-label="Main" hidden={!unlocked}>
          {TABS.map(([k, ic]) => <Link key={k} to={"/" + k} search={true} data-route={k}><Icon name={ic} /><span>{T["nav." + k]}</span></Link>)}
          <button type="button" onClick={(e) => openLimits(e.currentTarget)}><Icon name="shield" /><span>{T["nav.limits"]}</span></button>
        </nav>
        <div className="topbar-actions">
          <button className="chip" id="presetChip" type="button" aria-haspopup="dialog"
            aria-label={`${T["preset.title"]}: ${p.label}${edited ? " " + T.edited : ""}`} onClick={(e) => presetSheet(e.currentTarget)}>
            <Icon name="calendar" /><span>{chip}</span><Icon name="chevron" />
          </button>
          <button className="icon-btn" id="themeBtn" type="button" aria-label={T["theme.toggle"]}
            onClick={() => {
              const next = dark ? "light" : "dark";
              const apply = () => { document.documentElement.dataset.theme = next; set({ theme: next }); };
              if (document.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) (document.startViewTransition as (o: { update: () => void; types: string[] }) => unknown)({ update: apply, types: ["theme"] }); else apply();
            }}><Icon name={dark ? "sun" : "moon"} /></button>
        </div>
      </div>
      {!unlocked && step > 0 && <div className="progress" id="progress">
        <div className="progress-bar"><span style={{ width: (step / SCREENS.length) * 100 + "%" }} /></div>
        <span className="small">{fill(T.progress!, { s: { step: String(step), total: String(SCREENS.length) }, num: {} })}</span>
      </div>}
    </header>

    <main id="view" tabIndex={-1} className={name === "welcome" ? "wide" : undefined}><Outlet /></main>

    <div className="actionbar" id="actionbar" hidden={!step || name === "precheck"}>
      <div className="actionbar-inner">
        <button className="btn secondary" id="backBtn" type="button" onClick={() => history.length > 1 ? history.back() : go("learn")}>
          <Icon name="left" />{T["btn.back"]}</button>
        <button className="btn primary" id="nextBtn" type="button" hidden={name === "check"} onClick={next}>{T["btn.continue"]}<Icon name="right" /></button>
      </div>
    </div>

    <footer className="footer" id="footer">
      <p>{fill(T["footer.engine"]!, footerVars) + " · " + T["footer.rest"] + " · "}
        <button type="button" onClick={(e) => openSources(e.currentTarget)}>{T["footer.sources"]}</button>{" · "}
        <button type="button" onClick={(e) => openLimits(e.currentTarget)}>{T["nav.limits"]}</button>{" · "}
        <button type="button" onClick={() => {
          if (confirm(T["clearData.confirm"])) { clearData(); toast(T["toast.cleared"]!); go("precheck"); }
        }}>{T["footer.clear"]}</button>
      </p>
      <p className="small">{T["persona.tag"]}</p>
    </footer>
    <Sheet />
    <Toast />
  </>;
}

export function NotFound() {
  return <div className="screen"><h1 tabIndex={-1}>{T.notFound}</h1><Link className="btn primary" to="/learn">{T["notFound.btn"]}</Link></div>;
}
