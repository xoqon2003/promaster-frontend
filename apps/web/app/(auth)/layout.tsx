import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | UstaTop.uz',
    default: 'Kirish | UstaTop.uz',
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      {children}
    </div>
  );
}
