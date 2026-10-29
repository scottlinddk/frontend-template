import { useEffect, type ReactNode } from "react";

import { useAuth } from "./context";

/** Renders children only for authenticated users, otherwise starts sign-in. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status, signIn } = useAuth();

  useEffect(() => {
    if (status === "unauthenticated") void signIn();
  }, [status, signIn]);

  if (status !== "authenticated") return <p className="p-6 text-slate-500">Signing in…</p>;
  return children;
}
