// Screen: Welcome: a short scroll intro, one section per idea; motion follows the scroll position (CSS scroll-driven animations), side dots.
// Every number comes from @kirakurs/core (engine via makeVars, ECB series via feeday HISTORY / replay).
import { useEffect, useRef, useState } from "react";
import { T, fill, makeVars } from "@kirakurs/core/content";
import { HISTORY, replay, type Choice, type Round } from "@kirakurs/core/feeday";
import { PRESETS } from "@kirakurs/core/presets";
import { rm, fx } from "@kirakurs/core/format";
import { useApp, set } from "../store";
import { useGo } from "../Shell";
import { Icon } from "../ui";
import { tw, cn } from "../tw";
import { randomWindow, day } from "./Play";
import { HeroFigure, ThinkFigure, TwoPathsFigure, IdeasFigure, StopsFigure, ReadyFigure } from "../figures";

const P = PRESETS.snapshot;
const base = makeVars(P);
const titled = (s: string) => { const i = s.indexOf(": "); return i < 0 ? s : <><strong>{s.slice(0, i)}</strong>{s[i + 2]!.toUpperCase() + s.slice(i + 3)}</>; };
const vars = (o: Record<string, string>) => ({ s: { ...base.s, ...o }, num: base.num });
const H = HISTORY;

// Section shell. `wel-sec`, `hero-scene`, `in`, `rise`, `wel-inner`, `wel-list`, `fig-slot` are hooks for the scroll motion in styles.css.
const SEC = "wel-sec grid scroll-mt-14 items-center px-[clamp(1rem,3vw,3rem)] py-[clamp(3.5rem,7vw,7rem)] sm:pr-[max(clamp(1rem,3vw,3rem),4.5rem)] [&_.caption]:text-inherit [&_.caption]:opacity-85 [&_.label]:text-inherit [&_.label]:opacity-85";
const KIND: Record<string, string> = {
  ink: "bg-field text-on-field [--fig-accent:var(--field-accent)]", teal: "bg-primary text-on-primary [--fig-accent:var(--field-accent)]",
  ground: "bg-bg", amber: "bg-surface", "hero-scene": "hero-scene min-h-[calc(100svh-3.5rem)]",
};
const INNER = "wel-inner mx-auto grid w-full max-w-[110rem] content-center gap-6";
const H1 = "max-w-none text-5xl leading-none font-semibold tracking-[-0.02em] sm:text-6xl sm:tracking-[-0.03em] 2xl:text-7xl";
const LEAD = "max-w-[38ch] text-lg leading-relaxed lg:text-xl";
const H2 = "max-w-[20ch] text-3xl leading-tight font-semibold lg:text-5xl lg:tracking-[-0.02em]";
const PARA = "wel-p max-w-[46ch] text-base leading-relaxed lg:text-lg [&_strong]:block [&_strong]:font-semibold";
const CHART = "m-0 grid gap-2 rounded-xl bg-surface p-4 text-ink [&_svg]:block [&_svg]:h-auto [&_svg]:w-full [&_svg]:overflow-visible";
const LIST = "wel-list m-0 grid list-none gap-x-8 gap-y-5 p-0 sm:grid-cols-2 xl:grid-cols-4 [&_li]:text-base [&_li]:leading-relaxed lg:[&_li]:text-lg [&_strong]:mb-1 [&_strong]:block [&_strong]:font-semibold";
const hv = vars({ start: day(H.first), end: day(H.last), rLo: fx(H.lo.r, 4), rHi: fx(H.hi.r, 4), gapRM: rm((H.hi.r - H.lo.r) * P.T) });

