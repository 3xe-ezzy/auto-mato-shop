const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const settings = await prisma.portalSettings.findUnique({ where: { portalName: 'Mobile.de' }});
    if (!settings) return;

    const auth = Buffer.from(`${settings.apiKey}:${settings.apiSecret}`).toString('base64');
    
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ad>
    <vehicleClass>Car</vehicleClass>
    <category>Limousine</category>
    <make>VW</make>
    <model>Golf</model>
    <mileage>50000</mileage>
    <firstRegistration value="2020-01" />
    <fuel>PETROL</fuel>
    <gearbox>MANUAL_GEAR</gearbox>
    <power unit="KW">110</power>
    <condition>USED</condition>
    <price>
        <consumerValue value="15000" />
        <currency value="EUR" />
    </price>
</ad>`;

    const response = await fetch(`https://services.mobile.de/seller-api/sellers/${settings.customerNumber}/ads`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/vnd.de.mobile.api+xml',
            'Accept': 'application/vnd.de.mobile.api+xml'
        },
        body: xml
    });

    const text = await response.text();
    console.log('Status:', response.status);
    console.log('Response:', text);
}

main().finally(() => prisma.$disconnect());
