'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { syncVehicleToPortals } from '@/lib/portals/sync-service'

const PortalSettingsSchema = z.object({
    portalName: z.enum(['AutoScout24', 'Mobile.de', 'eBay']),
    customerNumber: z.string().optional().nullable(),
    apiKey: z.string().optional().nullable(),
    apiSecret: z.string().optional().nullable(),
    isActive: z.boolean().default(false),
})

export async function updatePortalSettings(formData: FormData) {
    const portalName = formData.get('portalName') as string
    const customerNumber = formData.get('customerNumber') as string
    const apiKey = formData.get('apiKey') as string
    const apiSecret = formData.get('apiSecret') as string
    const isActive = formData.get('isActive') === 'on'

    const validatedFields = PortalSettingsSchema.safeParse({
        portalName,
        customerNumber,
        apiKey,
        apiSecret,
        isActive,
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    try {
        await prisma.portalSettings.upsert({
            where: { portalName },
            update: {
                customerNumber,
                apiKey,
                apiSecret,
                isActive,
            },
            create: {
                portalName,
                customerNumber,
                apiKey,
                apiSecret,
                isActive,
            },
        })
    } catch (error) {
        console.error('Database Error:', error)
        return {
            message: 'Database Error: Failed to update portal settings.',
        }
    }

    revalidatePath('/admin/settings/portals')
    revalidatePath('/')
    return { success: true }
}

export async function manualSyncAllVehicles() {
    // Only fetch vehicles that have at least one sync flag enabled
    const vehicles = await prisma.vehicle.findMany({
        where: {
            OR: [
                { syncAutoScout24: true },
                { syncMobileDe: true },
                { syncEbay: true }
            ]
        },
        select: { id: true }
    });

    if (vehicles.length === 0) {
        return { success: true, count: 0, message: 'No vehicles to sync' };
    }

    let successCount = 0;
    let errorCount = 0;

    for (const vehicle of vehicles) {
        try {
            const results = await syncVehicleToPortals(vehicle.id);
            const hasError = results.some(result => result.status === 'FAILED');
            if (hasError) errorCount++;
            else successCount++;
        } catch (e) {
            errorCount++;
        }
    }

    revalidatePath('/admin');
    return { 
        success: true, 
        count: vehicles.length, 
        successCount, 
        errorCount 
    };
}

export async function getPortalSettings(portalName: string) {
    try {
        const settings = await prisma.portalSettings.findUnique({
            where: { portalName }
        })
        return settings
    } catch (error) {
        console.error('Database Error:', error)
        return null
    }
}
