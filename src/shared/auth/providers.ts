/** Auth adapters this app ships. `vp run init` removes the ones a project does not use. */
export const AUTH_PROVIDERS = [
  "none",
  "msal", // @adapter msal
  "clerk", // @adapter clerk
] as const;

export type AuthProviderName = (typeof AUTH_PROVIDERS)[number];

/** Environment variables that must be set for each provider. */
export const REQUIRED_ENV: Record<AuthProviderName, readonly string[]> = {
  none: [],
  msal: ["VITE_MSAL_CLIENT_ID", "VITE_MSAL_AUTHORITY"], // @adapter msal
  clerk: ["VITE_CLERK_PUBLISHABLE_KEY"], // @adapter clerk
};
