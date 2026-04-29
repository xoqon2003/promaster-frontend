import type { Metadata } from 'next';
import { AuthCard } from '@/components/auth/auth-card';
import { OtpForm } from './otp-form';

export const metadata: Metadata = {
  title: 'Tasdiqlash kodi',
};

// Dynamic searchParams — SSG'dan chiqarib, har request'ga qayta render
export const dynamic = 'force-dynamic';

interface OtpPageProps {
  searchParams: Promise<{ phone?: string; callbackUrl?: string }>;
}

export default async function OtpPage({ searchParams }: OtpPageProps) {
  const { phone, callbackUrl } = await searchParams;
  const maskedPhone = phone ? phone.replace(/(\+998\d{2})\d{5}(\d{2})/, '$1*****$2') : '';

  return (
    <AuthCard title="Tasdiqlash kodi" subtitle={`${maskedPhone} raqamiga SMS kod yuborildi`}>
      <OtpForm phone={phone ?? ''} callbackUrl={callbackUrl} />
    </AuthCard>
  );
}
