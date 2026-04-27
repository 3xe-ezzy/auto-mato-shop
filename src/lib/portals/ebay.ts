import { PortalAdapter, PortalConfig, PortalResponse } from './types';

export class EbayAdapter implements PortalAdapter {
    // This adapter handles both eBay Motors and Kleinanzeigen.de (REST API)
    
    async publishVehicle(vehicle: any, settings: PortalConfig): Promise<PortalResponse> {
        if (settings.portalName === 'eBay') {
            console.log('eBay API: Mock publish for vehicle', vehicle.id);
            if (!settings.apiSecret) return { success: false, errorMessage: 'Missing eBay API Token/Secret' };
        } else if (settings.portalName === 'Kleinanzeigen') {
            console.log('Kleinanzeigen REST API: Mock publish for vehicle', vehicle.id);
            if (!settings.apiKey) return { success: false, errorMessage: 'Missing Kleinanzeigen API Key' };
        }
        
        return {
            success: true,
            externalId: `${settings.portalName.toUpperCase()}-${vehicle.id}`
        };
    }

    async updateVehicle(vehicle: any, settings: PortalConfig, externalId: string): Promise<PortalResponse> {
        console.log(`${settings.portalName} API: Mock update for ID: ${externalId}`);
        return { success: true, externalId };
    }

    async deleteVehicle(externalId: string, settings: PortalConfig): Promise<PortalResponse> {
        console.log(`${settings.portalName} API: Mock delete for ID: ${externalId}`);
        return { success: true };
    }
}
