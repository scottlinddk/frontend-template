import {
  InteractionRequiredAuthError,
  PublicClientApplication,
  type AccountInfo,
} from "@azure/msal-browser";
import { MsalProvider, useMsal } from "@azure/msal-react";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { env } from "@/shared/config/env";

import { AuthPortProvider } from "../context";
import type { AuthPort } from "../port";

const scopes = (env.VITE_MSAL_SCOPES ?? "")
  .split(",")
  .map((scope) => scope.trim())
  .filter(Boolean);

function Bridge({ children }: { children: ReactNode }) {
  const { instance, accounts, inProgress } = useMsal();
  const account: AccountInfo | undefined = accounts[0];

  const getAccessToken = useCallback(async () => {
    if (!account) return null;
    try {
      const result = await instance.acquireTokenSilent({ account, scopes });
      return result.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        await instance.acquireTokenRedirect({ account, scopes });
      }
      return null;
    }
  }, [instance, account]);

  const value = useMemo<AuthPort>(
    () => ({
      status: account ? "authenticated" : inProgress === "none" ? "unauthenticated" : "loading",
      user: account
        ? {
            id: account.localAccountId,
            name: account.name ?? account.username,
            email: account.username,
          }
        : null,
      signIn: () => instance.loginRedirect({ scopes }),
      signOut: () => instance.logoutRedirect(),
      getAccessToken,
    }),
    [account, inProgress, instance, getAccessToken],
  );

  return <AuthPortProvider value={value}>{children}</AuthPortProvider>;
}

export default function MsalAuthAdapter({ children }: { children: ReactNode }) {
  const client = useMemo(
    () =>
      new PublicClientApplication({
        auth: {
          clientId: env.VITE_MSAL_CLIENT_ID ?? "",
          authority: env.VITE_MSAL_AUTHORITY,
          redirectUri: window.location.origin,
        },
        cache: { cacheLocation: "sessionStorage" },
      }),
    [],
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void client
      .initialize()
      .then(() => client.handleRedirectPromise())
      .then((result) => {
        if (result?.account) client.setActiveAccount(result.account);
        else client.setActiveAccount(client.getAllAccounts()[0] ?? null);
        setReady(true);
      });
  }, [client]);

  if (!ready) return null;
  return (
    <MsalProvider instance={client}>
      <Bridge>{children}</Bridge>
    </MsalProvider>
  );
}
