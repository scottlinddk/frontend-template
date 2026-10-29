import type { ZodType } from "zod";

import { getAccessToken } from "@/shared/auth/token";
import { env } from "@/shared/config/env";

/** Thrown for every non-2xx response, from both the generated client and `http()`. */
export class HttpError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
  }
}

/** Builds an HttpError from a failed response, reading `{ error, code }` when present. */
export async function toHttpError(response: Response) {
  let message = `${response.status} ${response.statusText}`.trim();
  let code: string | undefined;
  try {
    const body: unknown = await response.clone().json();
    if (body && typeof body === "object") {
      if ("error" in body && typeof body.error === "string") message = body.error;
      if ("code" in body && typeof body.code === "string") code = body.code;
    }
  } catch {
    // Body is empty or not JSON: keep the status line.
  }
  return new HttpError(response.status, message, code);
}

/** Absolute API base URL. Absolute so requests also work under jsdom and Node. */
export function apiBaseUrl() {
  return new URL(env.VITE_API_BASE_URL, window.location.origin).toString().replace(/\/$/, "");
}

type RequestOptions<T> = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** Validates the response body at runtime and infers the return type. */
  schema: ZodType<T>;
};

/**
 * Hand-written request helper with runtime response validation. Prefer the
 * generated client in `@/shared/api` when the backend publishes an OpenAPI
 * document. Use this for endpoints that have no spec.
 */
export async function http<T>(path: string, { body, schema, headers, ...init }: RequestOptions<T>) {
  const token = await getAccessToken();
  const requestHeaders = new Headers(headers);
  requestHeaders.set("Accept", "application/json");
  if (body !== undefined) requestHeaders.set("Content-Type", "application/json");
  if (token) requestHeaders.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${apiBaseUrl()}${path}`, {
    ...init,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) throw await toHttpError(response);
  if (response.status === 204) return schema.parse(undefined);
  return schema.parse(await response.json());
}
