// Screen 0: Pre-check (docs/UX-FLOWS.md §2.0, CONTENT.md §2). No right/wrong shown.
import { useState } from "react";
import { T, fill, makeVars } from "@kirakurs/core/content";
import { PRESETS } from "@kirakurs/core/presets";
import type { Answers } from "@kirakurs/core/quiz";
import { useApp, set } from "../store";
import { Icon } from "../ui";
import { useGo } from "../Shell";
import { Quiz } from "./Quiz";

const v = makeVars(PRESETS.snapshot);

export function Precheck() {
  const go = useGo();
  const form = useApp((s) => s.quiz.form);
  const [phase, setPhase] = useState<"intro" | "quiz" | "done">("intro");
  const finish = (pre: Answers | null) => set((s) => ({ quiz: { ...s.quiz, pre }, progress: { ...s.progress, precheck: true } }));

  return <div className="screen"><h1>{T["pre.h1"]}</h1><div className="stack">
    {phase === "intro" && <>
      <p className="banner"><Icon name="shield" />{T["pre.consent"]}</p>
      <p>{fill(T["pre.lead"]!, v)}</p>
      <div className="row">
        <button className="btn primary" type="button" onClick={() => setPhase("quiz")}>{T["btn.start"]}</button>
        <button className="btn secondary" type="button" onClick={() => { finish(null); go("learn"); }}>{T["btn.skip"]}</button>
      </div>
    </>}
    {phase === "quiz" && <Quiz form={form} withFeedback={false} onDone={(a) => { finish(a); setPhase("done"); }} />}
    {phase === "done" && <>
      <p className="value">{T["pre.done"]}</p>
      <button className="btn primary" type="button" autoFocus onClick={() => go("learn")}>{T["btn.continue"]}<Icon name="right" /></button>
    </>}
  </div></div>;
}
