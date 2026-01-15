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

  return (
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-sm dark:bg-background-dark/95 dark:border-border-dark/60 shadow-sm transition-all duration-200" role="navigation" aria-label="Main navigation">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center text-xl font-bold tracking-tight text-primary transition-all duration-200 hover:text-primary/80 dark:text-primary-dark-mode dark:hover:text-primary-dark-mode/80 sm:text-2xl"
          onClick={() => setMobileMenuOpen(false)}
        >
          CareConnect
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {/* Navigation Links - Only show when not logged in */}
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

          {/* Visual Separator */}
          {!session && (
            <div className="mx-2 h-6 w-px bg-border dark:bg-border-dark" aria-hidden="true" />
          )}

          {/* Auth Actions / User Menu */}
          {session ? (
            <div className="flex items-center gap-1">
              <NotificationBell />
              <Link href={`/${session.user.role.toLowerCase()}/dashboard`}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "h-9 rounded-lg px-4 text-sm font-medium transition-all duration-200",
                    "hover:bg-background-secondary dark:hover:bg-background-dark-secondary",
                    "focus-visible:ring-2 focus-visible:ring-primary/20",
                    isActive(`/${session.user.role.toLowerCase()}/dashboard`) && "bg-primary/5 text-primary dark:bg-primary-dark-mode/10 dark:text-primary-dark-mode"
                  )}
                >
                  {t('nav.dashboard')}
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="h-9 rounded-lg px-4 text-sm font-medium text-text/70 transition-all duration-200 hover:bg-background-secondary hover:text-text dark:text-text-dark/70 dark:hover:bg-background-dark-secondary dark:hover:text-text-dark focus-visible:ring-2 focus-visible:ring-primary/20"
              >
                {t('nav.logout')}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-9 rounded-lg px-4 text-sm font-medium text-text/80 transition-all duration-200 hover:bg-background-secondary hover:text-text dark:text-text-dark/80 dark:hover:bg-background-dark-secondary dark:hover:text-text-dark focus-visible:ring-2 focus-visible:ring-primary/20"
                >
                  {t('nav.login')}
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button 
                  size="sm" 
                  className="h-9 rounded-lg px-5 text-sm font-semibold shadow-sm transition-all duration-200 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
                >
                  {t('nav.register')}
                </Button>
              </Link>
            </div>
          )}

          {/* Utility Icons Separator */}
          <div className="mx-2 h-6 w-px bg-border dark:bg-border-dark" aria-hidden="true" />

          {/* Utility Icons */}
          <div className="flex items-center gap-0.5">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Utility Icons */}
          <div className="flex items-center gap-0.5">
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
            className="h-9 w-9 rounded-lg transition-all duration-200 hover:bg-background-secondary dark:hover:bg-background-dark-secondary focus-visible:ring-2 focus-visible:ring-primary/20"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 transition-transform duration-200" />
            ) : (
              <Menu className="h-5 w-5 transition-transform duration-200" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-background dark:bg-background-dark shadow-xl md:hidden animate-in slide-in-from-right duration-300">
            {/* Mobile Menu Header */}
            <div className="flex h-16 items-center justify-between border-b border-border/60 dark:border-border-dark/60 px-6">
              <span className="text-lg font-semibold tracking-tight text-text dark:text-text-dark">
                {t('nav.menu') || 'Menu'}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                className="h-9 w-9 rounded-lg transition-all duration-200 hover:bg-background-secondary dark:hover:bg-background-dark-secondary focus-visible:ring-2 focus-visible:ring-primary/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Mobile Menu Content */}
            <div className="flex h-[calc(100vh-4rem)] flex-col overflow-y-auto px-6 py-6">
              <nav className="space-y-1" aria-label="Mobile navigation">
                {!session && (
                  <>
                    <Link
                      href="/"
                      className={cn(
                        "block rounded-lg px-4 py-3 text-base font-medium transition-all duration-200",
                        "text-text/70 hover:text-text hover:bg-background-secondary",
                        "dark:text-text-dark/70 dark:hover:text-text-dark dark:hover:bg-background-dark-secondary",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2",
                        isActive('/') && "bg-primary/5 text-primary dark:bg-primary-dark-mode/10 dark:text-primary-dark-mode"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('nav.home')}
                    </Link>
                    <Link
                      href="/about"
                      className={cn(
                        "block rounded-lg px-4 py-3 text-base font-medium transition-all duration-200",
                        "text-text/70 hover:text-text hover:bg-background-secondary",
                        "dark:text-text-dark/70 dark:hover:text-text-dark dark:hover:bg-background-dark-secondary",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2",
                        isActive('/about') && "bg-primary/5 text-primary dark:bg-primary-dark-mode/10 dark:text-primary-dark-mode"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('nav.about')}
                    </Link>
                  </>
                )}
                {session ? (
                  <>
                    <Link
                      href={`/${session.user.role.toLowerCase()}/dashboard`}
                      className={cn(
                        "block rounded-lg px-4 py-3 text-base font-medium transition-all duration-200",
                        "text-text/70 hover:text-text hover:bg-background-secondary",
                        "dark:text-text-dark/70 dark:hover:text-text-dark dark:hover:bg-background-dark-secondary",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2",
                        isActive(`/${session.user.role.toLowerCase()}/dashboard`) && "bg-primary/5 text-primary dark:bg-primary-dark-mode/10 dark:text-primary-dark-mode"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('nav.dashboard')}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full rounded-lg px-4 py-3 text-left text-base font-medium text-text/70 transition-all duration-200 hover:bg-background-secondary hover:text-text dark:text-text-dark/70 dark:hover:bg-background-dark-secondary dark:hover:text-text-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
                    >
                      {t('nav.logout')}
                    </button>
                  </>
                ) : (
                  <div className="space-y-3 pt-4">
                    <Link
                      href="/auth/login"
                      className="block w-full rounded-lg px-4 py-3 text-center text-base font-medium text-text/80 transition-all duration-200 hover:bg-background-secondary hover:text-text dark:text-text-dark/80 dark:hover:bg-background-dark-secondary dark:hover:text-text-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('nav.login')}
                    </Link>
                    <Link
                      href="/auth/register"
                      className="block w-full rounded-lg bg-primary px-4 py-3 text-center text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-dark hover:shadow-md dark:bg-primary-dark-mode dark:hover:bg-primary-dark-mode-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('nav.register')}
                    </Link>
                  </div>
                )}
              </nav>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}

