/**
 * GeoTrackingDemo Storybook stories — T6.04 acceptance.
 *
 * 3 holat: prompt (default), granted (mock geolocation success), denied
 * (mock PERMISSION_DENIED). Mock decorator `navigator.geolocation`'ni
 * almashtiradi — story sahifasi yopilgach asl holat tiklanadi.
 */
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite';

import { GeoTrackingDemo } from './geo-tracking-demo';

// Tashkent — mock target
const TARGET = { lat: 41.31, lng: 69.27 };

// ─── Mock geolocation decorators ─────────────────────────────────────────────

interface MockOptions {
  /** 'granted' — koordinatalar oqimi; 'denied' — error code 1; 'prompt' — pending. */
  flow: 'granted' | 'denied' | 'prompt';
}

function makeGeolocationDecorator({ flow }: MockOptions): Decorator {
  const GeoDecorator: Decorator = (Story) => {
    if (typeof window === 'undefined') return <Story />;

    const original = navigator.geolocation;

    Object.defineProperty(navigator, 'geolocation', {
      value: {
        watchPosition: (
          success: (pos: GeolocationPosition) => void,
          error: ((err: GeolocationPositionError) => void) | undefined,
        ) => {
          if (flow === 'denied') {
            // Async error — komponent dastlab 'prompt' ko'rsatadi, keyin denied'ga.
            setTimeout(() => {
              error?.({
                code: 1,
                message: '',
                PERMISSION_DENIED: 1,
                POSITION_UNAVAILABLE: 2,
                TIMEOUT: 3,
              } as GeolocationPositionError);
            }, 100);
          } else if (flow === 'granted') {
            // Birinchi ping darhol, keyin har 1s da yangilash (story
            // ko'rgazmali bo'lishi uchun — production'da watchPosition
            // brauzer xohishi bilan emit qiladi)
            let lat = TARGET.lat - 0.005;
            const tick = () => {
              success({
                coords: {
                  latitude: lat,
                  longitude: TARGET.lng + 0.001,
                  accuracy: 15,
                  altitude: null,
                  altitudeAccuracy: null,
                  heading: null,
                  speed: null,
                  toJSON: () => ({}),
                },
                timestamp: Date.now(),
                toJSON: () => ({}),
              } as GeolocationPosition);
              lat += 0.0005;
            };
            tick();
            const id = window.setInterval(tick, 1_500);
            return id;
          }
          // 'prompt' — hech narsa qilmaymiz, success/error chaqirilmaydi.
          return 0;
        },
        clearWatch: (id: number) => {
          if (id) window.clearInterval(id);
        },
      },
      configurable: true,
      writable: true,
    });

    return (
      <div>
        <Story />
        <CleanupOnUnmount original={original} />
      </div>
    );
  };
  (GeoDecorator as { displayName?: string }).displayName = `GeoDecorator(${flow})`;
  return GeoDecorator;
}

function CleanupOnUnmount({ original }: { original: Geolocation }) {
  // Storybook story unmount'da asl geolocation'ni tiklash — boshqa story'larga
  // sizib chiqmasligi uchun.
  // (Bu component faqat side-effect uchun, render hech narsa qaytaradi.)
  if (typeof window !== 'undefined' && original) {
    // Inline cleanup — useEffect emas, chunki Storybook decorator scope'da.
    queueMicrotask(() => {
      Object.defineProperty(navigator, 'geolocation', {
        value: original,
        configurable: true,
        writable: true,
      });
    });
  }
  return null;
}

// ─── Meta ────────────────────────────────────────────────────────────────────

const meta: Meta<typeof GeoTrackingDemo> = {
  title: 'Features/GeoTrackingDemo',
  component: GeoTrackingDemo,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "S06 T6.04 — `useGeoTracking` hook'ning debug widget'i. Permission state machine (prompt/granted/denied) va adaptive interval (30s default, 15s ≤ 500m masofada) ni ko'rsatadi.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof GeoTrackingDemo>;

// ─── Stories ─────────────────────────────────────────────────────────────────

export const Prompt: Story = {
  decorators: [makeGeolocationDecorator({ flow: 'prompt' })],
  args: { target: TARGET, initialEnabled: true },
  parameters: {
    docs: {
      description: {
        story: "Boshlang'ich holat — brauzer hali permission so'ramagan.",
      },
    },
  },
};

export const Granted: Story = {
  decorators: [makeGeolocationDecorator({ flow: 'granted' })],
  args: { target: TARGET, initialEnabled: true },
  parameters: {
    docs: {
      description: {
        story:
          'Permission berildi — har 1.5s da yangi koordinata kelyapti. Adaptive interval 15s/30s — story Date.now() throttle bilan ishlaydi (haqiqiy frequency emas).',
      },
    },
  },
};

export const Denied: Story = {
  decorators: [makeGeolocationDecorator({ flow: 'denied' })],
  args: { target: TARGET, initialEnabled: true },
  parameters: {
    docs: {
      description: {
        story:
          "Foydalanuvchi rad etdi — manual mode'ga o'tadi. \"Qayta urinish\" tugmasi state'ni 'prompt'ga qaytaradi (lekin brauzer denied'dan keyin sozlamalardan ochishni talab qiladi).",
      },
    },
  },
};
