'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/components/LanguageContext'
import { useSearchParams } from 'next/navigation'

export default function ContactForm() {
    const { t } = useLanguage()
    const searchParams = useSearchParams()
    const [submitted, setSubmitted] = useState(false)
    const [refNumber, setRefNumber] = useState('')

    useEffect(() => {
        const ref = searchParams.get('ref')
        if (ref) {
            setRefNumber(ref)
        }
    }, [searchParams])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const form = e.target as HTMLFormElement
        const formData = new FormData(form)
        const data = Object.fromEntries(formData.entries())

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...data, refNumber }),
            })

            if (response.ok) {
                setSubmitted(true)
            } else {
                alert('Fehler beim Senden der Nachricht. Bitte versuchen Sie es später noch einmal.')
            }
        } catch (error) {
            console.error('Error submitting form:', error)
            alert('Fehler beim Senden der Nachricht.')
        }
    }

    if (submitted) {
        return (
            <div className="bg-green-50 p-4 rounded-md">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">
                            {t.contact.success}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 text-sm text-green-700 hover:text-green-600 underline"
                >
                    {t.nav.contact}
                </button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="refNumber" className="block text-sm font-medium text-gray-700">
                    {t.vehicle.articleNumber}
                </label>
                <div className="mt-1">
                    <input
                        type="text"
                        name="refNumber"
                        id="refNumber"
                        value={refNumber}
                        onChange={(e) => setRefNumber(e.target.value)}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border bg-gray-50 text-black"
                        readOnly={!!searchParams.get('ref')}
                    />
                </div>
            </div>

            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    {t.contact.name}
                </label>
                <div className="mt-1">
                    <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-black"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    {t.contact.email}
                </label>
                <div className="mt-1">
                    <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-black"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    {t.contact.phone}
                </label>
                <div className="mt-1">
                    <input
                        type="tel"
                        name="phone"
                        id="phone"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-black"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    {t.contact.message}
                </label>
                <div className="mt-1">
                    <textarea
                        id="message"
                        name="message"
                        rows={4}
                        required
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-black"
                    />
                </div>
            </div>

            <div>
                <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    {t.contact.submit}
                </button>
            </div>
        </form>
    )
}
