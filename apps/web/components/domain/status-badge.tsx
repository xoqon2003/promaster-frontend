import { cn } from '@/lib/utils';

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'in_progress'
  | 'done'
  | 'cancelled'
  | 'disputed';

type BadgeSize = 'sm' | 'md';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: BadgeSize;
  className?: string;
}

interface StatusConfig {
  label: string;
  dotClass: string;
  textClass: string;
  bgClass: string;
  pulse: boolean;
}

const STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  pending: {
    label: 'Kutilmoqda',
    dotClass: 'bg-warning',
    textClass: 'text-warning-fg',
    bgClass: 'bg-warning-bg',
    pulse: false,
  },
  accepted: {
    label: 'Qabul qilindi',
    dotClass: 'bg-info',
    textClass: 'text-info-fg',
    bgClass: 'bg-info-bg',
    pulse: false,
  },
  in_progress: {
    label: 'Jarayonda',
    dotClass: 'bg-brand-500',
    textClass: 'text-brand-700',
    bgClass: 'bg-brand-50',
    pulse: true,
  },
  done: {
    label: 'Bajarildi',
    dotClass: 'bg-success',
    textClass: 'text-success-fg',
    bgClass: 'bg-success-bg',
    pulse: false,
  },
  cancelled: {
    label: 'Bekor qilindi',
    dotClass: 'bg-muted-foreground',
    textClass: 'text-muted-foreground',
    bgClass: 'bg-muted',
    pulse: false,
  },
  disputed: {
    label: 'Nizo',
    dotClass: 'bg-danger',
    textClass: 'text-danger-fg',
    bgClass: 'bg-danger-bg',
    pulse: true,
  },
};

const sizeClasses: Record<BadgeSize, { text: string; dot: string; padding: string }> = {
  sm: { text: 'text-xs', dot: 'h-1.5 w-1.5', padding: 'px-2 py-0.5 gap-1.5' },
  md: { text: 'text-xs', dot: 'h-2 w-2', padding: 'px-2.5 py-1 gap-2' },
};

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const sizes = sizeClasses[size];

  return (
    <span
      data-slot="status-badge"
      data-status={status}
      aria-label={config.label}
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        config.bgClass,
        config.textClass,
        sizes.padding,
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'shrink-0 rounded-full',
          config.dotClass,
          sizes.dot,
          config.pulse && 'animate-pulse',
        )}
      />
      <span className={sizes.text}>{config.label}</span>
    </span>
  );
}
