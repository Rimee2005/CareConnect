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

  // 🔒 HYDRATION FIX (ONLY ADDITION)
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

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

  const isActive = (path: string) => pathname === path;

  // 🔒 PREVENT SSR / CLIENT TEXT MISMATCH
  if (!mounted) {
    return (
      <nav
        className="sticky top-0 z-50 h-16 border-b border-border/60 bg-background/95 backdrop-blur-sm dark:bg-background-dark/95 dark:border-border-dark/60 shadow-sm"
        role="navigation"
        aria-label="Main navigation"
      />
    );
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-sm dark:bg-background-dark/95 dark:border-border-dark/60 shadow-sm transition-all duration-200" role="navigation" aria-label="Main navigation">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link 
          href="/" 
          className="flex items-center text-2xl font-bold tracking-tight text-primary transition-all duration-200 hover:text-primary/80 dark:text-primary-dark-mode dark:hover:text-primary-dark-mode/80 sm:text-3xl"
          onClick={() => setMobileMenuOpen(false)}
        >
          CareConnect
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {!session && (
            <nav className="flex items-center gap-1" aria-label="Main navigation links">
              <Link 
                href="/" 
                className={cn(
                  "relative rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                  "text-text/70 hover:text-text hover:bg-background-secondary",
                  "dark:text-text-dark/70 dark:hover:text-text-dark dark:hover:bg-background-dark-secondary",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2",
                  isActive('/') && "text-primary dark:text-primary-dark-mode bg-primary/5 dark:bg-primary-dark-mode/10"
                )}
              >
                {t('nav.home')}
                {isActive('/') && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-primary dark:bg-primary-dark-mode" />
                )}
              </Link>

              <Link 
                href="/about" 
                className={cn(
                  "relative rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                  "text-text/70 hover:text-text hover:bg-background-secondary",
                  "dark:text-text-dark/70 dark:hover:text-text-dark dark:hover:bg-background-dark-secondary",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2",
                  isActive('/about') && "text-primary dark:text-primary-dark-mode bg-primary/5 dark:bg-primary-dark-mode/10"
                )}
              >
                {t('nav.about')}
                {isActive('/about') && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-primary dark:bg-primary-dark-mode" />
                )}
              </Link>
            </nav>
          )}

          {!session && <div className="mx-2 h-6 w-px bg-border dark:bg-border-dark" />}

          {session ? (
            <div className="flex items-center gap-1">
              <NotificationBell />
              <Link href={`/${session.user.role.toLowerCase()}/dashboard`}>
                <Button variant="ghost" size="sm">
                  {t('nav.dashboard')}
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                {t('nav.logout')}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  {t('nav.login')}
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">
                  {t('nav.register')}
                </Button>
              </Link>
            </div>
          )}

          <div className="mx-2 h-6 w-px bg-border dark:bg-border-dark" />

          <div className="flex items-center gap-0.5">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <LanguageToggle />
          <ThemeToggle />
          {session && <NotificationBell />}
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
    </nav>
  );
}

