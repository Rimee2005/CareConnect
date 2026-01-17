'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { useTranslation } from '@/lib/i18n';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<'VITAL' | 'GUARDIAN'>('VITAL');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'VITAL' || roleParam === 'GUARDIAN') {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('error.passwordsNotMatch'));
      return;
    }

    if (password.length < 6) {
      setError(t('error.passwordTooShort'));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      // Automatically log in the user after registration
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        // If auto-login fails, redirect to login page
        router.push('/auth/login?registered=true');
        setLoading(false);
        return;
      }

      // Wait a moment for the session to be updated, then fetch it
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Get the user's role from the session after signIn
      const sessionRes = await fetch('/api/auth/session', { cache: 'no-store' });
      const session = await sessionRes.json();
      
      // Redirect to dashboard based on role (not profile creation)
      // The dashboard will handle checking if profile exists and redirecting to profile creation if needed
      if (session?.user?.role) {
        const dashboardUrl = `/${session.user.role.toLowerCase()}/dashboard`;
        window.location.href = dashboardUrl;
      } else {
        // Fallback to role-based dashboard (use the role from registration)
        window.location.href = `/${role.toLowerCase()}/dashboard`;
      }
    } catch (err) {
      setError(t('error.generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark transition-colors">
      <Navbar />
      <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8 sm:py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl text-text dark:text-text-dark transition-colors">{t('auth.register.title')}</CardTitle>
            <CardDescription className="text-sm sm:text-base text-text-light dark:text-text-dark-light transition-colors">{t('auth.register.description')}</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm sm:text-base">{t('auth.register.iAmA')}</Label>
                <div className="flex gap-2 sm:gap-3">
                  <Button
                    type="button"
                    variant={role === 'VITAL' ? 'default' : 'outline'}
                    onClick={() => setRole('VITAL')}
                    className="flex-1"
                  >
                    {t('role.vital')}
                  </Button>
                  <Button
                    type="button"
                    variant={role === 'GUARDIAN' ? 'default' : 'outline'}
                    onClick={() => setRole('GUARDIAN')}
                    className="flex-1"
                  >
                    {t('role.guardian')}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('form.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('form.email.placeholder')}
                  required
                  aria-required="true"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('form.password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('form.password.placeholder')}
                    required
                    aria-required="true"
                    minLength={6}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text dark:text-text-dark-muted dark:hover:text-text-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 rounded"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('form.confirmPassword')}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('form.confirmPassword.placeholder')}
                    required
                    aria-required="true"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text dark:text-text-dark-muted dark:hover:text-text-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 rounded"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              {error && <p className="text-sm font-medium text-error dark:text-error transition-colors">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('common.loading') : t('nav.register')}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-text-muted dark:text-text-dark-muted transition-colors">
              {t('auth.register.alreadyHaveAccount')}{' '}
              <Link href="/auth/login" className="text-primary hover:underline dark:text-primary-dark-mode dark:hover:text-primary-dark-mode-hover transition-colors">
                {t('nav.login')}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background dark:bg-background-dark transition-colors">
        <Navbar />
        <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8 sm:py-12">
          <Card className="w-full max-w-md">
            <CardContent className="px-4 sm:px-6 py-8">
              <p className="text-center text-text-muted dark:text-text-dark-muted transition-colors">Loading...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}

