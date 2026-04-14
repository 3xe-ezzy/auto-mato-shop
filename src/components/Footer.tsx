import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="bg-gray-800 text-white py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <h3 className="text-lg font-bold mb-4">MATO AUTOMOBILE</h3>
                    <p>AHMED ABDALLA</p>
                    <p>IMPORT EXPORT</p>
                </div>
                <div>
                    <h3 className="text-lg font-bold mb-4">Kontakt</h3>
                    <p>Tel: +4969 97785893</p>
                    <p>Fax: +4969 97785894</p>
                    <p>Handy: +49 171 1482343</p>
                    <p>E-mail: <a href="mailto:info@mato-mobile.de" className="hover:text-blue-400">info@mato-mobile.de</a></p>
                </div>
                <div>
                    <h3 className="text-lg font-bold mb-4">Adresse</h3>
                    <p>Eschborner Land Str. 137a</p>
                    <p>60489 Frankfurt</p>
                    <div className="mt-4 flex flex-col space-y-2">
                        <Link href="/about" className="text-gray-400 hover:text-white underline">Über uns</Link>
                        <Link href="/impressum" className="text-gray-400 hover:text-white underline">Impressum</Link>
                        <Link href="/contact" className="text-gray-400 hover:text-white underline">Kontakt</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
