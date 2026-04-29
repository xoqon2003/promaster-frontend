/**
 * T4.15 — `Step6Confirm` Storybook stories.
 *
 * Stories:
 *  - EmptyDraft — bo'sh draft, ko'p SummaryBlock `isEmpty`, submit disabled
 *  - CompleteDraft — to'liq draft, hammasi yashil, "Buyurtma yaratish" yoqilgan
 *
 * Hooks: `useBookingDraft`, `useCurrentUser` (SessionProvider), `useMaster`
 * (TanStack Query). Decorator har uchalasini ta'minlaydi.
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SessionProvider } from 'next-auth/react';
import { withNuqsTestingAdapter } from 'nuqs/adapters/testing';
import { useState } from 'react';
import { fn } from 'storybook/test';
import type { Session } from 'next-auth';

import { Step6Confirm } from './step-6-confirm';

// ─── Mock session ────────────────────────────────────────────────────────────

const NEXT_YEAR_ISO = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

const MOCK_SESSION: Session = {
  user: {
    id: 'mock_998901234567',
    name: 'Bobur Toshmatov',
    email: 'mock@ustatop.uz',
    phone: '+998901234567',
    role: 'client',
  } as Session['user'],
  expires: NEXT_YEAR_ISO,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 0, gcTime: 0 } },
  });
}

function tomorrowAtNoon(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

function buildCompleteDraft(): string {
  const draft = {
    masterId: 'm_1',
    service: {
      categoryId: 'elektrik',
      subServiceId: 'rozetka-almashtirish',
      description: '3 ta rozetka almashtirish kerak',
    },
    addressSlot: {
      location: { lat: 41.31, lng: 69.28, address: 'Toshkent, Chilonzor 12-uy' },
      slotAt: tomorrowAtNoon(),
    },
    photos: [],
    contact: {
      fullName: 'Bobur Toshmatov',
      phone: '+998901234567',
    },
  };
  return `?draft=${encodeURIComponent(JSON.stringify(draft))}`;
}

// ─── Meta ────────────────────────────────────────────────────────────────────

const meta: Meta<typeof Step6Confirm> = {
  title: 'Booking/Step6Confirm',
  component: Step6Confirm,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    nextjs: {
      // `Step6Confirm` submit muvaffaqiyatda `useRouter().push('/orders/<id>')`
      // chaqiradi — App Router context kerak
      appDirectory: true,
    },
    docs: {
      description: {
        component:
          'Step 6 — Tasdiqlash + Yuborish (T4.09). 5 ta SummaryBlock ' +
          "(xizmat, vaqt, foto, narx, kontakt) + 'Buyurtma yaratish' CTA. " +
          'Submit `bookingApi.create()` chaqirib `/orders/<id>` ga redirect ' +
          "qiladi yoki classifySubmitError orqali xato UI ko'rsatadi (T4.11).",
      },
    },
  },
  args: {
    onEditStep: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof Step6Confirm>;

// ─── EmptyDraft ──────────────────────────────────────────────────────────────

export const EmptyDraft: Story = {
  decorators: [
    (Story) => {
      const [client] = useState(() => makeQueryClient());
      const Wrapper = withNuqsTestingAdapter({ searchParams: '' });
      return (
        <SessionProvider session={null} refetchOnWindowFocus={false} refetchInterval={0}>
          <Wrapper>
            <QueryClientProvider client={client}>
              <Story />
            </QueryClientProvider>
          </Wrapper>
        </SessionProvider>
      );
    },
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Bo'sh draft — xizmat, manzil, narx va kontakt bloklari `isEmpty` " +
          "(qizil ramka, 'To'ldirilmagan'). Foto bloki har doim 'Foto " +
          "biriktirilmagan'. Submit tugma disabled, pastida 'Avval barcha " +
          "majburiy bo'limlarni to'ldiring' xabari.",
      },
    },
  },
};

// ─── CompleteDraft ───────────────────────────────────────────────────────────

export const CompleteDraft: Story = {
  decorators: [
    (Story) => {
      const [client] = useState(() => makeQueryClient());
      const Wrapper = withNuqsTestingAdapter({ searchParams: buildCompleteDraft() });
      return (
        <SessionProvider session={MOCK_SESSION} refetchOnWindowFocus={false} refetchInterval={0}>
          <Wrapper>
            <QueryClientProvider client={client}>
              <Story />
            </QueryClientProvider>
          </Wrapper>
        </SessionProvider>
      );
    },
  ],
  parameters: {
    docs: {
      description: {
        story:
          "To'liq draft + login user. Hamma SummaryBlock to'ldirilgan: xizmat " +
          '(Elektrik · Rozetka), vaqt (ertaga 12:00), narx (calculatePriceRange ' +
          'natijasi), kontakt. Submit tugma yoqilgan, brand-500 fonda, bosilsa ' +
          '`bookingApi.create()` chaqiriladi.',
      },
    },
  },
};
