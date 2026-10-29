import createFetchClient, { type Middleware } from "openapi-fetch";
import createClient from "openapi-react-query";

import { getAccessToken } from "@/shared/auth/token";
import { apiBaseUrl, toHttpError } from "@/shared/lib/http";

import type { components, paths } from "./schema";

/** Adds the bearer token and turns non-2xx responses into `HttpError`. */
const middleware: Middleware = {
  async onRequest({ request }) {
    const token = await getAccessToken();
    if (token) request.headers.set("Authorization", `Bearer ${token}`);
    return request;
  },
  async onResponse({ response }) {
    if (!response.ok) throw await toHttpError(response);
    return response;
  },
};

export const fetchClient = createFetchClient<paths>({
  baseUrl: apiBaseUrl(),
  // Resolve fetch per request. openapi-fetch otherwise captures it when the
  // client is created, which bypasses MSW (and any later fetch polyfill).
  fetch: (request) => globalThis.fetch(request),
});
fetchClient.use(middleware);

/** Typed TanStack Query hooks for every operation in the OpenAPI document. */
export const $api = createClient(fetchClient);

export type Schemas = components["schemas"];
