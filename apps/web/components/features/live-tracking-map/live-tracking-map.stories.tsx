/**
 * LiveTrackingMap — Storybook stories (S06 T6.07).
 *
 * 4 holat: Initial (pro yo'q), EnRoute (pro pin mavjud, ping fresh),
 * Arrived (parent xaritani yopgan bo'lsa, lekin demo uchun ko'rsatamiz),
 * LostConnection (>5min stale ping → banner).
 *
 * Storybook-da Yandex SDK haqiqiy yuklanadi (storybook env'da `window`
 * mavjud). API key bo'lmasa "Failed to load" xato chiqishi mumkin —
 * bu kutilgan, banner logic'ini ko'rsatishga to'sqinlik qilmaydi.
 */
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { LiveTrackingMap } from './live-tracking-map';

const CLIENT = { lat: 41.31, lng: 69.27 }; // Tashkent markazi
const PRO_NEAR = { lat: 41.314, lng: 69.273 };
const NOW = new Date('2026-05-09T12:00:00Z');

const meta: Meta<typeof LiveTrackingMap> = {
  title: 'Features/LiveTrackingMap',
  component: LiveTrackingMap,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "S06 T6.07 — Yandex Maps real-time tracking. Mijoz pin'i (qizil) statik, usta pin'i (ko'k) SSE'dan kelgan. 5+ min eski ping bo'lsa qizil banner ko'rinadi.",
      },
    },
    layout: 'padded',
  },
  args: {
    now: NOW,
    locale: 'uz',
  },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-2xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof LiveTrackingMap>;

// ─── Stories ─────────────────────────────────────────────────────────────────

export const Initial: Story = {
  args: {
    client: CLIENT,
    pro: null,
    lastPingAt: null,
  },
  parameters: {
    docs: {
      description: {
        story: "Status pending/accepted — usta hali yo'lda emas. Faqat mijoz pin'i.",
      },
    },
  },
};

export const EnRoute: Story = {
  args: {
    client: CLIENT,
    pro: PRO_NEAR,
    lastPingAt: new Date('2026-05-09T11:59:30Z'), // 30s oldin
  },
  parameters: {
    docs: {
      description: {
        story: 'Usta yo`lda. So`nggi ping 30s oldin — banner yo`q, ikkala pin ham ko`rinadi.',
      },
    },
  },
};

export const LostConnection: Story = {
  args: {
    client: CLIENT,
    pro: PRO_NEAR,
    lastPingAt: new Date('2026-05-09T11:50:00Z'), // 10 min oldin
    onRetry: () => alert('Retry triggered (mock)'),
  },
  parameters: {
    docs: {
      description: {
        story: "10 min ping yo'q — qizil banner ko'rinadi, retry tugma faol.",
      },
    },
  },
};

export const Arrived: Story = {
  args: {
    client: CLIENT,
    pro: { lat: CLIENT.lat + 0.0001, lng: CLIENT.lng + 0.0001 }, // ustal mijozga ~10m
    lastPingAt: new Date('2026-05-09T11:59:50Z'),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Usta yetib keldi — pin'lar deyarli ustma-ust. Production'da parent component bu holatda xaritani yopishi mumkin, demo uchun ko'rsatilmoqda.",
      },
    },
  },
};
