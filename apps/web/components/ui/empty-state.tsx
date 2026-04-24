import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      role="status"
      aria-label={title}
      className={cn('flex flex-col items-center justify-center gap-4 py-12 text-center', className)}
    >
      {Icon && (
        <div
          aria-hidden="true"
          className="bg-muted text-muted-foreground flex h-16 w-16 items-center justify-center rounded-2xl"
        >
          <Icon className="h-8 w-8" strokeWidth={1.5} />
        </div>
      )}

      <div className="space-y-1.5">
        <p className="font-display text-foreground text-base font-semibold">{title}</p>
        {description && (
          <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">{description}</p>
        )}
      </div>

      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
