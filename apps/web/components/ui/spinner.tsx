import { cn } from '@/lib/utils';

type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
type SpinnerVariant = 'default' | 'white' | 'muted';

interface SpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  /** Ekran o'quvchilar uchun label */
  label?: string;
  className?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[3px]',
  xl: 'h-12 w-12 border-4',
};

const variantClasses: Record<SpinnerVariant, string> = {
  default: 'border-brand-500/25 border-t-brand-500',
  white: 'border-white/25 border-t-white',
  muted: 'border-muted-foreground/25 border-t-muted-foreground',
};

export function Spinner({
  size = 'md',
  variant = 'default',
  label = 'Yuklanmoqda',
  className,
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      data-slot="spinner"
      className={cn(
        'inline-block animate-spin rounded-full motion-reduce:animate-[spin_1.5s_linear_infinite]',
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
    />
  );
}
