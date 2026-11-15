// Screen 3: Parity Map (docs/UX-FLOWS.md §2.3, CONTENT.md §5).
import { T, fill } from "@kirakurs/core/content";
import { nominalFromReal, realRate } from "@kirakurs/core/engine";
import { fx, signedPct, toPctInput } from "@kirakurs/core/format";
import { useApp, setRaw, setLinked, setPreset, toast, useData, type RawKey } from "../store";
import { Arrow, Badge, Field, Icon, Kira, LimitsNote, Live, Maths, Rich } from "../ui";
import { tw, cn } from "../tw";
import { useMaths } from "../Shell";
import { AskButton } from "./Ask";

const SLIDERS: Partial<Record<RawKey, { min: number; max: number; step: number }>> = {
  piH: { min: 0, max: 10, step: 0.01 }, piF: { min: 0, max: 10, step: 0.01 },
  iH: { min: 0, max: 10, step: 0.05 }, iF: { min: 0, max: 10, step: 0.05 },
  rH: { min: -5, max: 8, step: 0.01 }, rF: { min: -5, max: 8, step: 0.01 },
};

// The inputs card, shared by the Map and the Play missions. `full` adds days, amount and the buttons.
export function InputsCard({ full = true }: { full?: boolean }) {
  const { raw: r, linked: L, preset } = useApp();
  const { v, inp, errors, hints } = useData();
  const fl = (k: string) => fill(T[k]!, v);
  const field = (k: RawKey, suffix?: string) => <Field key={k} label={fl("lbl." + k)} raw={r[k]} error={errors[k]} hint={hints[k]}
    suffix={suffix ?? "%"} slider={SLIDERS[k]} onInput={(x) => setRaw({ [k]: x })} />;
  const derived = (k: "iH" | "iF") => <Field key={k + "d"} label={fl("lbl." + k)} raw={toPctInput(Number(inp[k].toFixed(6)))} suffix="%" readonly />;
  const setEqual = () => {
    if (L) setRaw({ rF: toPctInput(realRate(inp.iH, inp.piH)) });
    else setRaw({ iF: toPctInput(nominalFromReal(realRate(inp.iH, inp.piH), inp.piF)) });
    toast(T["map.equalToast"]!);
  };
  return <section className={cn(tw.card, "inputs lg:sticky lg:top-20 lg:col-start-1 lg:row-start-1")}>
    <h2>{T["map.inputs"]}</h2>
    <label className={tw.switch}><input type="checkbox" role="switch" className={tw.switchInput} checked={L} onChange={(e) => setLinked(e.target.checked)} />{T["map.linked"]}</label>
    {L && <p className={cn(tw.banner)}><Icon name="info" />{T["map.linkedBanner"]}</p>}
    {field("piH")}{field("piF")}
    {L ? <>{field("rH")}{field("rF")}{derived("iH")}{derived("iF")}<p className={cn(tw.caption)}>{T["map.derived"]}</p></> : <>{field("iH")}{field("iF")}</>}
    {full && <>{field("n", "days")}
      <Field label={fl("lbl.T")} raw={r.T} error={errors.T} hint={hints.T} onInput={(x) => setRaw({ T: x })} /></>}
    <div className={cn(tw.row)}>
      {full && <button className={cn(tw.btn, tw.secondary)} type="button" onClick={setEqual}><Icon name="scale" />{T["map.equalBtn"]}</button>}
      <button className={cn(tw.btn, tw.ghost)} type="button" onClick={() => { setPreset(preset); toast(fl("toast.reset")); }}><Icon name="reset" /><span>{fl("btn.reset")}</span></button>
    </div>
  </section>;
}

