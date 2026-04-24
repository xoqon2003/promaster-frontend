/**
 * Test utility — QueryClientProvider wrapper for `renderHook`.
 *
 * Har test o'z alohida QueryClient instance'ini oladi — testlar o'rtasida
 * cache leak bo'lmaydi.
 *
 * @example
 *   const { result } = renderHook(() => useMasters({}), {
 *     wrapper: createQueryClientWrapper(),
 *   });
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

/**
 * Har test uchun yangi QueryClient — retry, staleTime test-friendly.
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // testda retry kutish yomon — darhol xato qaytsin
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * `renderHook({ wrapper })` uchun factory — QueryClientProvider o'rab beradi.
 */
export function createQueryClientWrapper() {
  const client = createTestQueryClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}
