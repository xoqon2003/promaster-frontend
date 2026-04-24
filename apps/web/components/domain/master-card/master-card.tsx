'use client';

import { Clock, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { PriceTag } from '../price-tag';
import { RatingStars } from '../rating-stars';
import { TrustBadge, type TrustLevel } from '../trust-badge';

export interface MasterData {
  id: string;
  name: string;
  avatarUrl?: string;
  rating: number;
  reviewCount: number;
  trustLevel: TrustLevel;
  categoryName: string;
  priceFrom: number;
  isOnline: boolean;
  responseTime: string;
}

export interface MasterCardProps {
  master: MasterData;
  variant?: 'default' | 'compact' | 'featured';
  onPress?: () => void;
  onContactPress?: (e: React.MouseEvent) => void;
  isLoading?: boolean;
  className?: string;
}

/** Avatar uchun initials: "Ali Vali" → "AV" */
function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');
}

export function MasterCard({
  master,
  variant = 'default',
  onPress,
  onContactPress,
  isLoading = false,
  className,
}: MasterCardProps) {
  if (isLoading) {
    return <MasterCardSkeleton variant={variant} className={className} />;
  }

  const isCompact = variant === 'compact';

  return (
    <article
      data-slot="master-card"
      data-variant={variant}
      aria-label={`${master.name} — ${master.categoryName}`}
      tabIndex={onPress ? 0 : undefined}
      role={onPress ? 'button' : 'article'}
      onClick={onPress}
      onKeyDown={
        onPress
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onPress();
              }
            }
          : undefined
      }
      className={cn(
        'group border-border bg-card rounded-2xl border p-4 shadow-sm transition-shadow',
        onPress &&
          'focus-visible:ring-ring cursor-pointer hover:shadow-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        {!isCompact && (
          <div className="relative shrink-0">
            <Avatar className="h-14 w-14">
              <AvatarImage src={master.avatarUrl} alt={master.name} />
              <AvatarFallback className="bg-brand-100 text-brand-700 text-sm font-semibold">
                {getInitials(master.name)}
              </AvatarFallback>
            </Avatar>
            {master.isOnline && (
              <span
                aria-label="Onlayn"
                className="border-card bg-success absolute right-0 bottom-0 h-3.5 w-3.5 rounded-full border-2"
              />
            )}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p
                data-testid="master-name"
                className="font-display text-foreground truncate text-sm font-semibold"
              >
                {master.name}
              </p>
              <p className="text-muted-foreground truncate text-xs">{master.categoryName}</p>
            </div>
            <TrustBadge level={master.trustLevel} size="sm" />
          </div>

          <div className="mt-1.5 flex items-center gap-2">
            <RatingStars
              rating={master.rating}
              reviewCount={master.reviewCount}
              size="sm"
              showValue
            />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="bg-border my-3 h-px" aria-hidden="true" />

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <PriceTag amount={master.priceFrom} unit="soat" prefix size="sm" />
          <span className="text-muted-foreground flex items-center gap-1 text-xs">
            <Clock aria-hidden="true" className="h-3 w-3" />
            {master.responseTime}
          </span>
        </div>

        {onContactPress && (
          <Button
            size="sm"
            variant="outline"
            aria-label={`${master.name} bilan bog'lanish`}
            onClick={(e) => {
              e.stopPropagation();
              onContactPress(e);
            }}
          >
            <MessageCircle aria-hidden="true" className="mr-1.5 h-3.5 w-3.5" />
            Bog&apos;lanish
          </Button>
        )}
      </div>
    </article>
  );
}

/* ─── Skeleton ──────────────────────────────────────────────── */

interface MasterCardSkeletonProps {
  variant?: MasterCardProps['variant'];
  className?: string;
}

function MasterCardSkeleton({ variant, className }: MasterCardSkeletonProps) {
  const isCompact = variant === 'compact';
  return (
    <div
      aria-busy="true"
      aria-label="Yuklanmoqda"
      data-slot="master-card-skeleton"
      className={cn('border-border bg-card rounded-2xl border p-4', className)}
    >
      <div className="flex items-start gap-3">
        {!isCompact && <Skeleton className="h-14 w-14 shrink-0 rounded-full" />}
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="bg-border my-3 h-px" />
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-7 w-24 rounded-lg" />
      </div>
    </div>
  );
}
