import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useEffect } from 'react';
import { fn } from 'storybook/test';

import { SearchBar } from './search-bar';

const POPULAR_QUERIES = [
  'Elektrik',
  'Santexnik',
  'Remont ustasi',
  'Dizayner',
  'Repetitor',
  'Tarjimon',
  'Haydovchi',
  'Nikoh fotograf',
];

const meta: Meta<typeof SearchBar> = {
  title: 'Features/SearchBar',
  component: SearchBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "Home Hero va Search sahifa yuqorisida ishlatiladigan autocomplete'li " +
          'qidiruv input. Recent searches (localStorage) + popular suggestions, ' +
          'klaviatura navigatsiyasi (Arrow / Enter / Esc), debounce 300ms.',
      },
    },
  },
  args: {
    onSubmit: fn(),
  },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-2xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SearchBar>;

// ─── Default ─────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    suggestions: POPULAR_QUERIES,
  },
  parameters: {
    docs: {
      description: {
        story: "Standart holat — focus berib, popular suggestion ro'yxati ochiladi.",
      },
    },
  },
};

// ─── WithDefaultValue ────────────────────────────────────────────────────────

export const WithDefaultValue: Story = {
  args: {
    defaultValue: 'elektrik',
    suggestions: POPULAR_QUERIES,
  },
  parameters: {
    docs: {
      description: {
        story: "URL'da `?q=elektrik` bo'lganda — input avval to'ldirilgan, " + "× tugma ko'rinadi.",
      },
    },
  },
};

// ─── WithRecent ──────────────────────────────────────────────────────────────

const RECENT_STORAGE_KEY = 'ustatop:storybook-recent';

function SeedRecent() {
  useEffect(() => {
    window.localStorage.setItem(
      RECENT_STORAGE_KEY,
      JSON.stringify(['Toshkent kondisioner ustasi', 'Mashina yuvish', 'Repetitor matematika']),
    );
    return () => window.localStorage.removeItem(RECENT_STORAGE_KEY);
  }, []);
  return null;
}

export const WithRecent: Story = {
  args: {
    suggestions: POPULAR_QUERIES,
    recentStorageKey: RECENT_STORAGE_KEY,
  },
  render: (args) => (
    <>
      <SeedRecent />
      <SearchBar {...args} />
    </>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "localStorage'da 3 ta oxirgi qidiruv mavjud — focus ochilganda " +
          "yuqorida 'Oxirgi' belgi bilan ko'rsatiladi.",
      },
    },
  },
};

// ─── EmptySuggestions ────────────────────────────────────────────────────────

export const EmptySuggestions: Story = {
  args: {
    suggestions: [],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Suggestion va recent yo'q — dropdown ochilmaydi. Foydalanuvchi to'liq " +
          "matn yozib Enter bossa qidiruv submit bo'ladi.",
      },
    },
  },
};

// ─── HeroPlacement (preview) ─────────────────────────────────────────────────

export const HeroPlacement: Story = {
  args: {
    suggestions: POPULAR_QUERIES,
    placeholder: 'Sizga qanday usta kerak?',
  },
  decorators: [
    (Story) => (
      <div className="from-brand-50 to-card -mx-4 bg-gradient-to-b px-4 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-foreground mb-2 text-3xl font-bold">Salom, Madiyor!</h1>
          <p className="text-muted-foreground mb-6 text-sm">1000+ tekshirilgan usta</p>
          <Story />
        </div>
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'T3.09 Home Hero kontekstida — gradient fon va salomlashish bilan birga.',
      },
    },
  },
};
