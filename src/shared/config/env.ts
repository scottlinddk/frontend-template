import { z } from "zod";

import { AUTH_PROVIDERS, REQUIRED_ENV } from "@/shared/auth/providers";

const schema = z
  .object({
    VITE_API_BASE_URL: z.string().default("/api"),
    VITE_AUTH_PROVIDER: z.enum(AUTH_PROVIDERS).default("none"),
    VITE_MSAL_CLIENT_ID: z.string().optional(), // @adapter msal
    VITE_MSAL_AUTHORITY: z.string().optional(), // @adapter msal
    VITE_MSAL_SCOPES: z.string().optional(), // @adapter msal
    VITE_CLERK_PUBLISHABLE_KEY: z.string().optional(), // @adapter clerk
    VITE_ENABLE_MSW: z
      .enum(["true", "false"])
      .default("false")
      .transform((value) => value === "true"),
  })
  .superRefine((value, ctx) => {
    const values: Record<string, unknown> = value;
    for (const key of REQUIRED_ENV[value.VITE_AUTH_PROVIDER]) {
      if (!values[key])
        ctx.addIssue({ code: "custom", path: [key], message: `${key} is required` });
    }
  });

export type Env = z.infer<typeof schema>;

/** Parse a raw env record. Throws with a readable message on invalid config. */
export function parseEnv(raw: Record<string, unknown>): Env {
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Invalid environment configuration:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

export const env = parseEnv(import.meta.env);
