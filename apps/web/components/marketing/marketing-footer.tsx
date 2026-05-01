import { Camera, MapPin, MessageCircle, PlayCircle, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

import type { Locale } from '@/lib/i18n/config';

import { LocaleSwitcher } from './locale-switcher';

interface MarketingFooterProps {
  locale: Locale;
}

const COLUMNS = [
  {
    key: 'product',
    links: [
      { id: 'categories', href: '#categories' },
      { id: 'topMasters', href: '#top-masters' },
      { id: 'howItWorks', href: '#how-it-works' },
      { id: 'pricing', href: '/pricing' },
      { id: 'mobile', href: '#mobile-app' },
    ],
  },
  {
    key: 'company',
    links: [
      { id: 'about', href: '/about' },
      { id: 'careers', href: '/careers' },
      { id: 'press', href: '/press' },
      { id: 'blog', href: '/blog' },
      { id: 'contact', href: '/contact' },
    ],
  },
  {
    key: 'legal',
    links: [
      { id: 'terms', href: '/terms' },
      { id: 'privacy', href: '/privacy' },
      { id: 'cookies', href: '/cookies' },
      { id: 'escrow', href: '/escrow' },
      { id: 'disputes', href: '/disputes' },
    ],
  },
  {
    key: 'support',
    links: [
      { id: 'helpCenter', href: '/help' },
      { id: 'forPros', href: '/for-pros' },
      { id: 'becomeProCta', href: '/signup?role=pro' },
      { id: 'telegram', href: 'https://t.me/ustatop_bot' },
      { id: 'status', href: 'https://status.ustatop.uz' },
    ],
  },
] as const;

const SOCIAL = [
  { id: 'telegram', href: 'https://t.me/ustatop', label: 'Telegram', icon: Send },
  { id: 'instagram', href: 'https://instagram.com/ustatop', label: 'Instagram', icon: Camera },
  { id: 'twitter', href: 'https://twitter.com/ustatop', label: 'X (Twitter)', icon: MessageCircle },
  { id: 'youtube', href: 'https://youtube.com/@ustatop', label: 'YouTube', icon: PlayCircle },
] as const;

export function MarketingFooter({ locale }: MarketingFooterProps) {
  const t = useTranslations('marketing.footer');
  const tCommon = useTranslations('common');
  const year = new Date().getFullYear();

  return (
    <footer className="border-border bg-card text-foreground border-t">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
        {/* Top: Brand + columns */}
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Brand block */}
          <div className="lg:col-span-4">
            <Link
              href="/"
              className="font-display text-foreground inline-flex items-center gap-1.5 text-xl font-bold"
              aria-label="UstaTop.uz"
            >
              <span className="bg-brand-500 inline-flex h-8 w-8 items-center justify-center rounded-md text-white">
                U
              </span>
              <span>UstaTop</span>
              <span className="text-brand-500">.uz</span>
            </Link>
            <p className="text-muted-foreground mt-4 max-w-sm text-sm leading-relaxed">
              {t('tagline')}
            </p>
            <p className="text-muted-foreground mt-4 inline-flex items-center gap-1.5 text-xs">
              <MapPin className="size-3.5" aria-hidden="true" />
              {t('address')}
            </p>

            {/* Social */}
            <ul className="mt-6 flex items-center gap-2">
              {SOCIAL.map((s) => {
                const Icon = s.icon;
                return (
                  <li key={s.id}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="border-border text-muted-foreground hover:text-foreground hover:border-brand-500 inline-flex size-9 items-center justify-center rounded-md border transition-colors"
                    >
                      <Icon className="size-4" aria-hidden="true" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
            {COLUMNS.map((col) => (
              <nav key={col.key} aria-labelledby={`footer-${col.key}`}>
                <h2
                  id={`footer-${col.key}`}
                  className="text-foreground text-sm font-semibold tracking-wide uppercase"
                >
                  {t(`columns.${col.key}.title`)}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.id}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                      >
                        {t(`columns.${col.key}.${link.id}`)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="border-border mt-12 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-xs">{t('copyright', { year })}</p>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-xs">{t('madeIn')}</span>
            <span aria-hidden="true" className="text-base">
              🇺🇿
            </span>
            <div className="bg-border h-4 w-px" aria-hidden="true" />
            <span className="text-muted-foreground text-xs">{t('language')}:</span>
            <LocaleSwitcher current={locale} compact />
          </div>
        </div>

        {/* Hidden a11y label */}
        <span className="sr-only">{tCommon('brand')}</span>
      </div>
    </footer>
  );
}
