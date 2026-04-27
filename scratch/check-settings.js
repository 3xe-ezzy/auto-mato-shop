const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.portalSettings.findMany();
  console.log('Portal Settings:');
  settings.forEach(s => {
    console.log(`- Portal: ${s.portalName}, Customer Number: ${s.customerNumber}, Is Active: ${s.isActive}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
