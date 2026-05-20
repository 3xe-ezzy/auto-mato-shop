import Link from 'next/link'

export default function ImpressumPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-8">
                <div className="mb-6">
                    <Link href="/" className="text-indigo-600 hover:text-indigo-800">&larr; Zurück zum Shop</Link>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Impressum</h1>

                <div className="space-y-6 text-gray-700">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Angaben gemäß § 5 TMG</h2>
                        <p>AHMED ABDALLA</p>
                        <p>MATO AUTOMOBILE</p>
                        <p>IMPORT EXPORT</p>
                        <p>Rödelheimer Landstraße 75</p>
                        <p>60487 Frankfurt am Main</p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Kontakt</h2>
                        <p>Telefon: +4969 97785893</p>
                        <p>Telefax: +4969 97785894</p>
                        <p>Mobil: +49 171 1482343</p>
                        <p>E-Mail: info@mato-mobile.de</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
