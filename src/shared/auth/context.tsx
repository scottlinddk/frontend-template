import { createContext, use, useEffect, type ReactNode } from "react";

import type { AuthPort } from "./port";
import { setTokenGetter } from "./token";

const AuthContext = createContext<AuthPort | null>(null);

/** Used by adapters to publish their AuthPort and register the token getter. */
export function AuthPortProvider({ value, children }: { value: AuthPort; children: ReactNode }) {
  const { getAccessToken } = value;
  useEffect(() => {
    setTokenGetter(getAccessToken);
  }, [getAccessToken]);

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthPort {
  const value = use(AuthContext);
  if (!value) throw new Error("useAuth must be used inside <AuthProvider>");
  return value;
}
