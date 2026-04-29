/**
 * T4.15 — `Step3Photos` Storybook stories.
 *
 * Stories:
 *  - Empty — bo'sh dropzone, foto yo'q
 *  - WithThreePhotos — `?draft=...` orqali 3 ta yuklangan foto pre-filled
 *
 * Hooks: `useBookingDraft` (nuqs). Ko'p draft URL'dan o'qiladi — initial
 * uploaded state shu yerdan keladi.
 */
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { withNuqsTestingAdapter } from 'nuqs/adapters/testing';
import { fn } from 'storybook/test';

import { Step3Photos } from './step-3-photos';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const THREE_PHOTOS = [
  {
    id: 'p_1',
    url: 'https://picsum.photos/seed/booking-1/400/400',
    mimeType: 'image/jpeg' as const,
    bytes: 245_120,
  },
  {
    id: 'p_2',
    url: 'https://picsum.photos/seed/booking-2/400/400',
    mimeType: 'image/jpeg' as const,
    bytes: 312_400,
  },
  {
    id: 'p_3',
    url: 'https://picsum.photos/seed/booking-3/400/400',
    mimeType: 'image/png' as const,
    bytes: 198_320,
  },
];

function buildDraftSearch(photos: typeof THREE_PHOTOS): string {
  const draft = { photos };
  return `?draft=${encodeURIComponent(JSON.stringify(draft))}`;
}

// ─── Meta ────────────────────────────────────────────────────────────────────

const meta: Meta<typeof Step3Photos> = {
  title: 'Booking/Step3Photos',
  component: Step3Photos,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Step 3 — Foto biriktirish (ixtiyoriy, T4.06). Drag-n-drop dropzone, ' +
          'fayl validatsiyasi (JPG/PNG/WebP, ≤5 MB, ≤5 ta), preview grid va ' +
          "ham 'Foto kerak emas, davom etish' link. Yuklangan rasmlar " +
          '`useBookingDraft.draft.photos` dan keladi.',
      },
    },
  },
  args: {
    onComplete: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof Step3Photos>;

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
          "Bo'sh holat. Dropzone (Upload ikonasi + 'Faylni tashlang yoki bosing') va " +
          "0/5 counter ko'rinadi. Foto qo'shish tugma yoqilgan; skip linki ham bor.",
      },
    },
  },
};

// ─── WithThreePhotos ─────────────────────────────────────────────────────────

export const WithThreePhotos: Story = {
  decorators: [
    (Story) => {
      const Wrapper = withNuqsTestingAdapter({
        searchParams: buildDraftSearch(THREE_PHOTOS),
      });
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
          'URL `?draft=...` orqali 3 ta yuklangan foto pre-filled. Preview grid ' +
          '3 kolonna mobile / 5 kolonna desktop. Har thumbnail tepasida bekor ' +
          "qilish ✕ tugma, pastida bayt o'lchami badge.",
      },
    },
  },
};
