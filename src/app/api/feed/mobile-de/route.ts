import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
    const vehicles = await prisma.vehicle.findMany({
        where: { status: 'Available' },
        include: { images: true, equipment: true }
    })

    // Simple CSV generation
    const header = 'id,make,model,year,mileage,price,description,image_url\n'
    const rows = vehicles.map(v => {
        const imageUrl = v.images[0]?.url || ''
        return `${v.id},${v.make},${v.model},${v.year},${v.mileage},${v.price},"${v.description?.replace(/"/g, '""')}",${imageUrl}`
    }).join('\n')

    const csv = header + rows

    return new NextResponse(csv, {
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="mobile-de-export.csv"',
        },
    })
}
