// Screen 5: Check: sensitivity table, post-quiz, results + code (docs/UX-FLOWS.md §2.5, CONTENT.md §8).
import { useState } from "react";
import { T, L, fill, makeVars } from "@kirakurs/core/content";
import { sensitivity } from "@kirakurs/core/engine";
import { pct, rm, signedRM } from "@kirakurs/core/format";
import { score, otherForm, resultCode } from "@kirakurs/core/quiz";
import { useApp, set, setRaw, toast, useData } from "../store";
import { Badge, Choices, Field, Icon, Live, Rich, openLimits, openSources } from "../ui";
import { Quiz } from "./Quiz";

const ROWS = [0.01, 0.018, 0.03, 0.04, 0.05];

export function Check() {
  const raw = useApp((s) => s.raw);
  const d = useData();
  const v = makeVars(d.inp);
  const rows = sensitivity(d.inp, [...ROWS, d.inp.piH]);
  const live = rows.pop()!;
  const all = rows.map((r) => [r, Math.abs(r.piH - live.piH) < 1e-9] as const);
  if (!all.some(([, here]) => here)) all.push([live, true]);
  all.sort((a, b) => a[0].piH - b[0].piH);

  return <div className="screen"><h1>{T["check.h1"]}</h1>
    <div className="grid items-start gap-5 xl:grid-cols-[3fr_2fr]">
    <section className="card">
      <Field label={T["lbl.piH"]!} raw={raw.piH} error={d.errors.piH} hint={d.hints.piH} suffix="%" slider={{ min: 0, max: 6, step: 0.01 }} onInput={(x) => setRaw({ piH: x })} />
      <div className="table-wrap"><table>
        <thead><tr>{L["check.th"]!.map((t) => <th key={t} scope="col">{t}</th>)}</tr></thead>
        <tbody>{all.map(([r, here]) => <tr key={r.piH} className={here ? "here" : ""}>
          <td>{pct(r.piH, here ? 2 : 1)}{here && <span className="sr-only">{" " + T["check.youAreHere"]}</span>}</td>
          <td>{pct(r.rH)}</td><td>{rm(r.Cppp)}</td><td>{signedRM(r.diff)}</td>
        </tr>)}</tbody>
      </table></div>
      <Rich className="small" text={fill(T["check.why"]!, v)} />
      <Live className="small">{fill(T["check.linked"]!, v)}</Live>
      <Badge />
    </section>
    <section className="card stack"><PostQuiz /></section>
    </div>
  </div>;
}

function PostQuiz() {
  const q = useApp((s) => s.quiz);
  const [running, setRunning] = useState(false);
  if (q.post) return <Results />;
  if (running) return <Quiz form={otherForm(q.form)} withFeedback onDone={(post) =>
    set((s) => ({ quiz: { ...s.quiz, post }, progress: { ...s.progress, check: true } }))} />;
  return <>
    <h2>{T["check.postTitle"]}</h2><p>{T["check.postIntro"]}</p>
    <button className="btn primary" type="button" onClick={() => setRunning(true)}>{T["check.startPost"]}</button>
  </>;
}

function Results() {
  const q = useApp((s) => s.quiz);
  const pre = q.pre ? score(q.form, q.pre) : null;
  const post = score(otherForm(q.form), q.post);
  const code = resultCode(q.form, pre?.total, post.total);
  const vars = { s: { pre: String(pre?.total ?? ""), post: String(post.total), max: String(post.max) }, num: {} };
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); toast(T["toast.copied"]!); } catch { toast(T.copyFailed!); }
  };
  return <>
    <h2>{T["check.changed"]}</h2>
    <Choices seg label={T["check.changed"]!} options={L["check.changedOpts"]!.map((o) => [o, o])} value={q.changedDecision}
      onChange={(c: string) => set((s) => ({ quiz: { ...s.quiz, changedDecision: c } }))} />
    <p className="value">{fill(T[pre ? "check.results" : "check.resultsNoPre"]!, vars)}</p>
    <h3>{T["check.objTitle"]}</h3>
    <div className="objbars">{Object.entries(post.perObj).map(([obj, [got, max]], k) => {
      const pg = pre ? pre.perObj[obj]![0] : 0;
      return <div className="objbar" key={obj}><span>{L["check.objShort"]![k]}</span>
        <div className="bars" aria-hidden="true"><span className="pre" style={{ width: `${(pg / max) * 100}%` }} /><span className="post" style={{ width: `${(got / max) * 100}%` }} /></div>
        <span className="num">{`${pre ? pg + " → " : ""}${got}/${max}`}</span></div>;
    })}</div>
    <p>{T["check.code"]}</p><p className="code">{code}</p>
    <button className="btn secondary" type="button" onClick={copy}><Icon name="copy" />{T["btn.copy"]}</button>
    <p className="caption">{T["check.codeNote"]}</p>
    <div className="row">
      <button className="btn ghost" type="button" onClick={(e) => openLimits(e.currentTarget)}>{T["limits.title"]}</button>
      <button className="btn ghost" type="button" onClick={(e) => openSources(e.currentTarget)}>{T["sources.title"]}</button>
    </div>
  </>;
}
