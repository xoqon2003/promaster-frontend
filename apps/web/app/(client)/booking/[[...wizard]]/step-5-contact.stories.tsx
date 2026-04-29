/**
 * T4.15 — `Step5Contact` Storybook stories.
 *
 * Stories:
 *  - GuestAuthGate — login qilinmagan, AuthGate paneli ko'rinadi
 *  - AuthenticatedUser — login user, profile'dan ism/telefon prefill
 *  - DraftOverride — login user lekin `draft.contact` URL'dan kelgan,
 *    formani draft qiymatlari qoplaydi (R04 restore senariy)
 *
 * Hooks: `useCurrentUser` → `useSession` (SessionProvider mock orqali),
 * `useBookingDraft` (nuqs), `useSearchParams` (next/navigation, nuqs).
 */
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SessionProvider } from 'next-auth/react';
import { withNuqsTestingAdapter } from 'nuqs/adapters/testing';
import { fn } from 'storybook/test';
import type { Session } from 'next-auth';

import { Step5Contact } from './step-5-contact';

// ─── Mock sessions ───────────────────────────────────────────────────────────

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

function buildContactDraft(): string {
  const draft = {
    masterId: 'm_1',
    contact: {
      fullName: "Aziz O'razbekov",
      phone: '+998935554433',
      alternativePhone: '+998901112233',
    },
  };
  return `?draft=${encodeURIComponent(JSON.stringify(draft))}`;
}

// ─── Meta ────────────────────────────────────────────────────────────────────

const meta: Meta<typeof Step5Contact> = {
  title: 'Booking/Step5Contact',
  component: Step5Contact,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "Step 5 — Bog'lanish ma'lumotlari + auth gate (T4.08). Login " +
          "qilinmagan foydalanuvchi 'AuthGate' paneli ko'radi va `?callbackUrl=` " +
          "bilan login'ga o'tadi (R04 mitigation). Login user uchun ism/telefon " +
          "profile'dan prefilled, `draft.contact` mavjud bo'lsa o'sha qoplaydi.",
      },
    },
  },
  args: {
    onComplete: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof Step5Contact>;

// ─── GuestAuthGate ───────────────────────────────────────────────────────────

export const GuestAuthGate: Story = {
  decorators: [
    (Story) => {
      const Wrapper = withNuqsTestingAdapter({ searchParams: '' });
      return (
        <SessionProvider session={null} refetchOnWindowFocus={false} refetchInterval={0}>
          <Wrapper>
            <Story />
          </Wrapper>
        </SessionProvider>
      );
    },
  ],
  parameters: {
    docs: {
      description: {
        story:
          'Mehmon foydalanuvchi (`session=null`). Brand-50 fonli LogIn ikonasi, ' +
          "'Tizimga kiring' sarlavhasi va 'Login sahifasiga' linki ko'rinadi. " +
          "Link `?callbackUrl=` orqali joriy URL'ga qaytarib olib keladi.",
      },
    },
  },
};

// ─── AuthenticatedUser ───────────────────────────────────────────────────────

export const AuthenticatedUser: Story = {
  decorators: [
    (Story) => {
      const Wrapper = withNuqsTestingAdapter({ searchParams: '' });
      return (
        <SessionProvider session={MOCK_SESSION} refetchOnWindowFocus={false} refetchInterval={0}>
          <Wrapper>
            <Story />
          </Wrapper>
        </SessionProvider>
      );
    },
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Login user — ism va telefon profile'dan prefilled (`session.user.name`, " +
          "`.phone`). Form asosiy + qo'shimcha telefon maydonlari hamda yashirin " +
          "submit tugma orqali wizard 'Davom etish' bilan bog'lanadi.",
      },
    },
  },
};

// ─── DraftOverride ───────────────────────────────────────────────────────────

export const DraftOverride: Story = {
  decorators: [
    (Story) => {
      const Wrapper = withNuqsTestingAdapter({ searchParams: buildContactDraft() });
      return (
        <SessionProvider session={MOCK_SESSION} refetchOnWindowFocus={false} refetchInterval={0}>
          <Wrapper>
            <Story />
          </Wrapper>
        </SessionProvider>
      );
    },
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Login user, lekin `?draft=...` URL'da `contact` mavjud (R04 restore: " +
          "mehmon login'dan oldin form to'ldirgan, qaytib kelganda saqlangan " +
          "ma'lumot tiklanadi). Form profile emas, draft qiymatlari bilan ko'rinadi.",
      },
    },
  },
};
