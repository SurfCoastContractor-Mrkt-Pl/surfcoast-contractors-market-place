import { QueryClient } from '@tanstack/react-query';

export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 2 * 60 * 1000,   // 2 min default — data stays fresh, no redundant refetches
      gcTime: 10 * 60 * 1000,      // 10 min — keep in cache longer after unmount
    },
  },
});