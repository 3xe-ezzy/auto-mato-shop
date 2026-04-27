import { PortalAdapter, PortalConfig, PortalResponse } from './types';
import { mapToMobileValue } from './mobile-mapping';

export class MobileDeAdapter implements PortalAdapter {
    private baseUrl = 'https://services.mobile.de/seller-api/sellers';

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
            const sellerId = settings.customerNumber || '46761516';
            const url = `${this.baseUrl}/${sellerId}/ads/${externalId}`;

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
            const payload = this.buildVehicleJson(vehicle);
            const jsonBody = JSON.stringify(payload);
            
            const primaryUser = settings.apiKey || 'ahmedabdalla';
            const fallbackUser = settings.customerNumber || '46761516';
            
            const auth = Buffer.from(`${primaryUser}:${settings.apiSecret}`).toString('base64');

            const method = externalId ? 'PUT' : 'POST';
            const sellerId = '46761516'; // Technical Seller ID from API probe
            const url = externalId 
                ? `${this.baseUrl}/${sellerId}/ads/${externalId}` 
                : `${this.baseUrl}/${sellerId}/ads`;

            console.log(`Syncing to Mobile.de (${method}): ${url} using user: ${primaryUser}`);
            
            const vendorHeaders = {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/vnd.de.mobile.api+json',
                'Accept': 'application/vnd.de.mobile.api+json'
            };

            let response = await fetch(url, {
                method,
                headers: vendorHeaders,
                body: jsonBody
            });

            // If 404 or 401 with primary, try fallback user (Seller API ID)
            if ((response.status === 404 || response.status === 401) && primaryUser !== fallbackUser) {
                console.log(`Retrying with fallback user: ${fallbackUser}`);
                const fallbackAuth = Buffer.from(`${fallbackUser}:${settings.apiSecret}`).toString('base64');
                response = await fetch(url, {
                    method,
                    headers: {
                        ...vendorHeaders,
                        'Authorization': `Basic ${fallbackAuth}`
                    },
                    body: jsonBody
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
        // Mobile.de Seller API 1.1 requires yyyyMM format (e.g. 202404)
        if (!dateVal) return '202001';
        const str = dateVal.toString().trim();
        
        // Handle "MM.YYYY" format
        if (str.includes('.')) {
            const parts = str.split('.');
            let month = parts[0].padStart(2, '0');
            let yearPart = parts[1];
            
            if (yearPart.length === 2) {
                yearPart = "20" + yearPart;
            }
            if (yearPart.length === 4) {
                return `${yearPart}${month}`;
            }
        }

        // Handle "YYYY-MM" format
        if (/^\d{4}-\d{2}$/.test(str)) {
            return str.replace('-', '');
        }

        // Handle "YYYY" format
        if (/^\d{4}$/.test(str)) {
            return `${str}01`;
        }

        return '202001';
    }

    private buildVehicleJson(v: any): any {
        const firstReg = this.convertMobileDate(v.year);

        const makeKey = mapToMobileValue('makes', v.make);
        const modelKey = mapToMobileValue('models', v.model);
        const fuelKey = mapToMobileValue('fuel', v.fuelType) || 'PETROL';
        const gearboxKey = mapToMobileValue('transmission', v.transmission) || 'MANUAL_GEAR';
        const conditionKey = mapToMobileValue('condition', v.condition) || 'USED';
        
        let category = 'Limousine';
        const modelUpper = v.model.toUpperCase();
        if (v.make === 'Mercedes-Benz') {
            if (modelUpper.startsWith('G') || modelUpper.includes('GLC') || modelUpper.includes('GLE') || modelUpper.includes('GLA') || modelUpper.includes('GLB') || modelUpper.includes('GLS') || modelUpper.includes('ML')) {
                category = 'OffRoad';
            }
        } else if (v.make === 'BMW') {
            if (modelUpper.startsWith('X')) {
                category = 'OffRoad';
            }
        } else if (v.make === 'Audi') {
            if (modelUpper.startsWith('Q')) {
                category = 'OffRoad';
            }
        } else if (v.make === 'Volkswagen' || v.make === 'VW') {
            if (modelUpper.includes('TIGUAN') || modelUpper.includes('TOUAREG') || modelUpper.includes('T-ROC') || modelUpper.includes('T-CROSS')) {
                category = 'OffRoad';
            }
        }

        // Base JSON structure following Mobile.de Seller API 1.1 Reference
        const payload: any = {
            sellerInventoryKey: (v.articleNumber || v.id).toString(),
            vehicleClass: "Car",
            category: category,
            make: makeKey,
            model: modelKey,
            modelDescription: `${v.make} ${v.model}`,
            damageUnrepaired: false,
            accidentDamaged: false,
            roadworthy: true,
            mileage: Math.round(v.mileage || 0),
            fuel: fuelKey,
            power: Math.round(v.power || 100),
            gearbox: gearboxKey,
            condition: conditionKey,
            firstRegistration: firstReg,
            description: v.description || '',
            price: {
                consumerPriceGross: parseFloat((v.price || 0).toFixed(2)),
                type: "FIXED",
                currency: "EUR"
            }
        };

        return payload;
    }
}
