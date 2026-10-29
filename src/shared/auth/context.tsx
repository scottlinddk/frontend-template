import { createContext, use, useEffect, useMemo, type ReactNode } from "react";

import { queryClient } from "@/shared/lib/queryClient";

import type { AuthPort } from "./port";
import { setTokenGetter } from "./token";

const AuthContext = createContext<AuthPort | null>(null);

/** Used by adapters to publish their AuthPort and register the token getter. */
export function AuthPortProvider({ value, children }: { value: AuthPort; children: ReactNode }) {
  const { getAccessToken, signOut } = value;

  useEffect(() => {
    setTokenGetter(getAccessToken);
  }, [getAccessToken]);

  // Whoever signs in next must never see the previous user's cached data.
  const port = useMemo<AuthPort>(
    () => ({
      ...value,
      signOut: async () => {
        await signOut();
        queryClient.clear();
      },
    }),
    [value, signOut],
  );

  return <AuthContext value={port}>{children}</AuthContext>;
}

export function useAuth(): AuthPort {
  const value = use(AuthContext);
  if (!value) throw new Error("useAuth must be used inside <AuthProvider>");
  return value;
}
