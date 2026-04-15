import { PortalAdapter, PortalConfig, PortalResponse } from './types';

export class EbayAdapter implements PortalAdapter {
    async publishVehicle(vehicle: any, settings: PortalConfig): Promise<PortalResponse> {
        console.log('eBay API: Mock publish for vehicle', vehicle.id);
        if (!settings.apiSecret) return { success: false, errorMessage: 'Missing API Token/Secret' };
        
        // Mocking a successful API call
        return {
            success: true,
            externalId: `EBAY-${vehicle.id}`
        };
    }

    async updateVehicle(vehicle: any, settings: PortalConfig, externalId: string): Promise<PortalResponse> {
        console.log(`eBay API: Mock update for Ebay Item ID: ${externalId}`);
        if (!settings.apiSecret) return { success: false, errorMessage: 'Missing API Token/Secret' };

        return { success: true, externalId };
    }

    async deleteVehicle(externalId: string, settings: PortalConfig): Promise<PortalResponse> {
        console.log(`eBay API: Mock delete for Ebay Item ID: ${externalId}`);
        if (!settings.apiSecret) return { success: false, errorMessage: 'Missing API Token/Secret' };

        return { success: true };
    }
}
