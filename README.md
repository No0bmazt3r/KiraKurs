# KiraKurs: Convert Now or Later?

See how inflation and interest rates move your ringgit before you pay abroad.

A learning web app for Malaysian students paying a foreign-currency bill on a future date. It links inflation, interest rates and
exchange rates (IRP, PPP, Fisher/IFE) to one decision: **lock the rate now, or wait?**
GFB3043/GEB3043 International Financial Management, FinBridge AI project.

```
pnpm install       # once (Node ≥ 20, pnpm via `corepack enable`)
pnpm dev           # web on http://localhost:5173 + API (wrangler dev) on :8787, one command
pnpm test          # Vitest: engine, content, format, quiz, API
pnpm typecheck     # strict TypeScript, all packages
pnpm e2e           # build + headless-Chrome smoke test (golden numbers on screen, 375 px, themes, deep links)
pnpm build         # apps/web/dist
```
For the Ask feature locally, copy `apps/api/.dev.vars.example` to `apps/api/.dev.vars` and add a Groq key (never commit it).
Without a key the API runs and always returns the topic menu.

Snapshot data is dated 6 Nov 2026 and is **not live**. Classroom data is illustrative. Parity theory, not a prediction. Not
financial advice.

Builders and AI agents: start with [AGENTS.md](AGENTS.md), then `docs/`.
