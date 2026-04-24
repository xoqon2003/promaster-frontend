import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TrustBadge } from './trust-badge';

const meta: Meta<typeof TrustBadge> = {
  title: 'Domain/TrustBadge',
  component: TrustBadge,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Usta ishonch darajasini ko'rsatuvchi badge. 4 daraja: basic → verified → pro → premium.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TrustBadge>;

export const AllLevels: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <TrustBadge level="basic" />
      <TrustBadge level="verified" />
      <TrustBadge level="pro" />
      <TrustBadge level="premium" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <TrustBadge level="verified" size="sm" />
        <TrustBadge level="verified" size="md" />
        <TrustBadge level="verified" size="lg" />
      </div>
    </div>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <TrustBadge level="basic" showLabel={false} />
      <TrustBadge level="verified" showLabel={false} />
      <TrustBadge level="pro" showLabel={false} />
      <TrustBadge level="premium" showLabel={false} />
    </div>
  ),
};

export const Verified: Story = {
  args: { level: 'verified' },
};

export const Premium: Story = {
  args: { level: 'premium' },
};
