const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Generate article number
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
  const articleNumber = `mer-e270-${maxSequence + 1}`;

  const vehicle = await prisma.vehicle.create({
    data: {
      make: 'Mercedes-Benz',
      model: 'E 270 CDI',
      year: 2002,
      mileage: 0, // Bitte manuell anpassen
      price: 0,   // Bitte manuell anpassen
      condition: 'Used',
      status: 'Available',
      articleNumber,
      fuelType: 'Diesel',
      transmission: 'Automatic',
      color: 'Grau',
      power: 125,           // kW
      engineCapacity: 2685, // ccm – 2.7 CDI
      doors: 4,
      seats: 5,
      emissionClass: 'Euro 3',
      exteriorColor: 'Grau',
      description: `Mercedes-Benz E 270 CDI (W210) – Limousine – EZ 11.2002 – Diesel – Grau – Euro 3

Technische Daten:
• Motor: 2.7 CDI, 5-Zylinder Diesel, 125 kW / 170 PS
• Getriebe: Automatik
• Antrieb: Hinterradantrieb
• Reifen: 215/55 R16 93V
• Zulässiges Gesamtgewicht: ca. 2.150 kg
• Anhängerkupplung eingetragen

Ausstattung:
• Klimaanlage
• Elektrische Fensterheber
• Zentralverriegelung
• Servolenkung
• Komfortsitze
• ABS, ESP
• Airbags (Front + Seiten)
• CDI-Direkteinspritzung
• Langlebiger 5-Zylinder Motor
• Gute Langstreckentauglichkeit
• Robuste Bauweise – Perfekt für Export`,
      descriptionEn: `Mercedes-Benz E 270 CDI (W210) – Sedan – First Registered 11/2002 – Diesel – Grey – Euro 3

Technical Data:
• Engine: 2.7 CDI, 5-cylinder diesel, 125 kW / 170 HP
• Transmission: Automatic
• Drive: Rear-wheel drive
• Tyres: 215/55 R16 93V
• Permissible total weight: approx. 2,150 kg
• Tow bar registered

Equipment:
• Air conditioning
• Electric windows
• Central locking
• Power steering
• Comfort seats
• ABS, ESP
• Airbags (front + side)
• CDI direct injection
• Long-lasting 5-cylinder engine
• Excellent long-distance capability
• Robust construction – ideal for export`,
      equipment: {
        create: [
          { name: 'Klimaanlage' },
          { name: 'Elektrische Fensterheber' },
          { name: 'Zentralverriegelung' },
          { name: 'Servolenkung' },
          { name: 'Komfortsitze' },
          { name: 'ABS' },
          { name: 'ESP' },
          { name: 'Airbags Front + Seiten' },
          { name: 'CDI-Direkteinspritzung' },
          { name: 'Anhängerkupplung' },
          { name: 'Hinterradantrieb' },
        ]
      }
    }
  });

  console.log('✅ Fahrzeug erstellt!');
  console.log(`   ID:            ${vehicle.id}`);
  console.log(`   Artikelnummer: ${vehicle.articleNumber}`);
  console.log(`   Admin-Link:    /admin/vehicles/${vehicle.id}`);
  console.log('');
  console.log('⚠️  Bitte noch manuell anpassen:');
  console.log('   - Kilometerstand (aktuell: 0)');
  console.log('   - Preis (aktuell: 0)');
  console.log('   - Bilder hochladen');
}

main().catch(console.error).finally(() => prisma.$disconnect());
