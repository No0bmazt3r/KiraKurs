// Screen 2: Predict (docs/UX-FLOWS.md §2.2, CONTENT.md §4).
import { useState } from "react";
import { T, fill } from "@kirakurs/core/content";
import { useApp, set, useData, type Dir } from "../store";
import { Badge, Choices, Feedback } from "../ui";
import { tw, cn } from "../tw";
import { ReasonBox } from "./Ask";
import { useGo } from "../Shell";

export function Predict() {
  const go = useGo();
  const { v } = useData();
  const saved = useApp((s) => s.progress.predict);
  const [picked, setPicked] = useState<Dir | null>(saved);
  const [checked, setChecked] = useState(!!saved);
  const check = () => { set((s) => ({ progress: { ...s.progress, predict: picked }, dismissedReveal: false })); setChecked(true); };

  return <div className={cn(tw.screen)}>
    <div className="grid items-start gap-5 lg:grid-cols-2">
    <h1>{fill(T["predict.h1"]!, v)}</h1>
    <div className={cn(tw.stack)}>
    <Choices label={T["predict.h1"]!} options={(["up", "down", "same"] as const).map((k) => [k, T["predict." + k]!])}
      value={picked} onChange={setPicked} locked={checked} correct="up" />
    {!checked && <button className={cn(tw.btn, tw.primary, "justify-self-end")} type="button" disabled={!picked} onClick={check}>{T["btn.check"]}</button>}
    {checked && picked && <Feedback ok={picked === "up"} text={fill(T["predict.fb." + picked]!, v)}
      onContinue={() => { set({ unlocked: true }); go("map"); }} />}
    {checked && picked && <ReasonBox pick={picked} />}
    <p className={cn(tw.caption)}>{T["predict.note"]}</p>
    <Badge preset="snapshot" />
    </div>
    </div>
  </div>;
}
