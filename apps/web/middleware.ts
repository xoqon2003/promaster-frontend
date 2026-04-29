import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';

import { authConfig } from '@/auth.config';
import type { UserRole } from '@/lib/auth/schemas';

// Edge-safe `auth` — `auth.config.ts` faqat callbacks/pages/session,
// Credentials provider va DB import'lari `auth.ts` da. Middleware
// bundle'ga DB code'i oqmaydi (S05 T5.04 split).
const { auth } = NextAuth(authConfig);

/**
 * Auth flow sahifalari (logged-in foydalanuvchi → home redirect).
 *
 * App Router fayl strukturasi route group'lar (`(auth)`, `(client)`,
 * `(pro)`) URL prefiks'ni stripsdir → barcha route'lar flat. Shuning
 * uchun `/auth/login` emas, `/login` ishlatamiz.
 */
const AUTH_PAGES = new Set(['/login', '/otp', '/signup']);

/**
 * Himoyalangan route prefiks'lari. Default — public (marketing, search,
 * booking flow ochiq, faqat oxirida step 5'da auth gate).
 */
const PROTECTED_PREFIXES = [
  '/home', // client home
  '/dashboard', // pro dashboard
  '/moderation', // admin moderation
  '/orders', // mijoz buyurtmalari
  '/tracking', // realtime tracking (S05)
  '/portfolio', // pro portfolio
  '/calendar', // pro calendar
  '/wallet', // wallet
  '/profile', // user profile
  '/chat', // messaging
  '/disputes', // admin disputes
  '/verifications', // admin verifications
] as const;

/** Rol bo'yicha home page. */
const ROLE_HOME: Record<UserRole, string> = {
  client: '/home',
  pro: '/dashboard',
  admin: '/moderation',
};

function homeByRole(role: UserRole | undefined): string {
  return role ? ROLE_HOME[role] : '/home';
}

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

// NextAuth v5: auth() wrapper pattern
export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isLoggedIn = !!session;
  const pathname = nextUrl.pathname;
  const role = session?.user?.role as UserRole | undefined;

  // 1. Logged-in foydalanuvchi auth page'da → o'z home'iga redirect
  if (isLoggedIn && AUTH_PAGES.has(pathname)) {
    return NextResponse.redirect(new URL(homeByRole(role), nextUrl));
  }

  // 2. Himoyalangan route + kirmagan → /login (callbackUrl bilan)
  if (isProtectedPath(pathname) && !isLoggedIn) {
    const loginUrl = new URL('/login', nextUrl);
    loginUrl.searchParams.set('callbackUrl', pathname + nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Rol bo'yicha cross-route guard — boshqa rol'ning home'iga kirsa, o'zinikiga
  if (isLoggedIn) {
    if (pathname === '/home' && role !== 'client') {
      return NextResponse.redirect(new URL(homeByRole(role), nextUrl));
    }
    if (pathname === '/dashboard' && role !== 'pro') {
      return NextResponse.redirect(new URL(homeByRole(role), nextUrl));
    }
    if (pathname === '/moderation' && role !== 'admin') {
      return NextResponse.redirect(new URL(homeByRole(role), nextUrl));
    }
  }

  return NextResponse.next();
});

/**
 * Matcher: API, statik fayllar va Next.js internal route'lardan tashqari
 * hammasi. Public route'lar handler ichida `next()` orqali o'tkaziladi.
 */
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
