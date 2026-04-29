const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

async function testMobileDeUpload() {
    const settings = await prisma.portalSettings.findUnique({ where: { portalName: 'Mobile.de' } });
    if (!settings) return console.log('No settings found');

    // Find the CLA 180 d
    const vehicle = await prisma.vehicle.findFirst({
        where: { make: 'Mercedes-Benz', model: 'CLA 180' },
        include: { images: true }
    });

    if (!vehicle) return console.log('CLA 180 not found');
    console.log('Vehicle:', vehicle.make, vehicle.model, 'Images:', vehicle.images.length);

    // Get the mobile.de external ID
    // Wait, the externalId is stored in PortalSyncStatus
    const syncStatus = await prisma.vehicleListing.findUnique({
        where: { vehicleId_portalName: { vehicleId: vehicle.id, portalName: 'Mobile.de' } }
    });

    if (!syncStatus || !syncStatus.externalId) {
        return console.log('No Mobile.de external ID found for this vehicle. Has it been synced?');
    }

    const adId = syncStatus.externalId;
    const sellerId = '46761516';
    const primaryUser = settings.apiKey || 'ahmedabdalla';
    const apiSecret = settings.apiSecret;
    const url = `https://services.mobile.de/seller-api/sellers/${sellerId}/ads/${adId}/images`;

    console.log(`URL: ${url}`);

    const formData = new FormData();
    const fetchPromises = vehicle.images.map(async (img, i) => {
        let imgUrl = img.url;
        if (imgUrl.startsWith('/')) {
            imgUrl = `https://mato-automobile.vercel.app${imgUrl}`;
        }
        console.log(`Fetching ${imgUrl}`);
        const res = await fetch(imgUrl);
        const buffer = await res.arrayBuffer();
        const blob = new Blob([buffer], { type: 'image/jpeg' });
        return { blob, filename: `image_${i}.jpg` };
    });

    const results = await Promise.all(fetchPromises);
    for (const res of results) {
        formData.append('image', res.blob, res.filename);
    }

    const auth = Buffer.from(`${primaryUser}:${apiSecret}`).toString('base64');
    
    console.log(`Sending PUT request to Mobile.de with ${results.length} images...`);
    const uploadRes = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/vnd.de.mobile.api+json'
        },
        body: formData
    });

    console.log('Status:', uploadRes.status);
    const text = await uploadRes.text();
    console.log('Response:', text);

    await prisma.$disconnect();
}

testMobileDeUpload().catch(console.error);
