'use client'

import { useLanguage } from '@/components/LanguageContext'
import Link from 'next/link'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import Footer from '@/components/Footer'
import { 
    CheckCircle, 
    Truck, 
    Users, 
    ShieldCheck, 
    Phone, 
    Mail, 
    MapPin,
    ArrowRight
} from 'lucide-react'

export default function AboutPage() {
    const { t } = useLanguage()

    return (
        <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
            {/* Background Watermark */}
            <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center opacity-[0.03] select-none">
                <img 
                    src="/logo.png" 
                    alt="" 
                    className="w-[150%] max-w-none transform -rotate-[45deg]"
                />
            </div>

            {/* Header */}
            <header className="bg-black shadow sticky top-0 z-50">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-4">
                        <img src="/logo.png" alt="Logo" className="h-16 w-auto object-contain" />
                        <h1 className="text-2xl font-bold text-white hidden sm:block">Mato-Automobile</h1>
                    </Link>
                    <div className="flex items-center space-x-6">
                        <Link href="/" className="text-gray-300 hover:text-white transition-colors">{t.nav.shop}</Link>
                        <LanguageSwitcher />
                        <Link href="/admin" className="text-blue-400 hover:text-blue-300 transition-colors">{t.nav.login}</Link>
                    </div>
                </div>
            </header>

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative bg-gray-900 py-24 sm:py-32">
                    <div className="absolute inset-0 overflow-hidden opacity-30">
                        {/* A background motif or overlay could go here */}
                    </div>
                    <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
                        <h2 className="text-base font-semibold leading-7 text-blue-400 uppercase tracking-widest">
                            Mato Automobile
                        </h2>
                        <h1 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-6xl">
                            {t.about.title}
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-gray-300 max-w-2xl mx-auto">
                            {t.about.subtitle}
                        </p>
                    </div>
                </section>

                {/* Intro Section */}
                <section className="py-24 sm:py-32">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <h3 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">
                                    {t.about.intro}
                                </h3>
                                <p className="text-lg leading-8 text-gray-600 mb-8">
                                    {t.about.mission}
                                </p>
                                <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                                    <p className="text-blue-800 font-medium italic">
                                        "{t.about.goal}"
                                    </p>
                                </div>
                            </div>
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl h-96 lg:h-full min-h-[400px]">
                                <img 
                                    src="/mato_automobile_about_highlight_composite_1776182370450.png" 
                                    alt="Mato Automobile Premium Highlights" 
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Services Grid */}
                <section className="bg-gray-50 py-24 sm:py-32">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl uppercase">
                                Fahrzeug-Impressionen
                            </h2>
                            <p className="mt-4 text-lg text-gray-600">Qualität, die man sieht – von jedem Winkel.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="rounded-2xl overflow-hidden shadow-lg h-80">
                                <img src="/mato_about_car_front_view_1776184011421.png" alt="Front View" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                            </div>
                            <div className="rounded-2xl overflow-hidden shadow-lg h-80">
                                <img src="/uploads/c8ba96a1-8544-4e6a-bfbf-a448afb030d2-WhatsAppImage2025-11-25at19.48.31.jpeg" alt="Side View" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Services Grid (previous) */}
                <section className="py-24 sm:py-32">
                            {[
                                { icon: CheckCircle, text: t.about.service1 },
                                { icon: Truck, text: t.about.service2 },
                                { icon: ShieldCheck, text: t.about.service3 },
                                { icon: Users, text: t.about.service4 },
                                { icon: CheckCircle, text: t.about.service5 },
                            ].map((item, index) => (
                                <div key={index} className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="flex-shrink-0">
                                        <item.icon className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <p className="text-lg font-medium text-gray-900">
                                        {item.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Why Us Section */}
                <section className="py-24 sm:py-32">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="lg:text-center mb-20">
                            <h2 className="text-base font-semibold leading-7 text-blue-600 uppercase tracking-widest">{t.about.whyTitle}</h2>
                            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                                {t.about.whySubtitle}
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                            {[
                                { text: t.about.why1, icon: CheckCircle },
                                { text: t.about.why2, icon: CheckCircle },
                                { text: t.about.why3, icon: CheckCircle },
                                { text: t.about.why4, icon: CheckCircle },
                                { text: t.about.why5, icon: CheckCircle },
                            ].map((item, index) => (
                                <div key={index} className="text-center group">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 group-hover:bg-blue-600 transition-colors">
                                        <item.icon className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors" aria-hidden="true" />
                                    </div>
                                    <h3 className="mt-6 text-base font-semibold text-gray-900">{item.text}</h3>
                                </div>
                            ))}
                        </div>
                        <div className="mt-16 text-center text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
                            {t.about.experience}
                        </div>
                    </div>
                </section>

                {/* Promise Section */}
                <section className="bg-blue-600 py-24 sm:py-32">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-8">
                            {t.about.promiseTitle}
                        </h2>
                        <p className="text-xl leading-8 text-blue-100 max-w-3xl mx-auto">
                            {t.about.promiseText}
                        </p>
                    </div>
                </section>

                {/* Contact Section */}
                <section id="contact" className="py-24 sm:py-32">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">{t.about.contactTitle}</h2>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                                            <MapPin className="h-6 w-6" />
                                        </div>
                                        <div className="text-gray-600">
                                            <p className="font-bold text-gray-900">MATO AUTOMOBILE</p>
                                            <p>Ahmed Abdalla</p>
                                            <p>Eschborner Land Str. 137a</p>
                                            <p>60489 Frankfurt am Main</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                                            <Phone className="h-6 w-6" />
                                        </div>
                                        <div className="text-gray-600">
                                            <p>+49 69 97785893</p>
                                            <p>+49 171 1482343 (Mobil)</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                                            <Mail className="h-6 w-6" />
                                        </div>
                                        <div className="text-gray-600">
                                            <p>info@mato-mobile.de</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="h-96 rounded-2xl overflow-hidden border border-gray-200">
                                {/* Map or Image */}
                                <img 
                                    src="https://images.unsplash.com/photo-1582139329536-e7284fece509?q=80&w=2080&auto=format&fit=crop" 
                                    className="w-full h-full object-cover"
                                    alt="Frankfurt Skyline"
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
