import React, { createContext, useContext, useState, useEffect } from 'react';

const SUPPORTED_LANGUAGES = ['en-US', 'zh-CN'];

const DEFAULT_LANGUAGE = 'en-US';

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('language');
    
    if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage)) {
      return savedLanguage;
    }
    
    const browserLang = navigator.language;
    
    const matchedLang = SUPPORTED_LANGUAGES.find(lang => 
      lang === browserLang || lang.split('-')[0] === browserLang.split('-')[0]
    );
    
    return matchedLang || DEFAULT_LANGUAGE;
  });

  useEffect(() => {
    if (SUPPORTED_LANGUAGES.includes(language)) {
      localStorage.setItem('language', language);
    } else {
      setLanguage(DEFAULT_LANGUAGE);
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 