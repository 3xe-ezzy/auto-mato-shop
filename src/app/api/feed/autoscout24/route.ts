import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
    const vehicles = await prisma.vehicle.findMany({
        where: { 
            status: 'Available',
            syncAutoScout24: true
        },
        include: { images: true, equipment: true }
    })

    const settings = await prisma.portalSettings.findUnique({
        where: { portalName: 'AutoScout24' }
    })

    if (!settings || !settings.isActive) {
        return new NextResponse('AutoScout24 synchronization is not active.', { status: 403 })
    }

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<transfer>\n'
    xml += '  <header>\n'
    xml += '    <version>1.0</version>\n'
    xml += `    <customer_id>${settings.customerNumber || 'MISSING_ID'}</customer_id>\n`
    xml += '  </header>\n'
    xml += '  <vehicles>\n'

    vehicles.forEach(v => {
        xml += `    <vehicle>
      <id>${v.articleNumber || v.id}</id>
      <make>${v.make}</make>
      <model>${v.model}</model>
      <year>${v.year}</year>
      <mileage>${v.mileage}</mileage>
      <price>${v.price}</price>
      <fuel_type>${v.fuelType || ''}</fuel_type>
      <transmission>${v.transmission || ''}</transmission>
      <power_kw>${(v as any).power || ''}</power_kw>
      <engine_capacity_ccm>${(v as any).engineCapacity || ''}</engine_capacity_ccm>
      <doors>${(v as any).doors || ''}</doors>
      <seats>${(v as any).seats || ''}</seats>
      <emission_class>${(v as any).emissionClass || ''}</emission_class>
      <body_color>${(v as any).exteriorColor || ''}</body_color>
      <description>${(v.description || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</description>
      <equipment_list>
        ${v.equipment.map(e => `<equipment>${e.name}</equipment>`).join('\n        ')}
      </equipment_list>
      <images>
        ${v.images.map(img => `<image_url>${img.url}</image_url>`).join('\n        ')}
      </images>
    </vehicle>\n`
    })

    xml += '  </vehicles>\n'
    xml += '</transfer>'

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Content-Disposition': 'attachment; filename="autoscout24-export.xml"',
        },
    })
}
