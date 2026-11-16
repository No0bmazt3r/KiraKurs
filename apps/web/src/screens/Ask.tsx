// The three AI features (idea.md §10). The API returns only an id or numbers copied from the learner's text;
// every sentence the learner reads was written by the team and every number comes from the engine.
import { useEffect, useState, type FormEvent } from "react";
import { ASK, ASK_UI, BILL_UI, REASON, REASON_UI, fill } from "@kirakurs/core/content";
import { ASK_IDS, MAX_LEN, piiBlocked, REASON_IDS, type AskId, type Bill, type ReasonId } from "@kirakurs/core/ask";
import { amount } from "@kirakurs/core/format";
import { openSheet, setRaw, toast, useData } from "../store";
import { Choices, Icon, LinesSkeleton } from "../ui";
import { tw, cn } from "../tw";

// Dev: Vite proxies /api to `wrangler dev`. Build: set VITE_ASK_URL to the deployed Worker URL; empty = AI hidden.
const ASK_URL: string = import.meta.env.VITE_ASK_URL ?? (import.meta.env.DEV ? "/api/ask" : "");
export const aiOn = !!ASK_URL;

// One POST to the Worker; null on any failure (offline, timeout, non-200).
async function callAI<R>(body: Record<string, string>): Promise<R | null> {
  try {
    const res = await fetch(ASK_URL, { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify(body), signal: AbortSignal.timeout(10000) });
    return res.ok ? ((await res.json()) as R) : null;
  } catch { return null; }
}

// Shared free-text box: length cap and the personal-data check before anything is sent.
function AiForm({ id, label, notice, send, busy, onSend }: { id: string; label: string; notice: string; send: string; busy: boolean; onSend: (text: string | null) => void }) {
  const [q, setQ] = useState("");
  const [pii, setPii] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = q.trim().slice(0, MAX_LEN);
    setPii(piiBlocked(text));
    onSend(!text || piiBlocked(text) ? null : text);
  };
  return <form className={cn(tw.stack)} onSubmit={submit}>
    <label htmlFor={id} className={cn(tw.label)}>{label}</label>
    <textarea id={id} maxLength={MAX_LEN} aria-describedby={id + "Notice"} value={q} onChange={(e) => setQ(e.target.value)} />
    <p className={cn(tw.caption)} id={id + "Notice"}>{notice}</p>
    {pii && <p className="field-error">{ASK_UI.pii}</p>}
    <button className={cn(tw.btn, tw.primary, "justify-self-start")} type="submit" disabled={busy}><Icon name="ask" />{send}</button>
  </form>;
}

// ---- 1. Ask KiraKurs: free question → one of 20 explanations ----
// Three questions per screen, shown first so a beginner never faces an empty box. Predict avoids why_ppp_down (it would give the answer away).
const SUGGEST: Record<string, AskId[]> = {
  welcome: ["real_rate_rule", "forward_not_forecast", "what_real_rate"],
  learn: ["what_real_rate", "why_ppp_down", "forward_not_forecast"],
  predict: ["what_real_rate", "forward_not_forecast", "data_dates"],
  map: ["why_forward_below_spot", "why_ife_equals_forward", "what_real_rate"],
  coach: ["why_wait_cheaper_ppp", "why_range_wide", "what_split"],
  play: ["why_range_wide", "forward_not_forecast", "how_reliable"],
  check: ["break_even", "linked_mode", "real_rate_rule"],
};

