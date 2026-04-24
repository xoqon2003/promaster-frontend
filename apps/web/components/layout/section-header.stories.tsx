import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SectionHeader } from './section-header';

const meta: Meta<typeof SectionHeader> = {
  title: 'Layout/SectionHeader',
  component: SectionHeader,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SectionHeader>;

export const Default: Story = {
  args: { title: 'Mashhur ustalar' },
};

export const WithSubtitle: Story = {
  args: {
    title: 'Mashhur ustalar',
    subtitle: 'Sizning hududingizda',
  },
};

export const WithAction: Story = {
  args: {
    title: 'Mashhur ustalar',
    subtitle: 'Sizning hududingizda',
    action: (
      <a href="#" className="text-brand-500 text-sm font-medium hover:underline">
        Barchasini ko&apos;rish →
      </a>
    ),
  },
};

export const H1Level: Story = {
  args: {
    title: 'UstaTop.uz',
    subtitle: "O'zbekistondagi eng yaxshi ustalar",
    as: 'h1',
  },
};
