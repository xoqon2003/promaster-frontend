import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MasterCard } from './master-card';
import type { MasterData } from './master-card';

const MOCK_MASTER: MasterData = {
  id: '1',
  name: 'Bobur Toshmatov',
  avatarUrl: 'https://i.pravatar.cc/150?img=11',
  rating: 4.8,
  reviewCount: 124,
  trustLevel: 'verified',
  categoryName: 'Santexnik',
  priceFrom: 50000,
  isOnline: true,
  responseTime: '~15 daqiqa',
};

const meta: Meta<typeof MasterCard> = {
  title: 'Domain/MasterCard',
  component: MasterCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Usta kartasi — asosiy domain komponent. Avatar, reyting, trust badge, narx va bog'lanish tugmasini o'z ichiga oladi.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof MasterCard>;

export const Default: Story = {
  args: {
    master: MOCK_MASTER,
    onContactPress: () => alert("Bog'lanish!"),
  },
};

export const Compact: Story = {
  args: {
    master: MOCK_MASTER,
    variant: 'compact',
  },
};

export const Loading: Story = {
  args: {
    master: MOCK_MASTER,
    isLoading: true,
  },
};

export const Premium: Story = {
  args: {
    master: {
      ...MOCK_MASTER,
      trustLevel: 'premium',
      name: 'Sherzod Karimov',
      rating: 5.0,
      reviewCount: 312,
    },
    onContactPress: () => {},
  },
};

export const Offline: Story = {
  args: {
    master: { ...MOCK_MASTER, isOnline: false, responseTime: '~2 soat' },
  },
};

export const Grid: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[
        { ...MOCK_MASTER, id: '1', name: 'Bobur Toshmatov', trustLevel: 'verified' as const },
        {
          ...MOCK_MASTER,
          id: '2',
          name: 'Sherzod Karimov',
          trustLevel: 'pro' as const,
          rating: 4.9,
        },
        {
          ...MOCK_MASTER,
          id: '3',
          name: 'Dilnoza Yusupova',
          trustLevel: 'premium' as const,
          rating: 5.0,
          isOnline: false,
        },
      ].map((master) => (
        <MasterCard key={master.id} master={master} onContactPress={() => {}} />
      ))}
    </div>
  ),
};
