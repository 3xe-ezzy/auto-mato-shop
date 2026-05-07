import { PrismaClient } from '@prisma/client';
import { put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function migrate() {
    console.log('Starting Image Migration to Vercel Blob...');
    
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        console.error('ERROR: BLOB_READ_WRITE_TOKEN is missing!');
        process.exit(1);
    }

    const images = await prisma.image.findMany({
        where: {
            url: {
                startsWith: '/uploads/'
            }
        }
    });

    console.log(`Found ${images.length} images to migrate.`);

    for (const image of images) {
        const localPath = path.join(process.cwd(), 'public', image.url);
        
        if (fs.existsSync(localPath)) {
            try {
                console.log(`Uploading ${image.url}...`);
                const fileBuffer = fs.readFileSync(localPath);
                const fileName = path.basename(image.url);
                
                const blob = await put(fileName, fileBuffer, {
                    access: 'public',
                });

                console.log(`Successfully uploaded. New URL: ${blob.url}`);
                
                await prisma.image.update({
                    where: { id: image.id },
                    data: { url: blob.url }
                });
                
            } catch (error) {
                console.error(`Failed to upload ${image.url}:`, error);
            }
        } else {
            console.warn(`File not found: ${localPath}`);
        }
    }

    console.log('Migration complete!');
}

migrate()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
