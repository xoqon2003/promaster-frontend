'use client';

import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';

export default function ClientHomePage() {
  const { user, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <main className="bg-background min-h-screen p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Salom, {user?.name ?? 'Mijoz'}! 👋</h1>
            <p className="text-muted-foreground text-sm">{user?.phone}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
          >
            Chiqish
          </Button>
        </div>

        <div className="border-border rounded-2xl border p-8 text-center">
          <p className="text-muted-foreground text-lg">🚧 Bosh sahifa — Sprint 3 da quriladi</p>
          <p className="text-muted-foreground mt-2 text-sm">
            Auth ishlayapti ✅ · Role: {user?.role}
          </p>
        </div>
      </div>
    </main>
  );
}
