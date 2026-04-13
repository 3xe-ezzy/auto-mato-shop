const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('--- Testing Portal Settings ---')
    
    // Create dummy settings
    await prisma.portalSettings.upsert({
        where: { portalName: 'AutoScout24' },
        update: { customerNumber: 'TEST-AS24-123', isActive: true },
        create: { portalName: 'AutoScout24', customerNumber: 'TEST-AS24-123', isActive: true }
    })
    
    const settings = await prisma.portalSettings.findUnique({
        where: { portalName: 'AutoScout24' }
    })
    
    console.log('Result:', settings)
    
    if (settings && settings.customerNumber === 'TEST-AS24-123') {
        console.log('SUCCESS: Portal settings saved correctly.')
    } else {
        console.log('FAILURE: Portal settings not saved correctly.')
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
