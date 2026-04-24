import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SearchX, ShoppingBag, Star, WifiOff } from 'lucide-react';
import { Button } from './button';
import { EmptyState } from './empty-state';

const meta: Meta<typeof EmptyState> = {
  title: 'UI/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: "Bo'sh ro'yxat yoki natija topilmaganda ko'rsatiladigan holat komponentasi.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const NoResults: Story = {
  args: {
    icon: SearchX,
    title: 'Hech narsa topilmadi',
    description: "Qidiruv so'zini o'zgartiring yoki filtrlarni tozalang",
    action: <Button variant="outline">Filtrlarni tozalash</Button>,
  },
};

export const NoOrders: Story = {
  args: {
    icon: ShoppingBag,
    title: "Hali buyurtma yo'q",
    description: 'Birinchi buyurtmangizni bering va ustalar sizga javob berishadi',
    action: <Button>Buyurtma berish</Button>,
  },
};

export const NoReviews: Story = {
  args: {
    icon: Star,
    title: "Izohlar yo'q",
    description: "Bu usta hali baho olmagan. Birinchi bo'ling!",
  },
};

export const NoConnection: Story = {
  args: {
    icon: WifiOff,
    title: "Internet aloqasi yo'q",
    description: "Tarmoqni tekshirib qayta urinib ko'ring",
    action: <Button variant="outline">Qayta urinish</Button>,
  },
};

export const Minimal: Story = {
  args: {
    title: 'Hech narsa topilmadi',
  },
};
