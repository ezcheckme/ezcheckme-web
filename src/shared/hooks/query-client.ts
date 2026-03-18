/**
 * TanStack Query client configuration.
 * Shared query client with sensible defaults for the entire app.
 */

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /** Data is considered fresh for 5 minutes */
      staleTime: 5 * 60 * 1000,
      /** Garbage-collect inactive queries after 30 minutes */
      gcTime: 30 * 60 * 1000,
      /** Retry failed queries up to 2 times */
      retry: 2,
      /** Don't refetch on window focus by default */
      refetchOnWindowFocus: false,
    },
    mutations: {
      /** Retry mutations once on failure */
      retry: 1,
    },
  },
});