export function Welcome() {
  const go = useGo();
  const unlocked = useApp((s) => s.unlocked);
  const refs = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const start = () => go(unlocked ? "learn" : "precheck");
  const skip = () => { set({ unlocked: true }); go("map"); };

  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      setActive(refs.current.indexOf(e.target as HTMLElement));
    }), { threshold: 0.45 });
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const scene = (k: number, cls: string, label: string, body: React.ReactNode) =>
    <section key={k} className={cn(SEC, ...cls.split(" ").map((t) => KIND[t] ?? t))} aria-label={label} ref={(el) => { refs.current[k] = el; }}>{body}</section>;
  const labels = [T["wel.h1a"] + " " + T["wel.h1b"], T["wel.s2.h"]!, T["wel.s3.h"]!, T["wel.s4.h"]!, T["wel.s5.h"]!, T["wel.s6.h"]!];
  const r = (i: number, cls?: string) => ({ className: cn("rise", cls), style: { "--i": i } as React.CSSProperties });

  return <div className="welcome">
    {scene(0, "ink hero-scene", labels[0]!, <div className={cn(INNER, "gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-14")}>
      <div className={cn(tw.stack, "gap-6")}>
      <h1 {...r(0, H1)}>{T["wel.h1a"]} <span className="inline-block size-[0.85em] rounded-[0.18em] bg-(image:--logo) bg-contain bg-center bg-no-repeat align-[-0.08em]" aria-hidden="true" /> {T["wel.h1b"]}</h1>
      <p {...r(1, LEAD)}>{fill(T["wel.lead"]!, base)}</p>
      <div {...r(2, tw.row)}>
        <button className={cn(tw.btn, tw.fieldPrimary, tw.big)} type="button" onClick={start}>{T["wel.start"]}<Icon name="right" /></button>
        <button className={cn(tw.btn, tw.onField)} type="button" onClick={skip}>{T["wel.skip"]}</button>
      </div>
      <div className="fig-slot max-w-sm"><HeroFigure /></div>
      </div>
      <div {...r(2, "grid gap-4")}>
      <figure className="m-0 [&_svg]:block [&_svg]:h-auto [&_svg]:w-full [&_svg]:overflow-visible"><HeroChart /></figure>
      <dl className="m-0 grid grid-cols-2 gap-3 [&_dd]:m-0">
        <div className="col-span-2"><dt className={cn(tw.label)}>{T["wel.bill.h"]}</dt><dd className={cn(tw.caption)}>{fill(T["wel.bill.due"]!, base)}</dd></div>
        <div className={cn(tw.tile, tw.tileLock, "bg-on-field text-field [&_.value]:text-field")}><dt className={cn(tw.tileHead)}><Icon name="lock" />{T["wel.bill.lock"]}</dt><dd className={cn(tw.value)}>{base.s.A}</dd></div>
        <div className={cn(tw.tile, tw.tileWait)}><dt className={cn(tw.tileHead)}><Icon name="hourglass" />{T["wel.bill.wait"]}</dt><dd className={cn(tw.value)}>{base.s.C_ppp}</dd></div>
        <dd className={cn(tw.caption, "col-span-2")}>{fill(T["wel.bill.range"]!, base)}</dd>
      </dl>
      </div>
    </div>)}

    {scene(1, "ground", labels[1]!, <div className={cn(INNER, "gap-10 lg:grid-cols-[5fr_6fr] lg:items-center lg:gap-16")}>
      <div className={cn(tw.stack)}>
        <h2 {...r(0, H2)}>{T["wel.s2.h"]}</h2>
        <p {...r(1, PARA)}>{fill(T["wel.s2.p"]!, hv)}</p>
        <div className="fig-slot mt-4 max-w-sm"><ThinkFigure /></div>
      </div>
      <figure {...r(2, CHART)}><HistoryChart /><figcaption className={cn(tw.caption)}>{fill(T["wel.s2.chart"]!, hv)}</figcaption></figure>
    </div>)}

    {scene(2, "teal", labels[2]!, <div className={cn(INNER, "gap-10 lg:grid-cols-[5fr_6fr] lg:items-center lg:gap-16")}>
      <div className={cn(tw.stack)}>
        <h2 {...r(0, H2)}>{T["wel.s3.h"]}</h2>
        <p {...r(1, PARA)}>{titled(T["wel.s3.lock"]!)}</p>
        <p {...r(2, PARA)}>{titled(T["wel.s3.wait"]!)}</p>
        <div className="fig-slot mt-4 max-w-md"><TwoPathsFigure /></div>
      </div>
      <TryIt />
    </div>)}

    {scene(3, "ground", labels[3]!, <div className={INNER}>
      <div className="grid items-end gap-6 md:grid-cols-[1fr_minmax(0,24rem)]"><h2 {...r(0, H2)}>{T["wel.s4.h"]}</h2><div className="fig-slot"><IdeasFigure /></div></div>
      <ul className={LIST}>{["irp", "ppp", "fisher", "ife"].map((k, i) =>
        <li key={k} {...r(i + 1)}>{titled(T["wel.s4." + k]!)}</li>)}</ul>
    </div>)}

    {scene(4, "amber", labels[4]!, <div className={INNER}>
      <div className="grid items-end gap-6 md:grid-cols-[1fr_minmax(0,28rem)]"><h2 {...r(0, H2)}>{T["wel.s5.h"]}</h2><div className="fig-slot"><StopsFigure /></div></div>
      <ol className={LIST}>{(["learn", "map", "coach", "play"] as const).map((k, i) =>
        <li key={k} {...r(i + 1)}>{titled(T["wel.s5." + k]!)}</li>)}</ol>
    </div>)}

    {scene(5, "ink", labels[5]!, <div className={cn(INNER, "items-center gap-10 lg:grid-cols-[1fr_minmax(0,22rem)]")}>
      <div className={cn(tw.stack, "gap-6")}>
      <h2 {...r(0, H2)}>{T["wel.s6.h"]}</h2>
      <p {...r(1, PARA)}>{T["wel.s6.p"]}</p>
      <div {...r(2, tw.row)}>
        <button className={cn(tw.btn, tw.fieldPrimary, tw.big)} type="button" onClick={start}>{T["wel.s6.start"]}<Icon name="right" /></button>
        <button className={cn(tw.btn, tw.onField)} type="button" onClick={skip}>{T["wel.s6.lecturer"]}</button>
      </div>
      </div>
      <div className="fig-slot"><ReadyFigure /></div>
    </div>)}

    <nav className="fixed top-1/2 right-3 z-10 hidden -translate-y-1/2 gap-1 rounded-lg bg-surface p-1 text-ink sm:grid" aria-label={T["wel.dots"]}>
      {labels.map((l, k) => <button key={k} type="button" aria-label={l} aria-current={active === k || undefined}
        className="grid size-7 cursor-pointer place-items-center border-0 bg-transparent p-0 after:size-2 after:rounded-xs after:bg-current after:opacity-35 after:transition-[opacity,transform] after:duration-200 after:content-[''] aria-[current=true]:after:scale-150 aria-[current=true]:after:opacity-100"
        onClick={() => refs.current[k]?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })} />)}
    </nav>
  </div>;
}

