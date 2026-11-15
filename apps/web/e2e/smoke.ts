// Browser smoke test (docs/TESTING.md): guided flow on a phone, golden numbers on screen, no sideways scroll,
// both themes, deep links. Runs against the production build. `pnpm e2e` from the repo root.
// Browser: CHROME_PATH=/path/to/chrome, else Playwright's own Chromium (`pnpm --filter web exec playwright-core install chromium`).
import { preview } from "vite";
import { chromium, type Locator, type Page } from "playwright-core";

const server = await preview({ root: new URL("..", import.meta.url).pathname, preview: { port: 4173, strictPort: true } });
const B = "http://localhost:4173/";
const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const fails: string[] = [], errors: string[] = [];
const expect = (label: string, got: unknown, want: unknown) => {
  if (want instanceof RegExp) got = String(got);
  const ok = want instanceof RegExp ? want.test(got as string) : got === want;
  console.log(`${ok ? "ok  " : "FAIL"} ${label}: ${JSON.stringify(got)}`);
  if (!ok) fails.push(label);
};

async function page(w: number, h: number, scheme: "light" | "dark" = "light") {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: scheme, reducedMotion: "reduce" });   // count-ups off: read final numbers
  const p = await ctx.newPage();
  p.on("pageerror", (e) => errors.push(`${w} pageerror: ${e.message}`));
  p.on("console", (m) => m.type() === "error" && !/fonts\.g|ERR_INTERNET|ERR_NAME/.test(m.text()) && errors.push(`${w} console: ${m.text()}`));
  return p;
}
const txt = (p: Page, sel: string) => p.locator(sel).first().innerText();
const hscroll = (p: Page) => p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
const enter = async (loc: Locator, value: string) => { await loc.fill(value); await loc.press("Enter"); };

