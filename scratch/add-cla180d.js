const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.vehicle.findMany({
    where: { make: 'Mercedes-Benz' },
    select: { articleNumber: true }
  });

  let maxSequence = 0;
  existing.forEach(v => {
    if (v.articleNumber) {
      const parts = v.articleNumber.split('-');
      const seq = parseInt(parts[parts.length - 1]);
      if (!isNaN(seq) && seq > maxSequence) maxSequence = seq;
    }
  });
  const articleNumber = `mer-cla180-${maxSequence + 1}`;

  const vehicle = await prisma.vehicle.create({
    data: {
      make: 'Mercedes-Benz',
      model: 'CLA 180 d',
      year: 2019,
      mileage: 0,
      price: 0,
      condition: 'Used',
      status: 'Inactive', // Set to Inactive initially so user can add price/km
      articleNumber,
      fuelType: 'Diesel',
      transmission: 'Automatic',
      color: 'Schwarz',
      power: 85,
      doors: 4,
      seats: 5,
      emissionClass: 'Euro 6d-TEMP',
      exteriorColor: 'Schwarz',
      description: `Mercedes-Benz CLA 180 d Automatik in Schwarz, Baujahr 2019.

Das Fahrzeug überzeugt durch seinen sparsamen und modernen Dieselmotor (Euro 6d-TEMP) sowie das komfortable Automatikgetriebe. Ideal für den Alltag und lange Strecken.

Sehr wirtschaftlich im Verbrauch und angenehm zu fahren.

➡️ Fahrzeug ist gepflegt
➡️ Motor und Getriebe laufen einwandfrei
➡️ Sofort fahrbereit

Besichtigung und Probefahrt nach Termin möglich.`,
      descriptionEn: `Mercedes-Benz CLA 180 d Automatic in Black, year 2019.

The vehicle impresses with its economical and modern diesel engine (Euro 6d-TEMP) as well as the comfortable automatic transmission. Ideal for everyday use and long distances.

Very economical in consumption and pleasant to drive.

➡️ Vehicle is well maintained
➡️ Engine and transmission run perfectly
➡️ Ready to drive immediately

Viewing and test drive possible by appointment.`,
      equipment: {
        create: [
          { name: 'Automatikgetriebe' },
          { name: 'Klimaanlage / Klimaautomatik' },
          { name: 'Elektrische Fensterheber' },
          { name: 'Zentralverriegelung' },
          { name: 'Multifunktionslenkrad' },
          { name: 'ABS' },
          { name: 'ESP' },
          { name: 'Airbags' },
          { name: 'Spurhalteassistent' },
          { name: 'Bremsassistent' },
          { name: 'Bordcomputer' },
          { name: 'Radio / Infotainment-System' },
          { name: 'Bluetooth' },
          { name: 'Anhängerkupplung' },
        ]
      }
    }
  });

  console.log('✅ Fahrzeug erstellt!');
  console.log(`   ID:            ${vehicle.id}`);
  console.log(`   Artikelnummer: ${vehicle.articleNumber}`);
  console.log(`   Admin-Link:    /admin/vehicles/${vehicle.id}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
