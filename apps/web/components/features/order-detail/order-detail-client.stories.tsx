/**
 * OrderDetailClient — Storybook stories (S06 T6.09).
 *
 * 5 holat: Pending, Accepted, EnRoute (with map), InProgress, Completed.
 * Cancelled holat ham qo'shiladi (terminal banner ko'rinishi).
 *
 * `useOrderStream` hook'ni mock qilamiz — Storybook'da haqiqiy SSE
 * connection bo'lmasligi kerak.
 */
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import type { Order, OrderStatus } from '@/lib/db/schema/orders';
import type { OrderStatusHistoryEntry } from '@/lib/db/schema/order-status-history';
import type { TrackingPing } from '@/lib/db/schema/tracking-pings';

import { OrderDetailClient } from './order-detail-client';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const NOW = new Date('2026-05-09T12:00:00Z');
const T_BASE = new Date('2026-05-09T11:00:00Z');

function makeOrder(status: OrderStatus, withPro = true): Order {
  return {
    id: 'b3f0214c-8d5e-4ad7-b2c6-1234567890ab',
    clientId: 'client-1',
    proId: withPro ? 'pro-1' : null,
    status,
    serviceCategory: 'Plumbing',
    priceMinor: 120_000,
    currency: 'UZS',
    addressText: "Toshkent, Yunusobod, Amir Temur ko'chasi 12",
    addressLat: '41.310000',
    addressLng: '69.270000',
    scheduledAt: null,
    createdAt: T_BASE,
    updatedAt: T_BASE,
  };
}

function makeHistory(...statuses: OrderStatus[]): OrderStatusHistoryEntry[] {
  return statuses.map((status, idx) => ({
    id: `h-${status}`,
    orderId: 'b3f0214c-8d5e-4ad7-b2c6-1234567890ab',
    status,
    actorId: 'client-1',
    metadata: {},
    createdAt: new Date(T_BASE.getTime() + idx * 8 * 60 * 1000),
  }));
}

const FRESH_PING: TrackingPing = {
  id: 'ping-1',
  orderId: 'b3f0214c-8d5e-4ad7-b2c6-1234567890ab',
  proId: 'pro-1',
  lat: '41.314000',
  lng: '69.273000',
  accuracy: '15.0',
  recordedAt: new Date('2026-05-09T11:59:30Z'),
};

// ─── Meta ────────────────────────────────────────────────────────────────────

const meta: Meta<typeof OrderDetailClient> = {
  title: 'Features/OrderDetailClient',
  component: OrderDetailClient,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'S06 T6.09 — Order detail page client orchestrator. RSC initial data + SSE incremental updates (Storybook mock).',
      },
    },
    layout: 'fullscreen',
  },
  args: {
    locale: 'uz',
    proName: 'Aziz Karimov',
    proRating: 4.8,
    disableStream: true, // Storybook — SSE connection yo'q
  },
};

export default meta;
type Story = StoryObj<typeof OrderDetailClient>;

// ─── Stories ─────────────────────────────────────────────────────────────────

export const Pending: Story = {
  args: {
    initialOrder: makeOrder('pending', false),
    initialHistory: makeHistory('pending'),
    initialLatestPing: null,
    proName: undefined,
    proRating: undefined,
  },
};

export const Accepted: Story = {
  args: {
    initialOrder: makeOrder('accepted'),
    initialHistory: makeHistory('pending', 'accepted'),
    initialLatestPing: null,
  },
};

export const EnRoute: Story = {
  args: {
    initialOrder: makeOrder('en_route'),
    initialHistory: makeHistory('pending', 'accepted', 'en_route'),
    initialLatestPing: FRESH_PING,
  },
  parameters: {
    docs: {
      description: {
        story: "Usta yo'lda — xarita va tracking faol. Cancel CTA endi yo'q.",
      },
    },
  },
};

export const InProgress: Story = {
  args: {
    initialOrder: makeOrder('in_progress'),
    initialHistory: makeHistory('pending', 'accepted', 'en_route', 'arrived', 'in_progress'),
    initialLatestPing: FRESH_PING,
  },
  parameters: {
    docs: {
      description: {
        story: 'Ish jarayonida — xarita yashiringan (parent qaror), Chat CTA disabled (S07).',
      },
    },
  },
};

export const Completed: Story = {
  args: {
    initialOrder: makeOrder('completed'),
    initialHistory: makeHistory(
      'pending',
      'accepted',
      'en_route',
      'arrived',
      'in_progress',
      'completed',
    ),
    initialLatestPing: FRESH_PING,
  },
};

export const Cancelled: Story = {
  args: {
    initialOrder: makeOrder('cancelled'),
    initialHistory: makeHistory('pending', 'accepted', 'cancelled'),
    initialLatestPing: null,
  },
  parameters: {
    docs: {
      description: {
        story: 'Bekor qilingan — timeline qizil terminator bilan, Chat CTA disabled.',
      },
    },
  },
};
