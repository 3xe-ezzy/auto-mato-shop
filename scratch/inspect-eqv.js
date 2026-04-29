const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const vehicle = await prisma.vehicle.findFirst({
    where: { model: { contains: 'EQV' } },
    include: { images: true }
  });

  if (!vehicle) {
    console.log('Vehicle not found');
    return;
  }

  console.log(`Vehicle: ${vehicle.make} ${vehicle.model} (${vehicle.id})`);
  console.log('Images:');
  vehicle.images.forEach(img => {
    console.log(`- ID: ${img.id}, SortOrder: ${img.sortOrder}, URL: ${img.url.substring(0, 50)}...`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
