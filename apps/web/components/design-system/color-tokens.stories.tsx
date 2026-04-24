import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TrustBadge } from '../domain/trust-badge';

const meta: Meta = {
  title: 'Design System/Color Tokens',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'UstaTop rang tokenlari — brand, trust tier va semantic ranglar.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const BRAND_SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

export const BrandPalette: Story = {
  render: () => (
    <div className="space-y-2">
      <p className="text-muted-foreground mb-4 text-sm font-semibold">Brand — UstaTop Ko&apos;k</p>
      <div className="flex flex-wrap gap-2">
        {BRAND_SHADES.map((shade) => (
          <div key={shade} className="flex flex-col items-center gap-1">
            <div
              aria-label={`brand-${shade}`}
              className={`border-border h-12 w-12 rounded-lg border bg-brand-${shade}`}
            />
            <span className="text-muted-foreground text-xs">{shade}</span>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const TrustTiers: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm font-semibold">Trust Tier tokenlar</p>
      <div className="flex flex-wrap gap-3">
        <TrustBadge level="basic" size="lg" />
        <TrustBadge level="verified" size="lg" />
        <TrustBadge level="pro" size="lg" />
        <TrustBadge level="premium" size="lg" />
      </div>
      <div className="mt-4 grid grid-cols-4 gap-3">
        {(['basic', 'verified', 'pro', 'premium'] as const).map((level) => (
          <div key={level} className="space-y-1">
            <div className={`h-12 rounded-lg bg-trust-${level}-bg border-border border`} />
            <p className="text-muted-foreground text-center text-xs">{level}-bg</p>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const SemanticColors: Story = {
  render: () => {
    const semantics = [
      { name: 'success', label: 'Muvaffaqiyat' },
      { name: 'warning', label: 'Ogohlantirish' },
      { name: 'danger', label: 'Xato' },
      { name: 'info', label: 'Axborot' },
    ] as const;
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {semantics.map(({ name, label }) => (
          <div key={name} className={`rounded-xl p-4 bg-${name}-bg space-y-2`}>
            <div className={`h-8 w-8 rounded-lg bg-${name}`} />
            <p className={`text-sm font-semibold text-${name}-fg`}>{label}</p>
            <p className={`text-xs text-${name}-fg opacity-70`}>{name}</p>
          </div>
        ))}
      </div>
    );
  },
};
