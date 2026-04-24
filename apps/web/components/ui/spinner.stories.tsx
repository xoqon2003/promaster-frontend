import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Spinner } from './spinner';

const meta: Meta<typeof Spinner> = {
  title: 'UI/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Yuklanish indikatori. `role="status"` va `aria-label` bilan ekran o\'quvchilar uchun to\'liq accessible.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = {
  args: { size: 'md', variant: 'default' },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <Spinner size="sm" label="Kichik spinner" />
      <Spinner size="md" label="O'rta spinner" />
      <Spinner size="lg" label="Katta spinner" />
      <Spinner size="xl" label="Juda katta spinner" />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-6 rounded-lg p-4">
      <Spinner variant="default" />
      <div className="rounded bg-gray-800 p-2">
        <Spinner variant="white" />
      </div>
      <Spinner variant="muted" />
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Spinner size="md" />
      <span className="text-muted-foreground text-sm">Ma&apos;lumot yuklanmoqda...</span>
    </div>
  ),
};
