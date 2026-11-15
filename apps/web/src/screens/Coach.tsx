// Screen 4: Decision Coach (docs/UX-FLOWS.md §2.4, CONTENT.md §7).
import { useEffect, useState } from "react";
import { T, fill, makeVars } from "@kirakurs/core/content";
import { parseNumber } from "@kirakurs/core/engine";
import { useApp, set, setRaw, useData } from "../store";
import { Badge, Field, Icon, Live, Maths, Rich, plain } from "../ui";
import { useMaths } from "../Shell";
import { Chart } from "../chart";
import { AskButton } from "./Ask";

export function Coach() {
  const openMaths = useMaths();
  const { raw, progress, dismissedReveal } = useApp();
  const d = useData();
  const [T0raw, setT0raw] = useState("1500");
  const T0 = parseNumber(T0raw);
  const T0ok = Number.isFinite(T0) && T0 > 0 && T0 <= 1e8;
  const v = makeVars(d.inp, { T0: T0ok ? T0 : 1500 });
  const c = v.results.c, fl = (k: string) => fill(T[k]!, v);
  const range = c.range;
  const verdict = v.finite ? fl(range ? "coach.verdict" : "coach.verdict.noRange") : T.outOfRange!;

  // screen readers hear the verdict once the sliders settle
  const [live, setLive] = useState("");
  useEffect(() => { const id = setTimeout(() => setLive(plain(verdict)), 500); return () => clearTimeout(id); }, [verdict]);

  let bar = null;
  if (range) {
    const lo = Math.min(range.lo, c.A, c.split.expected), hi = Math.max(range.hi, c.A, c.split.expected);
    const P = (x: number) => Math.min(100, Math.max(0, ((x - lo) / (hi - lo)) * 100)) + "%";   // clamp: extreme inputs never push the page sideways
    bar = <div className="rangebar" aria-hidden="true">
      <div className="track" />
      <div className="band" style={{ left: P(c.split.lo!), width: `calc(${P(c.split.hi!)} - ${P(c.split.lo!)})` }} />
      <div className="tick exp" style={{ left: P(c.split.expected) }} /><div className="tick lockt" style={{ left: P(c.A) }} />
    </div>;
  }
  const pr = progress.predict;
  const yv = pr && makeVars(d.inp, { s: { yourAnswer: T["predict." + pr]!, rightWrong: T[pr === "up" ? "coach.reveal.right" : "coach.reveal.wrong"]! } });

  return <div className="screen">
    <header><h1>{T["coach.h1"]}</h1><p className="muted">{T["coach.sub"]}</p></header>
    <div className="grid items-start gap-5 xl:grid-cols-2">
    <div className="stack gap-4">
    <Maths summary={T["coach.bill.title"]!} icon="sliders">
      <p className="small">{fl("coach.bill.note")}</p>
      <Field label={fl("lbl.T")} raw={raw.T} error={d.errors.T} hint={d.hints.T} onInput={(x) => setRaw({ T: x })} />
      <Field label={fl("lbl.n")} raw={raw.n} error={d.errors.n} hint={d.hints.n} suffix="days" onInput={(x) => setRaw({ n: x })} />
    </Maths>
    {yv && !dismissedReveal && <div className="callout">
      <p>{fill(T["coach.reveal"]!, yv)}</p>
      <button className="btn ghost" type="button" onClick={() => set({ dismissedReveal: true })}>{T["btn.close"]}</button>
    </div>}
    <section className="card">
      <div className="decision">
        <div className="tile lock"><div className="tile-head"><Icon name="lock" />{T["coach.lock"]}</div>
          <Live as="div" className="value">{v.s.A!}</Live><p className="small">{T["coach.lock.note"]}</p><p className="caption">{T["coach.lock.s"]}</p></div>
        <div className="tile wait"><div className="tile-head"><Icon name="hourglass" />{T["coach.wait"]}</div>
          <Live as="div" className="value">{v.s.C_ppp!}</Live><p className="small">{T["coach.wait.note"]}</p>
          {range && <Live className="small">{fl("coach.range")}</Live>}</div>
      </div>
      {bar}
      {range && <Live className="caption">{fl("coach.rangeLegend")}</Live>}
      <Rich text={verdict} />
      <p className="sr-only" aria-live="polite">{live}</p>
      <Live className="small">{v.s.ruleSentence!}</Live>
      <Badge />
    </section>
    <section className="card wait">
      <Field label={T["coach.split"]!} raw={raw.h} error={d.errors.h} suffix="%" slider={{ min: 0, max: 100, step: 10 }} onInput={(x) => setRaw({ h: x })} />
      <Live className="small">{fl(range ? "coach.split.c" : "coach.split.cNoRange")}</Live>
      <p className="caption">{T["coach.staging"]}</p>
    </section>
    </div>
    <div className="stack gap-4">
    <section className="card"><h2 className="card-title">{T["coach.chart.title"]}</h2><Chart inp={d.inp} vars={v} /><Badge /></section>
    <details className="maths card theory">
      <summary><Icon name="calc" />{T["coach.al.title"]}</summary>
      <div>
        <Field label={fl("coach.al.input")} raw={T0raw} error={T0ok ? undefined : T["err.allowance"]} onInput={setT0raw} />
        <Live className="small">{fl("coach.al.s")}</Live>
        <div className="grid2">
          <div><p className="small">{T["coach.al.usd"]}</p><Live as="div" className="value">{v.s["al.usd"]!}</Live></div>
          <div><p className="small">{T["coach.al.rm"]}</p><Live as="div" className="value">{v.s["al.rmPPP"]!}</Live></div>
        </div>
        <Live className="small">{fl("coach.al.why")}</Live>
        <Live className="small">{fl("coach.al.naive")}</Live><Live>{fl("coach.al.lw")}</Live>
        <Badge />
      </div>
    </details>
    <Maths summary={T["coach.fees"]!} icon="info">
      <Field label={T["lbl.margin"]!} raw={raw.margin} error={d.errors.margin} suffix="%" onInput={(x) => setRaw({ margin: x })} />
      <p>{T["coach.fees.help"]}</p><p>{T["coach.fees.wise"]}</p>
    </Maths>
    <Live className="small">{fl("coach.spot")}</Live>
    <Maths summary={T["btn.showMaths"]!} open={openMaths}>
      <Rich className="formula" text={fl("coach.m.ab")} /><p className="formula">{fl("coach.m.c")}</p>
      {range && <p className="formula">{fl("coach.m.range")}</p>}<p className="formula">{fl("coach.m.split")}</p>
    </Maths>
    <p className="caption">{T["coach.access"]}</p>
    <p className="caption">{T["coach.disclaimer"]}</p>
    <AskButton />
    </div>
    </div>
  </div>;
}