// Floating launcher on every screen except quizzes (Pre-check, and Check while its after-quiz card is on screen).
// Sits above the guided action bar / phone tab bar (both 5rem incl. gap); bottom-6 where nothing is fixed at the bottom.
export function AskLauncher({ screen }: { screen: string }) {
  const [quizInView, setQuizInView] = useState(false);
  useEffect(() => {
    const el = document.getElementById("postquiz");
    if (!el) return setQuizInView(false);
    const io = new IntersectionObserver(([e]) => setQuizInView(!!e?.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [screen]);
  if (screen === "precheck" || quizInView) return null;
  const Body = () => <AskBody screen={screen} />;
  return <button type="button" aria-haspopup="dialog" onClick={(e) => openSheet(ASK_UI.title!, Body, e.currentTarget)}
    className={cn(tw.btn, "fixed right-[clamp(1rem,3vw,3rem)] z-20 border-line-strong bg-surface text-ink shadow-[0_4px_16px_rgb(0_0_0/.14)] enabled:hover:bg-surface-2",
      "bottom-[calc(5rem+env(safe-area-inset-bottom))] max-[399px]:px-3", (screen === "welcome") ? "bottom-[calc(1.5rem+env(safe-area-inset-bottom))]" : "lg:in-[.unlocked]:bottom-6")}>
    <Icon name="ask" /><span className="max-[399px]:sr-only">{ASK_UI.title}</span></button>;
}

function AskBody({ screen }: { screen: string }) {
  const { v } = useData();
  const [busy, setBusy] = useState(false);
  const [shown, setShown] = useState<AskId | "menu" | null>(null);
  const send = async (text: string | null) => {
    if (!text) return;
    setBusy(true);
    const r = await callAI<{ explanation_id: string }>({ task: "ask", question: text });
    setBusy(false);
    setShown(r && r.explanation_id in ASK ? (r.explanation_id as AskId) : "menu");
  };
  const answer = shown && shown !== "menu" ? shown : null;
  const list = (ids: AskId[]) => <div className={tw.options}>
    {ids.map((k) => <button key={k} className={tw.option} type="button" aria-pressed={answer === k} onClick={() => setShown(k)}>{ASK[k].q}</button>)}</div>;
  return <>
    <p className={cn(tw.label)}>{ASK_UI.suggest}</p>
    {list(SUGGEST[screen] ?? SUGGEST.welcome!)}
    {aiOn && <AiForm id="askQ" label={ASK_UI.label} notice={ASK_UI.notice} send={ASK_UI.send} busy={busy} onSend={send} />}
    <div className={cn(tw.stack)} aria-live="polite">
      {busy && <LinesSkeleton />}
      {answer && <div className={cn(tw.callout)}>
        <h3>{ASK[answer].q}</h3><p>{fill(ASK[answer].a, v)}</p>
        <p className={cn(tw.caption)}><Icon name="ok" />{" " + ASK_UI.chip}</p>
      </div>}
      {(!aiOn || shown === "menu") && <><p className={cn(tw.label)}>{ASK_UI.menu}</p>{list(ASK_IDS.filter((k) => !SUGGEST[screen]?.includes(k)))}</>}
    </div>
  </>;
}

// ---- 2. Explain your thinking (Predict): free reasoning → one of 7 misconception replies. Works without AI as a pick-list. ----
export function ReasonBox({ pick }: { pick: string }) {
  const { v } = useData();
  const [busy, setBusy] = useState(false);
  const [id, setId] = useState<ReasonId | null>(null);
  const [byAi, setByAi] = useState(false);
  const send = async (text: string | null) => {
    if (!text) return;
    setBusy(true);
    const r = await callAI<{ reason_id: string }>({ task: "reason", pick, question: text });
    setBusy(false);
    const got = r && (REASON_IDS as readonly string[]).includes(r.reason_id) ? (r.reason_id as ReasonId) : "unclear";
    setId(got); setByAi(true);
  };
  return <section className={cn(tw.callout)} aria-labelledby="reasonTitle">
    <h2 id="reasonTitle" className={cn(tw.cardTitle)}>{REASON_UI.title}</h2>
    {aiOn && <AiForm id="reasonQ" label={REASON_UI.label} notice={REASON_UI.intro} send={REASON_UI.send} busy={busy} onSend={send} />}
    {busy && <LinesSkeleton n={2} />}
    <p className={cn(tw.label)}>{aiOn ? REASON_UI.menu : REASON_UI.introNoAi}</p>
    <Choices label={REASON_UI.title} options={REASON_IDS.map((k) => [k, REASON[k].opt])} value={id}
      onChange={(k: ReasonId) => { setId(k); setByAi(false); }} />
    <div aria-live="polite">{id && <div className={cn(tw.stack)}>
      <p>{fill(REASON[id].a, v)}</p>
      {byAi && <p className={cn(tw.caption)}><Icon name="ok" />{" " + REASON_UI.chip}</p>}
    </div>}</div>
  </section>;
}

// ---- 3. Describe your bill (Coach): words → amount and days, checked against the text, then the engine. ----
export function BillReader() {
  const [busy, setBusy] = useState(false);
  const [bill, setBill] = useState<Bill | null | undefined>(undefined);   // undefined = not asked yet, null = nothing found
  if (!aiOn) return null;
  const send = async (text: string | null) => {
    if (!text) return;
    setBusy(true);
    const r = await callAI<{ bill: Bill | null }>({ task: "bill", question: text });
    setBusy(false);
    setBill(r?.bill ?? null);
  };
  const usable = bill && (bill.ccy == null || bill.ccy === "USD");
  const apply = () => {
    if (!bill) return;
    setRaw({ ...(bill.T != null && { T: String(bill.T) }), ...(bill.n != null && { n: String(bill.n) }) });
    toast(BILL_UI.applied);
  };
  return <div className={cn(tw.stack)}>
    <AiForm id="billQ" label={BILL_UI.label} notice={ASK_UI.notice} send={BILL_UI.send} busy={busy} onSend={send} />
    <div aria-live="polite" className={cn(tw.stack)}>
      {busy && <LinesSkeleton n={2} />}
      {bill === null && <p>{BILL_UI.none}</p>}
      {bill && !usable && <p className="field-error">{BILL_UI.ccy}</p>}
      {usable && <div className={cn(tw.callout)}>
        <p className={cn(tw.label)}>{BILL_UI.read}</p>
        <p>{BILL_UI.amount}: <b className="num">{bill.T != null ? "US$" + amount(bill.T, bill.T % 1 ? 2 : 0) : "–"}</b> · {BILL_UI.days}: <b className="num">{bill.n ?? "–"}</b></p>
        <button className={cn(tw.btn, tw.primary, "justify-self-start")} type="button" onClick={apply}>{BILL_UI.apply}</button>
      </div>}
      <p className={cn(tw.caption)}>{BILL_UI.note}</p>
    </div>
  </div>;
}
