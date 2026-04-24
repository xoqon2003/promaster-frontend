import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { children: 'Buyurtma berish' } };
export const Secondary: Story = { args: { variant: 'secondary', children: 'Keyin' } };
export const Destructive: Story = { args: { variant: 'destructive', children: 'Bekor qilish' } };
export const Outline: Story = { args: { variant: 'outline', children: 'Ko\'proq' } };
