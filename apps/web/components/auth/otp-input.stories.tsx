import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { OtpInput } from './otp-input';

const meta: Meta<typeof OtpInput> = {
  title: 'Auth/OtpInput',
  component: OtpInput,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "6 xonali OTP kod inputi. `input-otp` library'si asosida, brand-500 ring aktiv slot uchun. `inputMode='numeric'` va `autocomplete='one-time-code'` bilan mobil SMS auto-fill qo'llab-quvvatlanadi.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof OtpInput>;

function StatefulOtpInput(props: { initial?: string; error?: string; disabled?: boolean }) {
  const [value, setValue] = useState(props.initial ?? '');
  return (
    <div className="max-w-sm">
      <OtpInput value={value} onChange={setValue} error={props.error} disabled={props.disabled} />
    </div>
  );
}

export const Empty: Story = {
  render: () => <StatefulOtpInput />,
};

export const Partial: Story = {
  render: () => <StatefulOtpInput initial="123" />,
};

export const Filled: Story = {
  render: () => <StatefulOtpInput initial="123456" />,
};

export const WithError: Story = {
  render: () => <StatefulOtpInput initial="000000" error="Kod noto'g'ri. 2 ta urinish qoldi" />,
};

export const Disabled: Story = {
  render: () => <StatefulOtpInput initial="123" disabled />,
};
