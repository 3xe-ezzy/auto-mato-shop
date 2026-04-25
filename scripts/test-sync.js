const { syncVehicleToPortals } = require('../src/lib/portals/sync-service');
const { prisma } = require('../src/lib/prisma');

async function testSync() {
    const vehicleId = 'cmifzi41h0000tqtiaimgd314';
    console.log(`Starting test sync for vehicle ${vehicleId}...`);
    try {
        const results = await syncVehicleToPortals(vehicleId);
        console.log('Sync results:', JSON.stringify(results, null, 2));
    } catch (err) {
        console.error('Sync Error:', err);
    }
}

testSync()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
