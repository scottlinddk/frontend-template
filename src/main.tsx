import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { AppProviders } from "@/app/providers/AppProviders";
import { AppRouter } from "@/app/router";
import { env } from "@/shared/config/env";
import "@/styles/index.css";

async function enableMocking() {
  // DEV guard lets the bundler drop the MSW worker from production builds.
  if (!import.meta.env.DEV || !env.VITE_ENABLE_MSW) return;
  const { worker } = await import("@/mocks/browser");
  await worker.start({ onUnhandledFrame: "bypass" });
}

void enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </StrictMode>,
  );
});
