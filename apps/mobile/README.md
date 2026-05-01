# UstaTop Mobile (Expo)

UstaTop.uz mobile app — React Native + Expo Router + NativeWind.

> **Status:** S08 MVP scaffold (2026-05-01). 5 screen demo: Onboarding,
> Login (mock), Home tab, Search tab, Orders tab, Profile tab.
> Full feature parity with web — S14 (2026-08-07).

## Quick start

```bash
cd apps/mobile
pnpm install   # workspace root install also picks this up
pnpm start     # expo start — opens DevTools, scan QR with Expo Go
pnpm web       # browser preview at http://localhost:8081
pnpm android   # Android emulator
pnpm ios       # iOS simulator (macOS only)
```

## Architecture

- **Framework:** Expo SDK 52 + Expo Router v4 (file-based routing)
- **Styling:** NativeWind v4 (Tailwind classes on RN primitives)
- **Icons:** lucide-react-native
- **Navigation:** Stack (top-level) + Tabs (post-login)
- **Brand tokens:** mirror of `apps/web` (`brand-50..950`, `trust-*`, semantic)

## Folders

```
app/
├── _layout.tsx          # Root: Stack + GestureHandler + SafeArea + global.css
├── index.tsx            # Onboarding/hero (entry screen)
├── (auth)/
│   ├── _layout.tsx
│   └── login.tsx        # Phone OTP entry (mock submit → /(tabs))
└── (tabs)/
    ├── _layout.tsx      # 4-tab bottom nav
    ├── index.tsx        # Home: search, hero card, 8 categories, top masters
    ├── search.tsx
    ├── orders.tsx       # Empty state
    └── profile.tsx
components/              # Shared mobile components (placeholder)
lib/                     # Hooks, stores (placeholder)
```

## Roadmap

- **S14** — Full integration: real auth (NextAuth via web API client),
  TanStack Query, push notifications (Expo Notifications), GPS tracking
  (real-time order screen), camera/photo upload (portfolio), Sentry RN.
- **S15** — Telegram Mini App share

## Why no shared `@ustatop/ui` import?

NativeWind primitives (`Pressable`, `Text`, `View`) don't share API with
shadcn/ui DOM primitives. The brand TOKENS are shared (Tailwind config
mirrors web's oklch as hex). Component-level reuse requires a separate
RN-compatible primitives package (planned S15).

## Known limitations (S08 MVP)

- No real backend integration (mock data)
- No icons/splash/adaptive-icon assets — Expo uses defaults
- No tests yet (added S14)
- Web bundler works but no PWA optimizations yet
