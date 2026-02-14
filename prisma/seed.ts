import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('ZiZo2026!!!', 10)

  const user = await prisma.user.upsert({
    where: { email: 'info@mato-automobile.de' },
    update: {
      password: hashedPassword,
      name: 'Admin',
    },
    create: {
      email: 'info@mato-automobile.de',
      name: 'Admin',
      password: hashedPassword,
    }
  })
  console.log('Admin User configured:', user.email)

  // Create vehicles if they don't exist (simplified check)
  const count = await prisma.vehicle.count()
  if (count === 0) {
    const vehicle1 = await prisma.vehicle.create({
      data: {
        make: 'BMW',
        model: 'X5',
        year: 2021,
        mileage: 45000,
        price: 55000,
        condition: 'Used',
        status: 'Available',
        description: 'Top condition, full service history.',
        images: {
          create: [
            { url: 'https://placehold.co/600x400?text=BMW+X5+Front', sortOrder: 1 },
            { url: 'https://placehold.co/600x400?text=BMW+X5+Interior', sortOrder: 2 },
          ]
        },
        equipment: {
          create: [
            { name: 'Navigation' },
            { name: 'Heated Seats' },
            { name: 'Sunroof' }
          ]
        }
      }
    })
    console.log('Created Vehicle:', vehicle1.make)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
