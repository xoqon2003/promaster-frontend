// NOTE: hozircha faqat placeholder. Storybook (`apps/web` ichida) — bu
// UI hujjatlarining asosiy manbasi. Bu sahifa Storybook'ga embed qilingach
// to'ldiriladi.
//
// Muhim: bu sahifada hech qanday `'use client'` komponent yo'q — Next 15.5.x +
// React 19 SSG kombinatsiyasida `useContext` null xatosini oldini olish uchun
// (ADR-0004).
export default function Page() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>UstaTop UI Docs</h1>
      <p>
        Komponent hujjatlari Storybook&apos;da yuritiladi:{' '}
        <a href="http://localhost:6006" target="_blank" rel="noreferrer">
          http://localhost:6006
        </a>
      </p>
      <p>
        Loyiha: <code>apps/web</code> · Design system: <code>packages/ui</code>
      </p>
    </main>
  );
}
