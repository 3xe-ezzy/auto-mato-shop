import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
    const vehicles = await prisma.vehicle.findMany({
        where: { 
            status: 'Available',
            syncMobileDe: true
        },
        include: { images: true, equipment: true }
    })

    const settings = await prisma.portalSettings.findUnique({
        where: { portalName: 'Mobile.de' }
    })

    if (!settings || !settings.isActive) {
        return new NextResponse('Mobile.de synchronization is not active.', { status: 403 })
    }

    // mobile.de CSV Format (Basis)
    // Field separator: ;
    // Quote character: "
    // Encoding: ISO-8859-15 (simplified to UTF-8 here as Next.js default, but the structure is correct)
    
    const headers = [
        'customer_number',
        'internal_number',
        'make',
        'model',
        'model_description',
        'price',
        'mileage',
        'first_registration',
        'fuel_type',
        'transmission',
        'power_kw',
        'engine_capacity',
        'emission_class',
        'exterior_color',
        'description',
        'image_url_1',
        'image_url_2',
        'image_url_3'
    ]

    const csvContent = [
        headers.join(';'),
        ...vehicles.map(v => {
            const firstReg = v.year ? `01.${v.year}` : ''
            const fields = [
                settings.customerNumber || 'MISSING_ID',
                v.articleNumber || v.id,
                v.make,
                v.model,
                '', // extra model description
                v.price,
                v.mileage,
                firstReg,
                v.fuelType || '',
                v.transmission || '',
                (v as any).power || '',
                (v as any).engineCapacity || '',
                (v as any).emissionClass || '',
                (v as any).exteriorColor || '',
                `"${(v.description || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
                v.images[0]?.url || '',
                v.images[1]?.url || '',
                v.images[2]?.url || ''
            ]
            return fields.join(';')
        })
    ].join('\r\n')

    return new NextResponse(csvContent, {
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attachment; filename="mobile-de-export.csv"',
        },
    })
}
