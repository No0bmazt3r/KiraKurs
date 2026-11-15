// Browser smoke test (docs/TESTING.md): guided flow on a phone, golden numbers on screen, no sideways scroll,
// both themes, deep links. Runs against the production build. `pnpm e2e` from the repo root.
// Browser: CHROME_PATH=/path/to/chrome, else Playwright's own Chromium (`pnpm --filter web exec playwright-core install chromium`).
import { preview } from "vite";
import { chromium } from "playwright-core";

const server = await preview({ root: new URL("..", import.meta.url).pathname, preview: { port: 4173, strictPort: true } });
const B = "http://localhost:4173/";
const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const fails = [], errors = [];
const expect = (label, got, want) => {
  const ok = want instanceof RegExp ? want.test(got) : got === want;
  console.log(`${ok ? "ok  " : "FAIL"} ${label}: ${JSON.stringify(got)}`);
  if (!ok) fails.push(label);
};

async function page(w, h, scheme = "light") {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: scheme });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => errors.push(`${w} pageerror: ${e.message}`));
  p.on("console", (m) => m.type() === "error" && !/fonts\.g|ERR_INTERNET|ERR_NAME/.test(m.text()) && errors.push(`${w} console: ${m.text()}`));
  return p;
}
const txt = (p, sel) => p.locator(sel).first().innerText();
const hscroll = (p) => p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
const enter = async (loc, value) => { await loc.fill(value); await loc.press("Enter"); };

try {
  // ---- guided flow on a phone ----
  let p = await page(375, 740);
  await p.goto(B);
  expect("start route", await p.evaluate(() => location.hash), "#/precheck");
  await p.getByRole("button", { name: "Start" }).click();
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
  expect("learn reveal", await txt(p, ".card.theory [role=status]"), /./);
  await p.locator("#nextBtn").click();
  await p.locator(".option").first().click();
  await p.getByRole("button", { name: "Check" }).click();
  await p.locator(".feedback .btn").click();
  await p.waitForURL(/#\/map/);
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
  expect("M8 cards dimmed", await p.locator(".grid2.dim").count(), 1);
  await enter(piH, "-150");
  expect("M8 -150", await txt(p, ".field.invalid .field-error"), "Inflation must be above −100%.");
  await enter(piH, "0.03");
  expect("M8 hint", await txt(p, ".field-hint:not(:empty)"), "Did you mean 3%? (Ignore if you meant it.)");
  expect("no NaN on map", (await p.locator("main").innerText()).includes("NaN"), false);
  await p.getByRole("button", { name: /Reset to Scenario/ }).click();

  // ---- Coach (M3–M5) ----
  await p.locator('#tabs a[data-route="coach"]').click();
  expect("M3 lock", await txt(p, ".tile.lock .value"), "RM 47,328");
  expect("M3 wait", await txt(p, ".tile.wait .value"), "RM 47,063");
  expect("M3 range", await txt(p, ".tile.wait p.small >> nth=1"), /RM 44,292.*RM 50,987/);
  const split = p.locator(".card.wait .field input[type=text]");
  await enter(split, "50");
  expect("M4 split", await txt(p, ".card.wait p.small"), /RM 47,195.*RM 45,810.*RM 49,158/s);
  await enter(split, "0");
  await p.getByText("Fees", { exact: true }).click();
  const marg = p.locator("details .field input[type=text]");
  await enter(marg, "0.11");
  expect("M5 margin lock", await txt(p, ".tile.lock .value"), "RM 47,380");
  await enter(marg, "0");
  expect("coach no sideways scroll (375)", await hscroll(p), false);

  // ---- Check (M6) + post-quiz ----
  await p.locator('#tabs a[data-route="check"]').click();
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
  expect("limits sheet open", await p.locator("#sheet").evaluate((d) => d.open), true);
  await p.keyboard.press("Escape");
  expect("sheet closes on Esc", await p.locator("#sheet").evaluate((d) => d.open), false);

  // ---- desktop, dark, deep links ----
  p = await page(1280, 900, "dark");
  await p.goto(B + "?preset=classroom#/map");
  expect("classroom deep link hero", await txt(p, ".hero-value"), /./);
  expect("classroom badge", await txt(p, ".badge-text"), "Classroom: illustrative numbers");
  await p.goto(B + "#/coach?preset=classroom");
  expect("classroom lock", await txt(p, ".tile.lock .value"), "RM 51,675");
  await p.goto(B + "?preset=snapshot&maths=1#/coach");
  expect("maths=1 opens the maths", await p.locator("details.maths[open]").count(), 1);
  expect("dark theme background", await p.evaluate(() => getComputedStyle(document.body).backgroundColor), /^rgb\((\d|[1-5]\d),/);
} finally {
  await browser.close();
  await server.close();
}
expect("console/page errors", errors.join("\n"), "");
if (fails.length) { console.error(`\n${fails.length} check(s) failed`); process.exit(1); }
console.log("\nall browser checks passed");
