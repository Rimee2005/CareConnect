'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { LanguageToggle } from './LanguageToggle';
import { ThemeToggle } from './ThemeToggle';
import { NotificationBell } from './NotificationBell';
import { useTranslation } from '@/lib/i18n';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset';
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

  const isActive = (path: string) => pathname === path;

  if (!mounted) {
    return (
      <nav className="sticky top-0 z-50 h-16 border-b border-border bg-background" />
    );
  }

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background dark:bg-background-dark">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">

          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold text-primary"
            onClick={() => setMobileMenuOpen(false)}
          >
            CareConnect
          </Link>

          {/* ================= DESKTOP ================= */}
          <div className="hidden md:flex items-center gap-2">

            {!session && (
              <>
                <Link
                  href="/"
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium',
                    isActive('/') && 'text-primary bg-primary/10'
                  )}
                >
                  {t('nav.home')}
                </Link>

                <Link
                  href="/about"
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium',
                    isActive('/about') && 'text-primary bg-primary/10'
                  )}
                >
                  {t('nav.about')}
                </Link>

                <div className="h-6 w-px bg-border mx-2" />
              </>
            )}

            {session ? (
              <>
                <NotificationBell />
                <Link href={`/${session.user.role.toLowerCase()}/dashboard`}>
                  <Button variant="ghost" size="sm">
                    {t('nav.dashboard')}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  {t('nav.logout')}
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">{t('nav.register')}</Button>
                </Link>
              </>
            )}

            <div className="h-6 w-px bg-border mx-2" />

            <LanguageToggle />
            <ThemeToggle />
          </div>

          {/* ================= MOBILE TOP BAR ================= */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            {session && <NotificationBell />}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </nav>

      {/* ================= MOBILE MENU ================= */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-40 bg-background dark:bg-background-dark">
          <div className="flex flex-col gap-2 p-4 text-text dark:text-text-dark">

            {!session ? (
              <>
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-lg hover:bg-background-secondary dark:hover:bg-background-dark-secondary"
                >
                  {t('nav.home')}
                </Link>

                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-lg hover:bg-background-secondary dark:hover:bg-background-dark-secondary"
                >
                  {t('nav.about')}
                </Link>

                <div className="my-2 h-px bg-border" />

                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    {t('nav.login')}
                  </Button>
                </Link>

                <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full justify-start">
                    {t('nav.register')}
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={`/${session.user.role.toLowerCase()}/dashboard`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="ghost" className="w-full justify-start">
                    {t('nav.dashboard')}
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleLogout}
                >
                  {t('nav.logout')}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}


