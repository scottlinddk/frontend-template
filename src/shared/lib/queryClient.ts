import { QueryClient } from "@tanstack/react-query";

import { HttpError } from "./http";

/** Shared singleton so route loaders and sign-out can reach the same cache. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      // Client errors will not fix themselves, so only retry network and 5xx failures.
      retry: (failureCount, error) => {
        if (error instanceof HttpError && error.status >= 400 && error.status < 500) return false;
        return failureCount < 2;
      },
    },
    mutations: { retry: 0 },
  },
});
