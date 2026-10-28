import { z } from "zod";

const schema = z
  .object({
    VITE_API_BASE_URL: z.string().default("/api"),
    VITE_AUTH_PROVIDER: z.enum(["none", "msal", "clerk"]).default("none"),
    VITE_MSAL_CLIENT_ID: z.string().optional(),
    VITE_MSAL_AUTHORITY: z.string().optional(),
    VITE_MSAL_SCOPES: z.string().optional(),
    VITE_CLERK_PUBLISHABLE_KEY: z.string().optional(),
    VITE_ENABLE_MSW: z
      .enum(["true", "false"])
      .default("false")
      .transform((value) => value === "true"),
  })
  .superRefine((value, ctx) => {
    const require = (key: keyof typeof value, when: boolean) => {
      if (when && !value[key]) {
        ctx.addIssue({ code: "custom", path: [key], message: `${key} is required` });
      }
    };
    const msal = value.VITE_AUTH_PROVIDER === "msal";
    require("VITE_MSAL_CLIENT_ID", msal);
    require("VITE_MSAL_AUTHORITY", msal);
    require("VITE_CLERK_PUBLISHABLE_KEY", value.VITE_AUTH_PROVIDER === "clerk");
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
