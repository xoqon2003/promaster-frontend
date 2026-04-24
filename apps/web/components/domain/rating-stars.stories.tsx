import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { RatingStars } from './rating-stars';

const meta: Meta<typeof RatingStars> = {
  title: 'Domain/RatingStars',
  component: RatingStars,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Yulduz reytingi komponenti. Read-only va interactive rejimlarni qo'llab-quvvatlaydi.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof RatingStars>;

export const ReadOnly: Story = {
  args: { rating: 4.8 },
};

export const WithReviewCount: Story = {
  args: { rating: 4.8, reviewCount: 124, showValue: true },
};

export const HalfStar: Story = {
  args: { rating: 3.5, showValue: true },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <RatingStars rating={4.5} size="sm" showValue />
      <RatingStars rating={4.5} size="md" showValue />
      <RatingStars rating={4.5} size="lg" showValue />
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState(3);
    return (
      <div className="flex flex-col gap-2">
        <RatingStars rating={value} interactive onRate={setValue} size="lg" />
        <p className="text-muted-foreground text-sm">Tanlangan: {value} yulduz</p>
      </div>
    );
  },
};
