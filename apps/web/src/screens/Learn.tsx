// Screen 1: Learn, Aina's story (docs/UX-FLOWS.md §2.1, CONTENT.md §3). Always uses the Snapshot preset.
import { useState } from "react";
import { T, L, fill, makeVars } from "@kirakurs/core/content";
import { PRESETS } from "@kirakurs/core/presets";
import { parsePct, signedPct } from "@kirakurs/core/format";
import { useApp, set } from "../store";
import { Arrow, Badge, Choices, Field, Icon, Live, Rich } from "../ui";
import { tw, cn } from "../tw";
import { useGo } from "../Shell";
import { AinaFigure } from "../figures";

const TARGET = 0.04;
const base = PRESETS.snapshot;
const v = makeVars(base, { target: TARGET });
const fl = (k: string) => fill(T[k]!, v);

export function Learn() {
  const go = useGo();
  const learned = useApp((s) => s.progress.learn);
  const [shown, setShown] = useState(learned ? 4 : 1);
  const [committed, setCommitted] = useState<string | null>(null);
  const [piH, setPiH] = useState(base.piH);
  const vv = makeVars({ ...base, piH }, { target: TARGET });
  const m0 = v.results.m.EPPP, m1 = vv.results.m.EPPP;
  const atTarget = Math.abs(piH - TARGET) < 0.0005;          // reveal only once the slider reaches the target
  const moved = Math.abs(m1 - m0) > 1e-9;

  return <div className={cn(tw.screen)}>
    <header className={tw.header}><h1>{T["learn.h1"]}</h1>
      <button className={cn(tw.btn, tw.ghost)} type="button" onClick={() => { set({ unlocked: true }); go("map"); }}>{T["learn.skip"]}<Icon name="right" /></button>
    </header>
    <div className="grid items-start gap-5 xl:grid-cols-2">
    <div className={cn(tw.stack, "gap-4")}>
    <div className={cn(tw.card, "flex items-start gap-3")}>
      <div className="grid size-11 shrink-0 place-items-center rounded-md bg-theory font-semibold text-surface" aria-hidden="true">A</div>
      <div className={cn(tw.stack)}><p>{fl("learn.intro")}</p><p className={cn(tw.caption)}>{T["persona.tag"]}</p></div>
    </div>
    <details className={tw.details}><summary className={tw.summary}>{T["learn.objTitle"]}</summary>
      <div className={tw.detailsBody}><ol>{L["learn.obj"]!.map((o) => <li key={o}>{o}</li>)}</ol></div></details>
    <ol className={cn(tw.card, "m-0 list-none gap-3 p-5 [counter-reset:step]")}>{[1, 2, 3, 4].map((k) => <li key={k} hidden={k > shown}
      className="grid grid-cols-[2rem_1fr] items-start gap-x-3 gap-y-1 animate-[up_320ms_var(--ease-out)] *:col-start-2 before:row-span-2 before:grid before:size-8 before:place-items-center before:rounded-sm before:bg-ink before:font-semibold before:text-bg before:content-[counter(step)] before:[counter-increment:step]">
      <Rich text={fl("learn.step" + k)} />
      {k === 2 && <Rich className={cn(tw.formula)} text={fl("map.m.ppp")} />}
      {k === 3 && <Rich className={cn(tw.formula)} text={fl("map.m.fwd")} />}
    </li>)}</ol>
    <Badge preset="snapshot" />
    {shown < 4 && <button className={cn(tw.btn, tw.secondary, "justify-self-start")} type="button" onClick={() => setShown(shown + 1)}>{T["btn.nextStep"]}</button>}
    </div>
    {shown < 4 && <div className="fig-slot self-center max-xl:hidden"><AinaFigure /></div>}
    <section className={cn(tw.card, "theory")} hidden={shown < 4}>
      <p className={cn(tw.label)}>{fl("learn.taskPrompt")}</p>
      <Choices label={fl("learn.taskPrompt")} options={[["up", T["learn.taskUp"]!], ["down", T["learn.taskDown"]!], ["same", T["learn.taskSame"]!]]}
        value={committed} onChange={(id: string) => committed || setCommitted(id)} locked={!!committed} correct="up" />
      <Field label={T["lbl.piH"]!} raw={String(Number((piH * 100).toFixed(1)))} suffix="%" slider={{ min: 0, max: 6, step: 0.1 }}
        onInput={(x) => { const d = parsePct(x); if (Number.isFinite(d)) setPiH(d); }} />
      <div className={cn(tw.tile)}>
        <p className={cn(tw.small)}>{T["learn.pppMini"]}</p>
        {committed ? <>
          <Live as="div" className={cn(tw.value)}>{"RM " + vv.s["EPPP.4"]}</Live>
          <div>{moved ? <Arrow dir={m1 > m0 ? "up" : "down"} words={`${signedPct(m1 / m0 - 1)} · ${fill(T.convention!, v)}`} />
            : <span className={cn(tw.small)}>{T["learn.noChange"]}</span>}</div>
        </> : <div className={cn(tw.value)}>?</div>}
      </div>
      <p role="status">{committed && atTarget ? T[committed === "up" ? "learn.revealRight" : "learn.revealWrong"] : fill(T["learn.taskMove"]!, v)}</p>
    </section>
    </div>
  </div>;
}
