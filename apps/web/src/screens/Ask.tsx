// The three AI features (idea.md §10). The API returns only an id or numbers copied from the learner's text;
// every sentence the learner reads was written by the team and every number comes from the engine.
import { Suspense, lazy, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ASK, ASK_UI, BILL_UI, REASON, REASON_UI, T, fill } from "@kirakurs/core/content";
import { ASK_IDS, MAX_LEN, piiBlocked, REASON_IDS, type AskId, type Bill, type ReasonId } from "@kirakurs/core/ask";
import { amount } from "@kirakurs/core/format";
import { setRaw, toast, useData } from "../store";
import { Choices, Icon, LinesSkeleton } from "../ui";
import { tw, cn } from "../tw";

// Dev: Vite proxies /api to `wrangler dev`. Build: set VITE_ASK_URL to the deployed Worker URL; empty = AI hidden.
// Loaded with the chat bubble, not the first page (~99 kB).
const BorderBeam = lazy(() => import("border-beam"));

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

// Floating avatar ("Kiri") on every screen except quizzes (Pre-check, and Check while its after-quiz card is on screen).
// Click → Kiri hops and flips, then a small chat bubble opens above it. Non-modal: the screen stays usable; Esc or × closes.
// Sits above the action bar / phone tab bar (both 5rem incl. gap) so it never covers Continue; lower on Welcome.
export function AskLauncher({ screen }: { screen: string }) {
  const [quizInView, setQuizInView] = useState(false);
  const [phase, setPhase] = useState<"closed" | "hop" | "open">("closed");
  const [busy, setBusy] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = document.getElementById("postquiz");
    if (!el) return setQuizInView(false);
    const io = new IntersectionObserver(([e]) => setQuizInView(!!e?.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [screen]);
  useEffect(() => {
    if (phase === "hop") { const t = setTimeout(() => setPhase("open"), matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 520); return () => clearTimeout(t); }
    if (phase === "open") panel.current?.focus();
  }, [phase]);
  const close = () => { setPhase("closed"); btn.current?.focus(); };
  if (screen === "precheck" || quizInView) return null;
  return <div className={cn("fixed right-[clamp(1rem,3vw,3rem)] z-30 bottom-[calc(5.25rem+env(safe-area-inset-bottom))]",
      screen === "welcome" && "bottom-[calc(1.5rem+env(safe-area-inset-bottom))]")}>
    {phase === "open" && <div ref={panel} role="dialog" aria-labelledby="askTitle" tabIndex={-1}
      onKeyDown={(e) => e.key === "Escape" && close()}
      className="ask-pop absolute right-0 bottom-full mb-3 flex h-[min(32rem,calc(100dvh-10rem))] w-[min(23rem,calc(100vw-2rem))] flex-col rounded-2xl border border-line bg-surface text-ink shadow-[0_12px_40px_rgb(0_0_0/.28)]">
      <div className="flex items-center gap-3 rounded-t-2xl bg-primary py-2 pr-2 pl-3 text-on-primary">
        <span className="grid size-9 place-items-center rounded-full bg-white/90"><Kiri state="idle" small /></span>
        <div className="grid flex-1 leading-tight"><h2 id="askTitle" className="text-base">{ASK_UI.title}</h2>
          <span className="text-xs opacity-85">{ASK_UI.sub}</span></div>
        <button className={cn(tw.iconBtn, "text-on-primary hover:bg-white/15")} type="button" onClick={close}><Icon name="x" label={T["btn.close"]} /></button>
      </div>
      <AskBody screen={screen} busy={busy} setBusy={setBusy} />
      <span aria-hidden="true" className="absolute -bottom-2 right-7 size-4 rotate-45 border-r border-b border-line bg-surface" />
    </div>}
    <button ref={btn} type="button" aria-expanded={phase === "open"} aria-label={ASK_UI.title}
      onClick={() => phase === "open" ? close() : setPhase("hop")}
      className="grid size-16 cursor-pointer place-items-center rounded-full border-0 bg-transparent p-0">
      <Kiri state={phase === "hop" ? "hop" : busy ? "working" : "idle"} />
    </button>
  </div>;
}

// Kiri: a ringgit/dollar coin-creature. Teal half = ringgit, amber half = dollar; the antenna is the exchange swirl.
// Idle: floats, blinks, glances around. Working: eyes dart, antenna glows. Hop: squash, jump and flip (click).
function Kiri({ state, small }: { state: "idle" | "working" | "hop"; small?: boolean }) {
  return <svg className={cn("kiri overflow-visible", small ? "size-7" : "size-16")} data-state={state} viewBox="0 0 64 64" aria-hidden="true">
    <ellipse className="kiri-shadow" cx="32" cy="61" rx="15" ry="2.5" fill="currentColor" opacity=".18" />
    <g className="kiri-body">
      <path className="kiri-ant" d="M32 12c0-5 4-8 8-6.5" fill="none" stroke="var(--line-strong)" strokeWidth="2" strokeLinecap="round" />
      <circle className="kiri-tip" cx="40.5" cy="5.5" r="3" fill="var(--risk-fill)" />
      <clipPath id="kiriClip"><rect x="6" y="11" width="52" height="46" rx="20" /></clipPath>
      <g clipPath="url(#kiriClip)">
        <rect x="6" y="11" width="52" height="46" fill="var(--primary)" />
        <path d="M60 9v50H18Z" fill="var(--risk-fill)" />
      </g>
      <rect x="13" y="22" width="38" height="23" rx="11.5" fill="var(--surface)" />
      <g className="kiri-eyes" fill="var(--ink)"><ellipse cx="25" cy="32.5" rx="3" ry="3.6" /><ellipse cx="39" cy="32.5" rx="3" ry="3.6" /></g>
      <path d="M29.5 39.5q2.5 2 5 0" fill="none" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="18.5" cy="38" r="2" fill="var(--danger)" opacity=".3" /><circle cx="45.5" cy="38" r="2" fill="var(--danger)" opacity=".3" />
    </g>
  </svg>;
}

// Topic list: four chips first, the rest behind "More topics" so the thread stays short.
function Topics({ ids, chips }: { ids: readonly AskId[]; chips: (ids: readonly AskId[]) => ReactNode }) {
  const [all, setAll] = useState(false);
  return <div className="grid gap-2">{chips(all ? ids : ids.slice(0, 4))}
    {!all && ids.length > 4 && <button type="button" onClick={() => setAll(true)}
      className="cursor-pointer justify-self-start rounded-full border border-line-strong bg-transparent px-3 py-1.5 text-sm text-ink hover:bg-surface-2">
      {ASK_UI.more} ({ids.length - 4})</button>}</div>;
}

// Thinking orb: shown while the AI picks an explanation.
function ThinkingOrb() {
  return <div className="flex items-center gap-2" role="status" aria-label={T["loading"]}>
    <span className="orb size-5 rounded-full" aria-hidden="true" /><span className={cn(tw.caption)}>Thinking…</span>
  </div>;
}

// Chat thread: Kiri greets, suggestions are chips, every reply is a team-written explanation picked by id.
type Msg = { me: string } | { id: AskId } | { menu: true };
function AskBody({ screen, busy, setBusy }: { screen: string; busy: boolean; setBusy: (b: boolean) => void }) {
  const { v } = useData();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [q, setQ] = useState("");
  const [pii, setPii] = useState(false);
  const [focus, setFocus] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: "end", behavior: "smooth" }); }, [msgs, busy]);   // braces: newer Chrome returns a Promise here, which React would call as cleanup
  const pick = (k: AskId) => setMsgs((m) => [...m, { me: ASK[k].q }, { id: k }]);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const text = q.trim().slice(0, MAX_LEN);
    setPii(piiBlocked(text));
    if (!text || piiBlocked(text) || busy) return;
    setQ(""); setMsgs((m) => [...m, { me: text }]); setBusy(true);
    const r = await callAI<{ explanation_id: string }>({ task: "ask", question: text });
    setBusy(false);
    setMsgs((m) => [...m, r && r.explanation_id in ASK ? { id: r.explanation_id as AskId } : { menu: true }]);
  };
  const suggested = SUGGEST[screen] ?? SUGGEST.welcome!;
  const chips = (ids: readonly AskId[]) => <div className="flex flex-wrap gap-2">
    {ids.map((k) => <button key={k} type="button" onClick={() => pick(k)} disabled={busy}
      className="cursor-pointer rounded-full border border-primary/40 bg-primary-soft/60 px-3 py-1.5 text-left text-sm text-primary-ink enabled:hover:bg-primary-soft">{ASK[k].q}</button>)}</div>;
  const bot = "max-w-[88%] justify-self-start rounded-2xl rounded-bl-sm bg-surface-2 px-3.5 py-2.5 text-sm";
  const inputRow = <div className="flex items-center gap-2 rounded-full border border-line-strong bg-surface-2 in-data-active:border-transparent py-1 pr-1 pl-4">
    <label htmlFor="askQ" className="sr-only">{ASK_UI.label}</label>
    <input id="askQ" maxLength={MAX_LEN} autoComplete="off" aria-describedby="askQNotice" placeholder={ASK_UI.placeholder}
      value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm outline-none" />
    <button type="submit" disabled={busy || !q.trim()} className="grid size-9 cursor-pointer place-items-center rounded-full border-0 bg-primary text-on-primary disabled:opacity-40">
      <Icon name="right" label={ASK_UI.send} /></button>
  </div>;
  const others = ASK_IDS.filter((k) => !suggested.includes(k));
  const topics = <Topics ids={others} chips={chips} />;
  return <>
    <div className="grid min-h-0 flex-1 content-start gap-3 overflow-y-auto px-4 py-4" aria-live="polite">
      <p className={bot}>{aiOn ? ASK_UI.hi : ASK_UI.hiNoAi}</p>
      {chips(suggested)}
      {msgs.map((m, i) => "me" in m
        ? <p key={i} className="max-w-[85%] justify-self-end rounded-2xl rounded-br-sm bg-primary px-3.5 py-2.5 text-sm text-on-primary">{m.me}</p>
        : "id" in m
          ? <div key={i} className={cn(bot, "grid gap-1.5")}><p>{fill(ASK[m.id].a, v)}</p>
              <p className="mt-1 flex items-start gap-2 border-t border-line pt-2 text-xs leading-snug text-muted">
                <span className="mt-px grid size-4 shrink-0 place-items-center rounded-full bg-success text-white"><Icon name="ok" /></span>
                <span><b className="font-semibold text-success">{ASK_UI.chip}.</b> {ASK_UI.chipWhy}</span></p></div>
          : <div key={i} className="grid gap-2"><p className={bot}>{ASK_UI.unsure}</p>{topics}</div>)}
      {busy && <div className={bot}><ThinkingOrb /></div>}
      {!aiOn && <><p className={bot}>{ASK_UI.menu}</p>{topics}</>}
      <div ref={end} />
    </div>
    {aiOn && <form onSubmit={submit} className="grid gap-1.5 border-t border-line px-3 pt-3 pb-2">
      {pii && <p className="field-error text-sm">{ASK_UI.pii}</p>}
      {/* Border Beam (libraries.dev/beam): a teal glow rides the input while you type and while the AI picks the topic */}
      <Suspense fallback={inputRow}><BorderBeam size="md" colorVariant="forest" theme="light" strength={1} borderRadius={999} active={busy || focus} className="rounded-full">
      {inputRow}
      </BorderBeam></Suspense>
      <p id="askQNotice" className="text-[0.6875rem] leading-snug text-muted">{ASK_UI.notice}</p>
    </form>}
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
