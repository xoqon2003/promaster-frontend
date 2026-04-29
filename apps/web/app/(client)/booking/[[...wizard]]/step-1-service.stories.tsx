/**
 * T4.15 — `Step1Service` Storybook stories.
 *
 * Stories:
 *  - Default — bo'sh form, categoryId tanlanmagan
 *  - URLPrefilled — `?categoryId=elektrik` URL'dan kelgan, kategoriya pre-selected
 *
 * Hooks: `useSearchParams` (`?categoryId=...`), `useBookingDraft` (nuqs),
 * `useCategories` (TanStack Query). Ikkala narsa decorator'da ta'minlanadi.
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { withNuqsTestingAdapter } from 'nuqs/adapters/testing';
import { useState } from 'react';
import { fn } from 'storybook/test';

import { Step1Service } from './step-1-service';

// ─── QueryClient factory ─────────────────────────────────────────────────────

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0, gcTime: 0 },
    },
  });
}

// ─── Meta ────────────────────────────────────────────────────────────────────

const meta: Meta<typeof Step1Service> = {
  title: 'Booking/Step1Service',
  component: Step1Service,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Step 1 — Xizmat tafsilotlari (T4.04). Kategoriya (radio grid) + ' +
          'sub-xizmat (select, kategoriya tanlanganida yoqiladi) + ixtiyoriy ' +
          'tavsif (0-500 belgi). Submit `useBookingDraft.setDraft({ service })` ' +
          "chaqiradi va `onComplete()` orqali wizard `goNext`'ga ulashtiriladi.",
      },
    },
  },
  args: {
    onComplete: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof Step1Service>;

// ─── Default ─────────────────────────────────────────────────────────────────

export const Default: Story = {
  decorators: [
    (Story) => {
      const [client] = useState(() => makeQueryClient());
      const Wrapper = withNuqsTestingAdapter({ searchParams: '' });
      return (
        <Wrapper>
          <QueryClientProvider client={client}>
            <Story />
          </QueryClientProvider>
        </Wrapper>
      );
    },
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Bo'sh form. 10 ta kategoriya grid'da (mock-data'dan), sub-xizmat " +
          'select disabled. "Tavsif" textarea bo\'sh, counter 0/500.',
      },
    },
  },
};

// ─── URLPrefilled ────────────────────────────────────────────────────────────

export const URLPrefilled: Story = {
  decorators: [
    (Story) => {
      const [client] = useState(() => makeQueryClient());
      const Wrapper = withNuqsTestingAdapter({ searchParams: '?categoryId=elektrik' });
      return (
        <Wrapper>
          <QueryClientProvider client={client}>
            <Story />
          </QueryClientProvider>
        </Wrapper>
      );
    },
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Search drawer'dan kelgan: URL'da `?categoryId=elektrik`. Kategoriya " +
          'pre-selected (brand rangli ramka), sub-xizmat select endi yoqilgan ' +
          "va elektrik xizmatlari ro'yxati ko'rinadi.",
      },
    },
  },
};
