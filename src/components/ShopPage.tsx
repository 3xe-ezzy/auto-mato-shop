'use client'

import { useState } from 'react'
import { useLanguage } from '@/components/LanguageContext'
import Link from 'next/link'
import { Vehicle, Image as VehicleImage } from '@prisma/client'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import Footer from '@/components/Footer'

type VehicleWithImages = Vehicle & { images: VehicleImage[] }

export default function ShopPage({ vehicles }: { vehicles: VehicleWithImages[] }) {
    const { t, language } = useLanguage()
    const [showMoreFilters, setShowMoreFilters] = useState(false)
    const [filters, setFilters] = useState({
        year: '',
        transmission: '',
        priceMax: '',
        fuelType: '',
        make: '',
        model: '',
        mileageMax: ''
    })

    const filteredVehicles = vehicles.filter(vehicle => {
        if (filters.year && vehicle.year.toString() !== filters.year) return false
        if (filters.transmission && vehicle.transmission?.toLowerCase() !== filters.transmission.toLowerCase()) return false
        if (filters.priceMax && vehicle.price > Number(filters.priceMax)) return false
        if (filters.fuelType && vehicle.fuelType?.toLowerCase() !== filters.fuelType.toLowerCase()) return false
        if (filters.make && vehicle.make.toLowerCase() !== filters.make.toLowerCase()) return false
        if (filters.model && vehicle.model.toLowerCase() !== filters.model.toLowerCase()) return false
        if (filters.mileageMax && vehicle.mileage > Number(filters.mileageMax)) return false
        return true
    })

    const uniqueYears = Array.from(new Set(vehicles.map(v => v.year))).sort((a, b) => b - a)
    const uniqueTransmissions = Array.from(new Set(vehicles.map(v => v.transmission).filter(Boolean))) as string[]
    const uniqueFuelTypes = Array.from(new Set(vehicles.map(v => v.fuelType).filter(Boolean))) as string[]
    const uniqueMakes = Array.from(new Set(vehicles.map(v => v.make))).sort()
    const uniqueModels = Array.from(new Set(vehicles.filter(v => !filters.make || v.make === filters.make).map(v => v.model))).sort()

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-black/90 backdrop-blur-md border-b border-white/10 shadow-lg sticky top-0 z-50 transition-all">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <img src="/logo.png" alt="Logo" className="h-12 sm:h-16 w-auto object-contain" />
                        <h1 className="text-xl sm:text-2xl font-bold text-white hidden sm:block tracking-tight">Mato-Automobile</h1>
                    </Link>
                    <div className="flex items-center space-x-4 sm:space-x-6 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                        <Link href="/" className="text-gray-300 hover:text-white transition-colors uppercase text-[10px] sm:text-sm font-semibold tracking-wider font-montserrat">Startseite</Link>
                        <LanguageSwitcher />
                        <Link href="/admin" className="text-blue-400 hover:text-blue-300 transition-colors uppercase text-[10px] sm:text-sm font-semibold tracking-wider font-montserrat">{t.nav.login}</Link>
                    </div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 flex-grow">
                <div className="px-4 py-6 sm:px-0">

                    {/* Search Filters */}
                    <div className="mb-8 p-6 bg-gray-900 rounded-lg shadow text-white">
                        <h2 className="text-lg font-medium mb-4 text-white">{t.nav.shop} - Filter</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">{t.vehicle.year}</label>
                                <select
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                                    value={filters.year}
                                    onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                                >
                                    <option value="">All</option>
                                    {uniqueYears.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">{t.vehicle.transmission}</label>
                                <select
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                                    value={filters.transmission}
                                    onChange={(e) => setFilters({ ...filters, transmission: e.target.value })}
                                >
                                    <option value="">All</option>
                                    {uniqueTransmissions.map(trans => (
                                        <option key={trans} value={trans}>
                                            {t.values[trans.toLowerCase() as keyof typeof t.values] || trans}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">{t.vehicle.fuelType}</label>
                                <select
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                                    value={filters.fuelType}
                                    onChange={(e) => setFilters({ ...filters, fuelType: e.target.value })}
                                >
                                    <option value="">All</option>
                                    {uniqueFuelTypes.map(fuel => (
                                        <option key={fuel} value={fuel}>
                                            {t.values[fuel.toLowerCase() as keyof typeof t.values] || fuel}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">{t.vehicle.price} (Max)</label>
                                <input
                                    type="number"
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                                    value={filters.priceMax}
                                    onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
                                    placeholder="Max Price"
                                />
                            </div>
                        </div>

                        {/* More Filters Button */}
                        <div className="mt-4 flex justify-center">
                            <button
                                onClick={() => setShowMoreFilters(!showMoreFilters)}
                                className="text-sm text-blue-400 hover:text-blue-300 flex items-center focus:outline-none"
                            >
                                {showMoreFilters ? 'Weniger Filter' : 'Mehr Filter'}
                                <svg className={`ml-1 h-4 w-4 transform transition-transform ${showMoreFilters ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>

                        {/* Additional Filters */}
                        {showMoreFilters && (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-700 pt-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">{t.vehicle.make}</label>
                                    <select
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                                        value={filters.make}
                                        onChange={(e) => setFilters({ ...filters, make: e.target.value, model: '' })}
                                    >
                                        <option value="">All</option>
                                        {uniqueMakes.map(make => (
                                            <option key={make} value={make}>{make}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">{t.vehicle.model}</label>
                                    <select
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                                        value={filters.model}
                                        onChange={(e) => setFilters({ ...filters, model: e.target.value })}
                                    >
                                        <option value="">All</option>
                                        {uniqueModels.map(model => (
                                            <option key={model} value={model}>{model}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">{t.vehicle.mileage} (Max)</label>
                                    <input
                                        type="number"
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                                        value={filters.mileageMax}
                                        onChange={(e) => setFilters({ ...filters, mileageMax: e.target.value })}
                                        placeholder="Max Mileage"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mb-8 p-4 bg-white rounded-lg shadow hidden">
                        <h2 className="text-lg font-medium mb-2">Export Feeds</h2>
                        <div className="flex gap-4">
                            <a href="/api/feed/mobile-de" target="_blank" className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">
                                {t.actions.downloadMobile}
                            </a>
                            <a href="/api/feed/autoscout24" target="_blank" className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                                {t.actions.downloadAutoscout}
                            </a>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {filteredVehicles
                            .sort((a, b) => (b.syncAutoScout24 ? 1 : 0) - (a.syncAutoScout24 ? 1 : 0))
                            .map((vehicle) => {
                                const isFeatured = vehicle.syncAutoScout24;
                                return (
                                    <Link 
                                        href={`/vehicles/${vehicle.id}`} 
                                        key={vehicle.id} 
                                        className={`group bg-white overflow-hidden shadow-sm rounded-2xl hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col ${
                                            isFeatured ? 'md:col-span-2 lg:col-span-2' : 'col-span-1'
                                        }`}
                                    >
                                        <div className={`relative w-full bg-gray-200 overflow-hidden ${isFeatured ? 'h-96' : 'h-64'}`}>
                                            {vehicle.images[0] ? (
                                                <img
                                                    src={vehicle.images[0].url}
                                                    alt={`${vehicle.make} ${vehicle.model}`}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-400">{t.messages.noImages}</div>
                                            )}
                                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                                <div className="bg-blue-600 text-white px-3 py-1 text-sm font-bold rounded-full shadow-lg">
                                                    {vehicle.price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                                                </div>
                                                {isFeatured && (
                                                    <div className="bg-blue-600 text-white px-3 py-1 text-xs font-black uppercase tracking-widest rounded-full shadow-lg animate-pulse">
                                                        Top Angebot
                                                    </div>
                                                )}
                                            </div>
                                            {vehicle.images.length > 0 && (
                                                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 text-xs font-bold rounded-full shadow-lg flex items-center gap-1.5">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    {vehicle.images.length}
                                                </div>
                                            )}
                                        </div>
                                        <div className={`p-6 flex flex-col flex-grow ${isFeatured ? 'space-y-4' : 'space-y-2'}`}>
                                            <h3 className={`font-bold text-blue-600 group-hover:text-blue-700 transition-colors uppercase tracking-tight ${isFeatured ? 'text-2xl' : 'text-lg'}`}>
                                                {vehicle.make} {vehicle.model}
                                            </h3>
                                            
                                            <div className="flex justify-between items-center text-sm font-medium text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <span className="bg-gray-100 px-2 py-1 rounded text-gray-700">{vehicle.year}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="bg-gray-100 px-2 py-1 rounded text-gray-700">{vehicle.mileage.toLocaleString('de-DE')} km</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-gray-400 uppercase tracking-widest">
                                                <span>{t.values[vehicle.fuelType?.toLowerCase() as keyof typeof t.values] || vehicle.fuelType}</span>
                                                <span className="text-right">{t.values[vehicle.transmission?.toLowerCase() as keyof typeof t.values] || vehicle.transmission}</span>
                                            </div>

                                            <div className="pt-4 mt-auto border-t border-gray-50 flex justify-between items-center">
                                                <span className="text-blue-600 font-bold text-sm group-hover:translate-x-1 transition-transform inline-flex items-center gap-2">
                                                    {t.actions.details} <span className="text-lg">→</span>
                                                </span>
                                                {vehicle.articleNumber && (
                                                    <span className="text-[10px] text-gray-300">#{vehicle.articleNumber}</span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
