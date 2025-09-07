import { useTheme } from '../contexts/ThemeContext';
import { translations, TranslationKey } from '../lib/translations';

export const useTranslation = () => {
  const { language } = useTheme();
  
  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  };
  
  return { t, language };
};