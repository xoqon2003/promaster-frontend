import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

type PriceUnit = 'soat' | 'kun' | 'ish' | 'm²';
type PriceSize = 'sm' | 'md' | 'lg';

interface PriceTagProps {
  amount: number;
  unit?: PriceUnit;
  /** "dan" prefixi ko'rsatish: "50 000 so'm/soat dan" */
  prefix?: boolean;
  size?: PriceSize;
  isLoading?: boolean;
  className?: string;
}

const sizeClasses: Record<PriceSize, { amount: string; unit: string }> = {
  sm: { amount: 'text-sm font-semibold', unit: 'text-xs' },
  md: { amount: 'text-base font-semibold', unit: 'text-sm' },
  lg: { amount: 'text-xl font-bold', unit: 'text-base' },
};

/** 50000 → "50 000" (UZ standart — bo'sh joy bilan ajratilgan) */
function formatAmount(amount: number): string {
  return amount.toLocaleString('uz-UZ').replace(/,/g, ' ');
}

export function PriceTag({
  amount,
  unit,
  prefix = false,
  size = 'md',
  isLoading = false,
  className,
}: PriceTagProps) {
  const classes = sizeClasses[size];

  if (isLoading) {
    return <Skeleton className={cn('h-5 w-24 rounded', className)} />;
  }

  return (
    <span
      data-slot="price-tag"
      aria-label={`${prefix ? 'Dan ' : ''}${formatAmount(amount)} so'm${unit ? ` ${unit} uchun` : ''}`}
      className={cn('inline-flex items-baseline gap-1', className)}
    >
      {prefix && <span className={cn('text-muted-foreground', classes.unit)}>dan</span>}
      <span className={cn('text-foreground', classes.amount)}>{formatAmount(amount)}</span>
      <span className={cn('text-muted-foreground', classes.unit)}>
        so&apos;m{unit && `/${unit}`}
      </span>
    </span>
  );
}
