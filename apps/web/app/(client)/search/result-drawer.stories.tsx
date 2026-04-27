/**
 * T3.20 — `ResultDrawer` Storybook stories.
 *
 * Stories:
 *  - Loading — fetch jarayonida (`useMaster` isPending), skeleton ko'rinadi
 *  - WithContent — usta ma'lumoti yuklangan, avatar, portfolio, reviewlar,
 *    'Bog'lanish' va 'To'liq profil' tugmalari mavjud
 *
 * Hooks: nuqs (`?masterId=...`) + TanStack Query (`useMaster`). Story
 * Decorator'da `?masterId=m_1` o'rnatiladi — mock api-client'dan haqiqiy
 * Master fixture qaytadi.
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { withNuqsTestingAdapter } from 'nuqs/adapters/testing';
import { useState } from 'react';

import { ResultDrawer } from './result-drawer';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeQueryClient(opts: { isLoading?: boolean } = {}) {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        // Loading story uchun — query'ni hech qachon resolve qilmaslik
        // muddatini cheksiz qilib, skeleton holatini "muzlatamiz".
        staleTime: opts.isLoading ? Infinity : 0,
        gcTime: 0,
      },
    },
  });
}

// ─── Meta ────────────────────────────────────────────────────────────────────

const meta: Meta<typeof ResultDrawer> = {
  title: 'Search/ResultDrawer',
  component: ResultDrawer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Quick profile drawer (T3.17). MasterCard click → `?masterId=...` URL ' +
          "param o'rnatiladi → drawer ochiladi. Tarkibi: avatar, ism, kategoriya, " +
          "reyting, narx, 3 portfolio rasm, 3 mock review, 'Bog'lanish' va " +
          "'To'liq profil' tugmalari. Esc / outside click — yopish.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ResultDrawer>;

// ─── WithContent (mock m_1 yuklangan) ────────────────────────────────────────

export const WithContent: Story = {
  decorators: [
    (Story) => {
      const [client] = useState(() => makeQueryClient());
      const Wrapper = withNuqsTestingAdapter({ searchParams: '?masterId=m_1' });
      return (
        <Wrapper>
          <QueryClientProvider client={client}>
            <Story />
          </QueryClientProvider>
        </Wrapper>
      );
    },
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Mock api-client'dan `m_1` IDli usta yuklanadi. Kontent: ism, " +
          'kategoriya, trust badge, reyting, narx, portfolio, izohlar va ' +
          "amallar. 'Bog'lanish' tugmasi `tel:` link ochadi.",
      },
    },
  },
};

// ─── Loading (skeleton) ──────────────────────────────────────────────────────

export const Loading: Story = {
  decorators: [
    (Story) => {
      // QueryClient never-resolving — query har doim isPending holatda
      const [client] = useState(() => {
        const c = makeQueryClient({ isLoading: true });
        // queryFn'ni replace qilamiz — hech qachon resolve bo'lmaydi
        c.setQueryDefaults(['masters', 'detail'], {
          queryFn: () => new Promise(() => {}),
        });
        return c;
      });
      const Wrapper = withNuqsTestingAdapter({ searchParams: '?masterId=m_1' });
      return (
        <Wrapper>
          <QueryClientProvider client={client}>
            <Story />
          </QueryClientProvider>
        </Wrapper>
      );
    },
  ],
  parameters: {
    docs: {
      description: {
        story:
          'Drawer ochildi, lekin `useMaster` hali isPending — skeleton ' +
          "blocks ko'rinadi: avatar circle, 3 ta portfolio kvadrat, 3 ta " +
          'review qator.',
      },
    },
  },
};
