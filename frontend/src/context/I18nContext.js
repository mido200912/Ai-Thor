import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const I18nContext = createContext();

const translations = {
  ar: {
    home: 'الرئيسية',
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    dashboard: 'لوحة التحكم',
    startNow: 'ابدأ الآن',
    language: 'اللغة',
    theme: 'المظهر',
    dark: 'داكن',
    light: 'فاتح',
  },
  en: {
    home: 'Home',
    login: 'Sign In',
    register: 'Sign Up',
    dashboard: 'Dashboard',
    startNow: 'Get Started',
    language: 'Language',
    theme: 'Theme',
    dark: 'Dark',
    light: 'Light',
  }
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
};

export const I18nProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'ar');

  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const t = (key) => translations[lang]?.[key] || key;
  const switchLang = () => setLang(prev => (prev === 'ar' ? 'en' : 'ar'));

  const value = useMemo(() => ({ lang, t, setLang, switchLang }), [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};
