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

    // Convert date format for CSV (MM.YYYY)
    const formatCsvDate = (dateVal: any) => {
        if (!dateVal) return '';
        const str = dateVal.toString().trim();
        if (str.includes('.')) {
            const parts = str.split('.');
            let month = parts[0].padStart(2, '0');
            let yearPart = parts[1];
            if (yearPart.length >= 2) {
                const yearDigits = yearPart.slice(-2);
                const year = "20" + yearDigits;
                return `${month}.${year}`;
            }
        }
        if (/^\d{4}-\d{2}$/.test(str)) {
            const [y, m] = str.split('-');
            return `${m}.${y}`;
        }
        if (/^\d{4}$/.test(str)) return `01.${str}`;
        return str;
    };

    // Dynamically determine the maximum number of images to create enough columns
    const maxImages = vehicles.length > 0 ? Math.max(...vehicles.map(v => v.images.length), 0) : 0;

    const baseHeaders = [
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
        'description'
    ]

    // Add as many image columns as needed
    const imageHeaders = [];
    for (let i = 1; i <= maxImages; i++) {
        imageHeaders.push(`image_url_${i}`);
    }

    const headers = [...baseHeaders, ...imageHeaders];

    const csvContent = [
        headers.join(';'),
        ...vehicles.map(v => {
            const baseFields = [
                settings.customerNumber || 'MISSING_ID',
                v.articleNumber || v.id,
                v.make,
                v.model,
                (v as any).titleMobileDe || '', // extra model description
                v.price,
                v.mileage,
                formatCsvDate(v.year),
                v.fuelType || '',
                v.transmission || '',
                (v as any).power || '',
                (v as any).engineCapacity || '',
                (v as any).emissionClass || '',
                (v as any).exteriorColor || '',
                `"${((v as any).shortDescMobileDe || v.description || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
            ];

            const imageFields = [];
            for (let i = 0; i < maxImages; i++) {
                imageFields.push(v.images[i]?.url || '');
            }

            return [...baseFields, ...imageFields].join(';');
        })
    ].join('\r\n')

    return new NextResponse(csvContent, {
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attachment; filename="mobile-de-export.csv"',
        },
    })
}
