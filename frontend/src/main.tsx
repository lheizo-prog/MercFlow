import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

import App from "./App.tsx";
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN || "https://o0.ingest.sentry.io/0",
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

// Tratamento nativo do Vite para erro de carregamento de chunk dinâmico após novo deploy
window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  const hasReloaded = sessionStorage.getItem("vite_preload_retry");
  if (!hasReloaded) {
    sessionStorage.setItem("vite_preload_retry", "true");
    window.location.reload();
  } else {
    sessionStorage.removeItem("vite_preload_retry");
  }
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if ("serviceWorker" in navigator) {
  // Desregistra qualquer Service Worker ativo e limpa caches para evitar que versões
  // antigas de chunks (.js) continuem sendo interceptadas ou retornem index.html
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });

  if ("caches" in window) {
    caches.keys().then((names) => {
      for (const name of names) {
        caches.delete(name);
      }
    });
  }
}
