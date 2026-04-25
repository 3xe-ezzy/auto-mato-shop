import { prisma } from '../src/lib/prisma';

async function checkSettings() {
    const settings = await prisma.portalSettings.findMany();
    console.log('--- Portal Settings ---');
    settings.forEach((s: any) => {
        console.log(`Portal: ${s.portalName}`);
        console.log(`Active: ${s.isActive}`);
        console.log(`Customer Number: ${s.customerNumber}`);
        console.log(`API Key: ${s.apiKey ? 'PRESENT' : 'MISSING'}`);
        console.log(`API Secret: ${s.apiSecret ? 'PRESENT' : 'MISSING'}`);
        console.log('----------------------');
    });

    const listings = await prisma.vehicleListing.findMany({
        where: { portalName: 'Mobile.de' },
        orderBy: { lastSync: 'desc' },
        take: 5
    });

    console.log('--- Recent Mobile.de Listings ---');
    listings.forEach((l: any) => {
        console.log(`Vehicle: ${l.vehicleId}`);
        console.log(`Status: ${l.status}`);
        console.log(`Error: ${l.errorMessage}`);
        console.log(`Last Sync: ${l.lastSync}`);
        console.log('----------------------');
    });
}

checkSettings()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
