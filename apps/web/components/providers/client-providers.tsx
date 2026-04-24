'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from './theme-provider';

interface ClientProvidersProps {
  children: React.ReactNode;
}

/**
 * Barcha client-side provider'lar (SessionProvider, ThemeProvider).
 * Bu komponent `next/dynamic({ ssr: false })` orqali yuklanadi — shuning
 * uchun SSG prerender paytida ishga tushmaydi.
 *
 * Sabab: Next 15 + React 19 + next-auth v5 beta kombinatsiyasida
 * SessionProvider SSG prerender'da `useState` null xatosini beradi.
 */
export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <SessionProvider refetchOnWindowFocus={false} refetchInterval={0}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
