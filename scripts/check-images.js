const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const v = await prisma.vehicle.findFirst({
        where: {
            images: {
                some: {}
            }
        },
        include: {
            images: true
        }
    });
    console.log(JSON.stringify(v?.images, null, 2));
}
main().finally(() => prisma.$disconnect());
