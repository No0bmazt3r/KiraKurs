// Vercel entry: the same Worker code, with env from process.env (GROQ_API_KEY, ALLOWED_ORIGIN).
// Bundled to apps/web/api/ask.js by apps/web/build-api.ts (part of `pnpm build`).
// ponytail: no per-IP rate limit on Vercel (that was a Cloudflare binding); Groq's free-tier limits still cap usage.
import worker from "./index.ts";

const env = () => ({ GROQ_API_KEY: process.env.GROQ_API_KEY, ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN });
export const POST = (req: Request) => worker.fetch(req, env());
