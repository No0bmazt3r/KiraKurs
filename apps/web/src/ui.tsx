// Shared components (docs/DESIGN.md §5). Copy is rendered as text only; icons are static SVG strings.
import { cloneElement, useEffect, useId, useLayoutEffect, useRef, useState, type ElementType, type KeyboardEvent, type ReactElement, type ReactNode } from "react";
import { T, L, TIPS, SOURCES, tipParts, explainChange } from "@kirakurs/core/content";
import { parseNumber, type Inputs } from "@kirakurs/core/engine";
import { PRESETS, type PresetId } from "@kirakurs/core/presets";
import { P, type IconName } from "./icons";
import { useApp, openSheet, set } from "./store";
import { tw, cn } from "./tw";

export const cx = cn;

export function Icon({ name, label }: { name: IconName; label?: string }) {
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true };
  return <svg className="i" viewBox="0 0 24 24" {...a11y} dangerouslySetInnerHTML={{ __html: P[name] }} />;
}

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// Text that animates when its value changes (not on first render). Big numbers (class value / hero-value) count up
// from the old figure to the new one with the same decimals and grouping; the final text is always the exact string.
const NUM = /-?\d[\d,]*(?:\.\d+)?/g;
function tween(from: string, to: string, t: number) {
  const a = from.match(NUM), b = to.match(NUM);
  if (!a || !b || a.length !== b.length || from.replace(NUM, "#") !== to.replace(NUM, "#")) return to;
  let i = 0;
  return to.replace(NUM, (tok) => {
    const x = parseFloat(a[i++]!.replace(/,/g, "")), y = parseFloat(tok.replace(/,/g, ""));
    const d = (tok.split(".")[1] ?? "").length;
    return (x + (y - x) * t).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d, useGrouping: tok.includes(",") });
  });
}
const nudge = (el: Element | null) => el?.animate([{ opacity: 0.4, transform: "translateY(3px)" }, { opacity: 1, transform: "none" }],
  { duration: 320, easing: "cubic-bezier(0.22,1,0.36,1)" });
export function Live({ as: Tag = "p", className, children, ...rest }: { as?: ElementType; className?: string; children: string; [k: string]: unknown }) {
  const prev = useRef(children);
  const el = useRef<HTMLElement>(null);
  const [mid, setMid] = useState<string | null>(null);   // in-between text while counting; null = show children
  const count = /\b(hero-)?value\b/.test(className ?? "");
  useEffect(() => {
    const from = prev.current;
    if (from === children) return;
    prev.current = children;
    if (reduced()) return;
    nudge(el.current);
    if (!count) return;
    const t0 = performance.now(); let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / 450), e = 1 - (1 - t) ** 3;
      setMid(t < 1 ? tween(from, children, e) : null);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(raf); setMid(null); };
  }, [children, count]);
  return <Tag ref={el} className={className} {...rest}>{mid ?? children}</Tag>;
}

// "[[tip|text]]" markup → plain text (for aria-live text).
export const plain = (s: string) => s.replace(/\[\[\w+\|([^\]]+)\]\]/g, "$1");

// Copy with [[tip|text]] markup → glossary buttons. A tip opens inline below its paragraph.
export function Rich({ text, className, as: Tag = "p" }: { text: string; className?: string; as?: ElementType }) {
  const id = useId();
  const [open, setOpen] = useState<number | null>(null);
  const prev = useRef(text);
  const el = useRef<HTMLElement>(null);
  useEffect(() => {   // animate in place on change, like <Live>
    if (prev.current !== text) { prev.current = text; if (!reduced()) nudge(el.current); }
  }, [text]);
  const parts = tipParts(text);
  return <>
    <Tag ref={el} className={className}>{parts.map((part, k) => typeof part === "string" ? part :
      <button key={k} className="cursor-pointer border-0 bg-transparent p-0 text-inherit underline decoration-theory decoration-dotted decoration-2 underline-offset-[3px] [font:inherit]" type="button" aria-expanded={open === k} aria-controls={`${id}-${k}`}
        onClick={() => setOpen(open === k ? null : k)} onKeyDown={(e) => e.key === "Escape" && setOpen(null)}>{part.text}</button>)}
    </Tag>
    {open != null && <span className="my-2 block rounded-sm bg-surface-2 px-3 py-2 text-sm animate-[up_320ms_var(--ease-out)]" id={`${id}-${open}`} role="note">{TIPS[(parts[open] as { tip: string }).tip]}</span>}
  </>;
}

