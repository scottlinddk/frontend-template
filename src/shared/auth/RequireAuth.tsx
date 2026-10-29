import { useEffect, type ReactNode } from "react";

import { useI18n } from "@/i18n";

import { useAuth } from "./context";

/** Renders children only for authenticated users, otherwise starts sign-in. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status, signIn } = useAuth();
  const { t } = useI18n();

  useEffect(() => {
    if (status === "unauthenticated") void signIn();
  }, [status, signIn]);

  if (status !== "authenticated")
    return <p className="p-6 text-ink-muted">{t("auth.signingIn")}</p>;
  return children;
}
