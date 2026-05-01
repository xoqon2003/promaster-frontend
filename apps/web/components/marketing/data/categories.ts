import {
  Wrench,
  Droplets,
  Zap,
  Sparkles,
  Scissors,
  GraduationCap,
  Laptop,
  Truck,
  Car,
  PartyPopper,
  Heart,
  Trees,
  type LucideIcon,
} from 'lucide-react';

export type CategoryKey =
  | 'repair'
  | 'plumbing'
  | 'electric'
  | 'cleaning'
  | 'beauty'
  | 'tutoring'
  | 'it'
  | 'moving'
  | 'auto'
  | 'events'
  | 'health'
  | 'garden';

export interface CategoryDef {
  key: CategoryKey;
  icon: LucideIcon;
  href: string;
  /** Tailwind text-color utility for icon — semantic, not raw hex. */
  tone: string;
  /** Tailwind bg utility for icon backdrop. */
  toneBg: string;
}

export const CATEGORIES: readonly CategoryDef[] = [
  {
    key: 'repair',
    icon: Wrench,
    href: '/search?cat=repair',
    tone: 'text-brand-600',
    toneBg: 'bg-brand-50',
  },
  {
    key: 'plumbing',
    icon: Droplets,
    href: '/search?cat=plumbing',
    tone: 'text-info-fg',
    toneBg: 'bg-info-bg',
  },
  {
    key: 'electric',
    icon: Zap,
    href: '/search?cat=electric',
    tone: 'text-warning-fg',
    toneBg: 'bg-warning-bg',
  },
  {
    key: 'cleaning',
    icon: Sparkles,
    href: '/search?cat=cleaning',
    tone: 'text-success-fg',
    toneBg: 'bg-success-bg',
  },
  {
    key: 'beauty',
    icon: Scissors,
    href: '/search?cat=beauty',
    tone: 'text-trust-premium',
    toneBg: 'bg-trust-premium-bg',
  },
  {
    key: 'tutoring',
    icon: GraduationCap,
    href: '/search?cat=tutoring',
    tone: 'text-brand-600',
    toneBg: 'bg-brand-50',
  },
  { key: 'it', icon: Laptop, href: '/search?cat=it', tone: 'text-info-fg', toneBg: 'bg-info-bg' },
  {
    key: 'moving',
    icon: Truck,
    href: '/search?cat=moving',
    tone: 'text-warning-fg',
    toneBg: 'bg-warning-bg',
  },
  {
    key: 'auto',
    icon: Car,
    href: '/search?cat=auto',
    tone: 'text-danger-fg',
    toneBg: 'bg-danger-bg',
  },
  {
    key: 'events',
    icon: PartyPopper,
    href: '/search?cat=events',
    tone: 'text-trust-premium',
    toneBg: 'bg-trust-premium-bg',
  },
  {
    key: 'health',
    icon: Heart,
    href: '/search?cat=health',
    tone: 'text-danger-fg',
    toneBg: 'bg-danger-bg',
  },
  {
    key: 'garden',
    icon: Trees,
    href: '/search?cat=garden',
    tone: 'text-success-fg',
    toneBg: 'bg-success-bg',
  },
] as const;
