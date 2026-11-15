import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./": hash routing means the build works under any Pages path (e.g. /KiraKurs/).
export default defineConfig({
  base: "./",
  plugins: [react()],
  server: {
    port: 5173, strictPort: true,
    proxy: { "/api": { target: "http://localhost:8787", rewrite: (p) => p.replace(/^\/api/, "") } },
  },
});
