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
            const username = settings.apiKey || settings.customerNumber;
            const auth = Buffer.from(`${username}:${settings.apiSecret}`).toString('base64');
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
            
            // Primary: ahmedabdalla, Fallback: 46761516
            // Based on our probes, the server recognizes both at different paths, 
            // but for /ads, the ID 46761516 was more consistent in returning 401 instead of 404.
            const primaryUser = settings.apiKey || 'ahmedabdalla';
            const fallbackUser = settings.customerNumber || '46761516';
            
            const auth = Buffer.from(`${primaryUser}:${settings.apiSecret}`).toString('base64');

            const method = externalId ? 'PUT' : 'POST';
            const url = externalId 
                ? `${this.baseUrl}/ads/${externalId}` 
                : `${this.baseUrl}/ads`;

            console.log(`Syncing to Mobile.de (${method}): ${url} using user: ${primaryUser}`);
            
            let response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/xml',
                    'Accept': 'application/xml'
                },
                body: xml
            });

            // If 404 or 401 with primary, try fallback user (Seller API ID)
            if ((response.status === 404 || response.status === 401) && primaryUser !== fallbackUser) {
                console.log(`Retrying with fallback user: ${fallbackUser}`);
                const fallbackAuth = Buffer.from(`${fallbackUser}:${settings.apiSecret}`).toString('base64');
                response = await fetch(url, {
                    method,
                    headers: {
                        'Authorization': `Basic ${fallbackAuth}`,
                        'Content-Type': 'application/xml',
                        'Accept': 'application/xml'
                    },
                    body: xml
                });
            }

            const responseText = await response.text();

            if (!response.ok) {
                if (response.status === 404 && externalId) {
                    console.log('Mobile.de ad not found (404) during update, trying new creation (POST)...');
                    return this.sync(vehicle, settings);
                }

                console.error('Mobile.de Sync Error:', response.status, responseText);
                return { 
                    success: false, 
                    errorMessage: `Mobile.de API Error: ${response.status}. Details: ${responseText || 'No response body'}` 
                };
            }

            let newExternalId = externalId;
            if (method === 'POST') {
                const location = response.headers.get('Location');
                if (location) {
                    newExternalId = location.split('/').pop() || undefined;
                }
            }

            return { success: true, externalId: newExternalId };
        } catch (error: any) {
            console.error('Mobile.de Portal Error:', error);
            return { success: false, errorMessage: error.message };
        }
    }

    private convertMobileDate(dateVal: any): string {
        if (!dateVal) return '2020-01';
        const str = dateVal.toString().trim();
        
        if (str.includes('.')) {
            const parts = str.split('.');
            let month = parts[0].padStart(2, '0');
            let yearPart = parts[1];
            
            if (yearPart.length >= 2) {
                const yearDigits = yearPart.slice(-2);
                const year = "20" + yearDigits;
                return `${year}-${month}`;
            }
        }

        if (/^\d{4}-\d{2}$/.test(str)) return str;
        if (/^\d{4}$/.test(str)) return `${str}-01`;

        return '2020-01';
    }

    private buildVehicleXml(v: any): string {
        const escape = (str: string) => (str || '').toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const firstReg = this.convertMobileDate(v.year);

        const makeKey = mapToMobileValue('makes', v.make);
        const modelKey = mapToMobileValue('models', v.model);
        const fuelKey = mapToMobileValue('fuel', v.fuelType) || 'PETROL';
        const gearboxKey = mapToMobileValue('transmission', v.transmission) || 'MANUAL_GEAR';
        const conditionKey = mapToMobileValue('condition', v.condition) || 'USED';
        
        let category = mapToMobileValue('category', v.model) || 'Limousine';
        if (v.make === 'Mercedes-Benz' && (v.model.includes('GLC') || v.model.includes('GLE') || v.model.includes('GLA'))) {
            category = 'OffRoad';
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
            <vehicle:make key="${makeKey}"/>
            <vehicle:model key="${modelKey}"/>
        </vehicle:classification>

        <vehicle:model-description value="${escape(v.make + ' ' + v.model)}"/>
        <vehicle:damage-and-unrepaired value="false"/>
        <vehicle:accident-damaged value="false"/>
        <vehicle:roadworthy value="true"/>

        <vehicle:specifics>
            <vehicle:mileage value="${Math.round(v.mileage || 0)}"/>
            <vehicle:fuel key="${fuelKey}"/>
            <vehicle:power value="${Math.round(v.power || 100)}"/>
            <vehicle:gearbox key="${gearboxKey}"/>
            <vehicle:condition key="${conditionKey}"/>
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
