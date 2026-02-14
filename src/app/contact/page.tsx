'use client'

import { Suspense } from 'react'
import ContactForm from '@/components/ContactForm'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { useLanguage } from '@/components/LanguageContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function ContactPage() {
    const { t } = useLanguage()

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-black shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <img src="/logo.png" alt="Logo" className="h-24 w-auto object-contain" />
                        <h1 className="text-3xl font-bold text-white">Mato-Automobile</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <LanguageSwitcher />
                        <Link href="/admin" className="text-blue-400 hover:text-blue-300">{t.nav.login}</Link>
                    </div>
                </div>
            </header>
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 flex-grow w-full">
                <div className="mb-6">
                    <Link href="/" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        &larr; {t.nav.shop}
                    </Link>
                </div>
                <div className="bg-white shadow overflow-hidden sm:rounded-lg max-w-2xl mx-auto">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            {t.contact.title}
                        </h3>
                    </div>
                    <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                        <Suspense fallback={<div>Loading...</div>}>
                            <ContactForm />
                        </Suspense>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}
