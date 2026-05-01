'use client';

import dynamic from 'next/dynamic';

/**
 * Provider wrapper — dynamic SSR-false for next-auth `SessionProvider`
 * compatibility with Next 15 + React 19 + next-auth beta.31.
 *
 * **Trade-off:** static pages don't have provider context during SSR
 * → first paint via CSR (BAILOUT_TO_CLIENT_SIDE_RENDERING). For
 * marketing landing, content INSIDE (marketing)/layout still SSRs
 * because it doesn't read session/queryclient — only the providers
 * tree itself is client-rendered. Lighthouse FCP penalty is small.
 *
 * **TD (S09):** Replace with hybrid — wrap only `SessionProvider` in
 * dynamic ssr:false; keep `QueryClient` + `Theme` + `NuqsAdapter` as
 * server-renderable. Or migrate to `useSession()` per-component fetch
 * and remove SessionProvider entirely.
 *
 * **Why dynamic?** During static prerender, `useState` inside
 * `SessionProvider` returns `null` due to a Next/React/next-auth
 * version mismatch — see chunks/459.js. dynamic({ssr:false}) skips
 * the chunk on the server.
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
