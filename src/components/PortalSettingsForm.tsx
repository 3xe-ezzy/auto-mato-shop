'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/components/LanguageContext'
import { updatePortalSettings } from '@/app/actions/portal-actions'

interface PortalSettingsFormProps {
    portalName: string
    initialData: {
        customerNumber?: string | null
        apiKey?: string | null
        apiSecret?: string | null
        isActive: boolean
    }
}

export default function PortalSettingsForm({ portalName, initialData }: PortalSettingsFormProps) {
    const { t } = useLanguage()
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [origin, setOrigin] = useState('')

    useEffect(() => {
        setOrigin(window.location.origin)
    }, [])

    const feedUrl = `${origin}/api/feed/${portalName.toLowerCase().replace('.', '-')}`

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setMessage('')
        
        formData.append('portalName', portalName)
        const result = await updatePortalSettings(formData)
        
        if (result.success) {
            setMessage(t.portals.saveSuccess)
        } else {
            setMessage('Error updating settings.')
        }
        setLoading(false)
    }

    return (
        <div className="bg-white shadow rounded-lg p-6 mb-8 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">{portalName}</h3>
                <div className="flex items-center">
                    <span className={`h-3 w-3 rounded-full mr-2 ${initialData.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    <span className="text-sm font-medium text-gray-600">
                        {initialData.isActive ? t.portals.active : 'Inactive'}
                    </span>
                </div>
            </div>

            <form action={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t.portals.dealerId || 'Händlernummer / Client ID'}</label>
                    <input
                        type="text"
                        name="customerNumber"
                        defaultValue={initialData.customerNumber || ''}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="e.g. 12345678"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">API Key / Benutzername</label>
                    <input
                        type="text"
                        name="apiKey"
                        defaultValue={initialData.apiKey || ''}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="API Key or Username"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">API Secret / Passwort</label>
                    <input
                        type="password"
                        name="apiSecret"
                        defaultValue={initialData.apiSecret || ''}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="API Secret or Password"
                    />
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        name="isActive"
                        id={`isActive-${portalName}`}
                        defaultChecked={initialData.isActive}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`isActive-${portalName}`} className="ml-2 block text-sm text-gray-900">
                        {t.portals.active}
                    </label>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                    >
                        {loading ? '...' : t.actions.save}
                    </button>
                </div>

                {message && (
                    <p className={`mt-2 text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                        {message}
                    </p>
                )}
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-500 italic">
                    Geben Sie hier Ihre API-Zugangsdaten ein. Sobald diese hinterlegt sind und der Status auf "Aktiv" gesetzt wurde, wird das System Fahrzeuge aktiv zu diesem Portal übertragen (Push-API).
                </p>
            </div>
        </div>
    )
}
