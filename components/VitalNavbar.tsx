'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { LanguageToggle } from './LanguageToggle';
import { ThemeToggle } from './ThemeToggle';
import { NotificationBell } from './NotificationBell';
import { useTranslation } from '@/lib/i18n';
import { Menu, X } from 'lucide-react';

export function VitalNavbar() {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [router]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
    router.refresh();
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background dark:bg-background-dark dark:border-border dark:shadow-dark-soft shadow-soft transition-colors" role="navigation" aria-label="Vital navigation">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link 
          href="/vital/dashboard" 
          className="text-lg font-bold text-primary dark:text-primary-dark-mode transition-colors sm:text-xl"
          onClick={() => setMobileMenuOpen(false)}
        >
          CareConnect
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-4 md:flex">
          {session ? (
            <>
              <Link href="/vital/dashboard">
                <Button variant="ghost" size="sm" className="text-sm">
                  {t('nav.dashboard')}
                </Button>
              </Link>
              <NotificationBell />
              <Link href="/vital/profile/create">
                <Button variant="ghost" size="sm" className="text-sm">
                  {t('nav.profile')}
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-sm"
              >
                {t('nav.logout')}
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="text-sm">
                  {t('nav.login')}
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm" className="text-sm">{t('nav.register')}</Button>
              </Link>
            </>
          )}

          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="flex items-center gap-1">
            <LanguageToggle />
            <ThemeToggle />
          </div>
          {session && <NotificationBell />}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
            className="h-9 w-9"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-background dark:bg-background-dark shadow-lg md:hidden">
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <span className="text-lg font-bold text-primary dark:text-primary-dark-mode">
                Menu
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                className="h-9 w-9"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex h-[calc(100vh-4rem)] flex-col overflow-y-auto px-4 py-6">
              {session ? (
                <div className="space-y-1">
                  <Link
                    href="/vital/dashboard"
                    className="block rounded-lg px-4 py-3 text-base font-medium text-text hover:bg-background-secondary dark:text-text-dark dark:hover:bg-background-dark-secondary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.dashboard')}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-lg px-4 py-3 text-left text-base font-medium text-text hover:bg-background-secondary dark:text-text-dark dark:hover:bg-background-dark-secondary transition-colors"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/auth/login"
                    className="block w-full rounded-lg px-4 py-3 text-center text-base font-medium text-text hover:bg-background-secondary dark:text-text-dark dark:hover:bg-background-dark-secondary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block w-full rounded-lg bg-primary px-4 py-3 text-center text-base font-medium text-white hover:bg-primary-dark dark:bg-primary-dark-mode dark:hover:bg-primary-dark-mode-hover transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.register')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
