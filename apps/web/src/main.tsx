// Boot: read the URL, apply preset / free mode, mount the router (docs/ARCHITECTURE.md §4, docs/UX-FLOWS.md §1).
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createRootRoute, createRoute, createRouter, lazyRouteComponent, RouterProvider, type RouteComponent } from "@tanstack/react-router";
import { isPreset, type PresetId } from "@kirakurs/core/presets";
import { set, setPreset, useApp } from "./store";
import { Shell, NotFound, SCREENS } from "./Shell";
import { ScreenSkeleton } from "./ui";
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
if (presetParam || (path && path !== "precheck" && path !== "welcome")) set({ unlocked: true });   // lecturer / deep link → free mode
// First visit lands on the welcome intro; returning visitors (or deep links) go to Learn.
if (path !== "welcome" && !(SCREENS as readonly string[]).includes(path))
  history.replaceState(null, "", `${BASE}/${useApp.getState().unlocked ? "learn" : "welcome"}${location.search}`);

export type Search = { preset?: PresetId; maths?: 1 };
const root = createRootRoute({
  component: Shell,
  notFoundComponent: NotFound,
  validateSearch: (s: Record<string, unknown>): Search => ({
    ...(isPreset(s.preset) ? { preset: s.preset } : {}),
    ...(String(s.maths) === "1" ? { maths: 1 as const } : {}),
  }),
});
const page = (path: string, component: RouteComponent) => createRoute({ getParentRoute: () => root, path, component });
// Each screen is its own chunk; the skeleton shows while one loads (only if it takes over 120 ms).
const router = createRouter({
  basepath: BASE || "/",
  defaultViewTransition: true,                          // cross-fade between screens (CSS: ::view-transition-*(main))
  defaultPendingComponent: ScreenSkeleton, defaultPendingMs: 120, defaultPendingMinMs: 300,
  routeTree: root.addChildren([
    page("/welcome", lazyRouteComponent(() => import("./screens/Welcome"), "Welcome")),
    page("/precheck", lazyRouteComponent(() => import("./screens/Precheck"), "Precheck")),
    page("/learn", lazyRouteComponent(() => import("./screens/Learn"), "Learn")),
    page("/predict", lazyRouteComponent(() => import("./screens/Predict"), "Predict")),
    page("/map", lazyRouteComponent(() => import("./screens/Map"), "MapScreen")),
    page("/coach", lazyRouteComponent(() => import("./screens/Coach"), "Coach")),
    page("/play", lazyRouteComponent(() => import("./screens/Play"), "Play")),
    page("/check", lazyRouteComponent(() => import("./screens/Check"), "Check")),
  ]),
});

createRoot(document.getElementById("root")!).render(<StrictMode><RouterProvider router={router} /></StrictMode>);
