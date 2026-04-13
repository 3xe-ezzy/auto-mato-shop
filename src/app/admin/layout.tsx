'use client'

import Link from 'next/link'
import { useLanguage } from '@/components/LanguageContext'
import { logout } from '@/lib/actions'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { t } = useLanguage()

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-black shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center gap-2">
                                <img src="/logo.png" alt="Logo" className="h-16 w-auto" />
                                <Link href="/" className="text-xl font-bold text-white">Mato-Automobile Admin</Link>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <Link href="/admin" className="border-blue-500 text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                    {t.nav.dashboard}
                                </Link>
                                <Link href="/admin/settings/portals" className="border-transparent text-gray-300 hover:border-gray-300 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                    {t.nav.portals}
                                </Link>
                                <Link href="/" className="border-transparent text-gray-300 hover:border-gray-300 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                    {t.nav.shop}
                                </Link>
                                <button
                                    onClick={() => logout()}
                                    className="border-transparent text-gray-300 hover:border-gray-300 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer"
                                >
                                    {t.nav.logout}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
            <div className="py-10">
                <main>
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
