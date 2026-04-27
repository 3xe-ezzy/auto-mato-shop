const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.portalSettings.findFirst({
    where: { portalName: 'Mobile.de' }
  });
  if (settings) {
    console.log(`API_KEY=${settings.apiKey}`);
    console.log(`API_SECRET=${settings.apiSecret}`);
    console.log(`CUSTOMER_NUMBER=${settings.customerNumber}`);
  }
}

main().finally(() => prisma.$disconnect());
