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
    ArrowRight,
    Car
} from 'lucide-react'

export default function Home() {
    const { t } = useLanguage()

    return (
        <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
            {/* Background Watermark */}
            <div className="fixed inset-0 pointer-events-none z-[1] flex items-center justify-center opacity-[0.06] select-none">
                <img 
                    src="/logo.png" 
                    alt="" 
                    className="w-[120%] max-w-none transform -rotate-[45deg] filter grayscale"
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
                        <Link href="/vehicles" className="text-gray-300 hover:text-white transition-colors uppercase text-xs sm:text-sm font-semibold tracking-wider font-montserrat">{t.nav.shop}</Link>
                        <LanguageSwitcher />
                        <Link href="/admin" className="text-blue-400 hover:text-blue-300 transition-colors uppercase text-xs sm:text-sm font-semibold tracking-wider font-montserrat">{t.nav.login}</Link>
                    </div>
                </div>
            </header>

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative bg-gray-900 py-24 sm:py-32 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden opacity-30">
                        <div className="absolute -right-20 -top-20 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-20"></div>
                        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-blue-900 rounded-full blur-3xl opacity-20"></div>
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
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <Link
                                href="/vehicles"
                                className="rounded-full bg-blue-600 px-8 py-4 text-sm font-bold text-white shadow-xl hover:bg-blue-500 hover:scale-105 transform transition-all active:scale-95 flex items-center gap-2 uppercase tracking-widest"
                            >
                                <Car className="h-5 w-5" />
                                Fahrzeuge ansehen
                            </Link>
                        </div>
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
                                <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 mb-8">
                                    <p className="text-blue-800 font-medium italic">
                                        "{t.about.goal}"
                                    </p>
                                </div>
                                <Link
                                    href="/vehicles"
                                    className="inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 hover:gap-3 transition-all text-lg group uppercase tracking-wider"
                                >
                                    Direkt zu unseren Angeboten 
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                            </div>
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl h-96 lg:h-full min-h-[450px] group">
                                <Link href="/vehicles" className="block w-full h-full relative cursor-pointer">
                                    <img 
                                        src="/mato_automobile_about_highlight_composite_1776182370450.png" 
                                        alt="Mato Automobile Premium Highlights" 
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                        <div className="bg-white/90 px-6 py-3 rounded-full font-bold text-black opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-2xl">
                                            Fahrzeuge entdecken
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Fahrzeug-Impressionen */}
                <section className="bg-gray-50 py-24 sm:py-32">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl uppercase">
                                Fahrzeug-Impressionen
                            </h2>
                            <p className="mt-4 text-lg text-gray-600 italic font-medium">Klicken Sie auf ein Bild, um unseren Bestand zu sehen.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Link href="/vehicles" className="relative rounded-3xl overflow-hidden shadow-2xl h-96 group cursor-pointer">
                                <img src="/mato_about_car_front_view_1776184011421.png" alt="Front View" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                                    <span className="text-white font-bold text-xl flex items-center gap-2">
                                        Alle Fahrzeuge <ArrowRight className="h-6 w-6" />
                                    </span>
                                </div>
                            </Link>
                            <Link href="/vehicles" className="relative rounded-3xl overflow-hidden shadow-2xl h-96 group cursor-pointer">
                                <img src="/uploads/c8ba96a1-8544-4e6a-bfbf-a448afb030d2-WhatsAppImage2025-11-25at19.48.31.jpeg" alt="Side View" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                                    <span className="text-white font-bold text-xl flex items-center gap-2">
                                        Bestand ansehen <ArrowRight className="h-6 w-6" />
                                    </span>
                                </div>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Services Grid */}
                <section className="py-24 sm:py-32">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl uppercase">
                                {t.about.servicesTitle}
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                { icon: CheckCircle, text: t.about.service1 },
                                { icon: Truck, text: t.about.service2 },
                                { icon: ShieldCheck, text: t.about.service3 },
                                { icon: Users, text: t.about.service4 },
                                { icon: CheckCircle, text: t.about.service5 },
                            ].map((item, index) => (
                                <div key={index} className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
                                    <div className="flex-shrink-0">
                                        <div className="p-3 bg-blue-50 rounded-xl">
                                            <item.icon className="h-6 w-6 text-blue-600" />
                                        </div>
                                    </div>
                                    <p className="text-lg font-semibold text-gray-900 flex-grow">
                                        {item.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Why Us Section */}
                <section className="py-24 sm:py-32 bg-gray-900 text-white">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="lg:text-center mb-20 text-center">
                            <h2 className="text-base font-semibold leading-7 text-blue-400 uppercase tracking-widest">{t.about.whyTitle}</h2>
                            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
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
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-900/50 border border-blue-500/30 group-hover:bg-blue-600 transition-all duration-300">
                                        <item.icon className="h-8 w-8 text-blue-400 group-hover:text-white transition-colors" aria-hidden="true" />
                                    </div>
                                    <h3 className="mt-6 text-base font-semibold text-gray-100">{item.text}</h3>
                                </div>
                            ))}
                        </div>
                        <div className="mt-16 text-center text-lg leading-8 text-gray-400 max-w-3xl mx-auto italic">
                            {t.about.experience}
                        </div>
                    </div>
                </section>

                {/* Promise Section */}
                <section className="bg-blue-600 py-24 sm:py-32 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-8">
                            {t.about.promiseTitle}
                        </h2>
                        <p className="text-xl leading-8 text-blue-100 max-w-3xl mx-auto mb-12">
                            {t.about.promiseText}
                        </p>
                        <Link
                            href="/vehicles"
                            className="inline-flex items-center gap-2 bg-white text-blue-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 shadow-2xl transition-all"
                        >
                            Unsere Fahrzeuge entdecken
                            <ArrowRight className="h-6 w-6" />
                        </Link>
                    </div>
                </section>

                {/* Contact Section */}
                <section id="contact" className="py-24 sm:py-32">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">{t.about.contactTitle}</h2>
                                <div className="space-y-6 text-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg">
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
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg">
                                            <Phone className="h-6 w-6" />
                                        </div>
                                        <div className="text-gray-600">
                                            <p className="font-bold text-gray-900">+49 69 97785893</p>
                                            <p>+49 171 1482343 (Mobil)</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg">
                                            <Mail className="h-6 w-6" />
                                        </div>
                                        <div className="text-gray-600">
                                            <p className="font-bold text-gray-900">info@mato-mobile.de</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="h-96 rounded-3xl overflow-hidden shadow-2xl border-4 border-white grayscale hover:grayscale-0 transition-all duration-700">
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
