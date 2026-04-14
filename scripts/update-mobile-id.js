const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function update() {
    await prisma.portalSettings.upsert({
        where: { portalName: 'Mobile.de' },
        update: { customerNumber: '876407', isActive: true },
        create: { portalName: 'Mobile.de', customerNumber: '876407', isActive: true }
    });
    console.log('Mobile.de customer number successfully updated to 876407');
}

update()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