// Sliding selection indicator: measures the selected child (`sel`) and exposes its box as CSS vars (--x, --y, --w, --h)
// on the container, whose ::before draws the highlight. `data-ready` turns the glide on after the first placement.
export function useSlide<E extends HTMLElement>(sel: string, dep: unknown) {
  const ref = useRef<E>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const place = () => {
      const on = el.querySelector<HTMLElement>(sel);
      el.style.setProperty("--w", on ? on.offsetWidth + "px" : "0px");
      if (!on) return;
      el.style.setProperty("--h", on.offsetHeight + "px");
      el.style.setProperty("--x", on.offsetLeft + "px");
      el.style.setProperty("--y", on.offsetTop + "px");
    };
    place();
    const raf = requestAnimationFrame(() => { el.dataset.ready = ""; });
    const ro = new ResizeObserver(place);
    ro.observe(el);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [sel, dep]);
  return ref;
}

// Tooltip: shows on hover, keyboard focus and tap (focus), dismisses with Esc. The child must be focusable
// (a button, or an element with tabIndex 0); it is linked to the tip with aria-describedby.
// `end`: open aligned to the trigger's right edge (for triggers near the right side), so the pop never sticks out.
export function Tip({ tip, children, className, end }: { tip: string; children: ReactElement<Record<string, unknown>>; className?: string; end?: boolean }) {
  const id = useId();
  const [hide, setHide] = useState(false);
  return <span className={cn("group/tip relative inline-flex", className)} data-off={hide || undefined} onMouseLeave={() => setHide(false)} onFocus={() => setHide(false)}
    onKeyDown={(e) => e.key === "Escape" && setHide(true)}>
    {cloneElement(children, { "aria-describedby": id })}
    <span role="tooltip" id={id} className={cn(tw.tipPop, end && "right-0 left-auto after:right-4 after:left-auto")}>{tip}</span>
  </span>;
}

// Data badge. `preset` pins it (screens that always use the Snapshot); otherwise it follows the chosen preset.
export function Badge({ preset: fixed }: { preset?: PresetId }) {
  const chosen = useApp((s) => s.preset), userEdited = useApp((s) => s.edited);
  const p = PRESETS[fixed ?? chosen], edited = !fixed && userEdited;
  return <Tip tip={T[p.kind === "dated" ? "badge.tipDated" : "badge.tipPractice"]!} className="justify-self-start">
    <button className={cn("badge inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-sm border border-primary bg-transparent px-2.5 py-1 text-left text-xs text-current in-[.tint-lock]:border-field-accent [&_svg]:size-4",
      p.kind !== "dated" && "border-theory")} type="button" onClick={(e) => openSources(e.currentTarget)}>
      <Icon name="calendar" /><span className="badge-text">{p.badge + (edited ? " " + T.edited : "")}</span>
    </button>
  </Tip>;
}

export function Card({ title, variant = "neutral", children }: { title: string; variant?: string; children: ReactNode }) {
  return <section className={cn(tw.card, variant)}><h2 className={tw.cardTitle}>{title}</h2>{children}</section>;
}

export function Arrow({ dir, words }: { dir: "up" | "down"; words: string }) {
  return <span className="inline-flex items-start gap-1 text-sm text-muted"><Icon name={dir} /><span>{words}</span></span>;
}

// A labelled number field (+ optional slider). The text box keeps a draft while focused; commit on Enter or blur.
export function Field({ label, raw, error, hint, suffix, slider, readonly, onInput }: {
  label: string; raw: string; error?: string; hint?: string; suffix?: string;
  slider?: { min: number; max: number; step: number }; readonly?: boolean; onInput?: (x: string) => void;
}) {
  const id = useId(), errId = id + "-err";
  const ref = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(raw);
  useEffect(() => { if (document.activeElement !== ref.current) setDraft(raw); }, [raw]);
  const x = parseNumber(raw);
  const shown = raw + (suffix === "%" ? "%" : "");
  const box = <div className={cn(tw.inputWrap, readonly && "border-dashed", error && "border-2 border-danger")}>
    <input ref={ref} id={id} type="text" className={tw.input} inputMode="decimal" autoComplete="off" readOnly={readonly} aria-label={label}
      aria-describedby={errId} aria-invalid={error ? "true" : "false"} value={readonly ? raw : draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => draft !== raw && onInput?.(draft)}
      onKeyDown={(e) => e.key === "Enter" && onInput?.(draft)} />
    {suffix && <span className="px-3 text-muted" aria-hidden="true">{suffix}</span>}
  </div>;
  return <div className={cn(tw.field, readonly && "readonly", error && "invalid")}>
    <div className="flex items-baseline justify-between gap-2"><label htmlFor={id} className="font-medium">{label}</label>{slider && <output htmlFor={id}>{shown}</output>}</div>
    {slider ? <>
      <div className="grid grid-cols-[1fr_6rem] items-center gap-3">
        <input type="range" min={slider.min} max={slider.max} step={slider.step} aria-label={label} disabled={readonly}
          value={Number.isFinite(x) ? x : slider.min} aria-valuetext={`${label} ${raw}${suffix === "%" ? " percent" : ""}`}
          onChange={(e) => onInput?.(e.target.value)} />
        {box}
      </div>
      <div className="-mt-1.5 flex justify-between text-xs text-muted" aria-hidden="true"><span>{slider.min + (suffix ?? "")}</span><span>{slider.max + (suffix ?? "")}</span></div>
    </> : box}
    <div className={error ? tw.fieldError : tw.fieldHint} id={errId} aria-live="polite">
      {error ? <><Icon name="no" />{error}</> : hint}
    </div>
  </div>;
}

