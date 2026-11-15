// Inline-SVG chart: wait − lock (RM) against Malaysian inflation 0–6% (docs/ARCHITECTURE.md §6).
import { sensitivity } from "./engine.mjs";
import * as f from "./format.js";
import { T, fill } from "./content.js";

const NS = "http://www.w3.org/2000/svg";
const s = (tag, attrs = {}, text) => {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (text != null) el.textContent = text;
  return el;
};

export function chart(inp, vars, width = 640) {
  const W = Math.max(300, Math.round(width)), H = 300, L = 64, R = 16, Tp = 28, B = 44;
  const xs = Array.from({ length: 61 }, (_, i) => i / 1000);          // 0.0% … 6.0%, step 0.1
  const pts = sensitivity(inp, xs).map((p) => [p.piH, p.diff]);
  const cur = sensitivity(inp, [inp.piH])[0];
  const ys = [...pts.map((p) => p[1]), cur.diff, 0];
  let lo = Math.min(...ys), hi = Math.max(...ys);
  const pad = (hi - lo) * 0.12 || 1; lo -= pad; hi += pad;
  const X = (x) => L + (x / 0.06) * (W - L - R);
  const Y = (y) => Tp + (1 - (y - lo) / (hi - lo)) * (H - Tp - B);
  const clampX = (x) => Math.min(Math.max(x, 0), 0.06);

  const svg = s("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": fill(T["coach.chart.aria"], vars) });
  // regions (text labels, not colour alone)
  // line rises left→right, so top-left and bottom-right stay clear
  svg.append(s("text", { x: L + 6, y: Tp + 14, class: "strong" }, T["coach.chart.up"]));
  svg.append(s("text", { x: W - R - 6, y: H - B - 8, class: "strong", "text-anchor": "end" }, T["coach.chart.down"]));
  // axes and ticks
  svg.append(s("line", { x1: L, x2: L, y1: Tp, y2: H - B, class: "axis" }), s("line", { x1: L, x2: W - R, y1: H - B, y2: H - B, class: "axis" }));
  for (let x = 0; x <= 0.06 + 1e-9; x += W < 480 ? 0.02 : 0.01)
    svg.append(s("text", { x: X(x), y: H - B + 18, "text-anchor": "middle" }, f.pct(x, 0)));
  svg.append(s("text", { x: (L + W - R) / 2, y: H - 6, "text-anchor": "middle" }, T["coach.chart.x"]));
  for (const y of [lo + pad, 0, hi - pad]) svg.append(s("text", { x: L - 6, y: Y(y) + 4, "text-anchor": "end" }, f.signedRM(y)));
  svg.append(s("line", { x1: L, x2: W - R, y1: Y(0), y2: Y(0), class: "zero" }));
  // break-even
  const be = vars.results.c.breakEvenPiH;
  if (be >= 0 && be <= 0.06) {
    svg.append(s("line", { x1: X(be), x2: X(be), y1: Tp, y2: H - B, class: "be" }));
    svg.append(s("text", { x: Math.max(L, Math.min(X(be) + 6, W - R - 190)), y: Tp - 10 }, fill(T["coach.chart.be"], vars)));
  }
  svg.append(s("path", { d: pts.map(([x, y], i) => `${i ? "L" : "M"}${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join(""), class: "line" }));
  // you are here
  const cx = X(clampX(inp.piH)), cy = Y(cur.diff);
  const dot = s("circle", { cx, cy, r: 7, class: "dot", tabindex: "0" });
  dot.append(s("title", {}, `${T["coach.chart.here"]}: ${f.pct(inp.piH)} · ${f.signedRM(cur.diff)}`));
  svg.append(dot, s("text", cx > L + 150 ? { x: cx - 12, y: cy - 12, class: "strong", "text-anchor": "end" } : { x: cx + 12, y: cy + 22, class: "strong" }, `${T["coach.chart.here"]} ${f.signedRM(cur.diff)}`));
  return svg;
}

// Visually hidden table alternative: the five fixed sensitivity rows.
export function chartTable(inp) {
  const wrap = document.createElement("div");
  wrap.className = "sr-only";
  const tbl = wrap.appendChild(document.createElement("table"));
  const head = tbl.createTHead().insertRow();
  for (const t of T["check.th"]) { const th = document.createElement("th"); th.textContent = t; head.append(th); }
  const body = tbl.createTBody();
  for (const r of sensitivity(inp, [0.01, 0.018, 0.03, 0.04, 0.05])) {
    const tr = body.insertRow();
    for (const t of [f.pct(r.piH, 1), f.pct(r.rH), f.rm(r.Cppp), f.signedRM(r.diff)]) tr.insertCell().textContent = t;
  }
  return wrap;
}
