// Boot: read the URL, apply preset / free mode, mount the router (docs/ARCHITECTURE.md §4, docs/UX-FLOWS.md §1).
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createHashHistory, createRootRoute, createRoute, createRouter, RouterProvider } from "@tanstack/react-router";
import { isPreset, type PresetId } from "@kirakurs/core/presets";
import { set, setPreset, useApp } from "./store";
import { Shell, NotFound, SCREENS } from "./Shell";
import { Precheck } from "./screens/Precheck";
import { Learn } from "./screens/Learn";
import { Predict } from "./screens/Predict";
import { MapScreen } from "./screens/Map";
import { Coach } from "./screens/Coach";
import { Check } from "./screens/Check";
import "./styles.css";

// Old links put ?preset=&maths= before the hash; move them into the hash so the router owns them.
const outer = new URLSearchParams(location.search);
if (outer.size) {
  const [path = "/", hq = ""] = location.hash.replace(/^#/, "").split("?");
  const merged = new URLSearchParams(hq);
  outer.forEach((v, k) => merged.set(k, v));
  history.replaceState(null, "", `${location.pathname}#${path}?${merged}`);
}
const [path = "", hq = ""] = location.hash.replace(/^#\/?/, "").split("?");
const presetParam = new URLSearchParams(hq).get("preset");
if (isPreset(presetParam)) setPreset(presetParam);
if (presetParam || (path && path !== "precheck")) set({ unlocked: true });   // lecturer / deep link → free mode
if (!(SCREENS as readonly string[]).includes(path))
  location.replace(`#/${useApp.getState().unlocked ? "learn" : "precheck"}${hq ? "?" + hq : ""}`);

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
  history: createHashHistory(),
  routeTree: root.addChildren([
    page("/precheck", Precheck), page("/learn", Learn), page("/predict", Predict),
    page("/map", MapScreen), page("/coach", Coach), page("/check", Check),
  ]),
});

createRoot(document.getElementById("root")!).render(<StrictMode><RouterProvider router={router} /></StrictMode>);
