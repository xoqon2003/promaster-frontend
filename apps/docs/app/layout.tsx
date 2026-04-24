import type { Metadata } from 'next';
import './globals.css';

// SSG'ni butunlay o'chirish. Sabab: Next 15.5.x + React 19.2 + App Router
// kombinatsiyasida `/_not-found` prerender paytida `useContext` null qaytaradi.
// Apps/docs faqat development runtime'da ishlatiladi (Storybook asosiy hujjat
// manbasi), shuning uchun force-dynamic xavfsiz.
// ADR: docs/adr/0004-next15-react19-nextauth-prerender.md
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'UstaTop Docs',
  description: 'UstaTop component documentation',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body>{children}</body>
    </html>
  );
}
