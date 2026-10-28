import { useMemo, type ReactNode } from "react";

import { AuthPortProvider } from "../context";
import type { AuthPort } from "../port";

/** Auth disabled: a fixed local user. Use for development and demos only. */
export default function NoneAuthAdapter({ children }: { children: ReactNode }) {
  const value = useMemo<AuthPort>(
    () => ({
      status: "authenticated",
      user: { id: "local", name: "Local developer" },
      signIn: () => Promise.resolve(),
      signOut: () => Promise.resolve(),
      getAccessToken: () => Promise.resolve(null),
    }),
    [],
  );
  return <AuthPortProvider value={value}>{children}</AuthPortProvider>;
}
