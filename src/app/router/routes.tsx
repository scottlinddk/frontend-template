import type { RouteObject } from "react-router";

import { RootLayout } from "@/app/layouts/RootLayout";
import { RouteErrorBoundary } from "@/app/layouts/RouteErrorBoundary";
import { useI18n } from "@/i18n";
import { ProtectedRoute } from "@/shared/auth";

function Home() {
  const { t } = useI18n();
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold">{t("app.name")}</h1>
      <p className="text-ink-muted">{t("home.lead")}</p>
    </section>
  );
}

function NotFound() {
  const { t } = useI18n();
  return <p className="text-ink-muted">{t("error.notFound")}</p>;
}

/**
 * Route tree. Load feature routes lazily with `lazy: () => import(...)`.
 *
 * Prefetching with a loader (`queryClient.ensureQueryData(...)`) is fine for
 * public data. Do not do it for routes behind `ProtectedRoute`: loaders start
 * before the user is signed in, so the request would go out without a token.
 */
export const routes: RouteObject[] = [
  {
    path: "/",
    Component: RootLayout,
    ErrorBoundary: RouteErrorBoundary,
    children: [
      { index: true, Component: Home },
      {
        Component: ProtectedRoute,
        children: [
          {
            path: "items",
            ErrorBoundary: RouteErrorBoundary,
            lazy: async () => {
              const { Component } = await import("@/features/items/routes/ItemsPage");
              return { Component };
            },
          },
        ],
      },
      { path: "*", Component: NotFound },
    ],
  },
];
