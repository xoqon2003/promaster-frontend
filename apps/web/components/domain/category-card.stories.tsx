import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { CategoryCard } from './category-card';

const meta: Meta<typeof CategoryCard> = {
  title: 'Domain/CategoryCard',
  component: CategoryCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Bosh sahifa kategoriyalar rail'i va filter panelda ishlatiladigan kichik karta (120×100). " +
          '`onClick` bilan button, `href` bilan Link, hech qaysisiz — dekorativ div.',
      },
    },
  },
  args: {
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof CategoryCard>;

// ─── Default ─────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    category: {
      id: 'elektrik',
      name: 'Elektrik',
      emoji: '⚡',
      masterCount: 42,
    },
  },
};

// ─── Empty (0 usta) ──────────────────────────────────────────────────────────

export const Empty: Story = {
  args: {
    category: {
      id: 'nikoh',
      name: 'Nikoh fotograflari',
      emoji: '📸',
      masterCount: 0,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "0 usta — `Tez orada` matni bilan ko'rsatiladi. Kategoriyani yashirmaymiz: " +
          "foydalanuvchilarga platformaning kengligini ko'rsatish muhim.",
      },
    },
  },
};

// ─── Hovered (force hover for visual testing) ────────────────────────────────

export const Hovered: Story = {
  args: {
    category: {
      id: 'santexnik',
      name: 'Santexnik',
      emoji: '🚿',
      masterCount: 28,
    },
  },
  parameters: {
    pseudo: { hover: true },
    docs: {
      description: {
        story: 'Hover holati — brand border + shadow + emoji scale animatsiyasi.',
      },
    },
  },
};

// ─── Long name (line-clamp) ──────────────────────────────────────────────────

export const LongName: Story = {
  args: {
    category: {
      id: 'tarjimon',
      name: "Rus/Ingliz/O'zbek tarjimoni va sinxron tarjimon",
      emoji: '🌐',
      masterCount: 13,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Uzun nom — 2 qatorga clampiladi, layout buzilmaydi.',
      },
    },
  },
};

// ─── Link variant ────────────────────────────────────────────────────────────

export const AsLink: Story = {
  args: {
    category: {
      id: 'dizayn',
      name: 'Dizayner',
      emoji: '🎨',
      masterCount: 19,
    },
    href: '/client/search?category=dizayn',
    onClick: undefined,
  },
  parameters: {
    docs: {
      description: {
        story: '`href` berilgan — `next/link` Anchor (SSR prefetch).',
      },
    },
  },
};

// ─── Rail (gallery) ──────────────────────────────────────────────────────────

export const RailExample: Story = {
  render: () => (
    <div className="flex gap-3 overflow-x-auto p-4">
      <CategoryCard
        category={{ id: 'elektrik', name: 'Elektrik', emoji: '⚡', masterCount: 42 }}
        onClick={() => {}}
      />
      <CategoryCard
        category={{ id: 'santexnik', name: 'Santexnik', emoji: '🚿', masterCount: 28 }}
        onClick={() => {}}
      />
      <CategoryCard
        category={{ id: 'remont', name: 'Remont', emoji: '🔨', masterCount: 56 }}
        onClick={() => {}}
      />
      <CategoryCard
        category={{ id: 'dizayn', name: 'Dizayner', emoji: '🎨', masterCount: 19 }}
        onClick={() => {}}
      />
      <CategoryCard
        category={{ id: 'tarbiyachi', name: 'Tarbiyachi', emoji: '🧸', masterCount: 8 }}
        onClick={() => {}}
      />
      <CategoryCard
        category={{ id: 'repetitor', name: 'Repetitor', emoji: '📚', masterCount: 34 }}
        onClick={() => {}}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Home sahifa kategoriyalar rail'i — horizontal scroll bilan.",
      },
    },
  },
};
