import { PortalAdapter, PortalConfig, PortalResponse } from './types';
import { mapToMobileValue } from './mobile-mapping';

export class MobileDeAdapter implements PortalAdapter {
    private baseUrl = 'https://services.mobile.de/seller-api/v1';

    async publishVehicle(vehicle: any, settings: PortalConfig): Promise<PortalResponse> {
        return this.sync(vehicle, settings);
    }

    async updateVehicle(vehicle: any, settings: PortalConfig, externalId: string): Promise<PortalResponse> {
        return this.sync(vehicle, settings, externalId);
    }

    async deleteVehicle(externalId: string, settings: PortalConfig): Promise<PortalResponse> {
        try {
            const auth = Buffer.from(`${settings.apiKey}:${settings.apiSecret}`).toString('base64');
            const url = `${this.baseUrl}/ads/${externalId}`;

            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Basic ${auth}`
                }
            });

            if (!response.ok) {
                const text = await response.text();
                return { success: false, errorMessage: `Mobile.de Delete Error: ${response.status} - ${text}` };
            }

            return { success: true };
        } catch (error: any) {
            return { success: false, errorMessage: error.message };
        }
    }

    private async sync(vehicle: any, settings: PortalConfig, externalId?: string): Promise<PortalResponse> {
        try {
            const xml = this.buildVehicleXml(vehicle);
            const auth = Buffer.from(`${settings.apiKey}:${settings.apiSecret}`).toString('base64');

            // Try singular /ad as some 1.1 schemas use it
            const method = externalId ? 'PUT' : 'POST';
            const url = externalId 
                ? `${this.baseUrl}/ad/${externalId}` 
                : `${this.baseUrl}/ad`;

            console.log(`Syncing to Mobile.de (${method}): ${url}`);
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/xml',
                    'Accept': 'application/xml'
                },
                body: xml
            });

            const responseText = await response.text();

            if (!response.ok) {
                // FALLBACK: If we get a 404 on PUT, it means the ad was not found.
                // In this case, try to create it as a new ad (POST).
                if (response.status === 404 && externalId) {
                    console.log('Mobile.de ad not found (404), falling back to POST (Create)...');
                    return this.sync(vehicle, settings); // Call sync again without externalId
                }

                console.error('Mobile.de Sync Error:', response.status, responseText);
                return { success: false, errorMessage: `Mobile.de API Error: ${response.status} - ${responseText}` };
            }

            let newExternalId = externalId;
            if (method === 'POST') {
                const location = response.headers.get('Location');
                if (location) {
                    newExternalId = location.split('/').pop();
                }
            }

            return { success: true, externalId: newExternalId };
        } catch (error: any) {
            console.error('Mobile.de Portal Error:', error);
            return { success: false, errorMessage: error.message };
        }
    }

    private buildVehicleXml(v: any): string {
        const escape = (str: string) => (str || '').toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        // Format first registration to YYYY-MM
        const firstReg = v.year ? `${v.year}-01` : '2020-01';

        // Map Category (SUV -> OffRoad, etc.)
        let category = mapToMobileValue('category', v.model) || 'Limousine';
        if (v.make === 'Mercedes-Benz' && (v.model.includes('GLC') || v.model.includes('GLE') || v.model.includes('GLA'))) {
            category = 'OffRoad';
        }
        if (v.make === 'Mercedes-Benz' && (v.model.includes('EQV') || v.model.includes('Vito') || v.model.includes('V-Klasse'))) {
            category = 'Van';
        }

        return `<?xml version="1.0" encoding="UTF-8"?>
<ad xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns="http://services.mobile.de/schema/seller/seller-ad-1.1"
    xmlns:vehicle="http://services.mobile.de/schema/seller/vehicle-1.0"
    xmlns:site-specifics="http://services.mobile.de/schema/seller/site-specifics-1.0"
    xmlns:price="http://services.mobile.de/schema/seller/price-1.0"
    xsi:schemaLocation="http://services.mobile.de/schema/seller/seller-ad-1.1 http://services.mobile.de/schema/seller/seller-ad-1.1.xsd">

    <seller-inventory-key value="${v.articleNumber || v.id}"/>
    <description>${escape(v.description || '')}</description>

    <vehicle:vehicle>
        <vehicle:classification>
            <vehicle:vehicle-class key="Car"/>
            <vehicle:category key="${category}"/>
            <vehicle:make key="${mapToMobileValue('makes', v.make) || v.make}"/>
            <vehicle:model key="${mapToMobileValue('models', v.model) || v.model}"/>
        </vehicle:classification>

        <vehicle:model-description value="${escape(v.make + ' ' + v.model)}"/>
        <vehicle:damage-and-unrepaired value="false"/>
        <vehicle:accident-damaged value="false"/>
        <vehicle:roadworthy value="true"/>

        <vehicle:specifics>
            <vehicle:mileage value="${v.mileage || 0}"/>
            <vehicle:fuel key="${(v.fuelType || 'PETROL').toUpperCase()}"/>
            <vehicle:power value="${v.power || 100}"/>
            <vehicle:gearbox key="${(v.transmission || 'MANUAL_GEAR').toUpperCase() === 'AUTOMATIC' ? 'AUTOMATIC_GEAR' : 'MANUAL_GEAR'}"/>
            <vehicle:condition key="${v.condition === 'New' ? 'NEW' : 'USED'}"/>
        </vehicle:specifics>

        <vehicle:site-specifics>
            <site-specifics:first-registration value="${firstReg}"/>
        </vehicle:site-specifics>
    </vehicle:vehicle>

    <price:price type="FIXED" currency="EUR">
        <price:gross-prices>
            <price:consumer-price-amount value="${(v.price || 0).toFixed(2)}"/>
        </price:gross-prices>
    </price:price>
</ad>`;
    }
}
