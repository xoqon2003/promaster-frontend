'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Hammer, UserRound } from 'lucide-react';
import { SignupSchema } from '@/lib/auth/schemas';
import { updateMockUser } from '@/lib/auth/mock-adapter';
import { RoleSelector } from '@/components/auth/role-selector';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import type { Signup, UserRole } from '@/lib/auth/schemas';

const ROLE_OPTIONS = [
  {
    value: 'client' as const,
    label: 'Mijoz',
    subtitle: 'Xizmat topaman',
    icon: UserRound,
  },
  {
    value: 'pro' as const,
    label: 'Usta',
    subtitle: "Xizmat ko'rsataman",
    icon: Hammer,
  },
];

export function SignupForm() {
  const router = useRouter();
  const { data: session, update } = useSession();

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Signup>({
    resolver: zodResolver(SignupSchema),
    defaultValues: { name: '', role: undefined as unknown as UserRole },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: Signup) => {
    const phone = session?.user?.phone ?? '';
    updateMockUser(phone, { name: data.name, role: data.role });
    // Session'ni yangilaymiz
    await update({ name: data.name, role: data.role });

    const home = data.role === 'pro' ? '/dashboard' : '/home';
    router.push(home);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {/* Step 1: Rol tanlash */}
      <Controller
        name="role"
        control={control}
        render={({ field }) => (
          <RoleSelector
            value={field.value as Exclude<UserRole, 'admin'> | undefined}
            onChange={field.onChange}
            options={ROLE_OPTIONS}
          />
        )}
      />

      {/* Step 2: Ism (rol tanlanganida paydo bo'ladi) */}
      {selectedRole && (
        <div className="animate-in fade-in slide-in-from-top-2 space-y-1.5 duration-200">
          <label htmlFor="signup-name" className="text-foreground block text-sm font-medium">
            Ismingiz
          </label>
          <input
            id="signup-name"
            type="text"
            autoComplete="name"
            placeholder="Masalan: Bobur"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
            {...register('name')}
            className="border-input focus:ring-brand-500 w-full rounded-lg border bg-transparent px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
          />
          {errors.name && (
            <p id="name-error" role="alert" className="text-danger text-xs">
              {errors.name.message}
            </p>
          )}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={!selectedRole || isSubmitting}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Spinner size="sm" variant="white" label="Saqlanmoqda" />
            <span className="ml-2">Saqlanmoqda...</span>
          </>
        ) : (
          'Davom etish →'
        )}
      </Button>
    </form>
  );
}
