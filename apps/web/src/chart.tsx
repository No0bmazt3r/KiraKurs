// Inline-SVG chart: wait − lock (RM) against Malaysian inflation 0–6% (docs/ARCHITECTURE.md §6).
import { useLayoutEffect, useRef, useState } from "react";
import { sensitivity, type Inputs } from "@kirakurs/core/engine";
import { T, L, fill, type FullVars } from "@kirakurs/core/content";
import { pct, rm, signedRM } from "@kirakurs/core/format";

export function Chart({ inp, vars }: { inp: Inputs; vars: FullVars }) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  useLayoutEffect(() => {
    const el = box.current!;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth || Math.min(innerWidth - 64, 640)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const W = Math.max(300, Math.round(width)), H = 300, Lm = 64, R = 16, Tp = 28, B = 44;
  const xs = Array.from({ length: 61 }, (_, i) => i / 1000);          // 0.0% … 6.0%, step 0.1
  const pts = sensitivity(inp, xs).map((p) => [p.piH, p.diff] as const);
  const cur = sensitivity(inp, [inp.piH])[0]!;
  const ys = [...pts.map((p) => p[1]), cur.diff, 0];
  let lo = Math.min(...ys), hi = Math.max(...ys);
  const pad = (hi - lo) * 0.12 || 1; lo -= pad; hi += pad;
  const X = (x: number) => Lm + (x / 0.06) * (W - Lm - R);
  const Y = (y: number) => Tp + (1 - (y - lo) / (hi - lo)) * (H - Tp - B);
  const ticks: number[] = [];
  for (let x = 0; x <= 0.06 + 1e-9; x += W < 480 ? 0.02 : 0.01) ticks.push(x);
  const be = vars.results.c.breakEvenPiH;
  const cx = X(Math.min(Math.max(inp.piH, 0), 0.06)), cy = Y(cur.diff);
  const here = `${T["coach.chart.here"]} ${signedRM(cur.diff)}`;

  return <div className="[&_svg]:block [&_svg]:h-auto [&_svg]:w-full [&_svg]:overflow-visible [&_text]:fill-muted [&_text]:text-[12px]" ref={box}>
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={fill(T["coach.chart.aria"]!, vars)}>
      {/* line rises left→right, so top-left and bottom-right stay clear for region labels */}
      <text x={Lm + 6} y={Tp + 14} className="fill-ink! font-semibold">{T["coach.chart.up"]}</text>
      <text x={W - R - 6} y={H - B - 8} className="fill-ink! font-semibold" textAnchor="end">{T["coach.chart.down"]}</text>
      <line x1={Lm} x2={Lm} y1={Tp} y2={H - B} className="stroke-line-strong stroke-1" /><line x1={Lm} x2={W - R} y1={H - B} y2={H - B} className="stroke-line-strong stroke-1" />
      {ticks.map((x) => <text key={x} x={X(x)} y={H - B + 18} textAnchor="middle">{pct(x, 0)}</text>)}
      <text x={(Lm + W - R) / 2} y={H - 6} textAnchor="middle">{T["coach.chart.x"]}</text>
      {[lo + pad, 0, hi - pad].map((y, k) => <text key={k} x={Lm - 6} y={Y(y) + 4} textAnchor="end">{signedRM(y)}</text>)}
      <line x1={Lm} x2={W - R} y1={Y(0)} y2={Y(0)} className="stroke-muted stroke-1" />
      {be >= 0 && be <= 0.06 && <>
        <line x1={X(be)} x2={X(be)} y1={Tp} y2={H - B} className="stroke-theory stroke-[1.5] [stroke-dasharray:5_4]" />
        <text x={Math.max(Lm, Math.min(X(be) + 6, W - R - 190))} y={Tp - 10}>{fill(T["coach.chart.be"]!, vars)}</text>
      </>}
      <path d={pts.map(([x, y], i) => `${i ? "L" : "M"}${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join("")} className="fill-none stroke-risk stroke-3 [stroke-linecap:round]" />
      <circle cx={cx} cy={cy} r={7} className="fill-primary stroke-surface stroke-2" tabIndex={0}><title>{`${T["coach.chart.here"]}: ${pct(inp.piH)} · ${signedRM(cur.diff)}`}</title></circle>
      {cx > Lm + 150
        ? <text x={cx - 12} y={cy - 12} className="fill-ink! font-semibold" textAnchor="end">{here}</text>
        : <text x={cx + 12} y={cy + 22} className="fill-ink! font-semibold">{here}</text>}
    </svg>
    {/* visually hidden table alternative: the five fixed sensitivity rows */}
    <div className="sr-only"><table>
      <thead><tr>{L["check.th"]!.map((t) => <th key={t}>{t}</th>)}</tr></thead>
      <tbody>{sensitivity(inp, [0.01, 0.018, 0.03, 0.04, 0.05]).map((r) =>
        <tr key={r.piH}>{[pct(r.piH, 1), pct(r.rH), rm(r.Cppp), signedRM(r.diff)].map((t, k) => <td key={k}>{t}</td>)}</tr>)}</tbody>
    </table></div>
  </div>;
}
