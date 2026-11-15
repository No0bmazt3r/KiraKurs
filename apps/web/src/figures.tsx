// Decorative figures: flat, rigged people (shoulder → elbow, hip → knee joints) with small looping movements, in the
// theme's colours. Joints rotate with SVG <animateTransform> around their own pivot, so nesting and scaling stay correct.
// Purely decorative (aria-hidden). Under prefers-reduced-motion every figure is drawn still.
import type { ReactNode } from "react";

const still = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

// Rotate around (cx, cy), swinging between angles `a` and `b` (degrees), or hold `a` when b is undefined / motion is off.
function Spin({ a, b, cx, cy, dur = 3, delay = 0, children }: { a: number; b?: number; cx: number; cy: number; dur?: number; delay?: number; children: ReactNode }) {
  return <g transform={`rotate(${a} ${cx} ${cy})`}>
    {!still && b != null && <animateTransform attributeName="transform" type="rotate" dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite"
      values={`${a} ${cx} ${cy};${b} ${cx} ${cy};${a} ${cx} ${cy}`} calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1" keyTimes="0;.5;1" />}
    {children}
  </g>;
}
// Move by (dx, dy) and back.
function Drift({ dx = 0, dy = 0, dur = 3, delay = 0, children }: { dx?: number; dy?: number; dur?: number; delay?: number; children: ReactNode }) {
  return <g>{!still && <animateTransform attributeName="transform" type="translate" dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite"
    values={`0 0;${dx} ${dy};0 0`} calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1" keyTimes="0;.5;1" />}{children}</g>;
}

// A joint chain: upper segment from (x, y) straight down, then the lower segment from the elbow/knee. 0° = hanging down;
// negative angles swing toward +x. `end` is drawn at the hand/foot (e.g. a phone or a lock).
type Joint = { a: number; a2?: number; b?: number; b2?: number; dur?: number; delay?: number; end?: ReactNode };
function Limb({ x, y, l1, l2, w, top, low, j, foot }: { x: number; y: number; l1: number; l2: number; w: number; top: string; low: string; j: Joint; foot?: boolean }) {
  const ey = y + l1, hy = ey + l2;
  return <Spin a={j.a} b={j.a2} cx={x} cy={y} dur={j.dur} delay={j.delay}>
    <path d={`M${x} ${y} V${ey}`} style={{ stroke: top }} strokeWidth={w} strokeLinecap="round" />
    <Spin a={j.b ?? 0} b={j.b2} cx={x} cy={ey} dur={j.dur} delay={j.delay}>
      <path d={`M${x} ${ey} V${hy}`} style={{ stroke: low }} strokeWidth={w - 1} strokeLinecap="round" />
      {foot ? <ellipse cx={x + 5} cy={hy + 4} rx="9" ry="5" className="fig-ink" /> : <circle cx={x} cy={hy + 1} r="5" className="fig-skin" />}
      {j.end && <g transform={`translate(${x} ${hy}) rotate(${-(j.a + (j.b ?? 0))})`}>{j.end}</g>}   {/* props stay upright */}
    </Spin>
  </Spin>;
}

type Pose = { l: Joint; r: Joint; ll?: Joint; rl?: Joint; tilt?: [number, number]; hair?: "bun" | "short" | "scarf" };
// One person in a 120 × 210 box (feet at y ≈ 206). `shirt` is a CSS colour; trousers and shoes use the section's ink.
function Person({ x = 0, y = 0, s = 1, flip, shirt, pose, breathe = true }: { x?: number; y?: number; s?: number; flip?: boolean; shirt: string; pose: Pose; breathe?: boolean }) {
  const ink = "currentColor", skin = "var(--fig-skin)";
  const tilt = pose.tilt ?? [0, 0];
  const body = <>
    <Limb x={54} y={120} l1={42} l2={40} w={13} top={ink} low={ink} j={pose.ll ?? { a: 4 }} foot />
    <Limb x={66} y={120} l1={42} l2={40} w={13} top={ink} low={ink} j={pose.rl ?? { a: -4 }} foot />
    <Limb x={47} y={64} l1={30} l2={28} w={11} top={shirt} low={skin} j={pose.l} />
    <path d="M42 66 Q42 50 58 50 H62 Q78 50 78 66 L75 124 Q60 130 45 124 Z" style={{ fill: shirt }} />
    <rect x="55" y="40" width="10" height="12" rx="3" className="fig-skin" />
    <Spin a={tilt[0]} b={tilt[1]} cx={60} cy={46} dur={4}>
      <circle cx="60" cy="28" r="16" className="fig-skin" />
      {pose.hair === "scarf"
        ? <path d="M42 30 Q42 8 60 8 Q78 8 78 30 Q78 44 66 50 H54 Q42 44 42 30 Z M47 28 Q48 16 60 15 Q72 16 73 28 Q73 40 60 42 Q47 40 47 28 Z" fillRule="evenodd" style={{ fill: "var(--fig-scarf)" }} />
        : <path d={pose.hair === "short" ? "M44 26 Q45 10 60 10 Q76 10 76 24 Q68 18 60 20 Q52 22 44 26 Z" : "M44 27 Q44 10 60 10 Q76 10 76 27 Q70 19 58 19 Q50 20 44 27 Z M70 9 a7 7 0 1 1 0.1 0"} className="fig-hair" />}
    </Spin>
    <Limb x={73} y={64} l1={30} l2={28} w={11} top={shirt} low={skin} j={pose.r} />
  </>;
  return <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})${flip ? " translate(-120 0)" : ""}`}>
    {breathe ? <Drift dy={-1.5} dur={3.6}>{body}</Drift> : body}
  </g>;
}

// props (drawn at the hand)
const Lock = () => <g transform="translate(-15 -34)"><path d="M8 13 V8 a7 7 0 0 1 14 0 V13" className="fig-line" /><rect x="0" y="12" width="30" height="24" rx="6" className="fig-lock" /><circle cx="15" cy="23" r="3" className="fig-bg" /></g>;
const Glass = () => <Spin a={-6} b={6} cx={0} cy={-18} dur={3.2}><g transform="translate(-13 -38)">
  <path d="M0 2 H26 M0 38 H26" className="fig-line" /><path d="M4 4 Q4 16 13 20 Q22 16 22 4 Z M4 36 Q4 24 13 20 Q22 24 22 36 Z" className="fig-wait" /></g></Spin>;
const Phone = () => <g transform="translate(-9 -30)"><rect width="18" height="30" rx="4" className="fig-ink" /><rect x="3" y="4" width="12" height="20" rx="2" className="fig-lock" /></g>;
const Bill = () => <g transform="translate(-4 -36)"><rect width="34" height="44" rx="4" className="fig-paper" /><path d="M7 12 H27 M7 20 H23 M7 28 H25" className="fig-thin" /></g>;
const Suitcase = ({ x, y }: { x: number; y: number }) =>
  <g transform={`translate(${x} ${y})`}><path d="M13 0 h16 v9" className="fig-line" /><rect x="0" y="8" width="42" height="36" rx="7" className="fig-wait" /><path d="M11 14 v24 M31 14 v24" className="fig-thin" /><circle cx="8" cy="47" r="3" className="fig-ink" /><circle cx="34" cy="47" r="3" className="fig-ink" /></g>;
const Plane = ({ x, y }: { x: number; y: number }) =>
  <g transform={`translate(${x} ${y})`}><Drift dx={10} dy={-8} dur={5}><path d="M0 22 L58 0 L44 32 Z" className="fig-paper" /><path d="M44 32 L30 22 L58 0" className="fig-thin" /></Drift></g>;
const Flag = ({ x, y, delay }: { x: number; y: number; delay: number }) =>
  <g transform={`translate(${x} ${y})`}><path d="M0 0 V76" className="fig-line" /><Spin a={0} b={-8} cx={0} cy={0} dur={1.6} delay={delay}><path d="M0 3 Q18 0 36 12 Q18 22 0 25 Z" className="fig-lock" /></Spin></g>;
const Ground = ({ w, y }: { w: number; y: number }) => <path d={`M0 ${y} H${w}`} className="fig-ground" />;
const Shadow = ({ x, y }: { x: number; y: number }) => <ellipse cx={x} cy={y} rx="34" ry="5" className="fig-shadow" />;

export function HeroFigure() {
  return <svg className="fig" viewBox="0 0 320 230" aria-hidden="true">
    <Ground w={320} y={222} /><Shadow x={102} y={220} />
    <Plane x={226} y={30} />
    <Person x={42} y={10} shirt="var(--field-accent)" pose={{ hair: "scarf", tilt: [-3, 4], l: { a: 6, a2: 2, dur: 3.6 }, r: { a: -28, b: 118, b2: 110, dur: 3, end: <Phone /> } }} />
    <Suitcase x={176} y={172} />
  </svg>;
}

export function ThinkFigure() {
  return <svg className="fig" viewBox="0 0 330 240" aria-hidden="true">
    <Ground w={330} y={232} /><Shadow x={90} y={230} />
    <g transform="translate(168 8)"><rect width="150" height="110" rx="14" className="fig-board" />
      <g className="fig-pulse"><text x="22" y="66" className="fig-q">?</text></g>
      {[34, 58, 82].map((y, i) => <g key={y}><rect x="62" y={y - 9} width="13" height="13" rx="3" className={i === 0 ? "fig-lock" : "fig-thin-box"} /><path d={`M84 ${y - 2} H134`} className="fig-thin" /></g>)}
    </g>
    <Person x={30} y={22} shirt="var(--primary)" pose={{ hair: "short", tilt: [6, -2], l: { a: 4 }, r: { a: -22, b: 150, b2: 142, dur: 4 } }} />
  </svg>;
}

// Lock (certain) vs hourglass (wait and see), on a forked path.
export function TwoPathsFigure() {
  return <svg className="fig" viewBox="0 0 380 250" aria-hidden="true">
    <path d="M190 246 C190 214 130 214 86 228 M190 246 C190 214 252 218 296 200" className="fig-path" />
    <Person x={22} y={24} shirt="var(--surface)" pose={{ hair: "scarf", tilt: [-2, 3], l: { a: 6 }, r: { a: -150, a2: -140, b: -10, dur: 2.4, end: <Lock /> } }} />
    <Person x={238} y={24} flip shirt="var(--risk-fill)" pose={{ hair: "short", tilt: [2, -3], l: { a: 6 }, r: { a: -150, a2: -142, b: -8, dur: 2.8, end: <Glass /> } }} />
  </svg>;
}

// Pointing at a chart: the theories.
export function IdeasFigure() {
  return <svg className="fig" viewBox="0 0 380 240" aria-hidden="true">
    <rect x="140" y="14" width="230" height="140" rx="14" className="fig-board" />
    <path d="M160 132 H350 M160 34 V132" className="fig-thin" />
    <path d="M162 120 C200 118 214 64 252 74 S318 44 348 38" className="fig-curve fig-draw" pathLength={1} />
    <text x="318" y="122" className="fig-pct">%</text>
    <Person x={0} y={26} shirt="var(--primary)" pose={{ hair: "bun", tilt: [-4, 2], l: { a: 6 }, r: { a: -100, a2: -88, b: -6, dur: 2.6 } }} />
  </svg>;
}

// Walking past four flags: the four stops. Legs and arms swing in opposition; the walker crosses and loops.
export function StopsFigure() {
  // Stride matches speed (no sliding feet): legs swing ±14° on 82 px legs ≈ 78 px per 1.4 s cycle ≈ 56 px/s.
  const step = 1.4;
  return <svg className="fig" viewBox="0 0 440 220" aria-hidden="true">
    <Ground w={440} y={214} />
    {[170, 250, 330, 410].map((x, i) => <Flag key={x} x={x} y={136} delay={i * 0.3} />)}
    <g>{!still && <animateTransform attributeName="transform" type="translate" values="-30 0;230 0" dur="4.6s" repeatCount="indefinite" />}
      {!still && <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.12;.82;1" dur="4.6s" repeatCount="indefinite" />}
      <Person x={0} y={6} s={0.98} breathe={false} shirt="var(--field-accent)" pose={{ hair: "scarf",
        l: { a: 16, a2: -16, b: -14, dur: step }, r: { a: -16, a2: 16, b: -14, dur: step },
        ll: { a: -14, a2: 14, b: 0, b2: 14, dur: step }, rl: { a: 14, a2: -14, b: 14, b2: 0, dur: step } }} />
    </g>
  </svg>;
}

// Two people celebrating, confetti falling.
export function ReadyFigure() {
  return <svg className="fig" viewBox="0 0 300 240" aria-hidden="true">
    <Ground w={300} y={234} />
    {[[40, 0, "fig-lock"], [96, 1.1, "fig-wait"], [150, .5, "fig-lock"], [206, 1.6, "fig-wait"], [262, .8, "fig-lock"], [124, 2.1, "fig-paper"]].map(([x, d, c], i) =>
      <g key={i} transform={`translate(${x} 0)`}>{!still && <animateTransform attributeName="transform" type="translate" values={`${x} -10;${x} 120`} dur="4s" begin={`${d}s`} repeatCount="indefinite" />}
        {!still && <animate attributeName="opacity" values="0;1;0" dur="4s" begin={`${d}s`} repeatCount="indefinite" />}
        <rect width="8" height="8" rx="2" transform="rotate(30)" className={c as string} /></g>)}
    <Drift dy={-4} dur={2}><Person x={24} y={16} breathe={false} shirt="var(--field-accent)" pose={{ hair: "scarf", tilt: [-3, 3], l: { a: 150, a2: 142, b: 10, dur: 2 }, r: { a: -150, a2: -142, b: -10, dur: 2 } }} /></Drift>
    <Drift dy={-4} dur={2} delay={0.5}><Person x={156} y={16} breathe={false} shirt="var(--risk-fill)" pose={{ hair: "short", tilt: [3, -3], l: { a: 150, a2: 142, b: 10, dur: 2, delay: 0.5 }, r: { a: -150, a2: -142, b: -10, dur: 2, delay: 0.5 } }} /></Drift>
  </svg>;
}

// Aina holding up her bill, for Learn.
export function AinaFigure() {
  return <svg className="fig" viewBox="0 0 300 240" aria-hidden="true">
    <Ground w={300} y={232} /><Shadow x={102} y={230} />
    <g transform="translate(176 40)"><rect width="104" height="130" rx="10" className="fig-board" />
      <path d="M16 28 H86 M16 48 H74 M16 68 H82" className="fig-thin" /><rect x="16" y="92" width="72" height="22" rx="5" className="fig-lock" /></g>
    <Person x={42} y={22} shirt="var(--theory)" pose={{ hair: "scarf", tilt: [-3, 3], l: { a: 6 }, r: { a: -60, a2: -52, b: -70, dur: 3, end: <Bill /> } }} />
  </svg>;
}
