'use client'

import { useState } from 'react'
import { useLanguage } from '@/components/LanguageContext'
import Link from 'next/link'
import { Vehicle, Image, VehicleListing } from '@prisma/client'
import DeleteVehicleButton from '@/components/DeleteVehicleButton'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import ManualSyncButton from '@/components/ManualSyncButton'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

type VehicleWithImages = Vehicle & { images: Image[], vin?: string | null, VehicleListing?: VehicleListing[] }

export default function AdminDashboard({ vehicles }: { vehicles: VehicleWithImages[] }) {
    const { t } = useLanguage()
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    const filteredVehicles = vehicles.filter(vehicle =>
        (vehicle.articleNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Calculate pagination
    const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedVehicles = filteredVehicles.slice(startIndex, endIndex)

    // Reset to page 1 when search changes
    const handleSearchChange = (value: string) => {
        setSearchTerm(value)
        setCurrentPage(1)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">{t.messages.adminTitle}</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        {t.messages.adminSubtitle} <span className="ml-2 font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs border border-blue-200">Build: v1.0.9 (Gross Price Structure)</span>
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <LanguageSwitcher />
                    <div className="flex gap-2">
                        <a
                            href="/api/feed/mobile-de"
                            target="_blank"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {t.actions.downloadMobile}
                        </a>
                        <a
                            href="/api/feed/autoscout24"
                            target="_blank"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {t.actions.downloadAutoscout}
                        </a>
                        <ManualSyncButton />
                    </div>
                    <Link
                        href="/admin/vehicles/new"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        {t.actions.addVehicle}
                    </Link>
                </div>
            </div>

            <div className="max-w-md">
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative rounded-md shadow-sm">
                    <input
                        type="text"
                        name="search"
                        id="search"
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 pr-12 sm:text-sm border-gray-300 rounded-md py-2 border text-black"
                        placeholder="Suche nach Artikelnummer, Marke oder Modell..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Image
                                        </th>

                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t.vehicle.make} / {t.vehicle.model}
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t.vehicle.price}
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t.vehicle.status}
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Portale
                                        </th>
                                        <th scope="col" className="relative px-6 py-3">
                                            <span className="sr-only">{t.actions.edit}</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedVehicles.map((vehicle) => (
                                        <tr key={vehicle.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Link href={`/admin/vehicles/${vehicle.id}`} className="block h-16 w-16 flex-shrink-0">
                                                    {vehicle.images[0] ? (
                                                        <img className="h-16 w-16 rounded-full object-cover" src={vehicle.images[0].url} alt="" />
                                                    ) : (
                                                        <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-xs">No Img</div>
                                                    )}
                                                </Link>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold">
                                                    <Link href={`/admin/vehicles/${vehicle.id}`} className="text-blue-600 hover:text-blue-800">
                                                        {vehicle.make} {vehicle.model}
                                                    </Link>
                                                </div>
                                                <div className="text-sm">
                                                    <Link href={`/admin/vehicles/${vehicle.id}`} className="font-normal text-gray-900 hover:text-blue-600 hover:underline">
                                                        {t.vehicle.articleNumber}: {vehicle.articleNumber || '-'}
                                                    </Link>
                                                </div>
                                                <div className="text-sm text-gray-500">{vehicle.year} • {vehicle.mileage.toLocaleString()} km</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {vehicle.price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${vehicle.status === 'Available' ? 'bg-green-100 text-green-800' :
                                                    vehicle.status === 'Sold' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {t.values[vehicle.status.toLowerCase() as keyof typeof t.values] || vehicle.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col gap-1 items-start">
                                                    {vehicle.syncEbay || vehicle.VehicleListing?.some(l => l.portalName === 'eBay') ? (
                                                        <PortalBadge vehicle={vehicle} portalName="eBay" isSyncEnabled={vehicle.syncEbay} />
                                                    ) : null}
                                                    {vehicle.syncMobileDe || vehicle.VehicleListing?.some(l => l.portalName === 'Mobile.de') ? (
                                                        <PortalBadge vehicle={vehicle} portalName="Mobile.de" isSyncEnabled={vehicle.syncMobileDe} />
                                                    ) : null}
                                                    {vehicle.syncAutoScout24 || vehicle.VehicleListing?.some(l => l.portalName === 'AutoScout24') ? (
                                                        <PortalBadge vehicle={vehicle} portalName="AutoScout24" isSyncEnabled={vehicle.syncAutoScout24} />
                                                    ) : null}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                                <Link href={`/admin/vehicles/${vehicle.id}`} className="text-blue-600 hover:text-blue-900" title="Bearbeiten">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </Link>
                                                <DeleteVehicleButton id={vehicle.id} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Zurück
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Weiter
                                    </button>
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Zeige <span className="font-medium">{startIndex + 1}</span> bis <span className="font-medium">{Math.min(endIndex, filteredVehicles.length)}</span> von{' '}
                                            <span className="font-medium">{filteredVehicles.length}</span> Ergebnissen
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-blue-600 bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <span className="sr-only">Vorherige</span>
                                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                                Seite {currentPage} von {totalPages}
                                            </span>
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-blue-600 bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <span className="sr-only">Nächste</span>
                                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* AutoScout24 External View */}
            <div className="mt-12 bg-white shadow sm:rounded-lg overflow-hidden border border-gray-200">
                <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center gap-2">
                        <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                        </svg>
                        AutoScout24 Live Ansicht
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Dies zeigt Ihre aktuellen Inserate direkt von AutoScout24.
                    </p>
                </div>
                <div className="bg-white p-0">
                    <iframe 
                        src="https://www.autoscout24.de/haendler/embedded-list/ahmed-abdalla-firma-mato?preview=false" 
                        scrolling="auto" 
                        className="w-full border-none shadow-inner"
                        style={{ height: '1024px' }}
                    >
                        Ihr Browser unterstützt keine iframes
                    </iframe>
                </div>
            </div>
        </div>
    )
}

function PortalBadge({ vehicle, portalName, isSyncEnabled }: { vehicle: VehicleWithImages, portalName: string, isSyncEnabled: boolean }) {
    const listing = vehicle.VehicleListing?.find(l => l.portalName === portalName)
    
    if (listing) {
        if (listing.status === 'PUBLISHED') {
            return (
                <div className="flex items-center gap-2" title="Publiziert">
                    <span className="text-[14px]">✅</span>
                    <span className="text-xs font-medium text-gray-700">{portalName}</span>
                </div>
            )
        }
        if (listing.status === 'FAILED') {
            return (
                <div className="flex items-center gap-2" title={listing.errorMessage || 'Fehler beim Publizieren'}>
                    <span className="text-[14px]">❌</span>
                    <span className="text-xs font-medium text-gray-700">{portalName}</span>
                </div>
            )
        }
        if (listing.status === 'PENDING') {
            return (
                <div className="flex items-center gap-2" title="Wird verarbeitet">
                    <span className="text-[14px]">⏳</span>
                    <span className="text-xs font-medium text-gray-700">{portalName}</span>
                </div>
            )
        }
    }
    
    if (isSyncEnabled) {
        return (
            <div className="flex items-center gap-2" title="Bereit für die Publizierung">
                <span className="text-[14px]">⏳</span>
                <span className="text-xs font-medium text-gray-700">{portalName}</span>
            </div>
        )
    }
    
    return null;
}
