const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const s = await prisma.portalSettings.findUnique({ where: { portalName: 'Mobile.de' }});
    console.log(JSON.stringify(s, null, 2));
}
main().finally(() => prisma.$disconnect());
