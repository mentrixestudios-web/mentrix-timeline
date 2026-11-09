import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Limpieza única automática de cachés heredadas en PWA móvil para v2.7.4
if (typeof window !== "undefined") {
  try {
    const MIGRATION_KEY = "mt_pwa_clean_v274";
    if (!localStorage.getItem(MIGRATION_KEY)) {
      localStorage.setItem(MIGRATION_KEY, "1");
      if ("caches" in window) {
        caches.keys().then((keys) => {
          keys.forEach((k) => {
            if (k !== "mentrix-timeline-v2.7.7") {
              caches.delete(k).catch(() => {});
            }
          });
        }).catch(() => {});
      }
    }
  } catch {}
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <App />
);
