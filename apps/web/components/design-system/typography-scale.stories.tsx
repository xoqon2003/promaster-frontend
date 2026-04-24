import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta: Meta = {
  title: 'Design System/Typography Scale',
  parameters: {
    docs: {
      description: {
        component: 'UstaTop tipografiya shkala — Inter (body) va Manrope (display) fontlari bilan.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const DisplayFont: Story = {
  render: () => (
    <div className="font-display space-y-4">
      <div>
        <p className="text-muted-foreground mb-1 text-xs">h1 · font-display text-4xl font-bold</p>
        <h1 className="text-4xl font-bold">Eng yaxshi ustalar</h1>
      </div>
      <div>
        <p className="text-muted-foreground mb-1 text-xs">h2 · font-display text-3xl font-bold</p>
        <h2 className="text-3xl font-bold">Xizmat kategoriyalari</h2>
      </div>
      <div>
        <p className="text-muted-foreground mb-1 text-xs">
          h3 · font-display text-2xl font-semibold
        </p>
        <h3 className="text-2xl font-semibold">Mashhur ustalar</h3>
      </div>
      <div>
        <p className="text-muted-foreground mb-1 text-xs">
          h4 · font-display text-xl font-semibold
        </p>
        <h4 className="text-xl font-semibold">Toshkent bo&apos;yicha</h4>
      </div>
    </div>
  ),
};

export const BodyFont: Story = {
  render: () => (
    <div className="space-y-4 font-sans">
      <div>
        <p className="text-muted-foreground mb-1 text-xs">body-lg · text-lg</p>
        <p className="text-lg">Usta yordamida uyingizni ta&apos;mirlang</p>
      </div>
      <div>
        <p className="text-muted-foreground mb-1 text-xs">body · text-base</p>
        <p className="text-base">UstaTop — O&apos;zbekistondagi eng yaxshi ustalar platformasi.</p>
      </div>
      <div>
        <p className="text-muted-foreground mb-1 text-xs">body-sm · text-sm</p>
        <p className="text-sm">
          Telefon orqali ro&apos;yxatdan o&apos;ting va birinchi buyurtmangizni bering.
        </p>
      </div>
      <div>
        <p className="text-muted-foreground mb-1 text-xs">
          caption · text-xs text-muted-foreground
        </p>
        <p className="text-muted-foreground text-xs">Oxirgi yangilanish: 2 daqiqa oldin</p>
      </div>
    </div>
  ),
};

export const MonoFont: Story = {
  render: () => (
    <div className="space-y-2 font-mono">
      <p className="text-muted-foreground text-xs">Kod bloklari uchun</p>
      <code className="bg-muted block rounded-lg p-4 text-sm">
        {`const master = { name: "Bobur", rating: 4.8 };`}
      </code>
    </div>
  ),
};
