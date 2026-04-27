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
    xml += '<tis-xml-30 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n'
    xml += '  <authentication>\n'
    xml += `    <customer-id>${escapeXml(settings.customerNumber || 'MISSING_ID')}</customer-id>\n`
    xml += '  </authentication>\n'
    xml += '  <vehicles>\n'

    const escapeXml = (unsafe: string | number | null | undefined) => {
        if (unsafe === null || unsafe === undefined) return '';
        return unsafe.toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    vehicles.forEach(v => {
        const firstRegMonth = v.year ? '01' : ''; 
        const firstRegYear = v.year?.toString() || '';

        xml += `    <vehicle id="${escapeXml(v.articleNumber || v.id)}" action="update">
      <common>
        <make>${escapeXml(v.make)}</make>
        <model>${escapeXml(v.model)}</model>
        <model-description>${escapeXml(`${v.make} ${v.model}`)}</model-description>
        <price>${v.price}</price>
        <vat-deductible>true</vat-deductible>
        <mileage>${v.mileage}</mileage>
        <first-registration>${firstRegMonth}-${firstRegYear}</first-registration>
        <body-type>Limousine</body-type>
        <fuel-type>${escapeXml(v.fuelType || 'Petrol')}</fuel-type>
        <transmission>${escapeXml(v.transmission || 'Manual')}</transmission>
      </common>
      <technical>
        <power-kw>${escapeXml((v as any).power || '')}</power-kw>
        <engine-capacity-ccm>${escapeXml((v as any).engineCapacity || '')}</engine-capacity-ccm>
        <doors>${escapeXml((v as any).doors || '')}</doors>
        <seats>${escapeXml((v as any).seats || '')}</seats>
        <emission-class>${escapeXml((v as any).emissionClass || 'EURO6')}</emission-class>
      </technical>
      <features>
        ${v.equipment.map(e => `<feature name="${escapeXml(e.name)}"/>`).join('\n        ')}
      </features>
      <description>
        <text lang="de">${escapeXml(v.description || '')}</text>
      </description>
      <images>
        ${v.images.map((img, index) => `<image url="${escapeXml(img.url)}" order="${index + 1}"/>`).join('\n        ')}
      </images>
    </vehicle>\n`
    })

    xml += '  </vehicles>\n'
    xml += '</tis-xml-30>'

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Content-Disposition': 'attachment; filename="autoscout24-export.xml"',
        },
    })
}
