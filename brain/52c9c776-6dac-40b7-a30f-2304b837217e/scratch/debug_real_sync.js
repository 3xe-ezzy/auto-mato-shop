'use strict'

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const https = require('https');

async function main() {
    // 1. Get Settings
    const settings = await prisma.portalSettings.findUnique({
        where: { portalName: 'Mobile.de' }
    });

    if (!settings || !settings.isActive) {
        console.log('Mobile.de not active or settings missing');
        return;
    }

    // 2. Get a Vehicle
    const vehicle = await prisma.vehicle.findFirst({
        where: { syncMobileDe: true },
        include: { images: true, equipment: true }
    });

    if (!vehicle) {
        console.log('No vehicle found for syncMobileDe=true');
        return;
    }

    console.log(`Syncing Vehicle: ${vehicle.make} ${vehicle.model} (${vehicle.id})`);

    // 3. Build XML (Copy of adapter logic)
    const escape = (s) => s ? s.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
    
    const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<ad>
    <vehicle xmlns:vehicle="http://services.mobile.de/schema/vehicle">
        <vehicle:class value="Car" />
        <vehicle:category value="EstateCar" /> 
        <vehicle:make-label>${escape(vehicle.make)}</vehicle:make-label>
        <vehicle:model-label>${escape(vehicle.model)}</vehicle:model-label>
        <vehicle:specifics>
            <vehicle:mileage value="${vehicle.mileage}" />
            <vehicle:first-registration>${vehicle.year}-01</vehicle:first-registration>
            <vehicle:fuel>PETROL</vehicle:fuel>
            <vehicle:transmission>MANUAL_GEAR</vehicle:transmission>
            <vehicle:power value="${vehicle.power || 100}" unit="KW" />
        </vehicle:specifics>
        <vehicle:description>${escape(vehicle.description || '')}</vehicle:description>
    </vehicle>
    <price value="${vehicle.price}" xmlns:ad="http://services.mobile.de/schema/ad">
        <ad:currency>EUR</ad:currency>
        <ad:vat-rate-fraction>0.19</ad:vat-rate-fraction>
    </price>
    <images xmlns:ad="http://services.mobile.de/schema/ad">
        ${vehicle.images?.map((img) => `<ad:image url="${escape(img.url)}" />`).join('\n        ') || ''}
    </images>
</ad>`;

    console.log('--- XML TO SEND ---');
    console.log(xml);
    console.log('-------------------');

    // 4. Send Request
    const auth = Buffer.from(`${settings.apiKey}:${settings.apiSecret}`).toString('base64');
    const options = {
        hostname: 'services.mobile.de',
        path: `/seller-api/sellers/${settings.customerNumber}/ads`,
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/vnd.de.mobile.api+xml',
            'Accept': 'application/vnd.de.mobile.api+xml'
        }
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', d => data += d);
        res.on('end', () => {
            console.log(`Status: ${res.statusCode}`);
            console.log('Response Body:');
            console.log(data);
        });
    });

    req.on('error', (e) => console.error(e));
    req.write(xml);
    req.end();
}

main().catch(console.error).finally(() => prisma.$disconnect());
