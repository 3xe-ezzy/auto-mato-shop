const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'info@mato-automobile.de';
    const password = 'ZiZo2026!!!';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            name: 'Admin',
        },
        create: {
            email,
            name: 'Admin',
            password: hashedPassword,
        }
    });
    console.log('Admin User configured:', user.email);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
