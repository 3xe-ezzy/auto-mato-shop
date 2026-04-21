const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testXml(xml, auth, customerNumber) {
    const url = `https://services.mobile.de/seller-api/sellers/${customerNumber}/ads`
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/vnd.de.mobile.api+xml',
                'Accept': 'application/vnd.de.mobile.api+xml'
            },
            body: xml
        })
        const text = await response.text()
        return { status: response.status, body: text }
    } catch (e) {
        return { error: e.message }
    }
}

async function main() {
    const auth = Buffer.from('ahmedabdalla:DZqyWg2mph2E').base64
    const customerNumber = '876407' // Based on user previous info
    
    // We need a real vehicle data
    const vehicle = await prisma.vehicle.findFirst({ include: { images: true } })
    if (!vehicle) return console.log('No vehicle found')

    const variations = [
        // Variation 1: Prefix on root, ad namespacing
        {
            name: 'Namespaced Prefix',
            xml: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<ad:ad xmlns:ad="http://services.mobile.de/schema/ad" xmlns:seller="http://services.mobile.de/schema/seller" xmlns:vehicle="http://services.mobile.de/schema/vehicle">
    <ad:vehicle>
        <vehicle:make-label>${vehicle.make}</vehicle:make-label>
        <vehicle:model-label>${vehicle.model}</vehicle:model-label>
        <vehicle:specifics>
            <vehicle:mileage value="${vehicle.mileage}" />
            <vehicle:first-registration>${vehicle.year}-01</vehicle:first-registration>
        </vehicle:specifics>
    </ad:vehicle>
    <ad:price value="${vehicle.price}"><ad:currency>EUR</ad:currency></ad:price>
</ad:ad>`
        },
        // Variation 2: No prefix, default namespace
        {
            name: 'Default Namespace',
            xml: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<ad xmlns="http://services.mobile.de/schema/ad" xmlns:seller="http://services.mobile.de/schema/seller" xmlns:vehicle="http://services.mobile.de/schema/vehicle">
    <vehicle>
        <vehicle:make-label>${vehicle.make}</vehicle:make-label>
        <vehicle:model-label>${vehicle.model}</vehicle:model-label>
        <vehicle:specifics>
            <vehicle:mileage value="${vehicle.mileage}" />
        </vehicle:first-registration>${vehicle.year}-01</vehicle:first-registration>
    </vehicle>
    <price value="${vehicle.price}"><currency>EUR</currency></price>
</ad>`
        },
        // Variation 3: No namespace on root (Null namespace)
        {
            name: 'Null Namespace Root',
            xml: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<ad xmlns:seller="http://services.mobile.de/schema/seller" xmlns:vehicle="http://services.mobile.de/schema/vehicle" xmlns:ad="http://services.mobile.de/schema/ad">
    <vehicle>
        <vehicle:make-label>${vehicle.make}</vehicle:make-label>
        <vehicle:model-label>${vehicle.model}</vehicle:model-label>
    </vehicle>
    <ad:price value="${vehicle.price}"><ad:currency>EUR</ad:currency></ad:price>
</ad>`
        }
    ]

    const b64Auth = Buffer.from('ahmedabdalla:DZqyWg2mph2E').toString('base64')

    for (const v of variations) {
        console.log(`Testing: ${v.name}...`)
        const res = await testXml(v.xml, b64Auth, customerNumber)
        console.log(`Status: ${res.status}`)
        if (res.status !== 201 && res.status !== 200) {
            console.log(`Body Snippet: ${res.body?.substring(0, 200)}`)
        }
        console.log('-------------------')
    }
}

main().catch(console.error).finally(() => prisma.$disconnect())
