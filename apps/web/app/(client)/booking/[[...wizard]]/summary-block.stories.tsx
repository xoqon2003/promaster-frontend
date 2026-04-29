/**
 * T4.15 — `SummaryBlock` Storybook stories.
 *
 * Stories:
 *  - Filled — to'ldirilgan blok (children render bo'ladi)
 *  - Empty — `isEmpty=true` — qizil ramka + "To'ldirilmagan" matni
 *
 * Pure UI komponent (hook'lar yo'q) — decorator kerakmas.
 */
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Wrench } from 'lucide-react';
import { fn } from 'storybook/test';

import { SummaryBlock } from './summary-block';

const meta: Meta<typeof SummaryBlock> = {
  title: 'Booking/SummaryBlock',
  component: SummaryBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "Step 6 confirmation'da bitta ma'lumot bloki (T4.09). Sarlavha, ikona, " +
          "tarkib (children) va 'Tahrirlash' linki. `isEmpty=true` — qizil ramka " +
          'va "To\'ldirilmagan" matni bilan ko\'rsatiladi.',
      },
    },
  },
  args: {
    onEdit: fn(),
    icon: Wrench,
    step: 1,
    title: 'Xizmat',
  },
};

export default meta;
type Story = StoryObj<typeof SummaryBlock>;

// ─── Filled ──────────────────────────────────────────────────────────────────

export const Filled: Story = {
  args: {
    isEmpty: false,
    children: (
      <>
        <p>Elektrik · Rozetka almashtirish</p>
        <p className="text-muted-foreground/80 mt-1 text-xs italic">
          &ldquo;3 ta rozetka almashtirish kerak&rdquo;
        </p>
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "To'ldirilgan blok. Brand rangida ikona kvadrati, sarlavha va tarkib " +
          "ma'lumoti ko'rinadi. 'Tahrirlash' linki o'ng tomonda.",
      },
    },
  },
};

// ─── Empty ───────────────────────────────────────────────────────────────────

export const Empty: Story = {
  args: {
    isEmpty: true,
    title: "Bog'lanish",
    step: 5,
    children: null,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Majburiy ma'lumot to'ldirilmagan. Ramka va ikona kvadrati `destructive` " +
          "rangda, 'To'ldirilmagan' matni ko'rsatiladi. 'Tahrirlash' linki kerakli " +
          'stepga olib boradi.',
      },
    },
  },
};
