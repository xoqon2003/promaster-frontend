'use client';

import { MasterCard } from '@/components/domain/master-card/master-card';
import { RatingStars } from '@/components/domain/rating-stars';
import { StatusBadge } from '@/components/domain/status-badge';
import { TrustBadge } from '@/components/domain/trust-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { SectionHeader } from '@/components/layout/section-header';
import { SearchX } from 'lucide-react';
import type { MasterData } from '@/components/domain/master-card/master-card';
import type { OrderStatus } from '@/components/domain/status-badge';

const DEMO_MASTERS: MasterData[] = [
  {
    id: '1',
    name: 'Bobur Toshmatov',
    rating: 4.8,
    reviewCount: 124,
    trustLevel: 'verified',
    categoryName: 'Santexnik',
    priceFrom: 50000,
    isOnline: true,
    responseTime: '~15 daqiqa',
  },
  {
    id: '2',
    name: 'Sherzod Karimov',
    rating: 4.9,
    reviewCount: 312,
    trustLevel: 'pro',
    categoryName: 'Elektrik',
    priceFrom: 80000,
    isOnline: true,
    responseTime: '~5 daqiqa',
  },
  {
    id: '3',
    name: 'Dilnoza Yusupova',
    rating: 5.0,
    reviewCount: 89,
    trustLevel: 'premium',
    categoryName: 'Dizayner',
    priceFrom: 150000,
    isOnline: false,
    responseTime: '~2 soat',
  },
];

const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'accepted',
  'in_progress',
  'done',
  'cancelled',
  'disputed',
];

export default function Page() {
  return (
    <main className="bg-background min-h-screen">
      {/* Header */}
      <header className="border-border bg-background/80 sticky top-0 z-10 flex items-center justify-between border-b px-6 py-3 backdrop-blur-sm">
        <span className="font-display text-brand-500 text-lg font-bold">UstaTop.uz</span>
        <ThemeToggle variant="dropdown" />
      </header>

      <div className="mx-auto max-w-4xl space-y-12 px-6 py-10">
        {/* Trust badges */}
        <section aria-labelledby="trust-heading">
          <SectionHeader title="Ishonch darajalari" subtitle="Trust tier tokenlar" as="h2" />
          <div className="mt-4 flex flex-wrap gap-3">
            <TrustBadge level="basic" size="lg" />
            <TrustBadge level="verified" size="lg" />
            <TrustBadge level="pro" size="lg" />
            <TrustBadge level="premium" size="lg" />
          </div>
        </section>

        <Separator />

        {/* Rating stars */}
        <section aria-labelledby="rating-heading">
          <SectionHeader title="Reyting yulduzlari" as="h2" />
          <div className="mt-4 flex flex-col gap-3">
            <RatingStars rating={5.0} reviewCount={312} showValue size="lg" />
            <RatingStars rating={4.8} reviewCount={124} showValue size="md" />
            <RatingStars rating={3.5} reviewCount={18} showValue size="sm" />
          </div>
        </section>

        <Separator />

        {/* Order statuses */}
        <section aria-labelledby="status-heading">
          <SectionHeader title="Buyurtma holatlari" as="h2" />
          <div className="mt-4 flex flex-wrap gap-3">
            {ORDER_STATUSES.map((s) => (
              <StatusBadge key={s} status={s} />
            ))}
          </div>
        </section>

        <Separator />

        {/* Spinner */}
        <section aria-labelledby="spinner-heading">
          <SectionHeader title="Yuklanish indikatorlari" as="h2" />
          <div className="mt-4 flex items-center gap-6">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
            <Spinner size="xl" />
          </div>
        </section>

        <Separator />

        {/* Master cards */}
        <section aria-labelledby="masters-heading">
          <SectionHeader
            title="Mashhur ustalar"
            subtitle="Toshkent bo'yicha top ustalar"
            as="h2"
            action={
              <span className="text-brand-500 text-sm font-medium">Barchasini ko&apos;rish →</span>
            }
          />
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DEMO_MASTERS.map((master) => (
              <MasterCard key={master.id} master={master} onContactPress={() => {}} />
            ))}
          </div>
        </section>

        <Separator />

        {/* Loading skeletons */}
        <section aria-labelledby="skeleton-heading">
          <SectionHeader title="Skeleton holati" as="h2" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <MasterCard master={DEMO_MASTERS[0]!} isLoading />
            <MasterCard master={DEMO_MASTERS[0]!} isLoading />
          </div>
        </section>

        <Separator />

        {/* Empty state */}
        <section aria-labelledby="empty-heading">
          <SectionHeader title="Bo'sh holat" as="h2" />
          <div className="border-border mt-4 rounded-2xl border">
            <EmptyState
              icon={SearchX}
              title="Hech narsa topilmadi"
              description="Qidiruv so'zini o'zgartiring yoki filtrlarni tozalang"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
