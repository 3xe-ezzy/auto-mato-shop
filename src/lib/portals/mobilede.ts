import { PortalAdapter, PortalConfig, PortalResponse } from './types';
import { mapToMobileValue } from './mobile-mapping';

export class MobileDeAdapter implements PortalAdapter {
    private baseUrl = 'https://services.mobile.de/seller-api';

    async publishVehicle(vehicle: any, settings: PortalConfig): Promise<PortalResponse> {
        console.log('Mobile.de Push API: Publishing vehicle', vehicle.id);
        
        if (!settings.apiKey || !settings.apiSecret || !settings.customerNumber) {
            return { success: false, errorMessage: 'Missing API credentials (Key, Secret or SellerID)' };
        }

        try {
            const xml = this.buildVehicleXml(vehicle, settings.customerNumber);
            
            const auth = Buffer.from(`${settings.apiKey}:${settings.apiSecret}`).toString('base64');
            const response = await fetch(`${this.baseUrl}/sellers/${settings.customerNumber}/ads`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/vnd.de.mobile.api+xml',
                    'Accept': 'application/vnd.de.mobile.api+xml'
                },
                body: xml
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Mobile.de API Error:', errorText);
                return { success: false, errorMessage: `Mobile.de API Error: ${response.status} - ${errorText}` };
            }

            // The API returns 201 Created and the URL in the Location header
            const location = response.headers.get('Location');
            const externalId = location ? location.split('/').pop() || `MOB-${vehicle.id}` : `MOB-${vehicle.id}`;

            return {
                success: true,
                externalId: externalId
            };
        } catch (error: any) {
            console.error('Mobile.de Publish Exception:', error);
            return { success: false, errorMessage: error.message };
        }
    }

    async updateVehicle(vehicle: any, settings: PortalConfig, externalId: string): Promise<PortalResponse> {
        console.log(`Mobile.de Push API: Updating MOB ID: ${externalId}`);
        
        if (!settings.apiKey || !settings.apiSecret || !settings.customerNumber) {
            return { success: false, errorMessage: 'Missing API credentials' };
        }

        try {
            const xml = this.buildVehicleXml(vehicle, settings.customerNumber);
            const auth = Buffer.from(`${settings.apiKey}:${settings.apiSecret}`).toString('base64');
            
            const response = await fetch(`${this.baseUrl}/sellers/${settings.customerNumber}/ads/${externalId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/vnd.de.mobile.api+xml'
                },
                body: xml
            });

            if (!response.ok) {
                const errorText = await response.text();
                return { success: false, errorMessage: `Update Error: ${response.status} - ${errorText}` };
            }

            return { success: true, externalId };
        } catch (error: any) {
            return { success: false, errorMessage: error.message };
        }
    }

    async deleteVehicle(externalId: string, settings: PortalConfig): Promise<PortalResponse> {
        console.log(`Mobile.de Push API: Deleting MOB ID: ${externalId}`);
        
        if (!settings.apiKey || !settings.apiSecret || !settings.customerNumber) {
            return { success: false, errorMessage: 'Missing API credentials' };
        }

        try {
            const auth = Buffer.from(`${settings.apiKey}:${settings.apiSecret}`).toString('base64');
            const response = await fetch(`${this.baseUrl}/sellers/${settings.customerNumber}/ads/${externalId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Basic ${auth}`
                }
            });

            if (!response.ok && response.status !== 404) {
                const errorText = await response.text();
                return { success: false, errorMessage: `Delete Error: ${response.status} - ${errorText}` };
            }

            return { success: true };
        } catch (error: any) {
            return { success: false, errorMessage: error.message };
        }
    }

    private buildVehicleXml(v: any, customerNumber: string): string {
        const escape = (s: any) => s ? s.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
        
        // Basic mobile.de XML structure
        // Note: In a production environment, we'd use a real XML builder to ensure correct namespacing
        // and element ordering according to the XSD.
        return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<ad:ad xmlns:ad="http://services.mobile.de/schema/ad" 
       xmlns:seller="http://services.mobile.de/schema/seller" 
       xmlns:vehicle="http://services.mobile.de/schema/vehicle">
    <ad:vehicle>
        <vehicle:make-label>${escape(v.make)}</vehicle:make-label>
        <vehicle:model-label>${escape(v.model)}</vehicle:model-label>
        <vehicle:specifics>
            <vehicle:mileage value="${v.mileage}" />
            <vehicle:first-registration>${v.year}-01</vehicle:first-registration>
            <vehicle:fuel>${mapToMobileValue('fuel', v.fuelType)}</vehicle:fuel>
            <vehicle:transmission>${mapToMobileValue('transmission', v.transmission)}</vehicle:transmission>
            <vehicle:power value="${v.power || 0}" unit="KW" />
        </vehicle:specifics>
        <vehicle:features>
            ${v.equipment?.map((e: any) => `<vehicle:feature name="${escape(e.name)}" />`).join('\n            ') || ''}
        </vehicle:features>
        <vehicle:description>${escape(v.description)}</vehicle:description>
    </ad:vehicle>
    <ad:price value="${v.price}">
        <ad:currency>EUR</ad:currency>
        <ad:vat-rate-fraction>0.19</ad:vat-rate-fraction>
    </ad:price>
    <ad:images>
        ${v.images?.map((img: any) => `<ad:image url="${escape(img.url)}" />`).join('\n        ') || ''}
    </ad:images>
</ad:ad>`;
    }
}
