'use client';

import { useTranslation } from '@/lib/i18n';
import { Button } from './ui/button';
import { Globe } from 'lucide-react';

export function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      aria-label={`Switch to ${i18n.language === 'en' ? 'Hindi' : 'English'}`}
      className="gap-2"
    >
      <Globe className="h-4 w-4" />
      <span>{i18n.language === 'en' ? 'HI' : 'EN'}</span>
    </Button>
  );
}

