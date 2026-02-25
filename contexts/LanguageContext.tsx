import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { I18nManager, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from '../constants/i18n/en.json';
import ar from '../constants/i18n/ar.json';

type Language = 'en' | 'ar';

interface LanguageContextValue {
    language: Language;
    setLanguage: (lang: Language) => Promise<void>;
    t: (key: string) => string;
    isRTL: boolean;
}

const translations: Record<Language, any> = { en, ar };

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');

    useEffect(() => {
        (async () => {
            const stored = await AsyncStorage.getItem('user_language');
            if (stored === 'ar' || stored === 'en') {
                setLanguageState(stored as Language);
            }
        })();
    }, []);

    const setLanguage = async (lang: Language) => {
        await AsyncStorage.setItem('user_language', lang);
        setLanguageState(lang);

        const isRTL = lang === 'ar';
        if (I18nManager.isRTL !== isRTL) {
            I18nManager.allowRTL(isRTL);
            I18nManager.forceRTL(isRTL);
            // Reload the app to apply RTL changes
            if (Platform.OS === 'web') {
                window.location.reload();
            } else {
                // Skip expo-updates for now if not available
                // In a production app, we would want expo-updates installed
                console.warn('RTL change requires app restart');
            }
        }
    };

    const t = (key: string) => {
        return translations[language][key] || key;
    };

    const value = {
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
