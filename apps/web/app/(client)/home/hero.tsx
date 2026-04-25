'use client';

/**
 * `Hero` — Home sahifa yuqori bloki.
 *
 * Task: T3.09
 *
 * Tarkib:
 *  - Salomlashish: "Salom, [Ism]!" (`useCurrentUser`). Ism yo'q bo'lsa "Salom!".
 *  - Markaziy SearchBar (max-w-2xl)
 *  - Trust subtitle: "1000+ tekshirilgan usta"
 *
 * Behavior:
 *  - Submit → `router.push('/search?q=<query>')` (T3.12 search sahifasiga)
 *  - SearchBar o'zining recent searches va popular suggestion'larni boshqaradi
 *
 * Mobile (320px):
 *  - Vertikal stack, padding kichikroq, sarlavha kichikroq font
 */
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { SearchBar } from '@/components/features/search-bar';
import { useCurrentUser } from '@/lib/hooks/use-current-user';

// ─── Constants ───────────────────────────────────────────────────────────────

/**
 * Statik popular suggestion'lar — S05'da CMS yoki analytics asosida real
 * "trending" ro'yxat bilan almashtiriladi.
 */
const POPULAR_QUERIES = [
  'Elektrik',
  'Santexnik',
  'Remont ustasi',
  'Dizayner',
  'Repetitor',
  'Tarjimon',
  'Haydovchi',
  'Nikoh fotograf',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildGreeting(name: string | undefined): string {
  if (!name) return 'Salom!';
  const firstName = name.trim().split(/\s+/)[0] ?? name;
  return `Salom, ${firstName}!`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Hero() {
  const router = useRouter();
  const { user } = useCurrentUser();

  const handleSubmit = useCallback(
    (query: string) => {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    },
    [router],
  );

  return (
    <section
      data-slot="home-hero"
      aria-label="Bosh sahifa qidiruv bloki"
      className="from-brand-50 to-background bg-gradient-to-b px-4 py-10 sm:py-16"
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
        <h1 className="text-foreground font-display text-2xl font-bold sm:text-4xl">
          {buildGreeting(user?.name)}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Sizga qanday usta kerak? 1000+ tekshirilgan usta xizmatingizda.
        </p>
        <div className="mt-4 w-full">
          <SearchBar
            onSubmit={handleSubmit}
            suggestions={POPULAR_QUERIES}
            placeholder="Sizga qanday usta kerak?"
          />
        </div>
      </div>
    </section>
  );
}
