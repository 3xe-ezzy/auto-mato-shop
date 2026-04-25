const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getSecret() {
    const s = await prisma.portalSettings.findUnique({ where: { portalName: 'Mobile.de' } });
    console.log(`KEY: ${s.apiKey}`);
    console.log(`SECRET: ${s.apiSecret}`);
}

getSecret().finally(() => prisma.$disconnect());
