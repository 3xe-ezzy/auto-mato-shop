const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const listings = await prisma.vehicleListing.findMany({
        orderBy: { lastSync: 'desc' },
        take: 5
    })

    console.log('--- LAST SYNC ERRORS ---')
    listings.forEach(l => {
        console.log(`Vehicle ID: ${l.vehicleId}`)
        console.log(`Portal: ${l.portalName}`)
        console.log(`Status: ${l.status}`)
        console.log(`Error: ${l.errorMessage}`)
        console.log('------------------------')
    })
}

main().catch(console.error).finally(() => prisma.$disconnect())
