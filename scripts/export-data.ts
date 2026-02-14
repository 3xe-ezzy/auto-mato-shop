import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function exportData() {
    try {
        console.log('Exporting data from SQLite...');

        const vehicles = await prisma.vehicle.findMany({
            include: {
                images: true,
                equipment: true,
            },
        });

        const users = await prisma.user.findMany();

        const exportData = {
            vehicles,
            users,
            exportedAt: new Date().toISOString(),
        };

        fs.writeFileSync(
            'data-export.json',
            JSON.stringify(exportData, null, 2)
        );

        console.log(`✓ Export complete!`);
        console.log(`  - ${vehicles.length} vehicles`);
        console.log(`  - ${users.length} users`);
        console.log(`  - Data saved to: data-export.json`);
    } catch (error) {
        console.error('Export failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

exportData();
