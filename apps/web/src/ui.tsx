// Shared components (docs/DESIGN.md §5). Copy is rendered as text only; icons are static SVG strings.
import { cloneElement, useEffect, useId, useLayoutEffect, useRef, useState, type ElementType, type KeyboardEvent, type ReactElement, type ReactNode } from "react";
import { T, L, TIPS, SOURCES, tipParts, explainChange } from "@kirakurs/core/content";
import { parseNumber, type Inputs } from "@kirakurs/core/engine";
import { PRESETS, type PresetId } from "@kirakurs/core/presets";
import { P, type IconName } from "./icons";
import { useApp, openSheet, set } from "./store";

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

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
export function Live({ as: Tag = "p", className, children, ...rest }: { as?: ElementType; className?: string; children: string; [k: string]: unknown }) {
  const prev = useRef(children);
  const [n, setN] = useState(0);
  const [mid, setMid] = useState<string | null>(null);   // in-between text while counting; null = show children
  const count = /\b(hero-)?value\b/.test(className ?? "");
  useEffect(() => {
    const from = prev.current;
    if (from === children) return;
    prev.current = children;
    if (reduced()) return;
    setN((x) => x + 1);
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
  return <Tag key={n} className={cx(className, n > 0 && "flash")} {...rest}>{mid ?? children}</Tag>;
}

// "[[tip|text]]" markup → plain text (for aria-live text).
export const plain = (s: string) => s.replace(/\[\[\w+\|([^\]]+)\]\]/g, "$1");

// Copy with [[tip|text]] markup → glossary buttons. A tip opens inline below its paragraph.
export function Rich({ text, className, as: Tag = "p" }: { text: string; className?: string; as?: ElementType }) {
  const id = useId();
  const [open, setOpen] = useState<number | null>(null);
  const prev = useRef(text);
  const [n, setN] = useState(0);   // flash on change, like <Live>
  useEffect(() => {
    if (prev.current !== text) { prev.current = text; if (!reduced()) setN((x) => x + 1); }
  }, [text]);
  const parts = tipParts(text);
  return <>
    <Tag key={n} className={cx(className, n > 0 && "flash")}>{parts.map((part, k) => typeof part === "string" ? part :
      <button key={k} className="term" type="button" aria-expanded={open === k} aria-controls={`${id}-${k}`}
        onClick={() => setOpen(open === k ? null : k)} onKeyDown={(e) => e.key === "Escape" && setOpen(null)}>{part.text}</button>)}
    </Tag>
    {open != null && <span className="tip" id={`${id}-${open}`} role="note">{TIPS[(parts[open] as { tip: string }).tip]}</span>}
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
export function Tip({ tip, children, className }: { tip: string; children: ReactElement<Record<string, unknown>>; className?: string }) {
  const id = useId();
  const [hide, setHide] = useState(false);
  return <span className={cx("tipwrap", hide && "tip-off", className)} onMouseLeave={() => setHide(false)} onFocus={() => setHide(false)}
    onKeyDown={(e) => e.key === "Escape" && setHide(true)}>
    {cloneElement(children, { "aria-describedby": id })}
    <span role="tooltip" id={id} className="tip-pop">{tip}</span>
  </span>;
}

// Data badge. `preset` pins it (screens that always use the Snapshot); otherwise it follows the chosen preset.
export function Badge({ preset: fixed }: { preset?: PresetId }) {
  const chosen = useApp((s) => s.preset), userEdited = useApp((s) => s.edited);
  const p = PRESETS[fixed ?? chosen], edited = !fixed && userEdited;
  return <Tip tip={T[p.kind === "dated" ? "badge.tipDated" : "badge.tipPractice"]!} className="justify-self-start">
    <button className={cx("badge", p.kind !== "dated" && "illustrative")} type="button" onClick={(e) => openSources(e.currentTarget)}>
      <Icon name="calendar" /><span className="badge-text">{p.badge + (edited ? " " + T.edited : "")}</span>
    </button>
  </Tip>;
}

export function Card({ title, variant = "neutral", children }: { title: string; variant?: string; children: ReactNode }) {
  return <section className={`card ${variant}`}><h2 className="card-title">{title}</h2>{children}</section>;
}

export function Arrow({ dir, words }: { dir: "up" | "down"; words: string }) {
  return <span className="arrow"><Icon name={dir} /><span>{words}</span></span>;
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
  const box = <div className="input-wrap">
    <input ref={ref} id={id} type="text" inputMode="decimal" autoComplete="off" readOnly={readonly} aria-label={label}
      aria-describedby={errId} aria-invalid={error ? "true" : "false"} value={readonly ? raw : draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => draft !== raw && onInput?.(draft)}
      onKeyDown={(e) => e.key === "Enter" && onInput?.(draft)} />
    {suffix && <span className="suffix" aria-hidden="true">{suffix}</span>}
  </div>;
  return <div className={cx("field", readonly && "readonly", error && "invalid")}>
    <div className="field-head"><label htmlFor={id}>{label}</label>{slider && <output htmlFor={id}>{shown}</output>}</div>
    {slider ? <>
      <div className="slider-row">
        <input type="range" min={slider.min} max={slider.max} step={slider.step} aria-label={label} disabled={readonly}
          value={Number.isFinite(x) ? x : slider.min} aria-valuetext={`${label} ${raw}${suffix === "%" ? " percent" : ""}`}
          onChange={(e) => onInput?.(e.target.value)} />
        {box}
      </div>
      <div className="minmax" aria-hidden="true"><span>{slider.min + (suffix ?? "")}</span><span>{slider.max + (suffix ?? "")}</span></div>
    </> : box}
    <div className={error ? "field-error" : "field-hint"} id={errId} aria-live="polite">
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
  return <div ref={seg ? slide : undefined} className={seg ? "segmented" : "options"} role={multi > 1 ? "group" : "radiogroup"} aria-label={label} onKeyDown={multi === 1 ? keys : undefined}>
    {options.map(([id, text]) => <button key={id} type="button" role={multi > 1 ? "checkbox" : "radio"} aria-checked={picked.includes(id)}
      className={cx(!seg && "option", locked && (right.includes(id) ? "correct" : picked.includes(id) && "wrong"))}
      disabled={locked} onClick={() => click(id)}>{text}</button>)}
  </div>;
}

export function Feedback({ ok, text, onContinue, continueText = T["btn.continue"]! }: { ok: boolean; text: string; onContinue?: () => void; continueText?: string }) {
  return <div className={`feedback ${ok ? "ok" : "no"}`} role="status">
    <div className="fb-head"><Icon name={ok ? "ok" : "no"} />{T[ok ? "fb.correct" : "fb.wrong"]}</div>
    <p>{text}</p>
    {onContinue && <button className="btn primary" type="button" autoFocus onClick={onContinue}>{continueText}<Icon name="right" /></button>}
  </div>;
}

export function Maths({ summary, open, children }: { summary: string; open?: boolean; icon?: IconName; children: ReactNode }) {
  return <details className="maths" open={open || undefined}><summary>{summary}</summary><div>{children}</div></details>;
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
  return <dialog className="sheet" id="sheet" aria-labelledby="sheetTitle" ref={ref}
    onClick={(e) => e.target === e.currentTarget && ref.current!.close()}
    onClose={() => { set({ sheet: null }); (trigger.current as HTMLElement | null)?.focus?.(); }}>
    <div className="sheet-handle" aria-hidden="true" />
    <div className="sheet-head"><h2 id="sheetTitle">{sheet?.title}</h2>
      <button className="icon-btn" type="button" onClick={() => ref.current!.close()}><Icon name="x" label={T["btn.close"]} /></button></div>
    <div className="sheet-body">{sheet && <sheet.Body />}</div>
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
  return <div className={cx("toast", show && "show")} role="status" aria-live="polite">{t?.msg}</div>;
}

export function openSources(trigger?: Element) {
  openSheet(T["sources.title"]!, () => <ol>{SOURCES.map(([t, url]) =>
    <li key={t}>{url ? <a href={url} target="_blank" rel="noopener">{t}</a> : t}</li>)}</ol>, trigger);
}

export function openLimits(trigger?: Element) {
  openSheet(T["limits.title"]!, () => <>
    <h3>{T["limits.assumeTitle"]}</h3><ul>{L["limits.assume"]!.map((x) => <li key={x}>{x}</li>)}</ul>
    <h3>{T["limits.limitsTitle"]}</h3><ol>{L["limits.list"]!.map((x) => <li key={x}>{x}</li>)}</ol>
    <button className="btn ghost" type="button" onClick={() => openSources(trigger)}>{T["sources.title"]}</button>
  </>, trigger);
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
  return <div className="kira" role="status" aria-live="polite">
    <div className="avatar kira-mark" aria-hidden="true" />
    <div className="stack-sm">
      <p className="label">{T["kira.name"]}</p>
      <p key={msg?.text ?? ""} className="fade-in">{msg ? msg.text : T["kira.start"]}</p>
      {msg && <p className="small">{msg.why}</p>}
    </div>
  </div>;
}

// Loading placeholders: a screen-shaped skeleton (route chunks) and a few text lines (Ask). Shimmer stops under reduced motion.
export function ScreenSkeleton() {
  return <div className="screen" role="status" aria-label={T["loading"]}>
    <div className="sk h-9 w-2/3 max-w-xl" />
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(19rem,23rem)_1fr]">
      <div className="sk h-[28rem]" />
      <div className="grid gap-4"><div className="sk h-28" /><div className="sk h-16" /><div className="sk h-72" /></div>
    </div>
  </div>;
}
export function LinesSkeleton({ n = 3 }: { n?: number }) {
  return <div className="grid gap-2" role="status" aria-label={T["loading"]}>
    {Array.from({ length: n }, (_, k) => <div key={k} className="sk h-4" style={{ width: `${92 - k * 17}%` }} />)}
  </div>;
}
