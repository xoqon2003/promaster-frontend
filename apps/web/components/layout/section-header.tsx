import { cn } from '@/lib/utils';

type HeadingLevel = 'h1' | 'h2' | 'h3';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  as?: HeadingLevel;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  action,
  as: Tag = 'h2',
  className,
}: SectionHeaderProps) {
  return (
    <div
      data-slot="section-header"
      className={cn('flex items-start justify-between gap-4', className)}
    >
      <div className="space-y-0.5">
        <Tag className="font-display text-foreground text-xl leading-tight font-bold">{title}</Tag>
        {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
