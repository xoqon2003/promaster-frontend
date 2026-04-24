import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ThemeToggle } from './theme-toggle';

const meta: Meta<typeof ThemeToggle> = {
  title: 'UI/ThemeToggle',
  component: ThemeToggle,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Dark/Light/System mavzuni almashtirish tugmasi. `next-themes` `useTheme()` hook'idan foydalanadi.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ThemeToggle>;

export const Icon: Story = {
  args: { variant: 'icon' },
};

export const Dropdown: Story = {
  args: { variant: 'dropdown' },
};
