import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { I18nManager, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from '../constants/i18n/en.json';
import ar from '../constants/i18n/ar.json';
import de from '../constants/i18n/de.json';

export type Language = 'en' | 'ar' | 'de';

interface LanguageContextValue {
    language: Language;
    setLanguage: (lang: Language) => Promise<void>;
    t: (key: string) => string;
    isRTL: boolean;
}

const translations: Record<Language, Record<string, string>> = { en, ar, de };

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');

    useEffect(() => {
        (async () => {
            const stored = await AsyncStorage.getItem('user_language');
            if (stored === 'ar' || stored === 'en' || stored === 'de') {
                setLanguageState(stored as Language);
            }
        })();
    }, []);

    const setLanguage = async (lang: Language) => {
        await AsyncStorage.setItem('user_language', lang);
        const wasRTL = language === 'ar';
        const willBeRTL = lang === 'ar';
        setLanguageState(lang);

        if (wasRTL !== willBeRTL) {
            I18nManager.allowRTL(willBeRTL);
            I18nManager.forceRTL(willBeRTL);
            if (Platform.OS === 'web') {
                window.location.reload();
            }
        }
    };

    const t = (key: string): string => {
        return (translations[language] as Record<string, string>)[key] || (translations['en'] as Record<string, string>)[key] || key;
    };

    const value: LanguageContextValue = {
        language,
        setLanguage,
        t,
        isRTL: language === 'ar',
    };

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
    return ctx;
}
