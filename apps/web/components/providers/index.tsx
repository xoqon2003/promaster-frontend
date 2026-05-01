import ClientProviders from './client-providers';

/**
 * Server-render-friendly provider wrapper.
 *
 * `ClientProviders` is a `'use client'` boundary — children still SSR
 * normally, only the providers hydrate on the client. The earlier
 * `dynamic({ ssr: false })` workaround killed all SSR
 * (`BAILOUT_TO_CLIENT_SIDE_RENDERING` on the live URL).
 */
interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return <ClientProviders>{children}</ClientProviders>;
}
