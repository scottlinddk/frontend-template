import type { RouteObject } from "react-router";

import { RootLayout } from "@/app/layouts/RootLayout";
import { RequireAuth } from "@/shared/auth";

function Home() {
  return <h1 className="text-2xl font-semibold">Frontend template</h1>;
}

function NotFound() {
  return <p className="text-slate-500">Page not found.</p>;
}

export const routes: RouteObject[] = [
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Home },
      {
        path: "items",
        lazy: async () => {
          const { Component } = await import("@/features/items/routes/ItemsPage");
          return {
            element: (
              <RequireAuth>
                <Component />
              </RequireAuth>
            ),
          };
        },
      },
      { path: "*", Component: NotFound },
    ],
  },
];
