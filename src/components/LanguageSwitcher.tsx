'use client'

import { useLanguage } from '@/components/LanguageContext'

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage()

    return (
        <div className="flex items-center space-x-2">
            <button
                onClick={() => setLanguage('de')}
                className={`hover:scale-110 transition-transform ${language === 'de' ? 'opacity-100' : 'opacity-60 hover:opacity-100'
                    }`}
                title="Deutsch"
            >
                <img src="/flag-de.png" alt="Deutsch" className="w-6 h-6 object-cover rounded border border-gray-400" />
            </button>
            <button
                onClick={() => setLanguage('en')}
                className={`hover:scale-110 transition-transform ${language === 'en' ? 'opacity-100' : 'opacity-60 hover:opacity-100'
                    }`}
                title="English"
            >
                <img src="/flag-en.png" alt="English" className="w-6 h-6 object-cover rounded border border-gray-400" />
            </button>
        </div>
    )
}
