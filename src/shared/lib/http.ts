import type { ZodType } from "zod";

import { env } from "@/shared/config/env";
import { getAccessToken } from "@/shared/auth/token";

export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

type RequestOptions<T> = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** Validates the response body at runtime and infers the return type. */
  schema: ZodType<T>;
};

function buildUrl(path: string) {
  return new URL(`${env.VITE_API_BASE_URL}${path}`, window.location.origin);
}

export async function http<T>(path: string, { body, schema, headers, ...init }: RequestOptions<T>) {
  const token = await getAccessToken();
  const requestHeaders = new Headers(headers);
  requestHeaders.set("Accept", "application/json");
  if (body !== undefined) requestHeaders.set("Content-Type", "application/json");
  if (token) requestHeaders.set("Authorization", `Bearer ${token}`);

  const response = await fetch(buildUrl(path), {
    ...init,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    throw new HttpError(response.status, `${response.status} ${response.statusText}`);
  }
  return schema.parse(await response.json());
}
