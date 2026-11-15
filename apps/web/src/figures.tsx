// Decorative figures: simple modern stick people with props (lock, hourglass, suitcase …), drawn in SVG with the theme's
// colours so they follow light/dark. Purely decorative: aria-hidden, no numbers, no text a reader needs.
import type { ReactNode } from "react";

type Pt = [number, number];
type Pose = { l: Pt; r: Pt; walk?: boolean };

// One person in a 120 × 200 box: filled head, rounded shirt, round-capped limbs. `shirt` is a CSS colour (a token var).
function Person({ x = 0, y = 0, s = 1, shirt, pose, flip, children }: { x?: number; y?: number; s?: number; shirt: string; pose: Pose; flip?: boolean; children?: ReactNode }) {
  const feet: [Pt, Pt] = pose.walk ? [[38, 192], [86, 186]] : [[50, 194], [72, 194]];
  return <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})${flip ? " translate(-120 0)" : ""}`}>
    <g className="fig-limb">
      <path d={`M54 116 L${feet[0][0]} ${feet[0][1]}`} /><path d={`M66 116 L${feet[1][0]} ${feet[1][1]}`} />
      <path d={`M46 64 L${pose.l[0]} ${pose.l[1]}`} /><path d={`M74 64 L${pose.r[0]} ${pose.r[1]}`} />
    </g>
    <rect x="42" y="50" width="36" height="72" rx="16" style={{ fill: shirt }} />
    <circle cx="60" cy="30" r="17" className="fig-head" />
    {children}
  </g>;
}

const Lock = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) =>
  <g transform={`translate(${x} ${y}) scale(${s})`}><path d="M7 12 V7 a8 8 0 0 1 16 0 V12" className="fig-line" /><rect x="0" y="11" width="30" height="24" rx="5" className="fig-lock" /></g>;
const Glass = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) =>
  <g transform={`translate(${x} ${y}) scale(${s})`}><path d="M0 0 H26 M0 36 H26" className="fig-line" /><path d="M3 2 L13 18 L3 34 Z M23 2 L13 18 L23 34 Z" className="fig-wait" /></g>;
const Suitcase = ({ x, y }: { x: number; y: number }) =>
  <g transform={`translate(${x} ${y})`}><path d="M12 0 h14 v8" className="fig-line" /><rect x="0" y="7" width="40" height="34" rx="6" className="fig-wait" /><path d="M10 12 v24 M30 12 v24" className="fig-thin" /></g>;
const Flag = ({ x, y }: { x: number; y: number }) =>
  <g transform={`translate(${x} ${y})`}><path d="M0 0 V70" className="fig-line" /><path d="M0 2 L34 12 L0 24 Z" className="fig-lock" /></g>;
const Phone = ({ x, y }: { x: number; y: number }) => <rect x={x} y={y} width="16" height="26" rx="4" className="fig-ink" />;

export function HeroFigure() {
  return <svg className="fig" viewBox="0 0 300 210" aria-hidden="true">
    <path d="M0 204 H300" className="fig-ground" />
    <Person x={40} y={6} shirt="var(--field-accent)" pose={{ l: [30, 112], r: [96, 92] }}><Phone x={88} y={70} /></Person>
    <Suitcase x={150} y={164} />
    <g transform="translate(222 38)"><path d="M0 22 L56 0 L44 30 Z" className="fig-wait" /><path d="M44 30 L30 22" className="fig-thin" /></g>
  </svg>;
}

// Two people at a fork: one holds a lock (certain), one an hourglass (wait and see).
export function TwoPathsFigure() {
  return <svg className="fig" viewBox="0 0 360 230" aria-hidden="true">
    <path d="M180 226 C180 190 120 190 80 210 M180 226 C180 190 250 196 290 176 M180 226 V214" className="fig-path" />
    <Person x={10} y={6} shirt="var(--surface)" pose={{ l: [28, 110], r: [104, 28] }}><Lock x={92} y={-4} /></Person>
    <Person x={230} y={6} shirt="var(--risk-fill)" pose={{ l: [16, 28], r: [92, 112] }} flip><Glass x={2} y={-6} /></Person>
  </svg>;
}

// Someone pointing at a board with a curve and a percent sign: the theories.
export function IdeasFigure() {
  return <svg className="fig" viewBox="0 0 360 220" aria-hidden="true">
    <rect x="120" y="10" width="230" height="140" rx="10" className="fig-board" />
    <path d="M140 120 C180 118 200 60 240 70 S300 40 330 34" className="fig-curve" />
    <path d="M140 132 H330 M140 30 V132" className="fig-thin" />
    <text x="300" y="118" className="fig-pct">%</text>
    <Person x={0} y={16} shirt="var(--primary)" pose={{ l: [34, 112], r: [128, 64] }} />
  </svg>;
}

// Walking past four flags: the four stops.
export function StopsFigure() {
  return <svg className="fig" viewBox="0 0 420 200" aria-hidden="true">
    <path d="M0 196 H420" className="fig-ground" />
    {[150, 230, 310, 390].map((x, i) => <g key={x} opacity={1 - i * 0.18}><Flag x={x} y={124} /></g>)}
    <Person x={10} y={0} s={0.98} shirt="var(--field-accent)" pose={{ l: [26, 100], r: [98, 104], walk: true }} />
  </svg>;
}

// Arms up, ready to start.
export function ReadyFigure() {
  return <svg className="fig" viewBox="0 0 280 220" aria-hidden="true">
    <path d="M0 214 H260" className="fig-ground" />
    <Person x={20} y={14} shirt="var(--field-accent)" pose={{ l: [18, 10], r: [104, 14] }} />
    <Person x={130} y={14} shirt="var(--risk-fill)" pose={{ l: [20, 8], r: [100, 20] }} flip />
    {[[124, 30], [146, 12], [112, 6], [236, 34], [10, 40]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="5" className={i % 2 ? "fig-wait" : "fig-lock"} />)}
  </svg>;
}

// Thinking, with a question card: the pre-check.
export function ThinkFigure() {
  return <svg className="fig" viewBox="0 0 320 230" aria-hidden="true">
    <path d="M0 224 H320" className="fig-ground" />
    <g transform="translate(160 6)"><rect width="150" height="104" rx="12" className="fig-board" />
      <text x="20" y="58" className="fig-q">?</text>
      {[30, 52, 74].map((y) => <g key={y}><rect x="62" y={y - 8} width="12" height="12" rx="3" className="fig-thin-box" /><path d={`M82 ${y - 2} H132`} className="fig-thin" /></g>)}
    </g>
    <Person x={30} y={26} shirt="var(--primary)" pose={{ l: [30, 112], r: [70, 46] }} />
  </svg>;
}

// Aina with her bill, for Learn.
export function AinaFigure() {
  return <svg className="fig" viewBox="0 0 300 220" aria-hidden="true">
    <path d="M0 214 H300" className="fig-ground" />
    <g transform="translate(150 20)"><rect width="120" height="150" rx="8" className="fig-board" />
      <path d="M18 30 H100 M18 52 H86 M18 74 H94" className="fig-thin" />
      <rect x="18" y="104" width="84" height="26" rx="5" className="fig-lock" /></g>
    <Person x={20} y={14} shirt="var(--theory)" pose={{ l: [30, 112], r: [130, 92] }} />
  </svg>;
}
