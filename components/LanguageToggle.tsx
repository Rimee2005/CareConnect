'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Button } from './ui/button';
import { Globe } from 'lucide-react';

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');

  useEffect(() => {
    setMounted(true);
    setCurrentLang(i18n.language);
  }, [i18n.language]);

  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setCurrentLang(lng);
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const toggleLanguage = () => {
    const newLang = currentLang === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
    // Update HTML lang attribute
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLang;
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        aria-label="Toggle language"
        disabled
      >
        <Globe className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      aria-label={`Switch to ${currentLang === 'en' ? 'Hindi' : 'English'}`}
      title={`Switch to ${currentLang === 'en' ? 'Hindi' : 'English'}`}
      className="h-9 w-9"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleLanguage();
        }
      }}
    >
      <Globe className="h-4 w-4" />
    </Button>
  );
}

