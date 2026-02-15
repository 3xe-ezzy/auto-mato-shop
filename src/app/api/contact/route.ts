import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const data = await request.json();
  const { name, email, phone, message, refNumber } = data;

  // Find vehicle to get ID for link
  let vehicleId = null;
  if (refNumber) {
    const vehicle = await prisma.vehicle.findFirst({
      where: { articleNumber: refNumber }
    });
    vehicleId = vehicle?.id;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    secure: process.env.EMAIL_SERVER_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  const vehicleLink = vehicleId ? `https://mato-automobile.de/vehicles/${vehicleId}` : null;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: 'info@mato-automobile.de',
    subject: `Neue Kontaktanfrage: ${refNumber ? `Fahrzeug ${refNumber}` : 'Allgemein'}`,
    text: `
      Name: ${name}
      Email: ${email}
      Telefon: ${phone}
      
      Nachricht:
      ${message}
      
      ${refNumber ? `Fahrzeug Referenz: ${refNumber}${vehicleLink ? ` (${vehicleLink})` : ''}` : ''}
    `,
    html: `
      <h3>Neue Kontaktanfrage</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Telefon:</strong> ${phone}</p>
      ${refNumber ? `<p><strong>Fahrzeug Referenz:</strong> ${vehicleLink ? `<a href="${vehicleLink}">${refNumber}</a>` : refNumber}</p>` : ''}
      <br/>
      <p><strong>Nachricht:</strong></p>
      <p>${message.replace(/\n/g, '<br/>')}</p>
    `,
  };

  const senderMailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Vielen Dank für Ihre Anfrage - Mato Automobile${refNumber ? ` (Referenz: ${refNumber})` : ''}`,
    text: `
      Sehr geehrte(r) ${name},
      
      vielen Dank für Ihre Anfrage. Wir haben Ihre Nachricht erhalten und werden uns schnellstmöglich bei Ihnen melden.
      
      Hier ist eine Kopie Ihrer Nachricht:
      --------------------------------------------------
      ${message}
      --------------------------------------------------
      ${refNumber ? `Referenz: ${refNumber}${vehicleLink ? ` (${vehicleLink})` : ''}` : ''}
      
      Mit freundlichen Grüßen,
      Ihr Team von Mato Automobile
    `,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://auto-mato-shop-yy1a.vercel.app/logo.png" alt="Mato Automobile Logo" style="max-width: 200px;">
        </div>
        <h2 style="color: #ed1c24;">Vielen Dank für Ihre Anfrage!</h2>
        <p>Sehr geehrte(r) <strong>${name}</strong>,</p>
        <p>wir haben Ihre Kontaktanfrage erhalten und freuen uns über Ihr Interesse. Ein Mitarbeiter wird sich in Kürze mit Ihnen in Verbindung setzen.</p>
        
        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Ihre Nachricht:</h3>
          <p style="white-space: pre-wrap;">${message}</p>
          ${refNumber ? `<p><strong>Referenz:</strong> ${vehicleLink ? `<a href="${vehicleLink}">${refNumber}</a>` : refNumber}</p>` : ''}
        </div>
        
        <p>Mit freundlichen Grüßen,<br/><strong>Ihr Team von Mato Automobile</strong></p>
        
        <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #ed1c24; font-size: 0.9em; color: #555;">
          <strong>MATO AUTOMOBILE</strong><br/>
          AHMED ABDALLA<br/>
          Eschborner Land Str. 137a<br/>
          60489 Frankfurt<br/><br/>
          <strong>Tel:</strong> +4969 97785893<br/>
          <strong>Fax:</strong> +4969 97785894<br/>
          <strong>Handy:</strong> +49 171 1482343<br/>
          <strong>E-Mail:</strong> info@mato-automobile.de<br/>
          <strong>Web:</strong> www.mato-automobile.de
        </div>

        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
        <p style="font-size: 0.8em; color: #888;">Dies ist eine automatisch generierte E-Mail. Bitte antworten Sie nicht direkt auf diese Nachricht.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail({
      ...mailOptions,
      replyTo: email, // Allow replying directly to the customer
    });
    // Send copy to sender
    await transporter.sendMail(senderMailOptions);
    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to send email:', error);
    // Log detailed error for debugging
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
      console.error('Error message:', error.message);
    }
    return NextResponse.json({ message: 'Failed to send email', error: String(error) }, { status: 500 });
  }
}
