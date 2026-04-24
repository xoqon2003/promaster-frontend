import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { PhoneInput } from './phone-input';

const meta: Meta<typeof PhoneInput> = {
  title: 'Auth/PhoneInput',
  component: PhoneInput,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "O'zbekiston telefon raqami uchun formatlangan input. `+998` prefiksi o'zgarmas, qolgan 9 raqam `XX XXX XX XX` shaklida ko'rsatiladi. Paste orqali to'liq raqamni (+998/0/9-digit) avtomatik tozalaydi.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof PhoneInput>;

function StatefulPhoneInput(props: { initial?: string; error?: string; disabled?: boolean }) {
  const [value, setValue] = useState(props.initial ?? '');
  return (
    <div className="max-w-sm">
      <PhoneInput value={value} onChange={setValue} error={props.error} disabled={props.disabled} />
    </div>
  );
}

export const Empty: Story = {
  render: () => <StatefulPhoneInput />,
};

export const Partial: Story = {
  render: () => <StatefulPhoneInput initial="901" />,
};

export const Filled: Story = {
  render: () => <StatefulPhoneInput initial="901234567" />,
};

export const WithError: Story = {
  render: () => <StatefulPhoneInput initial="12" error="To'g'ri O'zbek telefon raqami kiriting" />,
};

export const Disabled: Story = {
  render: () => <StatefulPhoneInput initial="901234567" disabled />,
};
