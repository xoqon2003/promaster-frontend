import type { Metadata } from 'next';
import { AuthCard } from '@/components/auth/auth-card';
import { SignupForm } from './signup-form';

export const metadata: Metadata = {
  title: "Ro'yxatdan o'tish",
};

export default function SignupPage() {
  return (
    <AuthCard title="Siz kim?" subtitle="Rolingizni tanlang va davom eting">
      <SignupForm />
    </AuthCard>
  );
}
