'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { LanguageToggle } from './LanguageToggle';
import { NotificationBell } from './NotificationBell';
import { useTranslation } from '@/lib/i18n';

export function Navbar() {
  const { data: session } = useSession();
  const { t } = useTranslation();

  return (
    <nav className="border-b bg-white shadow-soft" role="navigation" aria-label="Main navigation">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-primary">
          CareConnect
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/" className="text-text hover:text-primary">
            {t('nav.home')}
          </Link>
          <Link href="/about" className="text-text hover:text-primary">
            {t('nav.about')}
          </Link>

          {session ? (
            <>
              <NotificationBell />
              <Link href={`/${session.user.role.toLowerCase()}/dashboard`}>
                <Button variant="ghost" size="sm">
                  {t('nav.dashboard')}
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
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

          <LanguageToggle />
        </div>
      </div>
    </nav>
  );
}

