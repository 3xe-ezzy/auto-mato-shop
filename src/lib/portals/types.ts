export interface PortalResponse {
    success: boolean;
    externalId?: string;
    errorMessage?: string;
}

export interface PortalConfig {
    customerNumber?: string | null;
    apiKey?: string | null;
    apiSecret?: string | null;
}

export interface PortalAdapter {
    publishVehicle(vehicle: any, settings: PortalConfig): Promise<PortalResponse>;
    updateVehicle(vehicle: any, settings: PortalConfig, externalId: string): Promise<PortalResponse>;
    deleteVehicle(externalId: string, settings: PortalConfig): Promise<PortalResponse>;
}
