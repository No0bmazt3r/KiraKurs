// Screen: Welcome: a short scroll intro, one full-screen scene per idea (snap scrolling, side dots).
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

const P = PRESETS.snapshot;
const base = makeVars(P);
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
    document.documentElement.classList.add("snap");
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      setActive(refs.current.indexOf(e.target as HTMLElement));
    }), { threshold: 0.45 });
    refs.current.forEach((el) => el && io.observe(el));
    return () => { io.disconnect(); document.documentElement.classList.remove("snap"); };
  }, []);

  const scene = (k: number, cls: string, label: string, body: React.ReactNode) =>
    <section key={k} className={cx("wel-sec", cls)} aria-label={label} ref={(el) => { refs.current[k] = el; }}>{body}</section>;
  const labels = [T["wel.h1a"] + " " + T["wel.h1b"], T["wel.s2.h"]!, T["wel.s3.h"]!, T["wel.s4.h"]!, T["wel.s5.h"]!, T["wel.s6.h"]!];
  const r = (i: number, cls?: string) => ({ className: cx("rise", cls), style: { "--i": i } as React.CSSProperties });

  return <div className="welcome">
    {scene(0, "ink hero-scene", labels[0]!, <div className="wel-inner">
      <h1 {...r(0, "wel-h1")}>{T["wel.h1a"]} <span className="wel-mark" aria-hidden="true" /> {T["wel.h1b"]}</h1>
      <p {...r(1, "wel-lead")}>{fill(T["wel.lead"]!, base)}</p>
      <div {...r(2, "row")}>
        <button className="btn primary big" type="button" onClick={start}>{T["wel.start"]}<Icon name="right" /></button>
        <button className="btn on-field" type="button" onClick={skip}>{T["wel.skip"]}</button>
      </div>
      <p {...r(3, "wel-scroll")}><Icon name="chevron" />{T["wel.scroll"]}</p>
    </div>)}

    {scene(1, "ground", labels[1]!, <div className="wel-inner two">
      <div className="stack">
        <h2 {...r(0, "wel-h2")}>{T["wel.s2.h"]}</h2>
        <p {...r(1, "wel-p")}>{fill(T["wel.s2.p"]!, hv)}</p>
      </div>
      <figure {...r(2, "wel-chart")}><HistoryChart /><figcaption className="caption">{fill(T["wel.s2.chart"]!, hv)}</figcaption></figure>
    </div>)}

    {scene(2, "teal", labels[2]!, <div className="wel-inner two">
      <div className="stack">
        <h2 {...r(0, "wel-h2")}>{T["wel.s3.h"]}</h2>
        <p {...r(1, "wel-p")}><Icon name="lock" /> {T["wel.s3.lock"]}</p>
        <p {...r(2, "wel-p")}><Icon name="hourglass" /> {T["wel.s3.wait"]}</p>
      </div>
      <TryIt />
    </div>)}

    {scene(3, "ground", labels[3]!, <div className="wel-inner">
      <h2 {...r(0, "wel-h2")}>{T["wel.s4.h"]}</h2>
      <ul className="wel-list">{["irp", "ppp", "fisher", "ife"].map((k, i) =>
        <li key={k} {...r(i + 1)}>{T["wel.s4." + k]}</li>)}</ul>
    </div>)}

    {scene(4, "amber", labels[4]!, <div className="wel-inner">
      <h2 {...r(0, "wel-h2")}>{T["wel.s5.h"]}</h2>
      <ol className="wel-list stops">{(["learn", "map", "coach", "play"] as const).map((k, i) =>
        <li key={k} {...r(i + 1)}>{T["wel.s5." + k]}</li>)}</ol>
    </div>)}

    {scene(5, "ink", labels[5]!, <div className="wel-inner">
      <h2 {...r(0, "wel-h2 big")}>{T["wel.s6.h"]}</h2>
      <p {...r(1, "wel-p")}>{T["wel.s6.p"]}</p>
      <div {...r(2, "row")}>
        <button className="btn primary big" type="button" onClick={start}>{T["wel.s6.start"]}<Icon name="right" /></button>
        <button className="btn on-field" type="button" onClick={skip}>{T["wel.s6.lecturer"]}</button>
      </div>
    </div>)}

    <nav className="wel-dots" aria-label={T["wel.dots"]}>
      {labels.map((l, k) => <button key={k} type="button" aria-label={l} aria-current={active === k || undefined}
        onClick={() => refs.current[k]?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })} />)}
    </nav>
  </div>;
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
