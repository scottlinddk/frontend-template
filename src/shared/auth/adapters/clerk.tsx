import { ClerkProvider, useAuth as useClerkAuth, useClerk, useUser } from "@clerk/clerk-react";
import { useMemo, type ReactNode } from "react";

import { env } from "@/shared/config/env";

import { AuthPortProvider } from "../context";
import type { AuthPort } from "../port";

function Bridge({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, getToken } = useClerkAuth();
  const { user } = useUser();
  const clerk = useClerk();

  const value = useMemo<AuthPort>(
    () => ({
      status: !isLoaded ? "loading" : isSignedIn ? "authenticated" : "unauthenticated",
      user: user
        ? {
            id: user.id,
            name: user.fullName ?? user.primaryEmailAddress?.emailAddress ?? user.id,
            email: user.primaryEmailAddress?.emailAddress,
          }
        : null,
      signIn: async () => {
        await clerk.redirectToSignIn();
      },
      signOut: () => clerk.signOut(),
      getAccessToken: () => getToken(),
    }),
    [isLoaded, isSignedIn, user, clerk, getToken],
  );

  return <AuthPortProvider value={value}>{children}</AuthPortProvider>;
}

export default function ClerkAuthAdapter({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider publishableKey={env.VITE_CLERK_PUBLISHABLE_KEY ?? ""}>
      <Bridge>{children}</Bridge>
    </ClerkProvider>
  );
}
