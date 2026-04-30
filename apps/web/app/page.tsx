import type { Metadata } from 'next';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

/**
 * Marketing landing — `/`
 *
 * Task: FX-0 / S07.
 *
 * Bu skeleton — S07'da to'liq landing'ga (Hero + Categories rail + Top masters
 * + Trust + How it works + Footer) kengaytiriladi. Hozir minimum: brand,
 * value prop, 2 ta CTA (Mijoz / Usta).
 *
 * Eski design-system demo `/_dev/design-system` ga ko'chirilgan.
 */

export const metadata: Metadata = {
  title: 'UstaTop.uz — Professional ustalar marketplace',
  description: '30 soniyada ustani toping. Escrow himoyasi. 1000+ tekshirilgan usta.',
  alternates: { canonical: '/' },
};

const HIGHLIGHTS = [
  {
    title: '30 soniyada usta',
    description: 'AI sizga eng mos professionalni tavsiya qiladi.',
    icon: '⚡',
  },
  {
    title: 'Escrow himoyasi',
    description: "To'lov ish tugagandan keyin ustaga o'tadi — risksiz.",
    icon: '🛡️',
  },
  {
    title: 'Tekshirilgan portfolio',
    description: 'Har usta — reyting, sertifikat, real ish namunalari.',
    icon: '✓',
  },
];

export default function MarketingHome() {
  return (
    <main className="bg-background min-h-screen">
      {/* Header */}
      <header className="border-border bg-background/80 sticky top-0 z-10 flex items-center justify-between border-b px-6 py-3 backdrop-blur-sm">
        <Link href="/" className="font-display text-brand-500 text-lg font-bold">
          UstaTop.uz
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground hidden sm:inline"
          >
            Kirish
          </Link>
          <Button asChild size="sm">
            <Link href="/signup">Boshlash</Link>
          </Button>
        </nav>
      </header>

      {/* Hero */}
      <section
        aria-labelledby="hero-heading"
        className="from-brand-50 to-background bg-gradient-to-b px-6 py-20 sm:py-28"
      >
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <span className="bg-brand-100 text-brand-700 rounded-full px-3 py-1 text-xs font-medium">
            🇺🇿 O&apos;zbekiston #1 ustalar marketplace
          </span>
          <h1
            id="hero-heading"
            className="text-foreground font-display text-3xl font-bold sm:text-5xl"
          >
            Professional ustani 30 soniyada toping
          </h1>
          <p className="text-muted-foreground max-w-xl text-base sm:text-lg">
            1000+ tekshirilgan usta. Escrow himoyasi. Real-time tracking. Hech qachon
            noto&apos;g&apos;ri tanlovga pul to&apos;lamang.
          </p>
          <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/signup">Mijoz sifatida boshlash</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/signup?role=pro">Usta sifatida ro&apos;yxatdan o&apos;tish</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section aria-labelledby="highlights-heading" className="mx-auto max-w-5xl px-6 py-16">
        <h2 id="highlights-heading" className="sr-only">
          Asosiy afzalliklar
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {HIGHLIGHTS.map((h) => (
            <div key={h.title} className="border-border bg-card rounded-2xl border p-6 text-center">
              <div className="text-3xl" aria-hidden="true">
                {h.icon}
              </div>
              <h3 className="text-foreground font-display mt-3 text-lg font-semibold">{h.title}</h3>
              <p className="text-muted-foreground mt-1 text-sm">{h.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-border border-t px-6 py-8">
        <div className="text-muted-foreground mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 text-xs sm:flex-row">
          <span>© 2026 UstaTop.uz — Barcha huquqlar himoyalangan</span>
          <span>
            <Link href="/_dev/design-system" className="hover:text-foreground">
              Design System
            </Link>
          </span>
        </div>
      </footer>
    </main>
  );
}
