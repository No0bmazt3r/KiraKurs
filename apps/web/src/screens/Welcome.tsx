// Screen: Welcome: a short scroll intro, one section per idea; motion follows the scroll position (CSS scroll-driven animations), side dots.
// Every number comes from @kirakurs/core (engine via makeVars, ECB series via feeday HISTORY / replay).
import { useEffect, useRef, useState } from "react";
import { T, fill, makeVars } from "@kirakurs/core/content";
import { HISTORY, replay, type Choice, type Round } from "@kirakurs/core/feeday";
import { PRESETS } from "@kirakurs/core/presets";
import { rm, fx } from "@kirakurs/core/format";
import { useApp, set } from "../store";
import { useGo } from "../Shell";
import { Icon, cx } from "../ui";
import { randomWindow, day } from "./Play";
import { HeroFigure, ThinkFigure, TwoPathsFigure, IdeasFigure, StopsFigure, ReadyFigure } from "../figures";

const P = PRESETS.snapshot;
const base = makeVars(P);
const titled = (s: string) => { const i = s.indexOf(": "); return i < 0 ? s : <><strong>{s.slice(0, i)}</strong>{s[i + 2]!.toUpperCase() + s.slice(i + 3)}</>; };
const vars = (o: Record<string, string>) => ({ s: { ...base.s, ...o }, num: base.num });
const H = HISTORY;
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
    <section key={k} className={cx("wel-sec", cls)} aria-label={label} ref={(el) => { refs.current[k] = el; }}>{body}</section>;
  const labels = [T["wel.h1a"] + " " + T["wel.h1b"], T["wel.s2.h"]!, T["wel.s3.h"]!, T["wel.s4.h"]!, T["wel.s5.h"]!, T["wel.s6.h"]!];
  const r = (i: number, cls?: string) => ({ className: cx("rise", cls), style: { "--i": i } as React.CSSProperties });

  return <div className="welcome">
    {scene(0, "ink hero-scene", labels[0]!, <div className="wel-inner gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-14">
      <div className="stack gap-6">
      <h1 {...r(0, "wel-h1")}>{T["wel.h1a"]} <span className="wel-mark" aria-hidden="true" /> {T["wel.h1b"]}</h1>
      <p {...r(1, "wel-lead")}>{fill(T["wel.lead"]!, base)}</p>
      <div {...r(2, "row")}>
        <button className="btn primary big" type="button" onClick={start}>{T["wel.start"]}<Icon name="right" /></button>
        <button className="btn on-field" type="button" onClick={skip}>{T["wel.skip"]}</button>
      </div>
      <div className="fig-slot max-w-sm"><HeroFigure /></div>
      </div>
      <div {...r(2, "stack gap-4")}>
      <figure className="wel-hero-chart m-0"><HeroChart /></figure>
      <dl className="wel-bill">
        <div className="col-span-2"><dt className="label">{T["wel.bill.h"]}</dt><dd className="caption">{fill(T["wel.bill.due"]!, base)}</dd></div>
        <div className="tile lock"><dt className="tile-head"><Icon name="lock" />{T["wel.bill.lock"]}</dt><dd className="value">{base.s.A}</dd></div>
        <div className="tile wait"><dt className="tile-head"><Icon name="hourglass" />{T["wel.bill.wait"]}</dt><dd className="value">{base.s.C_ppp}</dd></div>
        <dd className="caption col-span-2">{fill(T["wel.bill.range"]!, base)}</dd>
      </dl>
      </div>
    </div>)}

    {scene(1, "ground", labels[1]!, <div className="wel-inner gap-10 lg:grid-cols-[5fr_6fr] lg:items-center lg:gap-16">
      <div className="stack">
        <h2 {...r(0, "wel-h2")}>{T["wel.s2.h"]}</h2>
        <p {...r(1, "wel-p")}>{fill(T["wel.s2.p"]!, hv)}</p>
        <div className="fig-slot mt-4 max-w-sm"><ThinkFigure /></div>
      </div>
      <figure {...r(2, "wel-chart")}><HistoryChart /><figcaption className="caption">{fill(T["wel.s2.chart"]!, hv)}</figcaption></figure>
    </div>)}

    {scene(2, "teal", labels[2]!, <div className="wel-inner gap-10 lg:grid-cols-[5fr_6fr] lg:items-center lg:gap-16">
      <div className="stack">
        <h2 {...r(0, "wel-h2")}>{T["wel.s3.h"]}</h2>
        <p {...r(1, "wel-p")}>{titled(T["wel.s3.lock"]!)}</p>
        <p {...r(2, "wel-p")}>{titled(T["wel.s3.wait"]!)}</p>
        <div className="fig-slot mt-4 max-w-md"><TwoPathsFigure /></div>
      </div>
      <TryIt />
    </div>)}

    {scene(3, "ground", labels[3]!, <div className="wel-inner">
      <div className="grid items-end gap-6 md:grid-cols-[1fr_minmax(0,24rem)]"><h2 {...r(0, "wel-h2")}>{T["wel.s4.h"]}</h2><div className="fig-slot"><IdeasFigure /></div></div>
      <ul className="wel-list">{["irp", "ppp", "fisher", "ife"].map((k, i) =>
        <li key={k} {...r(i + 1)}>{titled(T["wel.s4." + k]!)}</li>)}</ul>
    </div>)}

    {scene(4, "amber", labels[4]!, <div className="wel-inner">
      <div className="grid items-end gap-6 md:grid-cols-[1fr_minmax(0,28rem)]"><h2 {...r(0, "wel-h2")}>{T["wel.s5.h"]}</h2><div className="fig-slot"><StopsFigure /></div></div>
      <ol className="wel-list stops">{(["learn", "map", "coach", "play"] as const).map((k, i) =>
        <li key={k} {...r(i + 1)}>{titled(T["wel.s5." + k]!)}</li>)}</ol>
    </div>)}

    {scene(5, "ink", labels[5]!, <div className="wel-inner items-center gap-10 lg:grid-cols-[1fr_minmax(0,22rem)]">
      <div className="stack gap-6">
      <h2 {...r(0, "wel-h2 big")}>{T["wel.s6.h"]}</h2>
      <p {...r(1, "wel-p")}>{T["wel.s6.p"]}</p>
      <div {...r(2, "row")}>
        <button className="btn primary big" type="button" onClick={start}>{T["wel.s6.start"]}<Icon name="right" /></button>
        <button className="btn on-field" type="button" onClick={skip}>{T["wel.s6.lecturer"]}</button>
      </div>
      </div>
      <div className="fig-slot"><ReadyFigure /></div>
    </div>)}

    <nav className="wel-dots" aria-label={T["wel.dots"]}>
      {labels.map((l, k) => <button key={k} type="button" aria-label={l} aria-current={active === k || undefined}
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
    <polygon className="hc-band" points={`${xT},${yS} ${xP},${y(hero.hi)} ${xP},${y(hero.lo)}`} />
    <polyline className="hc-hist" points={hist} pathLength={1} />
    <line className="hc-today" x1={xT} x2={xT} y1={top - 8} y2={Ht - bot + 8} />
    <line className="hc-pay" x1={xP} x2={xP} y1={top - 8} y2={Ht - bot + 8} />
    <line className="hc-lock" x1={xT} y1={yS} x2={xP} y2={y(hero.F)} pathLength={1} />
    <line className="hc-ppp" x1={xT} y1={yS} x2={xP} y2={y(hero.E)} pathLength={1} />
    <circle className="hc-dot" cx={xT} cy={yS} r="6" />
    <circle className="hc-end lock" cx={xP} cy={y(hero.F)} r="6" />
    <text x={x0} y={top - 14} className="hc-t dim">{fill(T["wel.hero.unit"]!, v)}</text>
    <text x={x0} y={Ht - 14} className="hc-t dim">{T["wel.hero.past"]}</text>
    <text x={xT} y={Ht - 14} className="hc-t" textAnchor="middle">{T["wel.hero.today"]}</text>
    <text x={xP} y={Ht - 14} className="hc-t" textAnchor="middle">{T["wel.hero.pay"]}</text>
    <text x={xP + 14} y={y(hero.F) + (hero.F >= hero.E ? -6 : 18)} className="hc-t strong">{fill(T["wel.hero.lock"]!, v)}</text>
    <text x={xP + 14} y={y(hero.E) + (hero.F >= hero.E ? 18 : -6)} className="hc-t risk">{fill(T["wel.hero.ppp"]!, v)}</text>
    <text x={xP + 14} y={y(hero.hi) + 4} className="hc-t dim">{"RM " + v.s.rHi}</text>
    <text x={xP + 14} y={y(hero.lo) + 4} className="hc-t dim">{"RM " + v.s.rLo}</text>
    <text x={(xT + xP) / 2} y={y(hero.lo) + 22} className="hc-t risk" textAnchor="middle">{T["wel.hero.band"]}</text>
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
    <polyline className="wel-line" points={pts} pathLength={1} />
    <circle className="wel-pt hi" cx={x(iHi)} cy={y(hi)} r="7" />
    <circle className="wel-pt lo" cx={x(iLo)} cy={y(lo)} r="7" />
    <text x={x(iHi)} y={y(hi) - 14} textAnchor={iHi > n * 0.7 ? "end" : "middle"} className="strong">{fill(T["wel.s2.high"]!, hv)}</text>
    <text x={x(iLo)} y={y(lo) + 26} textAnchor={iLo < n * 0.3 ? "start" : "middle"} className="strong">{fill(T["wel.s2.low"]!, hv)}</text>
  </svg>;
}

// The one live thing: pick lock or wait, replay a real past 270-day period.
function TryIt() {
  const [round, setRound] = useState<Round | null>(null);
  const play = (c: Choice) => setRound(replay(randomWindow(), P.T, c));
  return <div className="tryit" role="group" aria-label={T["wel.s3.try"]}>
    <p className="label">{T["wel.s3.try"]}</p>
    <div className="row">
      <button className="btn big lockbtn" type="button" onClick={() => play("lock")}><Icon name="lock" />{T["fee.lock"]}</button>
      <button className="btn big waitbtn" type="button" onClick={() => play("wait")}><Icon name="hourglass" />{T["fee.wait"]}</button>
    </div>
    <div role="status" className="stack">{round && <>
      <p className="tryit-result">{fill(T["wel.s3.result"]!, vars({ start: day(round.start), end: day(round.end), lockRM: rm(round.lock), waitRM: rm(round.wait) }))}</p>
      <p>{fill(T[round.diff > 0 ? "fee.verdict.more" : "fee.verdict.less"]!, vars({ absDiff: rm(Math.abs(round.diff)) }))}</p>
      <p className="caption">{T["fee.label"]}</p>
    </>}</div>
  </div>;
}
