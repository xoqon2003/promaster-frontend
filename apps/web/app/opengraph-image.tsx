import { ImageResponse } from 'next/og';

/**
 * Dynamic OG image — rendered at build time (or on-demand) by Next.
 *
 * 1200×630 — Facebook / Twitter / LinkedIn standard. Uses inline SVG +
 * gradient + brand color tokens. No external font fetch (uses system
 * stack) so it works offline / in CI.
 */

export const runtime = 'edge';
export const alt = 'UstaTop.uz — Professional ustalar marketplace';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: '80px',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #2463eb 50%, #60a5fa 100%)',
        color: 'white',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Top: brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          style={{
            width: 64,
            height: 64,
            background: 'white',
            color: '#2463eb',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 40,
            fontWeight: 700,
          }}
        >
          U
        </div>
        <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em' }}>
          UstaTop<span style={{ opacity: 0.7 }}>.uz</span>
        </div>
      </div>

      {/* Center: headline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 940 }}>
        <div
          style={{
            fontSize: 80,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
          }}
        >
          Professional ustani
          <br />
          <span style={{ color: '#fbbf24' }}>30 soniyada</span> toping
        </div>
        <div style={{ fontSize: 30, opacity: 0.85, marginTop: 16, fontWeight: 400 }}>
          1000+ tekshirilgan usta · Escrow himoyasi · Real-time tracking
        </div>
      </div>

      {/* Bottom: chips */}
      <div style={{ display: 'flex', gap: 12, fontSize: 22 }}>
        <div
          style={{
            padding: '10px 22px',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 999,
            fontWeight: 600,
          }}
        >
          🇺🇿 O&apos;zbekiston #1
        </div>
        <div
          style={{
            padding: '10px 22px',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 999,
            fontWeight: 600,
          }}
        >
          ✅ MyID tasdiqlangan
        </div>
        <div
          style={{
            padding: '10px 22px',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 999,
            fontWeight: 600,
          }}
        >
          🛡️ 30 kun kafolat
        </div>
      </div>
    </div>,
    { ...size },
  );
}
