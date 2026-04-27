/**
 * T3.20 — `ResultGrid` Storybook stories.
 *
 * Stories:
 *  - Loading — 8 ta MasterCardSkeleton
 *  - Success — N ta MasterCard, "Ko'proq ko'rsatish" tugmasi mavjud
 *  - Empty — "Natija topilmadi" state
 *  - ErrorState — alert + retry tugmasi
 *
 * Pure UI komponent — ma'lumotlar props orqali keladi. Lekin ichida
 * `useQueryState` ('masterId') chaqirilgani uchun nuqs adapter shart.
 */
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { withNuqsTestingAdapter } from 'nuqs/adapters/testing';
import { fn } from 'storybook/test';

import type { Master, SearchResponse } from '@/lib/masters/schemas';

import { ResultGrid } from './result-grid';

// ─── Fixtures ────────────────────────────────────────────────────────────────

function makeMaster(id: string, name: string, overrides: Partial<Master> = {}): Master {
  return {
    id,
    name,
    rating: 4.8,
    reviewCount: 124,
    trustLevel: 'verified',
    categoryId: 'elektrik',
    categoryName: 'Elektrik',
    priceFrom: 50_000,
    currency: 'UZS',
    isOnline: true,
    responseTime: '~15 daqiqa',
    location: { lat: 41.31, lng: 69.28, address: 'Toshkent, Chilonzor' },
    ...overrides,
  };
}

const SAMPLE_MASTERS: Master[] = [
  makeMaster('m1', 'Bobur Toshmatov'),
  makeMaster('m2', 'Sherzod Karimov', {
    rating: 5,
    reviewCount: 312,
    trustLevel: 'premium',
    categoryName: 'Santexnik',
    priceFrom: 80_000,
  }),
  makeMaster('m3', 'Dilnoza Yusupova', {
    rating: 4.6,
    reviewCount: 88,
    trustLevel: 'pro',
    categoryName: 'Tarbiyachi',
    priceFrom: 30_000,
    isOnline: false,
    responseTime: '~1 soat',
  }),
  makeMaster('m4', "Umid To'rayev", {
    rating: 4.9,
    reviewCount: 201,
    categoryName: 'Repetitor',
    priceFrom: 100_000,
  }),
];

function makeResponse(
  masters: Master[],
  overrides: Partial<Omit<SearchResponse, 'masters'>> = {},
): SearchResponse {
  return {
    masters,
    total: masters.length,
    page: 1,
    pageSize: 20,
    hasMore: false,
    ...overrides,
  };
}

// ─── Meta ────────────────────────────────────────────────────────────────────

const meta: Meta<typeof ResultGrid> = {
  title: 'Search/ResultGrid',
  component: ResultGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Qidiruv natijalar grid (T3.15). 4 kolonna desktop (lg) / 2 tablet ' +
          '(sm) / 1 mobile (<360px). Loading, success, empty, error holatlari. ' +
          "MasterCard bosilganda `?masterId=...` URL'ga yoziladi (drawer trigger).",
      },
    },
  },
  args: {
    onRetry: fn(),
    onLoadMore: fn(),
  },
  decorators: [
    (Story) => {
      const Wrapper = withNuqsTestingAdapter({ searchParams: '' });
      return (
        <Wrapper>
          <Story />
        </Wrapper>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof ResultGrid>;

// ─── Loading ─────────────────────────────────────────────────────────────────

export const Loading: Story = {
  args: {
    data: undefined,
    isPending: true,
    isError: false,
  },
  parameters: {
    docs: {
      description: {
        story: "8 ta MasterCardSkeleton ko'rsatiladi (shimmer animatsiyasi bilan).",
      },
    },
  },
};

// ─── Success ─────────────────────────────────────────────────────────────────

export const Success: Story = {
  args: {
    data: makeResponse(SAMPLE_MASTERS, { hasMore: true, total: 47 }),
    isPending: false,
    isError: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "4 ta MasterCard render qilinadi. `hasMore=true` — 'Ko'proq " +
          "ko'rsatish' tugmasi pastda ko'rinadi.",
      },
    },
  },
};

// ─── Empty ───────────────────────────────────────────────────────────────────

export const Empty: Story = {
  args: {
    data: makeResponse([]),
    isPending: false,
    isError: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Filterlar juda qattiq — natija yo'q. 'Filterni o'zgartiring yoki " +
          "qidiruv so'zini tahrirlang' xabari ko'rinadi.",
      },
    },
  },
};

// ─── ErrorState ──────────────────────────────────────────────────────────────

export const ErrorState: Story = {
  args: {
    data: undefined,
    isPending: false,
    isError: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Backend xatolik berdi (5xx yoki tarmoq) — `role=alert` xabar va ' +
          "'Qayta urinib ko'ring' tugmasi → `onRetry` chaqiradi.",
      },
    },
  },
};
