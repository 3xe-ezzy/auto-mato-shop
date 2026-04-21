const fetch = require('node-fetch')

async function test() {
    const b64Auth = Buffer.from('ahmedabdalla:DZqyWg2mph2E').toString('base64')
    const sellerId = '46761516'
    const url = `https://services.mobile.de/seller-api/sellers/${sellerId}/ads`
    
    const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<ad xmlns="http://services.mobile.de/schema/ad" xmlns:seller="http://services.mobile.de/schema/seller" xmlns:vehicle="http://services.mobile.de/schema/vehicle">
    <vehicle>
        <vehicle:make-label>Audi</vehicle:make-label>
        <vehicle:model-label>A3</vehicle:model-label>
        <vehicle:specifics>
            <vehicle:mileage value="50000" />
            <vehicle:first-registration>2020-01</vehicle:first-registration>
            <vehicle:fuel>PETROL</vehicle:fuel>
            <vehicle:transmission>MANUAL_GEAR</vehicle:transmission>
            <vehicle:power value="110" unit="KW" />
        </vehicle:specifics>
        <vehicle:description>Test Ad</vehicle:description>
    </vehicle>
    <price value="15000">
        <ad:currency xmlns:ad="http://services.mobile.de/schema/ad">EUR</ad:currency>
    </price>
</ad>`

    console.log(`Testing URL: ${url}`)
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${b64Auth}`,
            'Content-Type': 'application/vnd.de.mobile.api+xml',
            'Accept': 'application/vnd.de.mobile.api+xml'
        },
        body: xml
    })

    console.log(`Status: ${res.status}`)
    const text = await res.text()
    console.log(`Body: ${text}`)
}

test().catch(console.error)
