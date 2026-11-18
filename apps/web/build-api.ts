// Bundles the AI function for Vercel: apps/api/src/vercel.ts (+ core/ask.ts) → api/ask.js, one file with no workspace imports.
import { build } from "vite";

await build({
  configFile: false, logLevel: "warn",
  build: { ssr: "../api/src/vercel.ts", outDir: "api", emptyOutDir: false, rollupOptions: { output: { entryFileNames: "ask.js" } } },
});