// Radio-like option list. options: [id, text][]. multi: max picks (pick-two). locked: show correct/wrong.
export function Choices({ options, label, multi = 1, value, onChange, seg, locked, correct }: {
  options: [string, string][]; label: string; multi?: number; value: string | string[] | null;
  onChange?: (v: any) => void; seg?: boolean; locked?: boolean; correct?: string | string[];
}) {
  const picked = value == null ? [] : ([] as string[]).concat(value);
  const right = correct == null ? [] : ([] as string[]).concat(correct);
  const click = (id: string) => multi > 1
    ? onChange?.(picked.includes(id) ? picked.filter((x) => x !== id) : [...picked, id].slice(-multi))
    : onChange?.(id);
  const keys = (e: KeyboardEvent<HTMLDivElement>) => {   // arrow keys move within a radio group
    const btns = [...e.currentTarget.querySelectorAll("button")];
    const i = btns.indexOf(document.activeElement as HTMLButtonElement); if (i < 0) return;
    const d = ({ ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 } as Record<string, number>)[e.key]; if (!d) return;
    e.preventDefault(); btns[(i + d + btns.length) % btns.length]!.focus();
  };
  const slide = useSlide<HTMLDivElement>('[aria-checked="true"]', picked.join());
  return <div ref={seg ? slide : undefined} className={seg ? cn(tw.slideBox, tw.segmented) : tw.options} role={multi > 1 ? "group" : "radiogroup"} aria-label={label} onKeyDown={multi === 1 ? keys : undefined}>
    {options.map(([id, text]) => <button key={id} type="button" role={multi > 1 ? "checkbox" : "radio"} aria-checked={picked.includes(id)}
      className={seg ? tw.segBtn : cn(tw.option, locked && (right.includes(id) ? tw.optionRight : picked.includes(id) && tw.optionWrong))}
      disabled={locked} onClick={() => click(id)}>{text}</button>)}
  </div>;
}

export function Feedback({ ok, text, onContinue, continueText = T["btn.continue"]! }: { ok: boolean; text: string; onContinue?: () => void; continueText?: string }) {
  return <div className={cn(tw.feedback, ok ? "ok text-success" : "no text-danger")} role="status">
    <div className="flex items-center gap-2 font-semibold"><Icon name={ok ? "ok" : "no"} />{T[ok ? "fb.correct" : "fb.wrong"]}</div>
    <p>{text}</p>
    {onContinue && <button className={cn(tw.btn, tw.primary, "justify-self-end")} type="button" autoFocus onClick={onContinue}>{continueText}<Icon name="right" /></button>}
  </div>;
}

export function Maths({ summary, open, children }: { summary: string; open?: boolean; icon?: IconName; children: ReactNode }) {
  return <details className={tw.details} open={open || undefined}><summary className={tw.summary}>{summary}</summary><div className={tw.detailsBody}>{children}</div></details>;
}

// ---- sheet (single <dialog>) and toast, driven by the store ----
export function Sheet() {
  const sheet = useApp((s) => s.sheet);
  const ref = useRef<HTMLDialogElement>(null);
  const trigger = useRef<Element | null>(null);
  useEffect(() => {
    const d = ref.current!;
    if (sheet) { trigger.current = sheet.trigger; if (!d.open) d.showModal(); d.querySelector(".sheet-body")!.scrollTop = 0; }
    else if (d.open) d.close();
  }, [sheet]);
  return <dialog className="m-0 mx-auto mt-auto w-full max-w-160 rounded-t-md border-0 bg-surface p-0 text-ink shadow-[0_-8px_32px_rgb(0_0_0/.18)] max-h-[90dvh] backdrop:bg-black/45 open:flex open:flex-col open:animate-[up_300ms_var(--ease-out)] lg:ml-auto lg:mr-0 lg:h-dvh lg:max-h-dvh lg:max-w-lg lg:rounded-none" id="sheet" aria-labelledby="sheetTitle" ref={ref}
    onClick={(e) => e.target === e.currentTarget && ref.current!.close()}
    onClose={() => { set({ sheet: null }); (trigger.current as HTMLElement | null)?.focus?.(); }}>
    <div className="mx-auto mt-2 h-1 w-10 rounded-sm bg-line-strong" aria-hidden="true" />
    <div className="flex items-center justify-between px-4 py-2"><h2 id="sheetTitle">{sheet?.title}</h2>
      <button className={tw.iconBtn} type="button" onClick={() => ref.current!.close()}><Icon name="x" label={T["btn.close"]} /></button></div>
    <div className="sheet-body grid gap-3 overflow-x-clip overflow-y-auto px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] [&_ol]:m-0 [&_ol]:grid [&_ol]:list-decimal [&_ol]:gap-2 [&_ol]:pl-5 [&_ul]:m-0 [&_ul]:grid [&_ul]:list-disc [&_ul]:gap-2 [&_ul]:pl-5">{sheet && <sheet.Body />}</div>
  </dialog>;
}
export const closeSheet = () => (document.getElementById("sheet") as HTMLDialogElement | null)?.close();

