import { useLanguage } from '../contexts/LanguageContext';
import type { Language } from '../contexts/LanguageContext';

const langs: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: 'EN' },
    { code: 'ar', label: 'العربية', flag: 'AR' },
    { code: 'de', label: 'Deutsch', flag: 'DE' },
];

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="flex items-center gap-1">
            {langs.map((l) => (
                <button
                    key={l.code}
                    onClick={() => setLanguage(l.code)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        language === l.code
                            ? 'bg-amber-500 text-black'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                    }`}
                >
                    {l.flag}
                </button>
            ))}
        </div>
    );
}
