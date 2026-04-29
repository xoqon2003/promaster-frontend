/**
 * T4.15 — `Step4Price` Storybook stories.
 *
 * Stories:
 *  - Loading — `useMaster` skeleton holat
 *  - WithRange — m_1 yuklangan, narx oralig'i ko'rinadi
 *
 * Hooks: `useBookingDraft` (nuqs), `useMaster` (TanStack Query). Loading
 * holat hech qachon resolve bo'lmaydigan QueryClient bilan "muzlatiladi".
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { withNuqsTestingAdapter } from 'nuqs/adapters/testing';
import { useState } from 'react';

import { Step4Price } from './step-4-price';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeQueryClient(opts: { isLoading?: boolean } = {}) {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: opts.isLoading ? Infinity : 0,
        gcTime: 0,
      },
    },
  });
}

function buildDraftSearch(masterId: string, categoryId = 'elektrik'): string {
  const draft = {
    masterId,
    service: { categoryId, subServiceId: 'rozetka-almashtirish', description: '' },
  };
  return `?draft=${encodeURIComponent(JSON.stringify(draft))}`;
}

// ─── Meta ────────────────────────────────────────────────────────────────────

const meta: Meta<typeof Step4Price> = {
  title: 'Booking/Step4Price',
  component: Step4Price,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    nextjs: {
      // `Step4Price` `useRouter().push('/search')` — App Router context kerak
      appDirectory: true,
    },
    docs: {
      description: {
        component:
          "Step 4 — Narx oralig'i (read-only, T4.07). Tanlangan usta " +
          '(`useMaster(draft.masterId)`) asosida `calculatePriceRange` orqali ' +
          "from-to oralig'i va kategoriya bo'yicha estimated soat hisoblanadi. " +
          "Form yo'q — pastki 'Davom etish' to'g'ridan `goNext()` chaqiradi.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Step4Price>;

// ─── Loading ─────────────────────────────────────────────────────────────────

export const Loading: Story = {
  decorators: [
    (Story) => {
      const [client] = useState(() => {
        const c = makeQueryClient({ isLoading: true });
        // Query'ni hech qachon resolve qilmaslik — skeleton "muzlatamiz"
        c.setQueryDefaults(['masters', 'detail'], {
          queryFn: () => new Promise(() => {}),
        });
        return c;
      });
      const Wrapper = withNuqsTestingAdapter({ searchParams: buildDraftSearch('m_1') });
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
          "`useMaster` `isPending: true` — Loader2 spinner va 'Yuklanmoqda…' matni " +
          "ko'rsatiladi. Foydalanuvchi shu vaqtda boshqa amal qila olmaydi.",
      },
    },
  },
};

// ─── WithRange ───────────────────────────────────────────────────────────────

export const WithRange: Story = {
  decorators: [
    (Story) => {
      const [client] = useState(() => makeQueryClient());
      const Wrapper = withNuqsTestingAdapter({ searchParams: buildDraftSearch('m_1') });
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
          "Mock api-client'dan `m_1` yuklandi. Usta nomi, kategoriya, narx " +
          "oralig'i (brand-50 fonda katta yozuv), estimated soat va disclaimer " +
          "ko'rinadi. 'Bekor qilish va qidiruvga qaytish' linki pastda.",
      },
    },
  },
};
