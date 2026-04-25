import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import en from '../i18n/en.json';
import ar from '../i18n/ar.json';
import de from '../i18n/de.json';

export type Language = 'en' | 'ar' | 'de';

interface LanguageContextValue {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    isRTL: boolean;
}

const translations: Record<Language, Record<string, string>> = { en, ar, de };

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>(() => {
        const stored = localStorage.getItem('admin_language');
        if (stored === 'ar' || stored === 'en' || stored === 'de') return stored;
        return 'en';
    });

    useEffect(() => {
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
    }, [language]);

    const setLanguage = (lang: Language) => {
        localStorage.setItem('admin_language', lang);
        setLanguageState(lang);
    };

    const t = (key: string): string => {
        return translations[language]?.[key] || translations['en']?.[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, isRTL: language === 'ar' }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
    return ctx;
}
