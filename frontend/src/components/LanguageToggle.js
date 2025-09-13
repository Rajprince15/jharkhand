import React from 'react';
import { Button } from './ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import { Globe } from 'lucide-react';

const LanguageToggle = ({ className = "", variant = "ghost" }) => {
  const { language, toggleLanguage } = useLanguage();
  const { t } = useTranslation();
  
  return (
    <Button
      variant={variant}
      size="sm"
      onClick={toggleLanguage}
      className={`flex items-center space-x-2 ${className}`}
      title="Switch Language"
    >
      <Globe className="h-4 w-4" />
      <span className="text-sm font-medium">
        {language === 'en' ? t('switchToHindi') : t('switchToEnglish')}
      </span>
    </Button>
  );
};

export default LanguageToggle;