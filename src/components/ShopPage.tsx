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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredVehicles.map((vehicle) => (
                            <div key={vehicle.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
                                <div className="relative h-80 w-full bg-gray-200">
                                    {vehicle.images[0] ? (
                                        <img
                                            src={vehicle.images[0].url}
                                            alt={`${vehicle.make} ${vehicle.model}`}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">{t.messages.noImages}</div>
                                    )}
                                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 text-xs font-bold rounded">
                                        {vehicle.price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="text-xl font-bold text-blue-600">{vehicle.make} {vehicle.model}</h3>
                                    <div className="mt-2 text-sm text-gray-500 flex justify-between">
                                        <span>{vehicle.year}</span>
                                        <span>{vehicle.mileage.toLocaleString('de-DE')} km</span>
                                    </div>
                                    <div className="mt-2 text-sm text-gray-500 flex justify-between">
                                        {/* Translate Fuel and Transmission if possible, or just display raw if it matches key */}
                                        <span>{t.values[vehicle.fuelType?.toLowerCase() as keyof typeof t.values] || vehicle.fuelType}</span>
                                        <span>{t.values[vehicle.transmission?.toLowerCase() as keyof typeof t.values] || vehicle.transmission}</span>
                                    </div>
                                    {vehicle.articleNumber && (
                                        <div
                                            className="mt-2 text-sm font-bold text-gray-900 select-all cursor-pointer"
                                            title="Klicken zum Markieren"
                                        >
                                            Art.Nr.: {vehicle.articleNumber}
                                        </div>
                                    )}
                                    <p className="mt-2 text-gray-600 text-sm line-clamp-2">
                                        {language === 'en' && (vehicle as any).descriptionEn ? (vehicle as any).descriptionEn : vehicle.description}
                                    </p>
                                    <div className="mt-4">
                                        <Link href={`/vehicles/${vehicle.id}`} className="block w-full text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors">
                                            {t.actions.details}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
