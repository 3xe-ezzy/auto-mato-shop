const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function update() {
    await prisma.portalSettings.upsert({
        where: { portalName: 'AutoScout24' },
        update: { customerNumber: '2142276015', isActive: true },
        create: { portalName: 'AutoScout24', customerNumber: '2142276015', isActive: true }
    });
    console.log('AutoScout24 ID successfully updated to 2142276015');
}

update()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
