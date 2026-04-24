import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { StatusBadge } from './status-badge';
import type { OrderStatus } from './status-badge';

const meta: Meta<typeof StatusBadge> = {
  title: 'Domain/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Buyurtma holati badge'i. 6 holat: pending, accepted, in_progress, done, cancelled, disputed.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

const ALL_STATUSES: OrderStatus[] = [
  'pending',
  'accepted',
  'in_progress',
  'done',
  'cancelled',
  'disputed',
];

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {ALL_STATUSES.map((status) => (
        <StatusBadge key={status} status={status} />
      ))}
    </div>
  ),
};

export const InProgress: Story = {
  args: { status: 'in_progress' },
};

export const Disputed: Story = {
  args: { status: 'disputed' },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        {ALL_STATUSES.map((s) => (
          <StatusBadge key={s} status={s} size="sm" />
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {ALL_STATUSES.map((s) => (
          <StatusBadge key={s} status={s} size="md" />
        ))}
      </div>
    </div>
  ),
};
