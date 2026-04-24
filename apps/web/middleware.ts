import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import type { UserRole } from '@/lib/auth/schemas';

// Himoyalangan route prefixlari
const PROTECTED = ['/client', '/pro', '/admin'] as const;

// Auth sahifalari (kirgan foydalanuvchi uchun yo'naltiriladi)
const AUTH_PAGES = ['/auth/login', '/auth/otp', '/auth/signup'] as const;

// Rol bo'yicha default redirect
function homeByRole(role: UserRole | undefined): string {
  switch (role) {
    case 'pro':
      return '/pro/dashboard';
    case 'admin':
      return '/admin/moderation';
    default:
      return '/client/home';
  }
}

// NextAuth v5: auth() wrapper pattern
export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isLoggedIn = !!session;
  const pathname = nextUrl.pathname;
  const role = session?.user?.role as UserRole | undefined;

  // 1. Himoyalangan route + kirmaganning harakat
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL('/auth/login', nextUrl);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Auth page'ga kirgan foydalanuvchi → home redirect
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL(homeByRole(role), nextUrl));
  }

  // 3. Rol bo'yicha cross-route guard
  if (isLoggedIn && role === 'client' && pathname.startsWith('/pro')) {
    return NextResponse.redirect(new URL('/client/home', nextUrl));
  }
  if (isLoggedIn && role === 'pro' && pathname.startsWith('/client')) {
    return NextResponse.redirect(new URL('/pro/dashboard', nextUrl));
  }
  if (isLoggedIn && role !== 'admin' && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL(homeByRole(role), nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/client/:path*', '/pro/:path*', '/admin/:path*', '/auth/:path*'],
};
