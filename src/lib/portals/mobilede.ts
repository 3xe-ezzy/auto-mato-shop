import { PortalAdapter, PortalConfig, PortalResponse } from './types';

export class MobileDeAdapter implements PortalAdapter {
    async publishVehicle(vehicle: any, settings: PortalConfig): Promise<PortalResponse> {
        console.log('Mobile.de Push API: Mock publish for vehicle', vehicle.id);
        if (!settings.apiKey) return { success: false, errorMessage: 'Missing API Key' };
        
        // Mocking a successful API call
        return {
            success: true,
            externalId: `MOB-${vehicle.id}`
        };
    }

    async updateVehicle(vehicle: any, settings: PortalConfig, externalId: string): Promise<PortalResponse> {
        console.log(`Mobile.de Push API: Mock update for MOB ID: ${externalId}`);
        if (!settings.apiKey) return { success: false, errorMessage: 'Missing API Key' };

        return { success: true, externalId };
    }

    async deleteVehicle(externalId: string, settings: PortalConfig): Promise<PortalResponse> {
        console.log(`Mobile.de Push API: Mock delete for MOB ID: ${externalId}`);
        if (!settings.apiKey) return { success: false, errorMessage: 'Missing API Key' };

        return { success: true };
    }
}
