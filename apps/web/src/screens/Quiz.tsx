// Quiz runner shared by Pre-check and Check (docs/UX-FLOWS.md §2.0, §2.5). Scoring lives in @kirakurs/core/quiz.
import { useEffect, useRef, useState } from "react";
import { T, QUIZ, fill, makeVars } from "@kirakurs/core/content";
import { PRESETS } from "@kirakurs/core/presets";
import { itemScore, type Answer, type Answers, type Form } from "@kirakurs/core/quiz";
import { Choices, Feedback, Icon } from "../ui";

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

  return <div className="grid items-start gap-5 lg:grid-cols-2">
    <div className="stack">
    <div className="row">
      <div className="dots" aria-hidden="true">{items.map((_, k) => <span key={k} className={k <= i ? "on" : ""} />)}</div>
      <span className="small">{fill(T["pre.dots"]!, { s: { qn: String(i + 1), qtotal: String(items.length) }, num: {} })}</span>
    </div>
    <h2 ref={stemRef} tabIndex={-1}>{stem}</h2>
    {q.pick2 && <p className="small">{T["pre.pickTwo"]}</p>}
    </div>
    <div className="stack">
    <Choices key={q.id} label={stem} options={q.options} multi={q.pick2 ? 2 : 1} value={answer} onChange={setAnswer}
      locked={checked} correct={q.pick2 ? q.correctSet : q.correct} />
    <p className="label">{T["pre.confidence"]}</p>
    <Choices seg label={T["pre.confidence"]!} options={[["1", T["pre.conf1"]!], ["2", T["pre.conf2"]!], ["3", T["pre.conf3"]!]]} value={conf} onChange={setConf} />
    {checked && <Feedback ok={ok} text={msg} />}
    <button className="btn primary" type="button" disabled={!ready} onClick={next}>
      {withFeedback && !checked ? T["btn.check"] : <>{T["btn.next"]}<Icon name="right" /></>}
    </button>
    </div>
  </div>;
}
