import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

type RatingSize = 'sm' | 'md' | 'lg';

interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
  showValue?: boolean;
  size?: RatingSize;
  /** interactive=true bo'lsa, onRate chaqiriladi */
  interactive?: boolean;
  onRate?: (value: number) => void;
  className?: string;
}

const sizeClasses: Record<RatingSize, string> = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

const textClasses: Record<RatingSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export function RatingStars({
  rating,
  reviewCount,
  showValue = false,
  size = 'md',
  interactive = false,
  onRate,
  className,
}: RatingStarsProps) {
  const clampedRating = Math.min(5, Math.max(0, rating));
  const reviewLabel = reviewCount !== undefined ? `, ${reviewCount} ta baho` : '';
  const ariaLabel = `5 dan ${clampedRating.toFixed(1)} yulduz${reviewLabel}`;

  return (
    <span
      data-slot="rating-stars"
      role="img"
      aria-label={ariaLabel}
      className={cn('inline-flex items-center gap-1', className)}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < Math.floor(clampedRating);
        const half = !filled && i < clampedRating;
        const value = i + 1;

        return (
          <span
            key={i}
            aria-hidden={interactive ? undefined : 'true'}
            onClick={interactive ? () => onRate?.(value) : undefined}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-label={interactive ? `${value} yulduz` : undefined}
            onKeyDown={
              interactive
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onRate?.(value);
                    }
                  }
                : undefined
            }
            className={cn(interactive && 'cursor-pointer')}
          >
            <Star
              className={cn(
                sizeClasses[size],
                'transition-colors',
                filled
                  ? 'fill-warning text-warning'
                  : half
                    ? 'fill-warning/50 text-warning'
                    : 'fill-muted text-muted-foreground/30',
              )}
            />
          </span>
        );
      })}

      {showValue && (
        <span className={cn('text-foreground font-medium', textClasses[size])}>
          {clampedRating.toFixed(1)}
        </span>
      )}

      {reviewCount !== undefined && (
        <span className={cn('text-muted-foreground', textClasses[size])}>({reviewCount})</span>
      )}
    </span>
  );
}
