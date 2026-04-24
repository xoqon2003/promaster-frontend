'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { useState } from 'react';
import { ThemeProvider } from './theme-provider';

interface ClientProvidersProps {
  children: React.ReactNode;
}

/**
 * Barcha client-side provider'lar (QueryClient, Session, Theme).
 *
 * Bu komponent `next/dynamic({ ssr: false })` orqali yuklanadi — shuning
 * uchun SSG prerender paytida ishga tushmaydi.
 *
 * Sabab: Next 15 + React 19 + next-auth v5 beta kombinatsiyasida
 * SessionProvider SSG prerender'da `useState` null xatosini beradi.
 *
 * QueryClient default'lari (T3.03):
 *  - staleTime: 5 daqiqa — yana fetch qilmaslik uchun (Home feed stabil)
 *  - refetchOnWindowFocus: false — foydalanuvchi tab almashtirsa fetch shart emas
 *  - retry: 1 — bir marta qaytadan urinadi (500 xatosi vaqtincha bo'lishi mumkin)
 *  - gcTime: 10 daqiqa — cache memory'da saqlanish vaqti
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  // useState bilan — har render'da yangi client yaratilmasin
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider refetchOnWindowFocus={false} refetchInterval={0}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
