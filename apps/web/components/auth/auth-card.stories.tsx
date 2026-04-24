import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AuthCard } from './auth-card';

const meta: Meta<typeof AuthCard> = {
  title: 'Auth/AuthCard',
  component: AuthCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Auth sahifalarining asosiy wrapper'i. Logo + sarlavha + children. Har auth sahifada (login, OTP, signup) bir xil brand identity saqlanishi uchun ishlatiladi.",
      },
    },
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof AuthCard>;

export const Default: Story = {
  args: {
    title: 'Kirish',
    subtitle: 'Hisobingizga kirish uchun telefon raqamni kiriting',
    children: <div className="text-muted-foreground text-center text-sm">[Form joylashadi]</div>,
  },
};

export const TitleOnly: Story = {
  args: {
    title: 'Hisob yarating',
    children: <div className="text-muted-foreground text-center text-sm">[Form joylashadi]</div>,
  },
};

export const LongSubtitle: Story = {
  args: {
    title: 'Tasdiqlash kodi',
    subtitle: '+998 90 *****67 raqamiga SMS kod yuborildi. 2 daqiqa ichida tasdiqlang',
    children: (
      <div className="text-muted-foreground text-center text-sm">[OTP input joylashadi]</div>
    ),
  },
};
