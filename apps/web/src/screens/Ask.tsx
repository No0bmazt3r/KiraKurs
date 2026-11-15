// "Ask KiraKurs" (stretch, idea.md §10). The API returns only an explanation id; we fill our own template.
import { useState, type FormEvent } from "react";
import { ASK, ASK_UI, fill } from "@kirakurs/core/content";
import { MAX_LEN, piiBlocked, type AskId } from "@kirakurs/core/ask";
import { openSheet, useData } from "../store";
import { Icon, LinesSkeleton } from "../ui";
import { tw, cn } from "../tw";

// Dev: Vite proxies /api to `wrangler dev`. Build: set VITE_ASK_URL to the deployed Worker URL; empty = feature hidden.
const ASK_URL: string = import.meta.env.VITE_ASK_URL ?? (import.meta.env.DEV ? "/api/ask" : "");

export function AskButton() {
  if (!ASK_URL) return null;
  return <button className={cn(tw.btn, tw.secondary)} type="button" onClick={(e) => openSheet(ASK_UI.title!, AskBody, e.currentTarget)}>
    <Icon name="ask" />{ASK_UI.btn}</button>;
}

function AskBody() {
  const { v } = useData();
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [shown, setShown] = useState<AskId | "menu" | "pii" | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const text = q.trim().slice(0, MAX_LEN);
    if (!text) return setShown("menu");
    if (piiBlocked(text)) return setShown("pii");
    setBusy(true);
    let id = "menu";
    try {
      const res = await fetch(ASK_URL, { method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: text }), signal: AbortSignal.timeout(10000) });
      if (res.ok) id = ((await res.json()) as { explanation_id: string }).explanation_id;
    } catch { /* offline, timeout: menu */ }
    setBusy(false);
    setShown(id in ASK ? (id as AskId) : "menu");
  };

  return <>
    <form className={cn(tw.stack)} onSubmit={submit}>
      <label htmlFor="askQ" className={cn(tw.label)}>{ASK_UI.label}</label>
      <textarea id="askQ" maxLength={MAX_LEN} aria-describedby="askNotice" value={q} onChange={(e) => setQ(e.target.value)} />
      <p className={cn(tw.caption)} id="askNotice">{ASK_UI.notice}</p>
      <button className={cn(tw.btn, tw.primary)} type="submit" disabled={busy}>{ASK_UI.send}</button>
    </form>
    <div className={cn(tw.stack)} aria-live="polite">
      {busy && <LinesSkeleton />}
      {shown === "pii" && <p className="field-error">{ASK_UI.pii}</p>}
      {shown === "menu" && <><p className={cn(tw.label)}>{ASK_UI.menu}</p><div className={tw.options}>
        {(Object.keys(ASK) as AskId[]).map((k) => <button key={k} className={tw.option} type="button" onClick={() => setShown(k)}>{ASK[k].q}</button>)}
      </div></>}
      {shown && shown !== "menu" && shown !== "pii" && <div className={cn(tw.callout)}>
        <h3>{ASK[shown].q}</h3><p>{fill(ASK[shown].a, v)}</p>
        <p className={cn(tw.caption)}><Icon name="ok" />{" " + ASK_UI.chip}</p>
      </div>}
    </div>
  </>;
}
