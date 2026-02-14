'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { dictionary, Language } from '@/lib/dictionary'

type LanguageContextType = {
    language: Language
    setLanguage: (lang: Language) => void
    t: typeof dictionary['en']
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('de') // Default to German as per recent requests

    useEffect(() => {
        const storedLang = localStorage.getItem('language') as Language
        if (storedLang && (storedLang === 'en' || storedLang === 'de')) {
            setLanguage(storedLang)
        }
    }, [])

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang)
        localStorage.setItem('language', lang)
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t: dictionary[language] }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}
