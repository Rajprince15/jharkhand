import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../data/translations';

export const useTranslation = () => {
  const { language } = useLanguage();
  
  const t = (key, params = {}) => {
    const keys = key.split('.');
    let translation = translations[language];
    
    for (const k of keys) {
      if (translation && typeof translation === 'object') {
        translation = translation[k];
      } else {
        // Fallback to English if translation not found
        translation = translations.en;
        for (const fallbackKey of keys) {
          if (translation && typeof translation === 'object') {
            translation = translation[fallbackKey];
          } else {
            return key; // Return key if no translation found
          }
        }
        break;
      }
    }
    
    if (typeof translation === 'string') {
      // Replace parameters in translation string
      return translation.replace(/\{(\w+)\}/g, (match, param) => {
        return params[param] || match;
      });
    }
    
    return translation || key;
  };
  
  return { t };
};