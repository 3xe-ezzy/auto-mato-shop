import { prisma } from '@/lib/prisma';
import { PortalAdapter, PortalListing } from './types';
import { AutoScout24Adapter } from './autoscout24';
import { MobileDeAdapter } from './mobilede';
import { EbayAdapter } from './ebay';



export async function syncVehicleToPortals(vehicleId: string) {
    const vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicleId },
        include: { images: true, equipment: true }
    });

    if (!vehicle) throw new Error('Vehicle not found');

    const portalsToSync = [];
    if (vehicle.syncAutoScout24) portalsToSync.push('AutoScout24');
    if (vehicle.syncMobileDe) portalsToSync.push('Mobile.de');
    if (vehicle.syncEbay) portalsToSync.push('eBay');

    const results = [];

    for (const portalName of portalsToSync) {
        // Load Settings
        const settings = await prisma.portalSettings.findUnique({
            where: { portalName }
        });

        if (!settings || !settings.isActive) {
            results.push({ portal: portalName, status: 'SKIPPED', error: 'Portal not active' });
            continue;
        }

        // Get Adapter
        let adapter: PortalAdapter;
        if (portalName === 'AutoScout24') adapter = new AutoScout24Adapter();
        else if (portalName === 'Mobile.de') adapter = new MobileDeAdapter();
        else if (portalName === 'eBay') adapter = new EbayAdapter();
        else continue;

        try {
            // Find existing listing
            const existingListing = await prisma.vehicleListing.findUnique({
                where: {
                    vehicleId_portalName: { vehicleId, portalName }
                }
            });

            let response;
            if (existingListing && existingListing.externalId) {
                // Update
                response = await adapter.updateVehicle(vehicle, settings, existingListing.externalId);
            } else {
                // Publish
                response = await adapter.publishVehicle(vehicle, settings);
            }

            if (response.success) {
                await prisma.vehicleListing.upsert({
                    where: { vehicleId_portalName: { vehicleId, portalName } },
                    update: { 
                        status: 'PUBLISHED', 
                        externalId: response.externalId,
                        errorMessage: null,
                        lastSync: new Date()
                    },
                    create: {
                        vehicleId,
                        portalName,
                        status: 'PUBLISHED',
                        externalId: response.externalId,
                        lastSync: new Date()
                    }
                });
                results.push({ portal: portalName, status: 'SUCCESS' });
            } else {
                await updateErrorStatus(vehicleId, portalName, response.errorMessage);
                results.push({ portal: portalName, status: 'FAILED', error: response.errorMessage });
            }

        } catch (error: any) {
            await updateErrorStatus(vehicleId, portalName, error.message);
            results.push({ portal: portalName, status: 'FAILED', error: error.message });
        }
    }

    return results;
}

async function updateErrorStatus(vehicleId: string, portalName: string, errorMessage?: string) {
    await prisma.vehicleListing.upsert({
        where: { vehicleId_portalName: { vehicleId, portalName } },
        update: { 
            status: 'FAILED', 
            errorMessage: errorMessage || 'Unknown error',
            lastSync: new Date()
        },
        create: {
            vehicleId,
            portalName,
            status: 'FAILED',
            errorMessage: errorMessage || 'Unknown error',
            lastSync: new Date()
        }
    });
}
