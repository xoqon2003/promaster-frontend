/**
 * T3.06 — CategoryCard unit tests.
 *
 * Qamrov:
 *  - renders emoji, nom, usta soni
 *  - button variant — onClick chaqiriladi (Enter + click)
 *  - link variant — href to'g'ri o'rnatiladi
 *  - static variant — onClick/href yo'q bo'lsa div
 *  - empty (0 usta) — "Tez orada" matni
 *  - long name — line-clamp saqlanadi
 *  - aria-label — ekran o'quvchilariga tushunarli
 *  - keyboard — Tab focus + Enter activation
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { Category } from '@/lib/masters/schemas';

import { CategoryCard } from './category-card';

// ─── Test fixtures ───────────────────────────────────────────────────────────

const ELEKTRIK: Category = {
  id: 'elektrik',
  name: 'Elektrik',
  emoji: '⚡',
  masterCount: 42,
};

const EMPTY_CATEGORY: Category = {
  id: 'nikoh',
  name: 'Nikoh fotograflari',
  emoji: '📸',
  masterCount: 0,
};

const LONG_NAME: Category = {
  id: 'long',
  name: 'Juda uzun kategoriya nomi haqiqatan ham ikki qatordan oshib ketadigan',
  emoji: '🧰',
  masterCount: 7,
};

// ─── Rendering ───────────────────────────────────────────────────────────────

describe('CategoryCard — rendering', () => {
  it("emoji, nom va usta sonini ko'rsatadi", () => {
    render(<CategoryCard category={ELEKTRIK} />);

    expect(screen.getByText('⚡')).toBeInTheDocument();
    expect(screen.getByText('Elektrik')).toBeInTheDocument();
    expect(screen.getByText('42 usta')).toBeInTheDocument();
  });

  it("category id data-attribute'ga yoziladi", () => {
    render(<CategoryCard category={ELEKTRIK} />);

    const card = screen.getByLabelText(/Elektrik kategoriyasi/);
    expect(card).toHaveAttribute('data-category-id', 'elektrik');
    expect(card).toHaveAttribute('data-slot', 'category-card');
  });

  it('aria-label — kategoriya nomi + usta soni', () => {
    render(<CategoryCard category={ELEKTRIK} />);

    expect(screen.getByLabelText('Elektrik kategoriyasi, 42 usta')).toBeInTheDocument();
  });

  it('masterCount=0 — "Tez orada" matni', () => {
    render(<CategoryCard category={EMPTY_CATEGORY} />);

    expect(screen.getByTestId('category-master-count')).toHaveTextContent('Tez orada');
    expect(screen.queryByText(/0 usta/)).not.toBeInTheDocument();
  });

  it('uzun kategoriya nomi — line-clamp class mavjud', () => {
    render(<CategoryCard category={LONG_NAME} />);

    const nameEl = screen.getByText(LONG_NAME.name);
    expect(nameEl.className).toContain('line-clamp-2');
  });
});

// ─── Button variant ──────────────────────────────────────────────────────────

describe('CategoryCard — button variant (onClick)', () => {
  it('<button> element render qiladi', () => {
    render(<CategoryCard category={ELEKTRIK} onClick={() => {}} />);

    const card = screen.getByRole('button', { name: /Elektrik/ });
    expect(card.tagName).toBe('BUTTON');
    expect(card).toHaveAttribute('type', 'button');
  });

  it('click — onClick chaqiriladi', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<CategoryCard category={ELEKTRIK} onClick={handleClick} />);

    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('klaviatura Enter — onClick chaqiriladi', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<CategoryCard category={ELEKTRIK} onClick={handleClick} />);

    const button = screen.getByRole('button');
    button.focus();
    expect(button).toHaveFocus();

    await user.keyboard('{Enter}');

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('klaviatura Space — onClick chaqiriladi', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<CategoryCard category={ELEKTRIK} onClick={handleClick} />);

    screen.getByRole('button').focus();
    await user.keyboard(' ');

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("Tab bilan fokusga o'tadi", async () => {
    const user = userEvent.setup();

    render(
      <>
        <button>Oldingi</button>
        <CategoryCard category={ELEKTRIK} onClick={() => {}} />
      </>,
    );

    await user.tab(); // "Oldingi" tugmasiga
    await user.tab(); // CategoryCard'ga

    expect(screen.getByRole('button', { name: /Elektrik/ })).toHaveFocus();
  });
});

// ─── Link variant ────────────────────────────────────────────────────────────

describe('CategoryCard — link variant (href)', () => {
  it('<a> element href bilan render qiladi', () => {
    render(<CategoryCard category={ELEKTRIK} href="/client/search?category=elektrik" />);

    const link = screen.getByRole('link', { name: /Elektrik/ });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/client/search?category=elektrik');
  });
});

// ─── Static variant ──────────────────────────────────────────────────────────

describe('CategoryCard — static variant (no handler)', () => {
  it('<div> element render qiladi', () => {
    render(<CategoryCard category={ELEKTRIK} />);

    const card = screen.getByLabelText(/Elektrik kategoriyasi/);
    expect(card.tagName).toBe('DIV');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
