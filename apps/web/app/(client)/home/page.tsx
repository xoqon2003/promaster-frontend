'use client';

import { signOut } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useCurrentUser } from '@/lib/hooks/use-current-user';

import { CategoriesRail } from './categories-rail';
import { Hero } from './hero';

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
    <main className="bg-background min-h-screen">
      <Hero />
      <CategoriesRail />

      <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <span>{user?.phone}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
          >
            Chiqish
          </Button>
        </div>

        <div className="border-border rounded-2xl border p-8 text-center">
          <p className="text-muted-foreground text-lg">🚧 Tavsiyalar — T3.11</p>
          <p className="text-muted-foreground mt-2 text-sm">Role: {user?.role}</p>
        </div>
      </div>
    </main>
  );
}
