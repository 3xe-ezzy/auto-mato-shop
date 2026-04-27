const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
async function main() {
    try {
        const settings = await prisma.portalSettings.findUnique({
            where: { portalName: 'Mobile.de' }
        })
        console.log('Mobile.de Settings:', JSON.stringify(settings, null, 2))
    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}
main()
