import type { Metadata } from 'next';
import { AuthCard } from '@/components/auth/auth-card';
import { SignupForm } from './signup-form';

export const metadata: Metadata = {
  title: "Ro'yxatdan o'tish",
};

// `SignupForm` `useSearchParams` ishlatadi (A03 callbackUrl) — SSG'dan istisno
export const dynamic = 'force-dynamic';

export default function SignupPage() {
  return (
    <AuthCard title="Siz kim?" subtitle="Rolingizni tanlang va davom eting">
      <SignupForm />
    </AuthCard>
  );
}
