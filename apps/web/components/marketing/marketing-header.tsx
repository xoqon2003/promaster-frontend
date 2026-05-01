'use client';

import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button, buttonVariants } from '@/components/ui/button';
import type { Locale } from '@/lib/i18n/config';
import { cn } from '@/lib/utils';

import { LocaleSwitcher } from './locale-switcher';

interface MarketingHeaderProps {
  locale: Locale;
}

const NAV_LINKS = [
  { id: 'categories', href: '#categories' },
  { id: 'howItWorks', href: '#how-it-works' },
  { id: 'forPros', href: '/signup?role=pro' },
  { id: 'pricing', href: '/pricing' },
] as const;

export function MarketingHeader({ locale }: MarketingHeaderProps) {
  const t = useTranslations('marketing.nav');
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 transition-all duration-200',
        scrolled
          ? 'border-border bg-background/85 border-b backdrop-blur-md'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <a
        href="#main"
        className="bg-brand-500 sr-only z-50 rounded-md px-3 py-1 text-sm text-white focus:not-sr-only focus:absolute focus:top-2 focus:left-2"
      >
        Asosiy mazmunga o&apos;tish
      </a>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Brand */}
        <Link
          href="/"
          className="font-display text-foreground flex items-center gap-1.5 text-lg font-bold"
          aria-label="UstaTop.uz — bosh sahifa"
        >
          <span className="bg-brand-500 inline-flex h-7 w-7 items-center justify-center rounded-md text-white">
            U
          </span>
          <span className="hidden sm:inline">UstaTop</span>
          <span className="text-brand-500 hidden sm:inline">.uz</span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Asosiy navigatsiya" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors"
            >
              {t(link.id)}
            </Link>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-1.5">
          <LocaleSwitcher current={locale} />
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'hidden sm:inline-flex',
            )}
          >
            {t('login')}
          </Link>
          <Link
            href="/signup"
            className={cn(buttonVariants({ size: 'sm' }), 'hidden sm:inline-flex')}
          >
            {t('signup')}
          </Link>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            aria-label={mobileOpen ? 'Menyuni yopish' : 'Menyuni ochish'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            className="lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobil navigatsiya"
          className="border-border bg-background border-t lg:hidden"
        >
          <ul className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-foreground hover:bg-accent block rounded-md px-3 py-2 text-sm font-medium"
                >
                  {t(link.id)}
                </Link>
              </li>
            ))}
            <li className="border-border mt-2 flex gap-2 border-t pt-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'flex-1')}
              >
                {t('login')}
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileOpen(false)}
                className={cn(buttonVariants({ size: 'sm' }), 'flex-1')}
              >
                {t('signup')}
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
