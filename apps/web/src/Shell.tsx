// App shell: top bar, tabs, progress, action bar, footer, sheet, toast (docs/UX-FLOWS.md §1).
import { useEffect } from "react";
import { Link, Outlet, useNavigate, useRouterState, useSearch } from "@tanstack/react-router";
import { T, makeVars, fill } from "@kirakurs/core/content";
import { PRESETS, PRESET_IDS, type Preset } from "@kirakurs/core/presets";
import { fx, pct } from "@kirakurs/core/format";
import { useApp, set, setPreset, clearData, toast, openSheet } from "./store";
import { Icon, Sheet, Tip, useSlide, Toast, closeSheet, openLimits, openSources } from "./ui";
import type { IconName } from "./icons";
import { tw, cn } from "./tw";

export const SCREENS = ["precheck", "learn", "predict", "map", "coach", "play", "check"] as const;
export type Screen = (typeof SCREENS)[number] | "welcome";
const TITLES: Record<Screen, string> = {
  welcome: "Welcome",
  precheck: "Pre-check", learn: "Learn", predict: "Predict", map: "Parity Map", coach: "Decision Coach", play: "Play", check: "Check",
};
// One tab: column on the phone bar, row pill on desktop; the sliding highlight sits behind the current one.
const tabCls = "flex min-h-11 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 border-0 bg-transparent text-xs font-medium text-muted no-underline transition-colors aria-[current=page]:font-semibold aria-[current=page]:text-primary-ink lg:h-10 lg:flex-none lg:flex-row lg:gap-2 lg:rounded-md lg:px-3 lg:text-sm lg:hover:bg-surface-2 lg:aria-[current=page]:text-bg lg:aria-[current=page]:hover:bg-transparent";
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
    return <div className="grid gap-3" role="radiogroup" aria-label={T["preset.title"]}>
      {groups.map(([title, list]) => <div key={title} className="grid gap-2">
        <h3 className="text-xs font-semibold text-muted">{title}</h3>
        {list.map((x) => {
          const on = cur === x.id, fact = "grid gap-0.5", k = "text-[0.7rem] leading-tight text-muted", val = "text-sm font-semibold tabular-nums";
          return <div key={x.id} className={cn("grid rounded-md border-2 border-line bg-surface transition hover:border-line-strong", on && "border-primary bg-primary-soft hover:border-primary")}>
          <button className="grid w-full cursor-pointer gap-1.5 rounded-md border-0 bg-transparent px-3.5 py-3 text-left" type="button" role="radio" aria-checked={on} onClick={() => pick(x)}>
            <span className="flex items-center gap-2"><span className="flex-1 font-semibold">{x.label}</span>
              <span className={cn("grid size-6 place-items-center rounded-sm [&_svg]:size-4", on && "bg-primary text-on-primary")} aria-hidden="true">{on && <Icon name="ok" />}</span></span>
            <span className={cn("text-sm text-muted", !on && "[@media(max-height:720px)]:hidden")}>{x.blurb}</span>
            {on && <span className="grid grid-cols-3 gap-2 rounded-sm bg-surface px-2 py-1.5 animate-[up_280ms_var(--ease-out)]">
              <span className={fact}><span className={k}>{T["preset.fx"]}</span><span className={val}>{"RM " + fx(x.S, 4)}</span></span>
              <span className={fact}><span className={k}>{T["preset.int"]}</span><span className={val}>{pct(x.iH) + " / " + pct(x.iF)}</span></span>
              <span className={fact}><span className={k}>{T["preset.inf"]}</span><span className={val}>{pct(x.piH, 1) + " / " + pct(x.piF, 1)}</span></span>
            </span>}
          </button>
          {on && <div className="grid gap-2 px-3.5 pb-3.5">
            {x.sources.length > 0 && <ul className="m-0! grid list-none! animate-[up_280ms_var(--ease-out)] grid-cols-2 gap-x-4 gap-y-2 p-0! text-xs" aria-label={T["sources.title"]}>
              {x.sources.map((src, i) => <li key={src.k} className="min-w-0"><Tip tip={src.by} end={i % 2 === 1} className="max-w-full">
                <span tabIndex={0} className="grid cursor-help rounded-sm outline-offset-2">
                  <span className="truncate text-muted">{src.k}</span>
                  <span className="font-semibold underline decoration-line-strong decoration-dotted underline-offset-4">{src.date}</span>
                </span></Tip></li>)}
            </ul>}
            <Tip tip={T[x.kind === "dated" ? "preset.frozenTip" : "preset.practiceTip"]!} className="justify-self-start">
              <span tabIndex={0} className={cn("inline-flex cursor-help items-center gap-1.5 rounded-sm px-2 py-1 text-xs font-semibold outline-offset-2 [&_svg]:size-3.5",
                x.kind === "dated" ? "bg-primary-soft text-primary-ink" : "bg-surface-2 text-muted")}>
                <Icon name={x.kind === "dated" ? "calendar" : "info"} />{x.kind === "dated" ? T["preset.frozen"] : T["preset.tagPractice"]}</span>
            </Tip>
          </div>}
        </div>; })}
      </div>)}
    </div>;
  }, trigger);

  const next = () => {
    if (name === "learn") set((s) => ({ progress: { ...s.progress, learn: true }, unlocked: true }));
    if (step > 0 && step < SCREENS.length) go(SCREENS[step]!);
  };

  return <>
    <a className="absolute -left-[9999px] focus:top-2 focus:left-4 focus:z-50 focus:bg-surface focus:px-3 focus:py-2" href="#view" onClick={(e) => { e.preventDefault(); document.getElementById("view")?.focus(); }}>Skip to content</a>
    <header className="topbar sticky top-0 z-20 bg-bg pt-[env(safe-area-inset-top)] shadow-[0_1px_0_var(--line)]">
      <div className="mx-auto flex h-14 w-full max-w-[110rem] items-center gap-3 px-[clamp(1rem,3vw,3rem)]">
        <Link className="mr-auto flex items-center gap-2 text-lg font-semibold tracking-tight text-ink no-underline" to="/welcome" search={true} aria-label="KiraKurs home">
          <span className="size-8 shrink-0 bg-(image:--logo) bg-contain bg-center bg-no-repeat" aria-hidden="true" /><span className="max-[399px]:hidden">KiraKurs</span></Link>
        <nav ref={tabsRef} id="tabs" aria-label="Main" hidden={!unlocked} className={cn(tw.slideBox,
          "fixed inset-x-0 bottom-0 z-20 flex h-[calc(4rem+env(safe-area-inset-bottom))] bg-surface pb-[env(safe-area-inset-bottom)] shadow-[0_-1px_0_var(--line)] before:h-[3px] before:rounded-b-sm before:bg-primary",
          "lg:relative lg:h-auto lg:gap-1 lg:bg-transparent lg:p-0 lg:shadow-none lg:before:h-[var(--h,0px)] lg:before:rounded-md lg:before:bg-ink")}>
          {TABS.map(([k, ic]) => <Link key={k} to={"/" + k} search={true} data-route={k} className={tabCls}><Icon name={ic} /><span>{T["nav." + k]}</span></Link>)}
          <button type="button" className={tabCls} onClick={(e) => openLimits(e.currentTarget)}><Icon name="shield" /><span>{T["nav.limits"]}</span></button>
        </nav>
        <div className="flex min-w-0 items-center gap-2">
          <button className="inline-flex min-h-10 max-w-[46vw] cursor-pointer items-center gap-1.5 rounded-md border-0 bg-surface px-3 text-sm font-medium hover:bg-surface-2 max-[399px]:max-w-[62vw] [&>span]:truncate" id="presetChip" type="button" aria-haspopup="dialog"
            aria-label={`${T["preset.title"]}: ${p.label}${edited ? " " + T.edited : ""}`} onClick={(e) => presetSheet(e.currentTarget)}>
            <Icon name="calendar" /><span>{chip}</span><Icon name="chevron" />
          </button>
          <button className={tw.iconBtn} id="themeBtn" type="button" aria-label={T["theme.toggle"]}
            onClick={() => {
              const next = dark ? "light" : "dark";
              const apply = () => { document.documentElement.dataset.theme = next; set({ theme: next }); };
              if (document.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) (document.startViewTransition as (o: { update: () => void; types: string[] }) => unknown)({ update: apply, types: ["theme"] }); else apply();
            }}><Icon name={dark ? "sun" : "moon"} /></button>
        </div>
      </div>
      {!unlocked && step > 0 && <div className="mx-auto flex w-full max-w-[110rem] items-center gap-3 px-[clamp(1rem,3vw,3rem)] pb-2" id="progress">
        <div className="h-1.5 flex-1 overflow-hidden rounded-sm bg-surface-2"><span className="block h-full bg-primary transition-[width] duration-500 ease-out" style={{ width: (step / SCREENS.length) * 100 + "%" }} /></div>
        <span className={tw.small}>{fill(T.progress!, { s: { step: String(step), total: String(SCREENS.length) }, num: {} })}</span>
      </div>}
    </header>

    <main id="view" tabIndex={-1} className={cn("mx-auto w-full max-w-[110rem] flex-1 px-[clamp(1rem,3vw,3rem)] pt-6 pb-12 outline-none", name === "welcome" && "max-w-none p-0")}><Outlet /></main>

    <div id="actionbar" hidden={!step || name === "precheck"} className="fixed inset-x-0 bottom-0 z-10 bg-bg px-[clamp(1rem,3vw,3rem)] pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-1px_0_var(--line)] in-[.unlocked]:static in-[.unlocked]:bg-transparent in-[.unlocked]:pb-6 in-[.unlocked]:shadow-none">
      <div className="mx-auto flex w-full max-w-[110rem] justify-between gap-3">
        <button className={cn(tw.btn, tw.secondary)} id="backBtn" type="button" onClick={() => history.length > 1 ? history.back() : go("learn")}>
          <Icon name="left" />{T["btn.back"]}</button>
        <button className={cn(tw.btn, tw.primary)} id="nextBtn" type="button" hidden={name === "check"} onClick={next}>{T["btn.continue"]}<Icon name="right" /></button>
      </div>
    </div>

    <footer id="footer" className="bg-surface-2 px-4 pt-6 pb-[calc(5.5rem+env(safe-area-inset-bottom))] text-center text-sm text-muted in-[.guided]:pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:pb-6! [&_button]:min-h-11 [&_button]:cursor-pointer [&_button]:border-0 [&_button]:bg-transparent [&_button]:p-2 [&_button]:text-primary-ink [&_button]:underline [&_p]:mx-auto [&_p]:max-w-none">
      <p>{fill(T["footer.engine"]!, footerVars) + " · " + T["footer.rest"] + " · "}
        <button type="button" onClick={(e) => openSources(e.currentTarget)}>{T["footer.sources"]}</button>{" · "}
        <button type="button" onClick={(e) => openLimits(e.currentTarget)}>{T["nav.limits"]}</button>{" · "}
        <button type="button" onClick={() => {
          if (confirm(T["clearData.confirm"])) { clearData(); toast(T["toast.cleared"]!); go("precheck"); }
        }}>{T["footer.clear"]}</button>
      </p>
      <p className={tw.small}>{T["persona.tag"]}</p>
    </footer>
    <Sheet />
    <Toast />
  </>;
}

export function NotFound() {
  return <div className={tw.screen}><h1 tabIndex={-1}>{T.notFound}</h1><Link className={cn(tw.btn, tw.primary)} to="/learn">{T["notFound.btn"]}</Link></div>;
}
