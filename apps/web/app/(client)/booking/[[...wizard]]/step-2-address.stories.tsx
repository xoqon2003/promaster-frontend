/**
 * T4.15 — `Step2Address` Storybook stories.
 *
 * Stories:
 *  - Empty — bo'sh holat, manzil tanlanmagan, slot tanlanmagan
 *  - WithAddressAndSlot — `?draft=...` orqali manzil + slot pre-filled
 *
 * Hooks: `useBookingDraft` (nuqs). Yandex Maps SDK external — storybook
 * `dynamic(ssr:false)` orqali yuklamaydi, MapLoadingFallback (Spinner)
 * doim ko'rinadi. Bu kutilgan xulq — SDK haqiqiy ishga tushgandagina pin
 * pickable bo'ladi.
 */
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { withNuqsTestingAdapter } from 'nuqs/adapters/testing';
import { fn } from 'storybook/test';

import { Step2Address } from './step-2-address';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function tomorrowAtNoon(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

function buildAddressSlotDraft(): string {
  const draft = {
    addressSlot: {
      location: { lat: 41.31, lng: 69.28, address: 'Toshkent, Chilonzor 12-uy' },
      slotAt: tomorrowAtNoon(),
    },
  };
  return `?draft=${encodeURIComponent(JSON.stringify(draft))}`;
}

// ─── Meta ────────────────────────────────────────────────────────────────────

const meta: Meta<typeof Step2Address> = {
  title: 'Booking/Step2Address',
  component: Step2Address,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Step 2 — Manzil + vaqt slot (T4.05). `AddressPicker` (Yandex Maps ' +
          '+ reverse-geo) va `SlotPicker` (7 kun + 30 daq slotlari, R02 ' +
          "mitigation). Yandex SDK external — storybook'da loading fallback " +
          "(Spinner) ko'rinadi.",
      },
    },
  },
  args: {
    onComplete: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof Step2Address>;

// ─── Empty ───────────────────────────────────────────────────────────────────

export const Empty: Story = {
  decorators: [
    (Story) => {
      const Wrapper = withNuqsTestingAdapter({ searchParams: '' });
      return (
        <Wrapper>
          <Story />
        </Wrapper>
      );
    },
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Bo'sh holat. Yandex map loading fallback (Spinner) yuqorida, manzil " +
          "input bo'sh, MapPin yo'riqnoma matni ('Xaritada kerakli joyni bosing'). " +
          'Pastida 7-kunlik calendar tabs va slot grid (bugundan boshlab).',
      },
    },
  },
};

// ─── WithAddressAndSlot ──────────────────────────────────────────────────────

export const WithAddressAndSlot: Story = {
  // Yandex SDK external (Invalid API key) — pre-filled coords bilan Placemark
  // render qilinadi va SDK loop @storybook/addon-vitest test'ini timeout qiladi.
  // Visual hujjat sifatida storybook UI'da qoladi, lekin avtomatik test'dan
  // istisno qilinadi.
  tags: ['!test'],
  decorators: [
    (Story) => {
      const Wrapper = withNuqsTestingAdapter({ searchParams: buildAddressSlotDraft() });
      return (
        <Wrapper>
          <Story />
        </Wrapper>
      );
    },
  ],
  parameters: {
    docs: {
      description: {
        story:
          "URL `?draft=...` orqali addressSlot pre-filled: manzil 'Toshkent, " +
          "Chilonzor 12-uy', slot ertaga 12:00. SlotPicker'da tegishli kun tab " +
          'active, 12:00 slot brand rangida tanlangan. RHF isValid=true → ' +
          "wizard 'Davom etish' submit'ni triggerlay oladi.",
      },
    },
  },
};
