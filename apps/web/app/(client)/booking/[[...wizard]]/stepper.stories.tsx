/**
 * T4.15 — `Stepper` Storybook stories.
 *
 * Stories:
 *  - EmptyStart — currentStep=1, hech qaysi step to'ldirilmagan
 *  - AllCompleted — barcha step done, joriy = 6 (Tasdiq)
 *  - Interactive — `useState` bilan klikable navigatsiya namunasi
 *
 * Pure UI komponent — hook'lar yo'q. Interactive story React state bilan
 * o'z ichida boshqaradi (nuqs adapter kerakmas).
 */
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';

import { type WizardStep } from '@/lib/hooks/use-wizard-step';

import { Stepper } from './stepper';

const meta: Meta<typeof Stepper> = {
  title: 'Booking/Stepper',
  component: Stepper,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "Booking wizard yuqorisidagi 6-qadam ko'rsatkichi (T4.03). Holatlar: " +
          '`done` (klikable, tahrirlash uchun), `active` (joriy step), `pending` ' +
          "(kelajak step, klikable emas). Mobile (<sm)'da label'lar yashirin, " +
          'faqat raqamlar.',
      },
    },
  },
  args: {
    onStepClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof Stepper>;

// ─── EmptyStart ──────────────────────────────────────────────────────────────

export const EmptyStart: Story = {
  args: {
    currentStep: 1,
    completedSteps: new Set<WizardStep>(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Boshlang'ich holat: 1-step active (brand-rangli halqa), 2-6 pending " +
          '(kulrang). Hech qaysi step to`ldirilmagan, faqat 1-step klikable.',
      },
    },
  },
};

// ─── AllCompleted ────────────────────────────────────────────────────────────

export const AllCompleted: Story = {
  args: {
    currentStep: 6,
    completedSteps: new Set<WizardStep>([1, 2, 3, 4, 5]),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Step 6 (Tasdiq) joriy. 1-5 step `done` — brand rangda Check ikona, ' +
          'connector chiziqlar ham brand rangida. Foydalanuvchi har qaysi ' +
          'oldingi stepga qaytib tahrirlashi mumkin.',
      },
    },
  },
};

// ─── Interactive ─────────────────────────────────────────────────────────────

export const Interactive: Story = {
  render: () => {
    const InteractiveDemo = () => {
      const [current, setCurrent] = useState<WizardStep>(3);
      const completed = new Set<WizardStep>([1, 2]);
      return (
        <Stepper
          currentStep={current}
          completedSteps={completed}
          onStepClick={(target) => setCurrent(target)}
        />
      );
    };
    return <InteractiveDemo />;
  },
  parameters: {
    docs: {
      description: {
        story:
          'Klikable navigatsiya namunasi: 1-2 done, 3 active, 4-6 pending. ' +
          "Done yoki active stepni bosib current'ni o'zgartirish mumkin. Pending " +
          'steplar disabled — bosish ishlamaydi.',
      },
    },
  },
};