// Hero: the last two years of real USD/MYR, forking on 6 Nov into the lock path (forward) and the wait range (8 of 10 past
// 270-day moves) up to Aina's payment day. Every value: feeday HISTORY, the engine (F, E_PPP) and the Snapshot range.
const hero = (() => {
  const past = H.months.slice(-24), m = base.results.m, rg = base.results.c.range!;
  const S = P.S, lo = rg.lo / P.T, hi = rg.hi / P.T;
  const vals = [...past.map((x) => x.r), lo, hi, m.F, m.EPPP];
  return { past, S, F: m.F, E: m.EPPP, lo, hi, min: Math.min(...vals), max: Math.max(...vals),
    v: vars({ rLo: fx(lo, 4), rHi: fx(hi, 4) }) };
})();
function HeroChart() {
  const W = 800, Ht = 400, top = 36, bot = 44, x0 = 8, xT = 430, xP = 590;
  const pad = (hero.max - hero.min) * 0.08, a = hero.min - pad, b = hero.max + pad;
  const y = (r: number) => top + ((b - r) / (b - a)) * (Ht - top - bot);
  const n = hero.past.length;
  const hist = hero.past.map((p, i) => `${(x0 + (i / (n - 1)) * (xT - x0)).toFixed(1)},${y(i === n - 1 ? hero.S : p.r).toFixed(1)}`).join(" ");
  const yS = y(hero.S), v = hero.v;
  return <svg viewBox={`0 0 ${W} ${Ht}`} role="img" aria-label={fill(T["wel.hero.aria"]!, v)}>
    <polygon className="hc-band fill-risk-fill [fill-opacity:.3]" points={`${xT},${yS} ${xP},${y(hero.hi)} ${xP},${y(hero.lo)}`} />
    <polyline className="hc-hist fill-none stroke-on-field stroke-[2.5] [stroke-linejoin:round] [stroke-opacity:.75]" points={hist} pathLength={1} />
    <line className="stroke-on-field stroke-1 [stroke-dasharray:3_5] [stroke-opacity:.3]" x1={xT} x2={xT} y1={top - 8} y2={Ht - bot + 8} />
    <line className="stroke-on-field stroke-1 [stroke-dasharray:3_5] [stroke-opacity:.3]" x1={xP} x2={xP} y1={top - 8} y2={Ht - bot + 8} />
    <line className="hc-lock stroke-field-accent stroke-4 [stroke-linecap:round]" x1={xT} y1={yS} x2={xP} y2={y(hero.F)} pathLength={1} />
    <line className="hc-ppp stroke-risk-fill stroke-[2.5]" x1={xT} y1={yS} x2={xP} y2={y(hero.E)} pathLength={1} />
    <circle className="fill-on-field" cx={xT} cy={yS} r="6" />
    <circle className="hc-end fill-field-accent" cx={xP} cy={y(hero.F)} r="6" />
    <text x={x0} y={top - 14} className="fill-on-field text-[15px] font-medium opacity-70">{fill(T["wel.hero.unit"]!, v)}</text>
    <text x={x0} y={Ht - 14} className="fill-on-field text-[15px] font-medium opacity-70">{T["wel.hero.past"]}</text>
    <text x={xT} y={Ht - 14} className="fill-on-field text-[15px] font-medium" textAnchor="middle">{T["wel.hero.today"]}</text>
    <text x={xP} y={Ht - 14} className="fill-on-field text-[15px] font-medium" textAnchor="middle">{T["wel.hero.pay"]}</text>
    <text x={xP + 14} y={y(hero.F) + (hero.F >= hero.E ? -6 : 18)} className="fill-on-field text-[15px] font-medium fill-field-accent font-semibold">{fill(T["wel.hero.lock"]!, v)}</text>
    <text x={xP + 14} y={y(hero.E) + (hero.F >= hero.E ? 18 : -6)} className="fill-on-field text-[15px] font-medium fill-risk-fill">{fill(T["wel.hero.ppp"]!, v)}</text>
    <text x={xP + 14} y={y(hero.hi) + 4} className="fill-on-field text-[15px] font-medium opacity-70">{"RM " + v.s.rHi}</text>
    <text x={xP + 14} y={y(hero.lo) + 4} className="fill-on-field text-[15px] font-medium opacity-70">{"RM " + v.s.rLo}</text>
    <text x={(xT + xP) / 2} y={y(hero.lo) + 22} className="fill-on-field text-[15px] font-medium fill-risk-fill" textAnchor="middle">{T["wel.hero.band"]}</text>
  </svg>;
}

