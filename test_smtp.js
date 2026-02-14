const nodemailer = require('nodemailer');
require('dotenv').config({ path: '/var/www/auto-shop/.env' });

async function testEmail() {
    console.log('Starting SMTP test (Port 587)...');
    console.log('Host:', process.env.EMAIL_SERVER_HOST);
    console.log('Port: 587');
    console.log('User:', process.env.EMAIL_SERVER_USER);

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: 587,
        secure: false, // TLS
        auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
        },
        debug: true,
        logger: true,
    });

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: '3xe.channel@gmail.com',
            subject: 'Mato Automobile SMTP Test (Port 587)',
            text: 'This is a test email to verify SMTP configuration on port 587.',
        });
        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('SMTP Error:', error);
    }
}

testEmail();
