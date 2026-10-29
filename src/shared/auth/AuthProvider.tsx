import { lazy, Suspense, type ComponentType, type ReactNode } from "react";

import { env } from "@/shared/config/env";

type Adapter = ComponentType<{ children: ReactNode }>;

// One dynamic import per adapter: only the selected one is downloaded.
const adapters: Record<typeof env.VITE_AUTH_PROVIDER, Adapter> = {
  none: lazy(() => import("./adapters/none")),
  msal: lazy(() => import("./adapters/msal")),
  clerk: lazy(() => import("./adapters/clerk")),
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const Adapter = adapters[env.VITE_AUTH_PROVIDER];
  return (
    <Suspense fallback={null}>
      <Adapter>{children}</Adapter>
    </Suspense>
  );
}
