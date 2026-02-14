const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
async function main() {
    try {
        const count = await prisma.vehicle.count()
        console.log('Vehicle count:', count)
    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}
main()