// Month-end USD/MYR line with the lowest and highest daily rates marked.
function HistoryChart() {
  const W = 600, Ht = 260, pad = 16;
  const lo = H.lo.r, hi = H.hi.r, n = H.months.length;
  const x = (i: number) => pad + (i / (n - 1)) * (W - 2 * pad);
  const y = (r: number) => pad + ((hi - r) / (hi - lo)) * (Ht - 2 * pad);
  const at = (d: string) => Math.max(0, H.months.findIndex((m) => m.d.slice(0, 7) === d.slice(0, 7)));
  const pts = H.months.map((m, i) => `${x(i).toFixed(1)},${y(m.r).toFixed(1)}`).join(" ");
  const iLo = at(H.lo.d), iHi = at(H.hi.d);
  return <svg viewBox={`0 0 ${W} ${Ht + 28}`} role="img" aria-label={fill(T["wel.s2.chart"]!, hv)}>
    <polyline className="wel-line fill-none stroke-primary stroke-3 [stroke-linecap:round] [stroke-linejoin:round]" points={pts} pathLength={1} />
    <circle className="fill-risk-fill" cx={x(iHi)} cy={y(hi)} r="7" />
    <circle className="fill-primary" cx={x(iLo)} cy={y(lo)} r="7" />
    <text x={x(iHi)} y={y(hi) - 14} textAnchor={iHi > n * 0.7 ? "end" : "middle"} className="fill-ink text-[15px] font-semibold">{fill(T["wel.s2.high"]!, hv)}</text>
    <text x={x(iLo)} y={y(lo) + 26} textAnchor={iLo < n * 0.3 ? "start" : "middle"} className="fill-ink text-[15px] font-semibold">{fill(T["wel.s2.low"]!, hv)}</text>
  </svg>;
}

// The one live thing: pick lock or wait, replay a real past 270-day period.
function TryIt() {
  const [round, setRound] = useState<Round | null>(null);
  const play = (c: Choice) => setRound(replay(randomWindow(), P.T, c));
  return <div className="tryit grid gap-3 rounded-xl bg-field p-6 text-on-field" role="group" aria-label={T["wel.s3.try"]}>
    <p className={cn(tw.label)}>{T["wel.s3.try"]}</p>
    <div className={cn(tw.row)}>
      <button className={cn(tw.btn, tw.big, "lockbtn flex-1 bg-on-field text-field")} type="button" onClick={() => play("lock")}><Icon name="lock" />{T["fee.lock"]}</button>
      <button className={cn(tw.btn, tw.big, "waitbtn flex-1 bg-risk-fill text-on-risk")} type="button" onClick={() => play("wait")}><Icon name="hourglass" />{T["fee.wait"]}</button>
    </div>
    <div role="status" className={cn(tw.stack)}>{round && <>
      <p className="tryit-result text-xl leading-snug font-semibold animate-[up_350ms_var(--ease-out)] lg:text-2xl">{fill(T["wel.s3.result"]!, vars({ start: day(round.start), end: day(round.end), lockRM: rm(round.lock), waitRM: rm(round.wait) }))}</p>
      <p>{fill(T[round.diff > 0 ? "fee.verdict.more" : "fee.verdict.less"]!, vars({ absDiff: rm(Math.abs(round.diff)) }))}</p>
      <p className={cn(tw.caption)}>{T["fee.label"]}</p>
    </>}</div>
  </div>;
}
