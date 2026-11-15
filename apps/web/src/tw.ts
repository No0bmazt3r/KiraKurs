// Tailwind class recipes for the building blocks used on many screens. Screens compose these with `cn()` and add
// their own layout utilities inline. tailwind-merge resolves conflicts, so a variant (e.g. tw.tileLock) overrides the
// base recipe's background instead of fighting it. The first word of a recipe is a plain hook name (no styles):
// e2e/smoke.ts and a few scripts find elements by it (e.g. `.tile.lock .value`, `.card.theory`, `.options .option`).
import { twMerge } from "tailwind-merge";

export const cn = (...c: (string | false | null | undefined)[]) => twMerge(c.filter(Boolean).join(" "));

export const tw = {
  // text roles
  small: "small text-sm leading-normal text-muted",
  caption: "caption text-xs leading-normal text-muted",
  label: "label font-medium",
  value: "value text-2xl leading-tight font-semibold tracking-tight tabular-nums",
  heroValue: "hero-value max-w-[32ch] text-3xl leading-[1.1] font-semibold tracking-tight tabular-nums lg:text-4xl",
  formula: "formula text-sm break-words text-muted tabular-nums",
  unit: "unit text-sm text-muted",

  // layout
  screen: "screen grid gap-5",
  header: "grid justify-items-start gap-2",
  stack: "grid gap-3",
  row: "flex flex-wrap items-center gap-3",
  splitLayout: "grid items-start gap-5 lg:grid-cols-[minmax(19rem,23rem)_1fr]",
  card: "card grid min-w-0 content-start gap-2 rounded-md border border-line bg-surface p-5",
  cardTitle: "flex items-center gap-2 text-lg font-semibold",

  // buttons
  btn: "btn inline-flex min-h-11 cursor-pointer items-center justify-center justify-self-start gap-2 rounded-md border-2 border-transparent px-5 font-semibold no-underline transition duration-150 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-40 [&_svg]:transition-transform enabled:hover:[&_svg:last-child]:translate-x-0.5",
  primary: "primary bg-ink text-bg enabled:hover:bg-primary enabled:hover:text-on-primary",
  secondary: "secondary border-ink bg-transparent text-ink enabled:hover:bg-surface",
  ghost: "ghost bg-transparent px-2 text-primary-ink enabled:hover:bg-surface-2",
  big: "big min-h-13 px-7 text-base",
  onField: "border-current bg-transparent text-inherit hover:bg-white/10",
  fieldPrimary: "bg-field-accent text-[#04201C] enabled:hover:bg-on-field enabled:hover:text-field",
  iconBtn: "grid size-11 cursor-pointer place-items-center rounded-md border-0 bg-transparent text-ink hover:bg-surface-2",

  // small surfaces
  hint: "hint rounded-sm bg-surface-2 px-3 py-2 animate-[up_320ms_var(--ease-out)]",
  banner: "flex gap-2 rounded-md bg-primary-soft p-3 text-sm",
  callout: "grid gap-2 rounded-md border border-line bg-surface px-4 py-3",
  pill: "rounded-sm border border-line px-2 py-0.5 text-xs whitespace-nowrap text-muted",
  pillOk: "border-ink bg-ink text-bg",

  // result tiles (Coach, Fee Day, welcome bill)
  tile: "tile grid content-start gap-1 rounded-md bg-surface-2 p-4 [&_.caption]:text-inherit [&_.caption]:opacity-85 [&_.small]:text-inherit [&_.small]:opacity-85 [&_.value]:text-xl [&_.value]:whitespace-nowrap sm:[&_.value]:text-2xl",
  tileLock: "lock bg-field text-on-field [&_.value]:text-field-accent",
  tileWait: "wait bg-risk-fill text-on-risk",
  tileYou: "you bg-ink text-bg",
  tileHead: "flex items-center gap-2 font-semibold",

  // form controls
  field: "field grid gap-1",
  inputWrap: "flex min-h-11 items-center rounded-md border border-line-strong bg-surface-2 focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-focus",
  input: "min-h-10 min-w-0 flex-1 border-0 bg-transparent px-3 text-base outline-none",
  fieldError: "field-error flex items-center gap-1 text-sm text-danger",
  fieldHint: "field-hint text-sm text-risk",
  switch: "switch flex min-h-11 cursor-pointer items-center gap-3 font-medium",
  switchInput: "relative h-6 w-11 shrink-0 cursor-pointer appearance-none rounded-sm bg-line-strong transition-colors checked:bg-primary after:absolute after:top-1 after:left-1 after:size-4 after:rounded-xs after:bg-surface after:transition-transform after:content-[''] checked:after:translate-x-5",

  // choices
  options: "options grid gap-2",
  option: "option flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-md border-2 border-transparent bg-surface px-4 py-3 text-left transition enabled:hover:border-ink disabled:cursor-default in-[.card]:bg-surface-2 aria-checked:border-ink aria-checked:bg-ink aria-checked:text-bg",
  optionRight: "correct border-success aria-checked:border-success",
  optionWrong: "wrong border-danger aria-checked:border-danger",
  // a sliding highlight (useSlide sets --x/--y/--w/--h); used by the segmented control and the tab bar
  slideBox: "relative isolate before:pointer-events-none before:absolute before:top-0 before:left-0 before:-z-10 before:w-[var(--w,0px)] before:h-[var(--h,0px)] before:translate-x-[var(--x,0px)] before:translate-y-[var(--y,0px)] data-ready:before:transition-[translate,width,height] data-ready:before:duration-[380ms] data-ready:before:ease-[var(--ease-out)]",
  segmented: "segmented flex gap-1 rounded-md bg-surface-2 p-1 before:rounded-sm before:bg-ink",
  segBtn: "min-h-10 flex-1 cursor-pointer rounded-sm border-0 bg-transparent px-2 text-sm font-medium transition-colors duration-[380ms] aria-checked:text-bg",

  feedback: "feedback grid gap-2 rounded-md border border-current bg-surface px-4 py-4 animate-[up_320ms_var(--ease-out)] [&_p]:text-ink",

  // expanders
  details: "maths group rounded-md border border-line bg-surface",
  summary: "flex min-h-12 cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 font-semibold after:text-muted after:content-['+'] group-open:after:content-['−'] [&::-webkit-details-marker]:hidden",
  detailsBody: "grid gap-3 px-4 pb-4 text-sm",

  // tooltip pop-up (ui.tsx Tip)
  tipPop: "pointer-events-none invisible absolute bottom-[calc(100%+0.5rem)] left-0 z-40 w-max max-w-[min(18rem,75vw)] translate-y-1 rounded-md bg-ink px-3 py-2 text-left text-xs leading-snug font-normal text-bg opacity-0 shadow-lg transition duration-150 after:absolute after:top-full after:left-4 after:border-6 after:border-transparent after:border-t-ink after:content-[''] group-hover/tip:visible group-hover/tip:translate-y-0 group-hover/tip:opacity-100 group-focus-within/tip:visible group-focus-within/tip:translate-y-0 group-focus-within/tip:opacity-100 group-data-off/tip:invisible group-data-off/tip:opacity-0",

  sk: "sk rounded-md",
} as const;
