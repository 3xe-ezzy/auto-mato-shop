
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'info@mato-automobile.de';
    const newPassword = 'Mato2025!';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    try {
        const user = await prisma.user.update({
            where: { email },
            data: { password: hashedPassword },
        });
        console.log(`Password for ${email} updated successfully.`);
    } catch (error) {
        console.error('Error updating password:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
