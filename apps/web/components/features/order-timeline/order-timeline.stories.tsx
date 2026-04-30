/**
 * OrderTimeline — Storybook stories (S06 T6.06).
 *
 * 7 holat: 6 status (pending..completed) + cancelled. Mobile + desktop
 * viewport variants har story uchun avtomatik (Storybook viewport addon).
 */
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import type { OrderStatusHistoryEntry } from '@/lib/db/schema/order-status-history';
import type { OrderStatus } from '@/lib/db/schema/orders';

import { OrderTimeline } from './order-timeline';

const NOW = new Date('2026-05-09T12:30:00Z');

function makeHistory(...statuses: OrderStatus[]): OrderStatusHistoryEntry[] {
  // Birinchi entry 1 soat oldin, har keyingisi 8 daqiqa farqi bilan
  const start = new Date('2026-05-09T11:30:00Z');
  return statuses.map((status, idx) => ({
    id: `h-${status}`,
    orderId: 'order-1',
    status,
    actorId: 'user-1',
    metadata: {},
    createdAt: new Date(start.getTime() + idx * 8 * 60 * 1000),
  }));
}

const meta: Meta<typeof OrderTimeline> = {
  title: 'Features/OrderTimeline',
  component: OrderTimeline,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "S06 T6.06 — Order lifecycle timeline. 6 ta bosqich (pending → completed) vertikal ro'yxatda. `cancelled` qizil terminator banner bilan.",
      },
    },
  },
  args: {
    now: NOW,
    locale: 'uz',
  },
  decorators: [
    (Story) => (
      <div className="bg-background mx-auto max-w-md p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof OrderTimeline>;

// ─── Stories ─────────────────────────────────────────────────────────────────

export const Pending: Story = {
  args: {
    currentStatus: 'pending',
    history: makeHistory('pending'),
  },
};

export const Accepted: Story = {
  args: {
    currentStatus: 'accepted',
    history: makeHistory('pending', 'accepted'),
  },
};

export const EnRoute: Story = {
  args: {
    currentStatus: 'en_route',
    history: makeHistory('pending', 'accepted', 'en_route'),
  },
};

export const Arrived: Story = {
  args: {
    currentStatus: 'arrived',
    history: makeHistory('pending', 'accepted', 'en_route', 'arrived'),
  },
};

export const InProgress: Story = {
  args: {
    currentStatus: 'in_progress',
    history: makeHistory('pending', 'accepted', 'en_route', 'arrived', 'in_progress'),
  },
};

export const Completed: Story = {
  args: {
    currentStatus: 'completed',
    history: makeHistory('pending', 'accepted', 'en_route', 'arrived', 'in_progress', 'completed'),
  },
};

export const Cancelled: Story = {
  args: {
    currentStatus: 'cancelled',
    history: makeHistory('pending', 'accepted', 'cancelled'),
  },
  parameters: {
    docs: {
      description: {
        story: "Bekor qilingan order — barcha step'lar disabled, qizil banner pastda.",
      },
    },
  },
};

export const RussianLocale: Story = {
  args: {
    currentStatus: 'arrived',
    history: makeHistory('pending', 'accepted', 'en_route', 'arrived'),
    locale: 'ru',
  },
};

export const EnglishLocale: Story = {
  args: {
    currentStatus: 'arrived',
    history: makeHistory('pending', 'accepted', 'en_route', 'arrived'),
    locale: 'en',
  },
};