try {
  // ---- guided flow on a phone ----
  let p = await page(375, 740);
  await p.goto(B);
  expect("first visit lands on welcome", await p.evaluate(() => location.pathname), "/welcome");
  expect("welcome h1", await txt(p, "h1"), /Lock\s+or wait\?/);
  expect("welcome gap from ECB series", await txt(p, ".wel-sec:nth-child(2) .wel-p"), /between RM \d\.\d{4} and RM \d\.\d{4}.*RM [\d,]+\.$/);
  await p.locator(".tryit .lockbtn").click();
  expect("welcome replay", await txt(p, ".tryit-result"), /locking cost RM [\d,]+, waiting cost RM [\d,]+\./);
  expect("welcome no sideways scroll (375)", await hscroll(p), false);
  await p.getByRole("button", { name: "Start", exact: true }).click();
  expect("start → precheck", await p.evaluate(() => location.pathname), "/precheck");
  await p.getByRole("heading", { name: /Quick check/ }).waitFor();   // screens load lazily
  await p.getByRole("button", { name: "Start", exact: true }).click();
  for (let i = 0; i < 8; i++) {
    const opt = p.locator(".options .option");
    await opt.first().click();
    if ((await p.locator(".options").getAttribute("role")) === "group") await opt.nth(1).click();
    await p.getByRole("button", { name: "Next" }).click();
  }
  await p.getByRole("button", { name: "Continue" }).first().click();
  expect("learn h1", await txt(p, "h1"), /./);
  for (let i = 0; i < 3; i++) await p.getByRole("button", { name: "Next step" }).click();
  await p.locator(".card.theory .option").first().click();
  expect("learn waits for the slider", await txt(p, ".card.theory [role=status]"), /^Move the slider to 4\.0%/);
  await enter(p.locator(".card.theory .field input[type=text]"), "4");
  expect("learn reveal at target", await txt(p, ".card.theory [role=status]"), /^Right:/);
  await p.locator("#nextBtn").click();
  await p.locator(".option").first().click();
  await p.getByRole("button", { name: "Check" }).click();
  await p.locator(".feedback .btn").click();
  await p.waitForURL(/\/map$/);
  expect("tabs visible after predict", await p.locator("#tabs").isVisible(), true);
  expect("map no sideways scroll (375)", await hscroll(p), false);

  // M7 linked mode, inflation 1.8 → 4.0
  await p.locator(".switch input").check();
  const piH = p.locator(".field input[type=text]").first();
  await enter(piH, "4");
  expect("M7 linked iH", await p.locator(".field.readonly input").first().inputValue(), "4.9705");
  await p.locator(".switch input").uncheck();
  // M8 invalid inputs
  await enter(piH, "abc");
  expect("M8 abc", await txt(p, ".field.invalid .field-error"), "Enter a number.");
  expect("M8 cards dimmed", await p.locator(".rates.dim").count(), 1);
  await enter(piH, "-150");
  expect("M8 -150", await txt(p, ".field.invalid .field-error"), "Inflation must be above −100%.");
  await enter(piH, "0.03");
  expect("M8 hint", await txt(p, ".field-hint:not(:empty)"), "Did you mean 3%? (Ignore if you meant it.)");
  expect("no NaN on map", (await p.locator("main").innerText()).includes("NaN"), false);
  await p.getByRole("button", { name: /Reset to Scenario/ }).click();

  // ---- Coach (M3–M5) ----
  await p.locator('#tabs a[data-route="coach"]').click();
  await p.locator("main h1", { hasText: "Lock or wait" }).waitFor();
  expect("M3 lock", await txt(p, ".tile.lock .value"), "RM 47,328");
  expect("M3 wait", await txt(p, ".tile.wait .value"), "RM 47,063");
  expect("M3 range", await txt(p, ".tile.wait p.small >> nth=1"), /RM 44,292.*RM 50,987/);
  const split = p.locator(".card.wait .field input[type=text]");
  await enter(split, "50");
  expect("M4 split", await txt(p, ".card.wait p.small"), /RM 47,195.*RM 45,810.*RM 49,158/s);
  await enter(split, "0");
  await p.getByText("Fees", { exact: true }).click();
  const marg = p.locator('details:has-text("Fees") .field input[type=text]');
  await enter(marg, "0.11");
  expect("M5 margin lock", await txt(p, ".tile.lock .value"), "RM 47,380");
  await enter(marg, "0");
  expect("coach no sideways scroll (375)", await hscroll(p), false);
  await enter(split, "150");
  expect("split validated", await txt(p, ".card.wait .field-error"), "Split must be between 0% and 100%.");
  await enter(split, "0");

  // ---- Play: Kira, missions, Fee Day ----
  await p.locator('#tabs a[data-route="play"]').click();
  await p.locator("main h1", { hasText: "Play" }).waitFor();
  expect("play h1", await txt(p, "h1"), /^Play/);
  const iH = p.getByLabel("Malaysian interest rate %", { exact: true }).first();
  await enter(iH, "5");
  expect("Kira explains", await txt(p, ".kira"), /You raised Malaysian interest to 5\.00%\. Bank lock: RM [0-9.]+ \(up\)/);
  expect("mission irp done", await p.locator(".mission.done").count() >= 1, true);
  for (let i = 0; i < 3; i++) {
    await p.locator(".feeday .option").first().click();
    await p.getByRole("button", { name: "Replay a past period" }).click();
    expect(`fee round ${i + 1}`, await txt(p, ".feeday [role=status]"), /Past period .* → .*: the rate went from RM [0-9.]+ to RM [0-9.]+/);
    await p.getByRole("button", { name: "Another period" }).click();
  }
  expect("fee summary", await txt(p, ".feeday"), /Across your 3 past periods, waiting minus locking ranged from/);
  expect("risk mission done", await p.locator(".mission.done", { hasText: "Feel the risk" }).count(), 1);
  expect("play no sideways scroll (375)", await hscroll(p), false);
  await p.getByRole("button", { name: /Reset to Scenario/ }).click();

  // ---- Check (M6) + post-quiz ----
  await p.locator('#tabs a[data-route="check"]').click();
  await p.locator("tr.here").waitFor();
  await enter(p.locator(".field input[type=text]").first(), "2.58");
  expect("M6 break-even row", await txt(p, "tr.here"), /2\.58%.*RM 1/s);
  await p.getByRole("button", { name: "Start the after-check" }).click();
  for (let i = 0; i < 8; i++) {
    const opt = p.locator(".options .option");
    await opt.first().click();
    if ((await p.locator(".options").getAttribute("role")) === "group") await opt.nth(1).click();
    await p.getByRole("button", { name: "Check" }).click();
    await p.getByRole("button", { name: "Next" }).click();
  }
  expect("result code", await txt(p, ".code"), /^KK-[AB]\d-\d$/);
  await p.locator("#tabs button").click();
  expect("limits sheet open", await p.locator("#sheet").evaluate((d) => (d as HTMLDialogElement).open), true);
  await p.keyboard.press("Escape");
  expect("sheet closes on Esc", await p.locator("#sheet").evaluate((d) => (d as HTMLDialogElement).open), false);

  // ---- desktop, dark, deep links ----
  p = await page(1280, 900, "dark");
  await p.goto(B + "map?preset=classroom");
  expect("classroom deep link hero", await txt(p, ".hero-value"), /./);
  expect("classroom badge", await txt(p, ".badge-text"), "Classroom: illustrative numbers");
  await p.goto(B + "coach?preset=classroom");
  expect("classroom lock", await txt(p, ".tile.lock .value"), "RM 51,675");
  await p.goto(B + "?preset=snapshot&maths=1#/coach");   // old hash link still works
  expect("old hash link rewritten", await p.evaluate(() => location.pathname + location.search), "/coach?preset=snapshot&maths=1");
  await p.goto(B + "nope");
  expect("unknown path → learn", await p.evaluate(() => location.pathname), "/learn");
  await p.goto(B + "coach?preset=snapshot&maths=1");
  await p.locator("main h1", { hasText: "Lock or wait" }).waitFor();
  expect("maths=1 opens the maths", await p.locator("details.maths[open]").count(), 1);
  expect("dark theme background", await p.evaluate(() => getComputedStyle(document.body).backgroundColor), /^rgb\((\d|[1-5]\d),/);
} finally {
  await browser.close();
  await server.close();
}
expect("console/page errors", errors.join("\n"), "");
if (fails.length) { console.error(`\n${fails.length} check(s) failed`); process.exit(1); }
console.log("\nall browser checks passed");
