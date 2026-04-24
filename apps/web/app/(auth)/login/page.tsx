import type { Metadata } from 'next';
import { LoginForm } from './login-form';
import { AuthCard } from '@/components/auth/auth-card';

export const metadata: Metadata = {
  title: 'Kirish',
};

export default function LoginPage() {
  return (
    <AuthCard title="Kirish" subtitle="Telefon raqamingizni kiriting">
      <LoginForm />
    </AuthCard>
  );
}
