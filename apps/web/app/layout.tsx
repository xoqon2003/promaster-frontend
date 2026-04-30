import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-manrope',
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ustatop.uz'),
  title: {
    default: 'UstaTop.uz — Professional ustalar marketplace',
    template: '%s | UstaTop.uz',
  },
  description:
    "O'zbekistondagi eng yaxshi ustalar platformasi. AI 30 soniyada eng mos ustani tavsiya qiladi. Escrow himoyasi bilan to'lov, real-time tracking, tekshirilgan portfolio.",
  keywords: [
    'usta',
    'xizmat',
    "O'zbekiston",
    'santexnik',
    'elektrik',
    'remont',
    "go'zallik",
    'marketplace',
    'UstaTop',
  ],
  authors: [{ name: 'UstaTop.uz' }],
  creator: 'UstaTop.uz',
  openGraph: {
    type: 'website',
    locale: 'uz_UZ',
    alternateLocale: ['ru_RU', 'en_US'],
    url: 'https://ustatop.uz',
    siteName: 'UstaTop.uz',
    title: 'UstaTop.uz — Professional ustalar marketplace',
    description: '30 soniyada ustani toping. Escrow himoyasi. 1000+ tekshirilgan usta.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UstaTop.uz — Professional ustalar marketplace',
    description: '30 soniyada ustani toping. Escrow himoyasi. 1000+ tekshirilgan usta.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
    languages: {
      uz: '/',
      ru: '/ru',
      en: '/en',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" suppressHydrationWarning className={`${inter.variable} ${manrope.variable}`}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
