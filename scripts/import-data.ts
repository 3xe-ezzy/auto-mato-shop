import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// Use direct connection for data import to avoid pool issues
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DIRECT_URL || process.env.DATABASE_URL
        }
    }
});

async function main() {
    try {
        const dataPath = path.join(process.cwd(), 'data-export.json');
        if (!fs.existsSync(dataPath)) {
            console.error('Error: data-export.json not found!');
            return;
        }

        const rawData = fs.readFileSync(dataPath, 'utf-8');
        const data = JSON.parse(rawData);

        console.log(`Found export data: ${data.vehicles?.length || 0} vehicles, ${data.users?.length || 0} users.`);

        // 1. Import Users
        if (data.users && data.users.length > 0) {
            console.log('Importing users...');
            for (const user of data.users) {
                const exists = await prisma.user.findUnique({ where: { email: user.email } });
                if (!exists) {
                    await prisma.user.create({ data: user });
                    console.log(`User created: ${user.email}`);
                } else {
                    console.log(`User already exists: ${user.email}`);
                }
            }
        }

        // 2. Import Vehicles
        if (data.vehicles && data.vehicles.length > 0) {
            console.log('Importing vehicles...');
            for (const vehicle of data.vehicles) {
                // Check if vehicle exists
                const existingVehicle = await prisma.vehicle.findUnique({ where: { id: vehicle.id } });

                if (!existingVehicle) {
                    // Create vehicle with relations
                    await prisma.vehicle.create({
                        data: {
                            id: vehicle.id,
                            make: vehicle.make,
                            model: vehicle.model,
                            year: vehicle.year,
                            mileage: vehicle.mileage,
                            price: vehicle.price,
                            condition: vehicle.condition,
                            status: vehicle.status,
                            vin: vehicle.vin,
                            description: vehicle.description,
                            descriptionEn: vehicle.descriptionEn,
                            color: vehicle.color,
                            fuelType: vehicle.fuelType,
                            transmission: vehicle.transmission,
                            articleNumber: vehicle.articleNumber,
                            createdAt: vehicle.createdAt,
                            updatedAt: vehicle.updatedAt,
                            images: {
                                create: vehicle.images.map((img: any) => ({
                                    id: img.id,
                                    url: img.url,
                                    sortOrder: img.sortOrder
                                }))
                            },
                            equipment: {
                                create: vehicle.equipment.map((eq: any) => ({
                                    id: eq.id,
                                    name: eq.name
                                }))
                            }
                        }
                    });
                    console.log(`Vehicle imported: ${vehicle.make} ${vehicle.model}`);
                } else {
                    console.log(`Vehicle skipped (already exists): ${vehicle.make} ${vehicle.model}`);
                }
            }
        }

        console.log('✅ Import completed successfully!');

    } catch (error) {
        console.error('Import failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
