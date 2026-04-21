'use client'

import { useState } from 'react'
import { manualSyncAllVehicles } from '@/app/actions/portal-actions'
import { useLanguage } from './LanguageContext'

export default function ManualSyncButton() {
    const { t } = useLanguage()
    const [isSyncing, setIsSyncing] = useState(false)
    const [progress, setProgress] = useState(0)
    const [result, setResult] = useState<{ successCount: number, errorCount: number } | null>(null)

    const handleSync = async () => {
        setIsSyncing(true)
        setProgress(10)
        setResult(null)

        // Artificial progress steps to give the user a "running" feeling
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) return prev
                return prev + 5
            })
        }, 1500)

        try {
            const data = await manualSyncAllVehicles()
            clearInterval(interval)
            setProgress(100)
            
            if (data.success) {
                setResult({ 
                    successCount: data.successCount || 0, 
                    errorCount: data.errorCount || 0 
                })
            }
        } catch (error) {
            console.error('Sync failed:', error)
            clearInterval(interval)
        } finally {
            setTimeout(() => {
                setIsSyncing(false)
                setProgress(0)
            }, 3000)
        }
    }

    return (
        <div className="flex flex-col items-end gap-2">
            <button
                onClick={handleSync}
                disabled={isSyncing}
                className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white transition-all duration-300 ${
                    isSyncing 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-orange-600 hover:bg-orange-700 active:scale-95'
                }`}
            >
                {isSyncing ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t.portals.syncing}
                    </>
                ) : (
                    <>
                        <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {t.portals.manualSync}
                    </>
                )}
            </button>

            {isSyncing && (
                <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-orange-500 transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {result && !isSyncing && (
                <div className="text-xs font-medium animate-fade-in text-right">
                    <span className="text-green-600">{t.portals.syncSuccess}</span>
                    <div className="text-gray-500">
                        {result.successCount} ✅ | {result.errorCount} ❌
                    </div>
                </div>
            )}
        </div>
    )
}
