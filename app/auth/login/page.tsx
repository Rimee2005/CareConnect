'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { useTranslation } from '@/lib/i18n';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // Success - redirect will be handled by the server action
      // Use a small delay to ensure session is updated, then redirect
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Check for callbackUrl first (if user was trying to access a protected route)
      const callbackUrl = searchParams.get('callbackUrl');
      if (callbackUrl && (callbackUrl.includes('/vital') || callbackUrl.includes('/guardian'))) {
        window.location.href = callbackUrl;
        return;
      }

      // Fetch session to get role and redirect
      const sessionRes = await fetch('/api/auth/session', { cache: 'no-store' });
      const session = await sessionRes.json();
      
      if (session?.user?.role) {
        // Redirect based on role - always go to dashboard
        const dashboardUrl = `/${session.user.role.toLowerCase()}/dashboard`;
        window.location.href = dashboardUrl;
      } else {
        // Fallback - this shouldn't happen
        window.location.href = '/';
      }
    } catch (err) {
      setError(t('error.generic'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark transition-colors">
      <Navbar />
      <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8 sm:py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl text-text dark:text-text-dark transition-colors">{t('auth.login.title')}</CardTitle>
            <CardDescription className="text-sm sm:text-base text-text-light dark:text-text-dark-light transition-colors">{t('auth.login.description')}</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
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
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('form.password.placeholder')}
                  required
                  aria-required="true"
                />
              </div>
              {error && <p className="text-sm font-medium text-error dark:text-error transition-colors">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('common.loading') : t('nav.login')}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-text-muted dark:text-text-dark-muted transition-colors">
              {t('auth.login.dontHaveAccount')}{' '}
              <Link href="/auth/register" className="text-primary hover:underline dark:text-primary-dark-mode dark:hover:text-primary-dark-mode-hover transition-colors">
                {t('nav.register')}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
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
      <LoginForm />
    </Suspense>
  );
}

