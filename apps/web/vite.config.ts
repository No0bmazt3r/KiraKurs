import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// BASE=/KiraKurs/ when hosting under a sub-path (GitHub Pages project site). Router basepath follows it.
export default defineConfig({
  base: process.env.BASE ?? "/",
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173, strictPort: true,
    proxy: { "/api": { target: "http://localhost:8787", rewrite: (p) => p.replace(/^\/api/, "") } },
  },
});
