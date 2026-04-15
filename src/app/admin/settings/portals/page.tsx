import { getPortalSettings } from '@/app/actions/portal-actions'
import PortalSettingsForm from '@/components/PortalSettingsForm'
import Link from 'next/link'

export default async function PortalsSettingsPage() {
    const as24Settings = await getPortalSettings('AutoScout24') || { customerNumber: '', apiKey: '', apiSecret: '', isActive: false }
    const mobileSettings = await getPortalSettings('Mobile.de') || { customerNumber: '', apiKey: '', apiSecret: '', isActive: false }
    const ebaySettings = await getPortalSettings('eBay') || { customerNumber: '', apiKey: '', apiSecret: '', isActive: false }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Portal Anbindungen</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Verwalten Sie hier die Synchronisation Ihrer Fahrzeuge mit Verkaufsportalen.
                    </p>
                </div>
                <Link 
                    href="/admin" 
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                    Zurück zum Dashboard
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <PortalSettingsForm 
                    portalName="AutoScout24" 
                    initialData={{
                        customerNumber: as24Settings.customerNumber,
                        apiKey: as24Settings.apiKey,
                        apiSecret: as24Settings.apiSecret,
                        isActive: as24Settings.isActive
                    }}
                />
                
                <PortalSettingsForm 
                    portalName="Mobile.de" 
                    initialData={{
                        customerNumber: mobileSettings.customerNumber,
                        apiKey: mobileSettings.apiKey,
                        apiSecret: mobileSettings.apiSecret,
                        isActive: mobileSettings.isActive
                    }}
                />

                <PortalSettingsForm 
                    portalName="eBay" 
                    initialData={{
                        customerNumber: ebaySettings.customerNumber,
                        apiKey: ebaySettings.apiKey,
                        apiSecret: ebaySettings.apiSecret,
                        isActive: ebaySettings.isActive
                    }}
                />
            </div>
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-blue-700 font-medium">
                            Hinweis zur API-Anbindung (DMS)
                        </p>
                        <p className="text-sm text-blue-600 mt-1">
                            Sobald Sie die API-Zugangsdaten (Key/Secret) Ihrer Portale in den jeweiligen Formularfeldern oben hinterlegt und auf "Aktiv" gesetzt haben, pusht unser System die Fahrzeuge via Direkt-Schnittstelle (Push) automatisch hinauf.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
