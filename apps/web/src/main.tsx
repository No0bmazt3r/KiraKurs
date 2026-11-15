// Boot: read the URL, apply preset / free mode, mount the router (docs/ARCHITECTURE.md §4, docs/UX-FLOWS.md §1).
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createRootRoute, createRoute, createRouter, RouterProvider } from "@tanstack/react-router";
import { isPreset, type PresetId } from "@kirakurs/core/presets";
import { set, setPreset, useApp } from "./store";
import { Shell, NotFound, SCREENS } from "./Shell";
import { Precheck } from "./screens/Precheck";
import { Learn } from "./screens/Learn";
import { Predict } from "./screens/Predict";
import { MapScreen } from "./screens/Map";
import { Coach } from "./screens/Coach";
import { Check } from "./screens/Check";
import { Play } from "./screens/Play";
import "./styles.css";

// Clean paths (/learn), served under BASE ("/" or e.g. "/KiraKurs/" on GitHub Pages; dist/404.html handles deep links).
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
// Old shared links used hash routing (#/map?preset=x): rewrite them to /map?preset=x.
if (location.hash.startsWith("#/")) {
  const [hp = "", hq = ""] = location.hash.slice(2).split("?");
  const q = new URLSearchParams(location.search);
  new URLSearchParams(hq).forEach((v, k) => q.set(k, v));
  history.replaceState(null, "", `${BASE}/${hp}${q.size ? "?" + q : ""}`);
}
const path = location.pathname.slice(BASE.length).replace(/^\/|\/$/g, "");
const presetParam = new URLSearchParams(location.search).get("preset");
if (isPreset(presetParam)) setPreset(presetParam);
if (presetParam || (path && path !== "precheck")) set({ unlocked: true });   // lecturer / deep link → free mode
if (!(SCREENS as readonly string[]).includes(path))
  history.replaceState(null, "", `${BASE}/${useApp.getState().unlocked ? "learn" : "precheck"}${location.search}`);

export type Search = { preset?: PresetId; maths?: 1 };
const root = createRootRoute({
  component: Shell,
  notFoundComponent: NotFound,
  validateSearch: (s: Record<string, unknown>): Search => ({
    ...(isPreset(s.preset) ? { preset: s.preset } : {}),
    ...(String(s.maths) === "1" ? { maths: 1 as const } : {}),
  }),
});
const page = (path: string, component: () => React.ReactNode) => createRoute({ getParentRoute: () => root, path, component });
const router = createRouter({
  basepath: BASE || "/",
  routeTree: root.addChildren([
    page("/precheck", Precheck), page("/learn", Learn), page("/predict", Predict),
    page("/map", MapScreen), page("/coach", Coach), page("/play", Play), page("/check", Check),
  ]),
});

createRoot(document.getElementById("root")!).render(<StrictMode><RouterProvider router={router} /></StrictMode>);
