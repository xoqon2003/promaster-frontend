'use client';

import { signOut } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useCurrentUser } from '@/lib/hooks/use-current-user';

import { CategoriesRail } from './categories-rail';
import { Hero } from './hero';
import { RecommendedGrid } from './recommended-grid';

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
      <RecommendedGrid />

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <span>{user?.phone}</span>
          <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: '/login' })}>
            Chiqish
          </Button>
        </div>
      </div>
    </main>
  );
}
