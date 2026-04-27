'use client';

/**
 * `ResultDrawer` — Qidiruv sahifasidagi quick profile drawer.
 *
 * Task: T3.17
 *
 * Trigger: MasterCard click → `?masterId=<id>` URL param.
 * Close: Esc, outside click, URL param cleared.
 *
 * Content:
 *  - Avatar + ism + kategoriya + reyting
 *  - 3 ta portfolio placeholder rasm
 *  - 3 ta mock review (usta ma'lumotidan generatsiya)
 *  - "Bog'lanish" tugmasi (tel: link)
 *  - "To'liq profil" → /client/masters/[id] (S07 gacha 404)
 *
 * Desktop: right side Sheet (w-[400px])
 * Mobile: bottom Sheet
 *
 * Focus trap va Esc — @base-ui/react Dialog tomonidan boshqariladi.
 */
import Link from 'next/link';
import { parseAsString, useQueryState } from 'nuqs';
import { MessageCircle, Star, X } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { RatingStars } from '@/components/domain/rating-stars';
import { TrustBadge } from '@/components/domain/trust-badge';
import { PriceTag } from '@/components/domain/price-tag';
import { useMaster } from '@/lib/hooks/use-master';
import type { Master } from '@/lib/masters/schemas';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');
}

/** Mock reviews — usta ma'lumotlaridan generatsiya (S09 da real). */
function getMockReviews(master: Master) {
  return [
    {
      id: 'r1',
      author: 'Aziz T.',
      rating: 5,
      text: `${master.categoryName} bo'yicha ajoyib usta! Tez va sifatli bajaradi.`,
    },
    {
      id: 'r2',
      author: 'Malika H.',
      rating: master.rating >= 4.5 ? 5 : 4,
      text: "Ishni o'z vaqtida tugatdi. Narxi ham qulay. Tavsiya qilaman.",
    },
    {
      id: 'r3',
      author: 'Bobur K.',
      rating: 4,
      text: 'Professional yondashuv, natija yaxshi chiqdi.',
    },
  ];
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function DrawerSkeleton() {
  return (
    <div data-slot="result-drawer-skeleton" className="space-y-4 p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="aspect-square rounded-xl" />
        ))}
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function DrawerContent({ master }: { master: Master }) {
  const reviews = getMockReviews(master);

  return (
    <div
      data-slot="result-drawer-content"
      className="flex flex-col gap-5 overflow-y-auto px-4 py-2 pb-6"
    >
      {/* ── Avatar + info ─────────────────────────────────────────── */}
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16 shrink-0">
          <AvatarImage src={master.avatarUrl} alt={master.name} />
          <AvatarFallback className="bg-brand-100 text-brand-700 font-semibold">
            {getInitials(master.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p data-testid="drawer-master-name" className="text-foreground font-semibold">
                {master.name}
              </p>
              <p className="text-muted-foreground text-sm">{master.categoryName}</p>
            </div>
            <TrustBadge level={master.trustLevel} size="sm" />
          </div>
          <div className="mt-1.5">
            <RatingStars
              rating={master.rating}
              reviewCount={master.reviewCount}
              size="sm"
              showValue
            />
          </div>
          <div className="mt-1">
            <PriceTag amount={master.priceFrom} unit="soat" prefix size="sm" />
          </div>
        </div>
      </div>

      {/* ── Portfolio (3 ta placeholder) ─────────────────────────── */}
      <div>
        <h3 className="text-foreground mb-2 text-sm font-semibold">Portfolio</h3>
        <div data-testid="drawer-portfolio" className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-muted aspect-square rounded-xl"
              aria-label={`Portfolio rasm ${i}`}
            />
          ))}
        </div>
      </div>

      {/* ── Reviews (3 ta mock) ──────────────────────────────────── */}
      <div>
        <h3 className="text-foreground mb-2 text-sm font-semibold">So&apos;nggi izohlar</h3>
        <ul data-testid="drawer-reviews" className="space-y-3">
          {reviews.map((review) => (
            <li key={review.id} className="border-border rounded-xl border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-foreground text-sm font-medium">{review.author}</p>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: review.rating }).map((_, j) => (
                    <Star
                      key={j}
                      aria-hidden="true"
                      className="h-3 w-3 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground mt-1 text-sm">{review.text}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Amallar ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <Button
          data-testid="drawer-contact-btn"
          className="w-full"
          onClick={() => {
            window.location.href = 'tel:+998900000000';
          }}
          aria-label={`${master.name} bilan bog'lanish`}
        >
          <MessageCircle aria-hidden="true" className="mr-2 h-4 w-4" />
          Bog&apos;lanish
        </Button>
        <Link
          data-testid="drawer-full-profile-btn"
          href={`/client/masters/${master.id}`}
          className="border-border text-foreground focus-visible:ring-brand-500 hover:bg-muted inline-flex w-full items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          To&apos;liq profil
        </Link>
      </div>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ResultDrawer() {
  const [masterId, setMasterId] = useQueryState('masterId', parseAsString);

  const { data: master, isPending } = useMaster(masterId ?? undefined);

  const isOpen = Boolean(masterId);

  const handleClose = () => {
    void setMasterId(null);
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <SheetContent
        side="right"
        data-slot="result-drawer"
        data-testid="result-drawer"
        className="w-full p-0 sm:w-[400px]"
      >
        <SheetHeader className="border-border border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base">{master?.name ?? 'Usta profili'}</SheetTitle>
            <SheetDescription className="sr-only">Usta haqida qisqa ma&apos;lumot</SheetDescription>
            <button
              type="button"
              aria-label="Yopish"
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground focus-visible:ring-brand-500 rounded focus-visible:ring-2 focus-visible:outline-none"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        </SheetHeader>

        {isPending ? <DrawerSkeleton /> : master ? <DrawerContent master={master} /> : null}
      </SheetContent>
    </Sheet>
  );
}
