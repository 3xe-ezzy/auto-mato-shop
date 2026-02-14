import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
    const vehicles = await prisma.vehicle.findMany({
        where: { status: 'Available' },
        include: { images: true, equipment: true }
    })

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<vehicles>\n'

    vehicles.forEach(v => {
        xml += `  <vehicle>
    <id>${v.id}</id>
    <make>${v.make}</make>
    <model>${v.model}</model>
    <year>${v.year}</year>
    <mileage>${v.mileage}</mileage>
    <price>${v.price}</price>
    <description>${v.description || ''}</description>
    <images>
      ${v.images.map(img => `<image>${img.url}</image>`).join('\n      ')}
    </images>
  </vehicle>\n`
    })

    xml += '</vehicles>'

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Content-Disposition': 'attachment; filename="autoscout24-export.xml"',
        },
    })
}
