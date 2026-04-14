'use client'

import { useLanguage } from '@/components/LanguageContext'
import Link from 'next/link'
import { Vehicle, Image as VehicleImage, Equipment } from '@prisma/client'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import Footer from '@/components/Footer'
import { useState } from 'react'

type VehicleWithRelations = Vehicle & {
    images: VehicleImage[]
    equipment: Equipment[]
}

export default function VehicleDetails({ vehicle }: { vehicle: VehicleWithRelations }) {
    const { t, language } = useLanguage()
    const [mainImage, setMainImage] = useState(vehicle.images[0]?.url || null)

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-black shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                        <img src="/logo.png" alt="Logo" className="h-24 w-auto object-contain" />
                        <h1 className="text-3xl font-bold text-white">Mato-Automobile</h1>
                    </Link>
                    <div className="flex items-center space-x-4">
                        <LanguageSwitcher />
                        <Link href="/admin" className="text-blue-400 hover:text-blue-300">{t.nav.login}</Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 flex-grow w-full">
                <div className="px-4 py-6 sm:px-0">
                    <div className="mb-6">
                        <Link href="/" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            &larr; {t.nav.shop}
                        </Link>
                    </div>

                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    {vehicle.make} {vehicle.model}
                                </h3>
                                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                    {vehicle.year} • {vehicle.mileage.toLocaleString('de-DE')} km
                                    {vehicle.articleNumber && (
                                        <span className="ml-4 text-gray-400">Ref: {vehicle.articleNumber}</span>
                                    )}
                                </p>
                            </div>
                            <div className="text-2xl font-bold text-green-600">
                                {vehicle.price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                            </div>
                        </div>

                        {/* Image Gallery */}
                        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden mb-4 h-[650px] relative group">
                                        {mainImage ? (
                                            <>
                                                <img
                                                    src={mainImage}
                                                    alt={`${vehicle.make} ${vehicle.model}`}
                                                    className="w-full h-full object-contain bg-black"
                                                />
                                                {vehicle.images.length > 1 && (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                const currentIndex = vehicle.images.findIndex(img => img.url === mainImage)
                                                                const prevIndex = (currentIndex - 1 + vehicle.images.length) % vehicle.images.length
                                                                setMainImage(vehicle.images[prevIndex].url)
                                                            }}
                                                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors focus:outline-none"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                const currentIndex = vehicle.images.findIndex(img => img.url === mainImage)
                                                                const nextIndex = (currentIndex + 1) % vehicle.images.length
                                                                setMainImage(vehicle.images[nextIndex].url)
                                                            }}
                                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors focus:outline-none"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </button>
                                                    </>
                                                )}
                                            </>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400">
                                                {t.messages.noImages}
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                        {vehicle.images.map((img) => (
                                            <button
                                                key={img.id}
                                                onClick={() => setMainImage(img.url)}
                                                className={`relative h-20 bg-gray-100 rounded overflow-hidden ${mainImage === img.url ? 'ring-2 ring-indigo-500' : ''}`}
                                            >
                                                <img src={img.url} alt="Thumbnail" className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-start">
                                        <svg className="w-10 h-10 mr-2 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <div>
                                            <h4 className="text-base font-semibold text-gray-700 mt-2">
                                                {t.vehicle.description}
                                            </h4>
                                            <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                                                {language === 'en' && (vehicle as any).descriptionEn ? (vehicle as any).descriptionEn : vehicle.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-start">
                                            <svg className="w-8 h-8 mr-2 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-700 mt-1.5">
                                                    {t.vehicle.fuelType}
                                                </h4>
                                                <p className="mt-1 text-sm text-gray-900">
                                                    {t.values[vehicle.fuelType?.toLowerCase() as keyof typeof t.values] || vehicle.fuelType}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <svg className="w-8 h-8 mr-2 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-700 mt-1.5">
                                                    {t.vehicle.transmission}
                                                </h4>
                                                <p className="mt-1 text-sm text-gray-900">
                                                    {t.values[vehicle.transmission?.toLowerCase() as keyof typeof t.values] || vehicle.transmission}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <svg className="w-8 h-8 mr-2 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-700 mt-1.5">
                                                    {t.vehicle.condition}
                                                </h4>
                                                <p className="mt-1 text-sm text-gray-900">
                                                    {t.values[vehicle.condition?.toLowerCase() as keyof typeof t.values] || vehicle.condition}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <svg className="w-8 h-8 mr-2 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-700 mt-1.5">
                                                    {t.vehicle.status}
                                                </h4>
                                                <p className="mt-1 text-sm text-gray-900">
                                                    {t.values[vehicle.status?.toLowerCase() as keyof typeof t.values] || vehicle.status}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <svg className="w-8 h-8 mr-2 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                            </svg>
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-700 mt-1.5">
                                                    {t.vehicle.articleNumber}
                                                </h4>
                                                <p className="mt-1 text-sm text-gray-900">
                                                    {vehicle.articleNumber || '-'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {vehicle.equipment.length > 0 && (
                                        <div className="flex items-start">
                                            <svg className="w-10 h-10 mr-2 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                            </svg>
                                            <div className="flex-1">
                                                <h4 className="text-base font-semibold text-gray-700 mb-3 mt-2">
                                                    {t.vehicle.equipment}
                                                </h4>
                                                <ul className="space-y-2 list-none pl-0">
                                                    {vehicle.equipment.map((eq) => {
                                                        // Split equipment items that might be comma or bullet separated
                                                        const items = eq.name.split(/[•,]/).filter(item => item.trim())
                                                        return items.map((item, idx) => (
                                                            <li key={`${eq.id}-${idx}`} className="flex items-start text-sm text-gray-900">
                                                                <span className="text-blue-600 mr-2 flex-shrink-0">•</span>
                                                                <span className="flex-1">{item.trim()}</span>
                                                            </li>
                                                        ))
                                                    })}
                                                </ul>
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-6">
                                        <Link
                                            href={`/contact?ref=${vehicle.articleNumber || ''}`}
                                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            {t.contact.title}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
