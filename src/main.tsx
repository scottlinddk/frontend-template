import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { AppProviders } from "@/app/providers/AppProviders";
import { AppRouter } from "@/app/router";
import { env } from "@/shared/config/env";
import "@/styles/index.css";

async function enableMocking() {
  // The mode check is static, so the bundler drops the MSW worker from every build
  // except `--mode demo`. A normal production build can never serve mock data.
  if (!(import.meta.env.DEV || import.meta.env.MODE === "demo") || !env.VITE_ENABLE_MSW) return;
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
