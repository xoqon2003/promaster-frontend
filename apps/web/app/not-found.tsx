import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Force dynamic rendering — `<Providers>` (next-auth SessionProvider)
// can't prerender under Next 15 + React 19 + next-auth beta.31 (useState
// returns null in static export). Dynamic rendering bypasses the issue.
export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <main className="bg-background flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-brand-500 font-display text-6xl font-bold">404</p>
      <h1 className="text-foreground mt-4 text-2xl font-semibold">Sahifa topilmadi</h1>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm">
        Siz qidirayotgan sahifa mavjud emas yoki ko&apos;chirilgan bo&apos;lishi mumkin.
      </p>
      <Link href="/" className={cn(buttonVariants({ variant: 'default', size: 'lg' }), 'mt-6')}>
        Bosh sahifaga qaytish
      </Link>
    </main>
  );
}
