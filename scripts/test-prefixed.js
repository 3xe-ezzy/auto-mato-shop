const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const settings = await prisma.portalSettings.findUnique({ where: { portalName: 'Mobile.de' }});
    if (!settings) return;

    const auth = Buffer.from(`${settings.apiKey}:${settings.apiSecret}`).toString('base64');
    
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<seller:ad xmlns:seller="http://services.mobile.de/schema/seller">
    <seller:vehicleClass>Car</seller:vehicleClass>
    <seller:category>Limousine</seller:category>
    <seller:car>
        <seller:make>VW</seller:make>
        <seller:model>Golf</seller:model>
        <seller:specifics>
            <seller:mileage>50000</seller:mileage>
            <seller:firstRegistration>2020-01</seller:firstRegistration>
            <seller:fuel>PETROL</seller:fuel>
            <seller:gearbox>MANUAL_GEAR</seller:gearbox>
            <seller:power unit="KW">110</seller:power>
        </seller:specifics>
    </seller:car>
    <seller:price>
        <seller:amount>15000</seller:amount>
        <seller:currency>EUR</seller:currency>
    </seller:price>
</seller:ad>`;

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
