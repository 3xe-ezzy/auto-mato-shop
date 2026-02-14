const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
require('dotenv').config({ path: '/var/www/auto-shop/.env' });

const prisma = new PrismaClient();

async function run() {
    console.log('--- Database Seeding ---');
    const email = 'info@mato-automobile.de';
    const password = 'ZiZo2026!!!';

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        console.log('User already exists, updating password...');
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        });
    } else {
        console.log('Creating new admin user...');
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: 'Admin'
            }
        });
    }
    console.log('User seeding complete.');

    console.log('\n--- Vehicle Check ---');
    const count = await prisma.vehicle.count();
    console.log('Total vehicles:', count);

    console.log('\n--- Environment Check ---');
    console.log('EMAIL_SERVER_HOST:', process.env.EMAIL_SERVER_HOST);
    console.log('EMAIL_SERVER_PORT:', process.env.EMAIL_SERVER_PORT);
    console.log('EMAIL_SERVER_SECURE:', process.env.EMAIL_SERVER_SECURE);

    console.log('\n--- SMTP Test (Verification) ---');
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        secure: process.env.EMAIL_SERVER_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
        },
        debug: true,
        logger: true,
    });

    try {
        await transporter.verify();
        console.log('SMTP Connection: SUCCESS');
    } catch (error) {
        console.error('SMTP Connection: FAILED', error);
    }
}

run()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
