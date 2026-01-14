'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { useTranslation } from '@/lib/i18n';
import Link from 'next/link';

export default function LoginPage() {
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
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark transition-colors">
      <Navbar />
      <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8 sm:py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl text-text dark:text-text-dark transition-colors">{t('nav.login')}</CardTitle>
            <CardDescription className="text-sm sm:text-base text-text-light dark:text-text-dark-light transition-colors">Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-required="true"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              Don't have an account?{' '}
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

