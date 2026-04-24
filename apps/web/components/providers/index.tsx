'use client';

import dynamic from 'next/dynamic';

/**
 * Barcha client-only provider'lar (SessionProvider, ThemeProvider) lazy yuklanadi.
 * SSG prerender vaqtida ular ishga tushmaydi — bu Next 15 + React 19 +
 * next-auth beta.31 `useState is null` muammosidan himoyalaydi.
 *
 * Runtime'da (hydration'dan keyin) ular normal ishlaydi.
 */
const ClientProviders = dynamic(() => import('./client-providers'), {
  ssr: false,
});

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return <ClientProviders>{children}</ClientProviders>;
}
