// Screen 1: Learn, Aina's story (docs/UX-FLOWS.md §2.1, CONTENT.md §3). Always uses the Snapshot preset.
import { useState } from "react";
import { T, L, fill, makeVars } from "@kirakurs/core/content";
import { PRESETS } from "@kirakurs/core/presets";
import { parsePct, signedPct } from "@kirakurs/core/format";
import { useApp, set } from "../store";
import { Arrow, Choices, Field, Icon, Live, Rich } from "../ui";
import { useGo } from "../Shell";

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

  return <div className="screen">
    <header><h1>{T["learn.h1"]}</h1>
      <button className="btn ghost" type="button" onClick={() => { set({ unlocked: true }); go("map"); }}>{T["learn.skip"]}<Icon name="right" /></button>
    </header>
    <div className="card row" style={{ flexWrap: "nowrap", alignItems: "flex-start" }}>
      <div className="avatar" aria-hidden="true">A</div>
      <div className="stack"><p>{fl("learn.intro")}</p><p className="caption">{T["persona.tag"]}</p></div>
    </div>
    <details className="maths"><summary><Icon name="book" />{T["learn.objTitle"]}</summary>
      <div><ol>{L["learn.obj"]!.map((o) => <li key={o}>{o}</li>)}</ol></div></details>
    <ol className="steps card">{[1, 2, 3, 4].map((k) => <li key={k} hidden={k > shown}><Rich text={fl("learn.step" + k)} /></li>)}</ol>
    {shown < 4 && <button className="btn secondary" type="button" onClick={() => setShown(shown + 1)}>{T["btn.nextStep"]}</button>}
    <section className="card theory" hidden={shown < 4}>
      <p className="label">{fl("learn.taskPrompt")}</p>
      <Choices label={fl("learn.taskPrompt")} options={[["up", T["learn.taskUp"]!], ["down", T["learn.taskDown"]!], ["same", T["learn.taskSame"]!]]}
        value={committed} onChange={(id: string) => committed || setCommitted(id)} locked={!!committed} correct="up" />
      <Field label={T["lbl.piH"]!} raw={String(Number((piH * 100).toFixed(1)))} suffix="%" slider={{ min: 0, max: 6, step: 0.1 }}
        onInput={(x) => { const d = parsePct(x); if (Number.isFinite(d)) setPiH(d); }} />
      <div className="card">
        <p className="small">{T["learn.pppMini"]}</p>
        {committed ? <>
          <Live as="div" className="value">{"RM " + vv.s["EPPP.4"]}</Live>
          <div><Arrow dir={m1 >= m0 ? "up" : "down"} words={`${signedPct(m1 / m0 - 1)} · ${fill(T.convention!, v)}`} /></div>
        </> : <div className="value">?</div>}
      </div>
      <p role="status">{committed ? T[committed === "up" ? "learn.revealRight" : "learn.revealWrong"] : fill(T["learn.taskMove"]!, v)}</p>
    </section>
  </div>;
}
