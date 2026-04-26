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
                // Log the XML we sent for debugging
                console.error('Mobile.de XML Sent:', xml);
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
        const escape = (s: any) => s ? s.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : '';
        
        const monthStr = '01';
        const yearStr = v.year || new Date().getFullYear();
        const firstReg = `${yearStr}-${monthStr}`;
        
        const model = mapToMobileValue('models', v.model);
        
        // Basic category mapping
        let category = 'Limousine';
        const modelLower = (v.model || '').toLowerCase();
        const makeLower = (v.make || '').toLowerCase();

        if (modelLower.includes('glc') || modelLower.includes('gle') || modelLower.includes('gls') || 
            modelLower.includes('g-klasse') || modelLower.includes('g 500') || modelLower.includes('ml ') ||
            modelLower.includes('tiguan') || modelLower.includes('touareg') || modelLower.includes('t-roc') ||
            modelLower.includes('q3') || modelLower.includes('q5') || modelLower.includes('q7') || modelLower.includes('x3') || modelLower.includes('x5')) {
            category = 'OffRoad';
        } else if (modelLower.includes('eqv') || modelLower.includes('vito') || modelLower.includes('v-klasse') || 
                   modelLower.includes('vaneo') || modelLower.includes('sharan') || modelLower.includes('touran') ||
                   modelLower.includes('caddy') || modelLower.includes('multivan') || modelLower.includes('transporter')) {
            category = 'Van';
        } else if (modelLower.includes('kombi') || modelLower.includes('variant') || modelLower.includes('shooting brake') || modelLower.includes('avant')) {
            category = 'EstateCar';
        }

        return `<?xml version="1.0" encoding="UTF-8"?>
<ad>
    <vehicleClass>Car</vehicleClass>
    <category>${category}</category>
    <make>${mapToMobileValue('makes', v.make)}</make>
    <model>${model || 'ANDERE'}</model>
    <mileage>${v.mileage || 0}</mileage>
    <first-registration>${firstReg}</first-registration>
    <fuel>${mapToMobileValue('fuel', v.fuelType)}</fuel>
    <gearbox>${mapToMobileValue('transmission', v.transmission)}</gearbox>
    <power unit="KW">${v.power || 100}</power>
    <condition>${mapToMobileValue('condition', v.condition) || 'USED'}</condition>
    <descriptions>
        <description>${escape(v.description || '')}</description>
    </descriptions>
    <price>
        <consumerValue>
            <amount>${Math.round(v.price || 0)}</amount>
            <currency>EUR</currency>
        </consumerValue>
        <taxDetail>GROSS</taxDetail>
    </price>
</ad>`;
    }
}
