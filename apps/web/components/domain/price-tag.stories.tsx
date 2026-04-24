import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PriceTag } from './price-tag';

const meta: Meta<typeof PriceTag> = {
  title: 'Domain/PriceTag',
  component: PriceTag,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Narxni UZ standartida ko\'rsatuvchi komponent. 50000 → "50 000 so\'m"',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof PriceTag>;

export const Default: Story = {
  args: { amount: 50000 },
};

export const WithUnit: Story = {
  args: { amount: 50000, unit: 'soat' },
};

export const WithPrefix: Story = {
  args: { amount: 50000, unit: 'soat', prefix: true },
};

export const LargeAmount: Story = {
  args: { amount: 1250000, unit: 'ish', prefix: true, size: 'lg' },
};

export const Loading: Story = {
  args: { amount: 0, isLoading: true },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <PriceTag amount={50000} unit="soat" size="sm" prefix />
      <PriceTag amount={50000} unit="soat" size="md" prefix />
      <PriceTag amount={50000} unit="soat" size="lg" prefix />
    </div>
  ),
};
