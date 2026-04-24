import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Hammer, UserRound } from 'lucide-react';
import { useState } from 'react';
import { RoleSelector } from './role-selector';
import type { UserRole } from '@/lib/auth/schemas';

const meta: Meta<typeof RoleSelector> = {
  title: 'Auth/RoleSelector',
  component: RoleSelector,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Signup'da foydalanuvchi rolini (mijoz yoki usta) tanlash uchun card-based `radiogroup`. Keyboard navigation (Space/Enter) va aria-checked qo'llab-quvvatlanadi.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof RoleSelector>;

const OPTIONS = [
  {
    value: 'client' as const,
    label: 'Mijoz',
    subtitle: 'Xizmat topaman',
    icon: UserRound,
  },
  {
    value: 'pro' as const,
    label: 'Usta',
    subtitle: "Xizmat ko'rsataman",
    icon: Hammer,
  },
];

function StatefulRoleSelector(props: { initial?: Exclude<UserRole, 'admin'> }) {
  const [value, setValue] = useState<Exclude<UserRole, 'admin'> | undefined>(props.initial);
  return (
    <div className="max-w-sm">
      <RoleSelector value={value} onChange={setValue} options={OPTIONS} />
    </div>
  );
}

export const Empty: Story = {
  render: () => <StatefulRoleSelector />,
};

export const ClientSelected: Story = {
  render: () => <StatefulRoleSelector initial="client" />,
};

export const ProSelected: Story = {
  render: () => <StatefulRoleSelector initial="pro" />,
};
