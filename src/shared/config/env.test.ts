import { describe, expect, it } from "vite-plus/test";

import { parseEnv } from "./env";

describe("parseEnv", () => {
  it("applies defaults", () => {
    const env = parseEnv({});
    expect(env.VITE_AUTH_PROVIDER).toBe("none");
    expect(env.VITE_API_BASE_URL).toBe("/api");
    expect(env.VITE_ENABLE_MSW).toBe(false);
  });

  it("rejects an unknown auth provider", () => {
    expect(() => parseEnv({ VITE_AUTH_PROVIDER: "nope" })).toThrow(/VITE_AUTH_PROVIDER/);
  });

  // @adapter-start msal
  it("requires MSAL settings when msal is selected", () => {
    expect(() => parseEnv({ VITE_AUTH_PROVIDER: "msal" })).toThrow(/VITE_MSAL_CLIENT_ID/);
  });
  // @adapter-end msal

  // @adapter-start clerk
  it("requires a Clerk key when clerk is selected", () => {
    expect(() => parseEnv({ VITE_AUTH_PROVIDER: "clerk" })).toThrow(/VITE_CLERK_PUBLISHABLE_KEY/);
  });
  // @adapter-end clerk
});