export function MapScreen() {
  const openMaths = useMaths();
  const { v, inp, ok } = useData();
  const fl = (k: string) => fill(T[k]!, v);
  const m = v.results.m;

  return <div className={cn(tw.screen)}>
    <header className={tw.header}><h1>{fl("map.h1")}</h1><p className={cn(tw.small)}>{fl("convention")}</p></header>
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(19rem,23rem)_1fr]">
      <div className={cn(tw.stack, "outputs gap-4 lg:col-start-2 lg:row-start-1")}>
        <section className={cn(tw.card, "lock tint-lock gap-3 border-transparent bg-field text-on-field")}><Live className={cn(tw.heroValue, !ok && "opacity-50")}>{v.finite ? fl("map.hero") : T.outOfRange!}</Live><Badge /></section>
        <Kira inp={inp} />
        <p className={tw.fieldError} hidden={ok}>{T.fixInput}</p>
        <section className={cn(tw.card, "rates gap-0", !ok && "dim opacity-50")} aria-label={T["map.ratesTitle"]}>
          <h2 className="pb-3">{T["map.ratesTitle"]}</h2>
          <Rate title={T["map.card.fwd"]!} value={"RM " + v.s.F} unit={fl("map.perUnit")}
            arrow={<Arrow dir={m.F >= inp.S ? "up" : "down"} words={fl("map.fwd.arrow")} />}
            text={fl("map.card.fwd.s")} note={fl("map.fwd.bank")} lock />
          <Rate title={T["map.card.ppp"]!} value={"RM " + v.s.EPPP} unit={fl("map.perUnit")}
            arrow={<Arrow dir={m.EPPP >= inp.S ? "up" : "down"} words={fl("map.ppp.arrow")} />} text={fl("map.card.ppp.s")} />
          <Rate title={T["map.card.ife"]!} value={"RM " + v.s.EIFE} unit={fl("map.perUnit")}
            arrow={<Arrow dir={m.EIFE >= inp.S ? "up" : "down"} words={fl("map.fwd.arrow")} />} text={fl("map.card.ife.s")} />
          <Rate title={T["map.card.real"]!} value={fl("map.card.real.v")} text={fl("map.card.real.s")} />
          <Badge />
        </section>
        <Rich className={cn(tw.small)} text={Math.abs(m.parityGapPP) < 1e-9 ? T["map.gapZero"]! : fl("map.gap")} />
        <LimitsNote />
      </div>
      <InputsCard />
    </div>

    <Maths summary={T["btn.showMaths"]!} open={openMaths}>
      <h3>{T["map.m.formulas"]}</h3>
      {["t", "fwd", "ppp", "ife", "fisher", "gap"].map((k) => <Rich key={k} className={cn(tw.formula)} text={fl("map.m." + k)} />)}
      <h3>{T["map.m.oneYear"]}</h3><p>{fl("map.m.oneYearV")}</p>
      <h3>{T["map.m.bank"]}</h3><p>{fl("map.m.bankNote")}</p>
      <h3>{T["map.m.forecasts"]}</h3>
      <div className={cn("overflow-x-auto")}><table>
        <caption className={cn(tw.small)}>{T["map.m.forecastsCaption"]}</caption>
        <thead><tr><th scope="col">{T["map.m.colTheory"]}</th><th scope="col">{fl("map.m.colRate")}</th><th scope="col">{T["map.m.colChange"]}</th></tr></thead>
        <tbody>{m.forecasts.map((x) => <tr key={x.id}><th scope="row"><Rich as="span" text={T["map.m.f." + x.id]!} /></th><td>{fx(x.value, 4)}</td><td>{signedPct(x.value / inp.S - 1, 4)}</td></tr>)}</tbody>
      </table></div>
    </Maths>
    <Maths summary={T["map.explainQ"]!} icon="info"><p>{T["map.explainA"]}</p></Maths>
    <AskButton />
  </div>;
}

// One row of the reference-rates table: name and explanation on the left, the figure right-aligned.
function Rate({ title, value, unit, arrow, text, note, lock }: { title: string; value: string; unit?: string; arrow?: React.ReactNode; text: string; note?: string; lock?: boolean }) {
  return <div className={cn("rate grid gap-2 border-t border-line py-4 sm:grid-cols-[1fr_auto] sm:gap-8", lock && "lock")}>
    <div className="grid content-start gap-1"><h3>{title}</h3><Rich className={cn(tw.small)} text={text} />{note && <Live className={cn(tw.caption)}>{note}</Live>}</div>
    <div className="grid content-start gap-0.5 sm:justify-items-end sm:text-right"><Live as="div" className={cn(tw.value, "whitespace-nowrap", lock && "text-primary-ink")}>{value}</Live>{unit && <span className={cn(tw.unit)}>{unit}</span>}{arrow}</div>
  </div>;
}
