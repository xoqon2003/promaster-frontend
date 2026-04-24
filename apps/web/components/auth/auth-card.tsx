import { cn } from '@/lib/utils';

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export function AuthCard({ title, subtitle, children, className }: AuthCardProps) {
  return (
    <div
      className={cn(
        'bg-card border-border w-full max-w-sm rounded-2xl border p-8 shadow-sm',
        className,
      )}
    >
      {/* Logo */}
      <div className="mb-6 text-center">
        <span className="font-display text-brand-500 text-2xl font-bold">UstaTop.uz</span>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-foreground text-xl font-semibold">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>}
      </div>

      {children}
    </div>
  );
}
