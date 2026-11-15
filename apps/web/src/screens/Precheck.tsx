// Screen 0: Pre-check (docs/UX-FLOWS.md §2.0, CONTENT.md §2). No right/wrong shown.
import { useState } from "react";
import { T, QUIZ, fill, makeVars } from "@kirakurs/core/content";
import { PRESETS } from "@kirakurs/core/presets";
import type { Answers } from "@kirakurs/core/quiz";
import { useApp, set } from "../store";
import { Badge, Icon } from "../ui";
import { tw, cn } from "../tw";
import type { IconName } from "../icons";
import { useGo } from "../Shell";
import { Quiz } from "./Quiz";
import { ThinkFigure } from "../figures";

const v = makeVars(PRESETS.snapshot);

export function Precheck() {
  const go = useGo();
  const form = useApp((s) => s.quiz.form);
  const [phase, setPhase] = useState<"intro" | "quiz" | "done">("intro");
  const finish = (pre: Answers | null) => set((s) => ({ quiz: { ...s.quiz, pre }, progress: { ...s.progress, precheck: true } }));

  const qtotal = String(QUIZ[form].length);
  const expect: [IconName, string, string][] = [
    ["check", fill(T["pre.exp.q"]!, { s: { qtotal }, num: {} }), T["pre.exp.q.s"]!],
    ["shield", T["pre.exp.t"]!, T["pre.exp.t.s"]!],
    ["scale", T["pre.exp.r"]!, T["pre.exp.r.s"]!],
  ];
  const enter = "animate-[slide-in_480ms_var(--ease-out)_both]";

  return <div className={cn(tw.screen, "gap-8")}>
    {phase === "intro" && <div key="intro" className={"grid items-center gap-10 lg:min-h-[calc(100dvh-14rem)] lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16 " + enter}>
      <div className="grid gap-8">
        <div className="grid gap-4">
          <h1 className="text-3xl leading-tight lg:text-5xl">{T["pre.h1"]}</h1>
          <p className="max-w-[60ch] text-lg text-muted">{fill(T["pre.lead"]!, v)}</p>
        </div>
        <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-3">
          {expect.map(([icon, head, sub], k) => <li key={head} style={{ animationDelay: `${120 + k * 90}ms` }}
            className="grid content-start gap-2 rounded-md border border-line bg-surface p-4 animate-[slide-in_480ms_var(--ease-out)_both]">
            <span className="grid size-9 place-items-center rounded-sm bg-primary-soft text-primary-ink"><Icon name={icon} /></span>
            <span className="font-semibold">{head}</span>
            <span className="text-sm text-muted">{sub}</span>
          </li>)}
        </ul>
        <div className="flex flex-wrap items-center gap-3">
          <button className={cn(tw.btn, tw.primary, tw.big)} type="button" onClick={() => setPhase("quiz")}>{T["btn.start"]}<Icon name="right" /></button>
          <button className={cn(tw.btn, tw.secondary, tw.big)} type="button" onClick={() => { finish(null); go("learn"); }}>{T["btn.skip"]}</button>
        </div>
        <div className="grid gap-3">
          <p className="flex items-start gap-2 text-sm text-muted"><Icon name="shield" />{T["pre.consent"]}</p>
          <Badge preset="snapshot" />
        </div>
      </div>
      <div className="grid place-items-center rounded-lg bg-surface p-6 lg:p-10 max-lg:hidden"><div className="w-full max-w-md"><ThinkFigure /></div></div>
    </div>}
    {phase === "quiz" && <div key="quiz" className={"grid gap-6 " + enter}><h1>{T["pre.h1"]}</h1>
      <Quiz form={form} withFeedback={false} onDone={(a) => { finish(a); setPhase("done"); }} /></div>}
    {phase === "done" && <div key="done" className={"grid justify-items-start gap-6 " + enter}>
      <h1>{T["pre.h1"]}</h1>
      <p className={cn(tw.value)}>{T["pre.done"]}</p>
      <button className={cn(tw.btn, tw.primary, tw.big)} type="button" autoFocus onClick={() => go("learn")}>{T["btn.continue"]}<Icon name="right" /></button>
    </div>}
  </div>;
}
