const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const settings = await prisma.portalSettings.findUnique({ where: { portalName: 'Mobile.de' }});
    if (!settings) return;

    const auth = Buffer.from(`${settings.apiKey}:${settings.apiSecret}`).toString('base64');
    
    const response = await fetch(`https://services.mobile.de/seller-api/refdata/sites/GERMANY/vatrates`, {
        headers: {
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/vnd.de.mobile.api+xml'
        }
    });

    const text = await response.text();
    console.log('Status:', response.status);
    console.log('Response:', text);
}

main().finally(() => prisma.$disconnect());
