import { Award, BadgeCheck, Circle, Crown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TrustLevel = 'basic' | 'verified' | 'pro' | 'premium';

type BadgeSize = 'sm' | 'md' | 'lg';

interface TrustBadgeProps {
  level: TrustLevel;
  showLabel?: boolean;
  size?: BadgeSize;
  className?: string;
}

interface TrustConfig {
  icon: LucideIcon;
  label: string;
  colorClass: string;
  bgClass: string;
}

const TRUST_CONFIG: Record<TrustLevel, TrustConfig> = {
  basic: {
    icon: Circle,
    label: 'Asosiy',
    colorClass: 'text-trust-basic',
    bgClass: 'bg-trust-basic-bg',
  },
  verified: {
    icon: BadgeCheck,
    label: 'Tekshirilgan',
    colorClass: 'text-trust-verified',
    bgClass: 'bg-trust-verified-bg',
  },
  pro: {
    icon: Award,
    label: 'Professional',
    colorClass: 'text-trust-pro',
    bgClass: 'bg-trust-pro-bg',
  },
  premium: {
    icon: Crown,
    label: 'Premium',
    colorClass: 'text-trust-premium',
    bgClass: 'bg-trust-premium-bg',
  },
};

const sizeClasses: Record<BadgeSize, { icon: string; text: string; padding: string }> = {
  sm: { icon: 'h-3 w-3', text: 'text-xs', padding: 'px-1.5 py-0.5 gap-1' },
  md: { icon: 'h-3.5 w-3.5', text: 'text-xs', padding: 'px-2 py-1 gap-1.5' },
  lg: { icon: 'h-4 w-4', text: 'text-sm', padding: 'px-2.5 py-1 gap-1.5' },
};

export function TrustBadge({ level, showLabel = true, size = 'md', className }: TrustBadgeProps) {
  const config = TRUST_CONFIG[level];
  const sizes = sizeClasses[size];
  const Icon = config.icon;

  return (
    <span
      data-slot="trust-badge"
      data-level={level}
      aria-label={`${config.label} usta`}
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        config.bgClass,
        config.colorClass,
        sizes.padding,
        className,
      )}
    >
      <Icon aria-hidden="true" className={cn('shrink-0', sizes.icon)} />
      {showLabel && <span className={sizes.text}>{config.label}</span>}
    </span>
  );
}
