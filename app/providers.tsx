'use client';

import { useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize language from localStorage
    const storedLang = localStorage.getItem('careconnect-language');
    if (storedLang === 'en' || storedLang === 'hi') {
      i18n.changeLanguage(storedLang);
      document.documentElement.lang = storedLang;
    }
  }, []);

  return (
    <SessionProvider 
      refetchInterval={0}
      refetchOnWindowFocus={false}
      basePath={process.env.NEXT_PUBLIC_BASE_PATH || undefined}
    >
      <I18nextProvider i18n={i18n}>
        {children}
      </I18nextProvider>
    </SessionProvider>
  );
}

