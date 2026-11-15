// Quiz runner shared by Pre-check and Check (docs/UX-FLOWS.md §2.0, §2.5). Scoring lives in @kirakurs/core/quiz.
import { useEffect, useRef, useState } from "react";
import { T, QUIZ, fill, makeVars } from "@kirakurs/core/content";
import { PRESETS } from "@kirakurs/core/presets";
import { itemScore, type Answer, type Answers, type Form } from "@kirakurs/core/quiz";
import { Choices, Feedback, Icon } from "../ui";
import { tw, cn } from "../tw";
import { ThinkFigure } from "../figures";

const v = makeVars(PRESETS.snapshot);

// One item per view. withFeedback: show right/wrong after each item (post-check only).
export function Quiz({ form, withFeedback, onDone }: { form: Form; withFeedback: boolean; onDone: (a: Answers) => void }) {
  const items = QUIZ[form];
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState<Answer>(null);
  const [conf, setConf] = useState("2");
  const [checked, setChecked] = useState(false);
  const answers = useRef<Answers>({});
  const stemRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => stemRef.current?.focus(), [i]);

  const q = items[i]!;
  const ready = q.pick2 ? Array.isArray(answer) && answer.length === 2 : answer != null;
  const ok = itemScore(q, answer) === (q.pick2 ? 2 : 1);
  const wrongPick = q.pick2 && Array.isArray(answer) ? answer.find((a) => q.fbWrong?.[a]) : undefined;
  const msg = wrongPick ? q.fbWrong![wrongPick]! : typeof q.fb === "string" ? q.fb : ok ? T["fb.correct"] + "." : q.fb[answer as string] ?? "";
  const stem = fill(q.stem, v).replace("US$1", (form === "B" ? "£" : "US$") + "1");

  const next = () => {
    answers.current[q.id] = { answer, confidence: Number(conf) };
    if (withFeedback && !checked) return setChecked(true);
    if (i + 1 < items.length) { setI(i + 1); setAnswer(null); setConf("2"); setChecked(false); }
    else onDone(answers.current);
  };

  // Container query: two columns only when the quiz itself is wide (full-page Pre-check), one column inside the Check card.
  return <div className="@container">
    <div key={i} className="grid items-stretch gap-5 @3xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] @3xl:gap-8 animate-[slide-in_420ms_var(--ease-out)_both]">
      <div className="grid content-between gap-6 rounded-xl bg-surface-2 p-5 @3xl:p-7">
        <div className="grid gap-4">
          <div className="flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-sm bg-line" aria-hidden="true">
              <div className="h-full rounded-sm bg-primary transition-[width] duration-500 ease-out" style={{ width: `${((i + 1) / items.length) * 100}%` }} />
            </div>
            <span className="text-sm text-muted tabular-nums">{fill(T["pre.dots"]!, { s: { qn: String(i + 1), qtotal: String(items.length) }, num: {} })}</span>
          </div>
          <h2 ref={stemRef} tabIndex={-1} className="text-xl leading-snug @3xl:text-2xl">{stem}</h2>
          {q.pick2 && <p className="text-sm text-muted">{T["pre.pickTwo"]}</p>}
        </div>
        <div className="hidden max-w-[16rem] @3xl:block"><ThinkFigure /></div>
      </div>
      <div className="grid content-start gap-3">
        <Choices key={q.id} label={stem} options={q.options} multi={q.pick2 ? 2 : 1} value={answer} onChange={setAnswer}
          locked={checked} correct={q.pick2 ? q.correctSet : q.correct} />
        <p className={cn(tw.label, "mt-2")}>{T["pre.confidence"]}</p>
        <Choices seg label={T["pre.confidence"]!} options={[["1", T["pre.conf1"]!], ["2", T["pre.conf2"]!], ["3", T["pre.conf3"]!]]} value={conf} onChange={setConf} />
        {checked && <Feedback ok={ok} text={msg} />}
        <button className={cn(tw.btn, tw.primary, "justify-self-end")} type="button" disabled={!ready} onClick={next}>
          {withFeedback && !checked ? T["btn.check"] : <>{T["btn.next"]}<Icon name="right" /></>}
        </button>
      </div>
    </div>
  </div>;
}
