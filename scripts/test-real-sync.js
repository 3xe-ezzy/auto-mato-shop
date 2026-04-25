const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const settings = await prisma.portalSettings.findUnique({ where: { portalName: 'Mobile.de' }});
    const vehicle = await prisma.vehicle.findFirst({
        include: { images: true, equipment: true }
    });

    if (!vehicle || !settings) {
        console.log('Missing vehicle or settings');
        return;
    }

    console.log('Testing sync for vehicle:', vehicle.make, vehicle.model);
    
    // We need to bypass the TypeScript check or use the real adapter
    // Since we are in JS, we can just instantiate it if it's exported correctly
    // But MobileDeAdapter is a class in a TS file. 
    // We might need to use the compiled version or just re-implement the logic here for testing.
    
    const auth = Buffer.from(`${settings.apiKey}:${settings.apiSecret}`).toString('base64');
    
    // Re-implementing the XML build logic from mobilede.ts
    const escape = (s) => s ? s.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : '';
    const yearStr = vehicle.year || 2024;
    const firstReg = `${yearStr}-01`;
    
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ad>
    <vehicleClass>Car</vehicleClass>
    <category>Limousine</category>
    <vehicle>
        <make>${escape(vehicle.make)}</make>
        <model>${escape(vehicle.model)}</model>
        <specifics>
            <mileage>${vehicle.mileage || 0}</mileage>
            <firstRegistration>${firstReg}</firstRegistration>
            <fuel>PETROL</fuel>
            <gearbox>MANUAL_GEARBOX</gearbox>
            <power unit="KW">${vehicle.power || 100}</power>
            <condition>USED</condition>
        </specifics>
        <descriptions>
            <description>${escape(vehicle.description || '')}</description>
        </descriptions>
    </vehicle>
    <price>
        <consumerValue>${vehicle.price || 0}</consumerValue>
        <currency>EUR</currency>
        <type>FIXED</type>
    </price>
</ad>`;

    console.log('XML to send:', xml);

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
