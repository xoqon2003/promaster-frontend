/**
 * T3.20 — `SortDropdown` Storybook stories.
 *
 * Stories:
 *  - Default — `?sort` yo'q (default = 'rating')
 *  - PriceSelected — URL'dan `?sort=price` o'qilgan holat
 *  - DistanceWithoutGeo — geolocation 'idle' bo'lgan holat ('Eng yaqin' disabled)
 *
 * Hook'lar: `useSearchFilters` (nuqs) — testing adapter orqali. Brauzerda
 * `useGeolocation` real navigator'ga murojaat qiladi — Chromatic'da default
 * 'idle' holatda ishlaydi.
 */
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { withNuqsTestingAdapter } from 'nuqs/adapters/testing';

import { SortDropdown } from './sort-dropdown';

const meta: Meta<typeof SortDropdown> = {
  title: 'Features/SortDropdown',
  component: SortDropdown,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "Qidiruv natijalarini saralash dropdown'i (T3.14). Variantlar: " +
          "Reyting bo'yicha (default), Narx past, Eng yaqin, Eng yangi. URL " +
          "state (`?sort=...`) nuqs orqali boshqariladi. 'Eng yaqin' " +
          "geolocation 'granted' bo'lmasa disabled holatda.",
      },
    },
  },
  decorators: [
    (Story, ctx) => {
      const searchParams =
        (ctx.parameters as { searchParams?: string } | undefined)?.searchParams ?? '';
      const Wrapper = withNuqsTestingAdapter({ searchParams });
      return (
        <Wrapper>
          <div className="flex justify-end">
            <Story />
          </div>
        </Wrapper>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof SortDropdown>;

// ─── Default ─────────────────────────────────────────────────────────────────

export const Default: Story = {
  parameters: {
    searchParams: '',
    docs: {
      description: {
        story:
          "Standart holat — `?sort` URL'da yo'q (default = 'rating'). " +
          "Trigger 'Reyting bo'yicha' deb ko'rsatadi.",
      },
    },
  },
};

// ─── PriceSelected ───────────────────────────────────────────────────────────

export const PriceSelected: Story = {
  parameters: {
    searchParams: '?sort=price',
    docs: {
      description: {
        story:
          "URL'da `?sort=price` mavjud — trigger 'Narx past' deb ko'rsatadi. " +
          'Foydalanuvchi linkni share qilsa, tartib saqlanadi.',
      },
    },
  },
};

// ─── DistanceWithoutGeo ──────────────────────────────────────────────────────

export const DistanceWithoutGeo: Story = {
  parameters: {
    searchParams: '',
    docs: {
      description: {
        story:
          "Geolocation 'granted' emas — 'Eng yaqin' option disabled holatda " +
          "ko'rinadi va '(joylashuv kerak)' belgisi bilan ajratiladi. " +
          'Trigger ochilganda interaksiya orqali tasdiqlanadi.',
      },
    },
  },
};
