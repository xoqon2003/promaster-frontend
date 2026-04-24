import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Progress } from './progress';

const meta: Meta<typeof Progress> = {
  title: 'UI/Progress',
  component: Progress,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: "Progress bar — jarayon ko'rsatish uchun.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  args: { value: 60 },
};

export const AllValues: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <Progress value={0} aria-label="0%" />
      <Progress value={25} aria-label="25%" />
      <Progress value={50} aria-label="50%" />
      <Progress value={75} aria-label="75%" />
      <Progress value={100} aria-label="100%" />
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="w-80 space-y-2">
      <div className="flex justify-between text-sm">
        <span>Profil to&apos;ldirilishi</span>
        <span className="text-muted-foreground">65%</span>
      </div>
      <Progress value={65} aria-label="65% profil to'ldirilishi" />
    </div>
  ),
};
