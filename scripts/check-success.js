const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const l = await prisma.vehicleListing.findMany({ where: { portalName: 'Mobile.de', status: 'SUCCESS' }, take: 1 });
    console.log(JSON.stringify(l, null, 2));
}
main().finally(() => prisma.$disconnect());
