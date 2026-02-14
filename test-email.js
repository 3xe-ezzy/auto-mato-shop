
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

async function testEmail() {
    console.log('Testing SMTP connection...');
    console.log('Host:', process.env.EMAIL_SERVER_HOST);
    console.log('Port:', process.env.EMAIL_SERVER_PORT);
    console.log('Secure:', process.env.EMAIL_SERVER_SECURE);
    console.log('User:', process.env.EMAIL_SERVER_USER);

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        secure: process.env.EMAIL_SERVER_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
        },
        debug: true, // show debug output
        logger: true // lot info to console
    });

    try {
        await transporter.verify();
        console.log('SMTP connection verified successfully!');

        console.log('Sending test email...');
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: process.env.EMAIL_FROM, // Send to self
            subject: 'Test Email from SMTP Test Script',
            text: 'This is a test email to verify SMTP configuration.',
        });

        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Error occurred:', error);
    }
}

testEmail();
