const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const vehicles = await prisma.vehicle.findMany({
        select: { make: true, model: true }
    });
    const unique = [...new Set(vehicles.map(v => v.make + ' | ' + v.model))];
    console.log(JSON.stringify(unique, null, 2));
}
main().finally(() => prisma.$disconnect());
