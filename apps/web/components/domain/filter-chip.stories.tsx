import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';

import { FilterChip } from './filter-chip';

const meta: Meta<typeof FilterChip> = {
  title: 'Domain/FilterChip',
  component: FilterChip,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Qidiruv va filter paneldagi yagona chip elementi. 3 ta variant: ' +
          "**toggle** (`onToggle`), **dismissible** (× bilan o'chirish), **static** (read-only). " +
          "Count badge `(42)` formatida ham qo'shilishi mumkin.",
      },
    },
  },
  args: {
    onToggle: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof FilterChip>;

// ─── Default (Toggle, inactive) ──────────────────────────────────────────────

export const Default: Story = {
  args: {
    label: 'Online',
    active: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Standart toggle holati — neutral border, hover'da brand-500. " +
          "`onToggle(next)` orqali state'ni yangilaydi.",
      },
    },
  },
};

// ─── Active ──────────────────────────────────────────────────────────────────

export const Active: Story = {
  args: {
    label: 'Online',
    active: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Active holati — brand-500 fon, oq matn. `aria-pressed="true"`.',
      },
    },
  },
};

// ─── WithCount ───────────────────────────────────────────────────────────────

export const WithCount: Story = {
  args: {
    label: 'Elektrik',
    count: 42,
    active: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Count badge — kategoriya yoki filter natijalari sonini ko'rsatish uchun. " +
          "`Elektrik (42)` ko'rinishida.",
      },
    },
  },
};

// ─── Dismissible ─────────────────────────────────────────────────────────────

export const Dismissible: Story = {
  args: {
    label: 'Kategoriya: Elektrik',
    dismissible: true,
    onDismiss: fn(),
    active: true,
    onToggle: undefined,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Filter panel ustida joriy faol filter'larni ko'rsatish uchun. " +
          '× tugmasi bosilsa — `onDismiss` chaqiriladi.',
      },
    },
  },
};

// ─── Disabled ────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  args: {
    label: 'Eng yaqin (geo kerak)',
    disabled: true,
    active: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Disabled — opacity 50% + pointer-events yo'q. " +
          'Geolocation berilmaganda "Eng yaqin" sort kabi.',
      },
    },
  },
};

// ─── Group example (Filter row) ──────────────────────────────────────────────

const RATING_OPTIONS = [
  { value: 3, label: '3+' },
  { value: 4, label: '4+' },
  { value: 4.5, label: '4.5+' },
  { value: 5, label: '5' },
];

function RatingChipsExample() {
  const [selected, setSelected] = useState<number | null>(4);
  return (
    <div className="flex gap-2">
      {RATING_OPTIONS.map((opt) => (
        <FilterChip
          key={opt.value}
          label={opt.label}
          active={selected === opt.value}
          onToggle={(next) => setSelected(next ? opt.value : null)}
        />
      ))}
    </div>
  );
}

export const RatingGroup: Story = {
  render: () => <RatingChipsExample />,
  parameters: {
    docs: {
      description: {
        story:
          'Filter panelda "Reyting minimum" chips qatori — bir vaqtda ' +
          "faqat bittasi tanlanishi mumkin (radio-ga o'xshash).",
      },
    },
  },
};

// ─── Active filters bar (dismissible row) ────────────────────────────────────

function ActiveFiltersExample() {
  const [filters, setFilters] = useState<string[]>([
    'Kategoriya: Elektrik',
    'Reyting 4.5+',
    'Online',
  ]);
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((f) => (
        <FilterChip
          key={f}
          label={f}
          dismissible
          active
          onDismiss={() => setFilters((prev) => prev.filter((x) => x !== f))}
        />
      ))}
      {filters.length === 0 && (
        <span className="text-muted-foreground text-sm">Filterlar tozalandi</span>
      )}
    </div>
  );
}

export const ActiveFiltersBar: Story = {
  render: () => <ActiveFiltersExample />,
  parameters: {
    docs: {
      description: {
        story:
          'Search sahifa yuqorisida joriy faol filterlar qatori — ' +
          "har birini × bosib alohida o'chirish mumkin.",
      },
    },
  },
};
