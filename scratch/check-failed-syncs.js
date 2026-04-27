const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Checking failed syncs with timestamps...');
    const failedSyncs = await prisma.vehicleListing.findMany({
        where: {
            status: 'FAILED'
        },
        include: {
            vehicle: true
        },
        orderBy: {
            lastSync: 'desc'
        }
    });

    console.log(`Found ${failedSyncs.length} failed syncs:`);
    failedSyncs.forEach(sync => {
        console.log(`- Vehicle: ${sync.vehicle.make} ${sync.vehicle.model} (${sync.vehicle.id})`);
        console.log(`  Portal: ${sync.portalName}`);
        console.log(`  Last Sync: ${sync.lastSync.toISOString()}`);
        console.log(`  Error: ${sync.errorMessage}`);
        console.log('---');
    });
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
