'use client';

/**
 * `CategoryCard` — Home kategoriyalar rail'ida va filter paneldagi ishlatiladigan
 * kichik karta. Emoji + kategoriya nomi + usta soni ("42 usta").
 *
 * Task: T3.06
 *
 * Behavior:
 *  - `onClick` bilan button sifatida ishlaydi (client navigatsiyasi).
 *  - `href` bilan `next/link` Anchor sifatida (SSR prefetch).
 *  - Ikkalasi ham berilmasa — oddiy dekorativ `div` (informativ variant).
 *  - Keyboard: Tab + Enter/Space (button va anchor uchun native).
 *
 * O'lchamlar:
 *  - Minimal 120×100 — rail'da 3-4 tasi sig'ishi uchun.
 *  - Brand border hover'da — foydalanuvchi interaktivlikni tushunadi.
 *  - Focus ring — klaviatura fokusi uchun.
 */
import Link from 'next/link';

import { cn } from '@/lib/utils';

import type { Category } from '@/lib/masters/schemas';

// ─── Types ───────────────────────────────────────────────────────────────────

type CategoryCardBaseProps = {
  category: Category;
  className?: string;
};

type CategoryCardLinkProps = CategoryCardBaseProps & {
  href: string;
  onClick?: never;
};

type CategoryCardButtonProps = CategoryCardBaseProps & {
  onClick: () => void;
  href?: never;
};

type CategoryCardStaticProps = CategoryCardBaseProps & {
  href?: never;
  onClick?: never;
};

export type CategoryCardProps =
  | CategoryCardLinkProps
  | CategoryCardButtonProps
  | CategoryCardStaticProps;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Uzbek tilida "usta" so'z ko'plikda o'zgarmaydi ("1 usta", "42 usta"),
 * ammo count=0 holatida alohida matn — rail'da bo'sh kategoriyalarni
 * ustalar paydo bo'lguncha yashirmaslik (UX: "tez orada" signali).
 */
function formatMasterCount(count: number): string {
  if (count === 0) return 'Tez orada';
  return `${count} usta`;
}

// ─── Card content ────────────────────────────────────────────────────────────

function CardContent({ category }: { category: Category }) {
  return (
    <>
      <span
        aria-hidden="true"
        className="text-2xl leading-none transition-transform group-hover:scale-110"
      >
        {category.emoji}
      </span>
      <span className="text-foreground line-clamp-2 text-center text-xs font-medium">
        {category.name}
      </span>
      <span
        data-testid="category-master-count"
        className={cn(
          'text-[10px]',
          category.masterCount === 0 ? 'text-muted-foreground italic' : 'text-muted-foreground',
        )}
      >
        {formatMasterCount(category.masterCount)}
      </span>
    </>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Base class'lar — barcha variantlar uchun bir xil.
 *
 * `group` — emoji hover scale effekti uchun.
 * `min-h-[100px] w-[120px]` — PRD talablariga ko'ra 120×100px.
 * `focus-visible:ring-2` — klaviatura fokusi ko'rinadi, sichqoncha clicki
 * shov-shuv qilmaydi (focus-visible, focus emas).
 */
const BASE_CLASSES = cn(
  'group flex min-h-[100px] w-[120px] flex-col items-center justify-center gap-1.5 rounded-2xl border bg-card p-3 shadow-sm transition-all',
  'border-border hover:border-brand-500 hover:shadow-md',
  'focus-visible:ring-brand-500 focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
);

export function CategoryCard(props: CategoryCardProps) {
  const { category, className } = props;
  const ariaLabel = `${category.name} kategoriyasi, ${formatMasterCount(category.masterCount)}`;

  // Link variant (SSR prefetch)
  if ('href' in props && props.href) {
    return (
      <Link
        href={props.href}
        data-slot="category-card"
        data-category-id={category.id}
        aria-label={ariaLabel}
        className={cn(BASE_CLASSES, className)}
      >
        <CardContent category={category} />
      </Link>
    );
  }

  // Button variant (client-side action)
  if ('onClick' in props && props.onClick) {
    return (
      <button
        type="button"
        data-slot="category-card"
        data-category-id={category.id}
        aria-label={ariaLabel}
        onClick={props.onClick}
        className={cn(BASE_CLASSES, 'cursor-pointer', className)}
      >
        <CardContent category={category} />
      </button>
    );
  }

  // Static (informativ — filter panelda radio ichida ishlatilishi mumkin)
  return (
    <div
      data-slot="category-card"
      data-category-id={category.id}
      aria-label={ariaLabel}
      className={cn(BASE_CLASSES, 'cursor-default', className)}
    >
      <CardContent category={category} />
    </div>
  );
}
