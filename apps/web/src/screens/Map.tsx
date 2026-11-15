// Screen 3: Parity Map (docs/UX-FLOWS.md §2.3, CONTENT.md §5).
import { T, fill } from "@kirakurs/core/content";
import { nominalFromReal, realRate } from "@kirakurs/core/engine";
import { fx, signedPct, toPctInput } from "@kirakurs/core/format";
import { useApp, setRaw, setLinked, setPreset, toast, useData, type RawKey } from "../store";
import { Arrow, Badge, Card, Field, Icon, Kira, Live, Maths, Rich } from "../ui";
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
  return <section className="card inputs">
    <h2 className="card-title"><Icon name="sliders" />{T["map.inputs"]}</h2>
    <label className="switch"><input type="checkbox" role="switch" checked={L} onChange={(e) => setLinked(e.target.checked)} />{T["map.linked"]}</label>
    {L && <p className="banner"><Icon name="info" />{T["map.linkedBanner"]}</p>}
    {field("piH")}{field("piF")}
    {L ? <>{field("rH")}{field("rF")}{derived("iH")}{derived("iF")}<p className="caption">{T["map.derived"]}</p></> : <>{field("iH")}{field("iF")}</>}
    {full && <>{field("n", "days")}
      <Field label={fl("lbl.T")} raw={r.T} error={errors.T} hint={hints.T} onInput={(x) => setRaw({ T: x })} /></>}
    <div className="row">
      {full && <button className="btn secondary" type="button" onClick={setEqual}><Icon name="scale" />{T["map.equalBtn"]}</button>}
      <button className="btn ghost" type="button" onClick={() => { setPreset(preset); toast(fl("toast.reset")); }}><Icon name="reset" /><span>{fl("btn.reset")}</span></button>
    </div>
  </section>;
}

export function MapScreen() {
  const openMaths = useMaths();
  const { v, inp, ok } = useData();
  const fl = (k: string) => fill(T[k]!, v);
  const m = v.results.m;

  return <div className="screen">
    <header><h1>{fl("map.h1")}</h1><p className="small">{fl("convention")}</p></header>
    <div className="map-layout">
      <div className="stack outputs">
        <section className="card lock tint-lock hero-card"><Live className={ok ? "hero-value" : "hero-value dim"}>{v.finite ? fl("map.hero") : T.outOfRange!}</Live><Badge /></section>
        <Kira inp={inp} />
        <p className="field-error" hidden={ok}>{T.fixInput}</p>
        <div className={ok ? "grid2" : "grid2 dim"}>
          <Card title={T["map.card.fwd"]!} variant="lock">
            <div><Live as="span" className="value">{"RM " + v.s.F}</Live> <span className="unit">{fl("map.perUnit")}</span></div>
            <div><Arrow dir={m.F >= inp.S ? "up" : "down"} words={fl("map.fwd.arrow")} /></div>
            <Rich className="small" text={fl("map.card.fwd.s")} />
            <Live className="caption">{fl("map.fwd.bank")}</Live><Badge />
          </Card>
          <Card title={T["map.card.ppp"]!} variant="theory">
            <Live as="div" className="value">{"RM " + v.s.EPPP}</Live>
            <div><Arrow dir={m.EPPP >= inp.S ? "up" : "down"} words={fl("map.ppp.arrow")} /></div>
            <Rich className="small" text={fl("map.card.ppp.s")} /><Badge />
          </Card>
          <Card title={T["map.card.ife"]!} variant="theory">
            <div><Live as="span" className="value">{"RM " + v.s.EIFE}</Live> <span className="unit">{fl("map.perUnit")}</span></div>
            <div><Arrow dir={m.EIFE >= inp.S ? "up" : "down"} words={fl("map.fwd.arrow")} /></div>
            <Rich className="small" text={fl("map.card.ife.s")} /><Badge />
          </Card>
          <Card title={T["map.card.real"]!}>
            <Live as="div" className="value">{fl("map.card.real.v")}</Live><Rich className="small" text={fl("map.card.real.s")} /><Badge />
          </Card>
        </div>
        <Rich className="small" text={Math.abs(m.parityGapPP) < 1e-9 ? T["map.gapZero"]! : fl("map.gap")} />
      </div>
      <InputsCard />
    </div>

    <Maths summary={T["btn.showMaths"]!} open={openMaths}>
      <h3>{T["map.m.formulas"]}</h3>
      {["t", "fwd", "ppp", "ife", "fisher", "gap"].map((k) => <Rich key={k} className="formula" text={fl("map.m." + k)} />)}
      <h3>{T["map.m.oneYear"]}</h3><p>{fl("map.m.oneYearV")}</p>
      <h3>{T["map.m.bank"]}</h3><p>{fl("map.m.bankNote")}</p>
      <h3>{T["map.m.forecasts"]}</h3>
      <div className="table-wrap"><table>
        <caption className="small">{T["map.m.forecastsCaption"]}</caption>
        <thead><tr><th scope="col">{T["map.m.colTheory"]}</th><th scope="col">{fl("map.m.colRate")}</th><th scope="col">{T["map.m.colChange"]}</th></tr></thead>
        <tbody>{m.forecasts.map((x) => <tr key={x.id}><th scope="row"><Rich as="span" text={T["map.m.f." + x.id]!} /></th><td>{fx(x.value, 4)}</td><td>{signedPct(x.value / inp.S - 1, 4)}</td></tr>)}</tbody>
      </table></div>
    </Maths>
    <Maths summary={T["map.explainQ"]!} icon="info"><p>{T["map.explainA"]}</p></Maths>
    <AskButton />
  </div>;
}