export function Toast() {
  const t = useApp((s) => s.toast);
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!t) return;
    setShow(true);
    const id = setTimeout(() => setShow(false), 4000);
    return () => clearTimeout(id);
  }, [t]);
  return <div className={cn("toast pointer-events-none fixed bottom-38 left-1/2 z-50 max-w-[calc(100vw-2rem)] -translate-x-1/2 translate-y-5 rounded-lg bg-ink px-4 py-3 text-sm text-bg opacity-0 transition-[opacity,transform] duration-200",
    show && "translate-y-0 opacity-100")} role="status" aria-live="polite">{t?.msg}</div>;
}

export function openSources(trigger?: Element) {
  openSheet(T["sources.title"]!, () => <ol>{SOURCES.map(([t, url]) =>
    <li key={t}>{url ? <a href={url} target="_blank" rel="noopener">{t}</a> : t}</li>)}</ol>, trigger);
}

export function openLimits(trigger?: Element) {
  openSheet(T["limits.title"]!, () => <>
    <h3>{T["limits.assumeTitle"]}</h3><ul>{L["limits.assume"]!.map((x) => <li key={x}>{x}</li>)}</ul>
    <h3>{T["limits.limitsTitle"]}</h3><ol>{L["limits.list"]!.map((x) => <li key={x}>{x}</li>)}</ol>
    <button className={cn(tw.btn, tw.ghost)} type="button" onClick={() => openSources(trigger)}>{T["sources.title"]}</button>
  </>, trigger);
}

// The key assumptions beside a result, so they are not hidden behind a button.
export function LimitsNote() {
  return <p className={cn(tw.caption)}><Icon name="shield" />{" " + T["limits.inline"] + " "}
    <button className="underline underline-offset-2" type="button" onClick={(e) => openLimits(e.currentTarget)}>{T["limits.title"]}</button></p>;
}

// Kira: the hint guide. States what the last input change did, from engine output (no AI).
export function Kira({ inp }: { inp: Inputs }) {
  const prev = useRef(inp);
  const [msg, setMsg] = useState<{ text: string; why: string } | null>(null);
  useEffect(() => {
    const p = prev.current;
    prev.current = inp;
    if (p === inp) return;
    if (p.id !== inp.id) return setMsg(null);          // preset switch: start over
    const e = explainChange(p, inp);
    if (e) setMsg(e);
  }, [inp]);
  return <div className="kira flex items-start gap-3 rounded-xl bg-surface-2 p-4" role="status" aria-live="polite">
    <div className="size-9 shrink-0 rounded-lg bg-(image:--logo) bg-contain bg-center bg-no-repeat" aria-hidden="true" />
    <div className="grid gap-1">
      <p className={tw.label}>{T["kira.name"]}</p>
      <p key={msg?.text ?? ""} className="animate-[up_320ms_var(--ease-out)]">{msg ? msg.text : T["kira.start"]}</p>
      {msg && <p className={tw.small}>{msg.why}</p>}
    </div>
  </div>;
}

// Loading placeholders: a screen-shaped skeleton (route chunks) and a few text lines (Ask). Shimmer stops under reduced motion.
export function ScreenSkeleton() {
  return <div className={tw.screen} role="status" aria-label={T["loading"]}>
    <div className={cn(tw.sk, "h-9 w-2/3 max-w-xl")} />
    <div className={tw.splitLayout}>
      <div className={cn(tw.sk, "h-[28rem]")} />
      <div className="grid gap-4"><div className={cn(tw.sk, "h-28")} /><div className={cn(tw.sk, "h-16")} /><div className={cn(tw.sk, "h-72")} /></div>
    </div>
  </div>;
}
export function LinesSkeleton({ n = 3 }: { n?: number }) {
  return <div className="grid gap-2" role="status" aria-label={T["loading"]}>
    {Array.from({ length: n }, (_, k) => <div key={k} className={cn(tw.sk, "h-4")} style={{ width: `${92 - k * 17}%` }} />)}
  </div>;
}
