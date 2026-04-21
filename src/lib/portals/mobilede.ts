import { PortalAdapter, PortalConfig, PortalResponse } from './types';

export class MobileDeAdapter implements PortalAdapter {
    private async generateXml(vehicle: any, settings: PortalConfig): Promise<string> {
        // Essential mapping for mobile.de
        // Note: Element order is CRITICAL in mobile.de XSD
        const firstRegistration = vehicle.year ? `01-${vehicle.year}` : '01-2020';
        
        // Map fuel type to mobile.de enums
        const fuelMapping: Record<string, string> = {
            'Benzin': 'PETROL',
            'Diesel': 'DIESEL',
            'Hybrid': 'HYBRID',
            'Elektro': 'ELECTRIC',
            'Petrol': 'PETROL'
        };
        const fuelType = fuelMapping[vehicle.fuelType] || 'PETROL';

        // Map transmission to mobile.de enums
        const transMapping: Record<string, string> = {
            'Automatik': 'AUTOMATIC_GEAR',
            'Schaltgetriebe': 'MANUAL_GEAR',
            'Automatic': 'AUTOMATIC_GEAR',
            'Manual': 'MANUAL_GEAR'
        };
        const transmission = transMapping[vehicle.transmission] || 'MANUAL_GEAR';

        const escape = (str: string) => str.replace(/[<>&"']/g, (c) => {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '"': return '&quot;';
                case "'": return '&apos;';
                default: return c;
            }
        });

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<ad:advert xmlns:ad="http://services.mobile.de/schema/ad" 
            xmlns:seller="http://services.mobile.de/schema/seller" 
            xmlns:resource="http://services.mobile.de/schema/resource"
            xmlns:vehicle="http://services.mobile.de/schema/vehicle">
    <ad:vehicle>
        <vehicle:class>Car</vehicle:class>
        <vehicle:make-id>${escape(vehicle.make)}</vehicle:make-id>
        <vehicle:model-id>${escape(vehicle.model)}</vehicle:model-id>
        <vehicle:category>Limousine</vehicle:category>
        <vehicle:price value="${vehicle.price}" currency="EUR" />
        <vehicle:mileage value="${vehicle.mileage}" />
        <vehicle:first-registration value="${firstRegistration}" />
        <vehicle:fuel value="${fuelType}" />
        <vehicle:transmission value="${transmission}" />
        <vehicle:description>${escape(vehicle.description || '')}</vehicle:description>
        <vehicle:images>
            ${vehicle.images?.map((img: any) => `<vehicle:image url="${escape(img.url)}" />`).join('\n            ') || ''}
        </vehicle:images>
    </ad:vehicle>
</ad:advert>`;

        return xml;
    }

    async publishVehicle(vehicle: any, settings: PortalConfig): Promise<PortalResponse> {
        console.log('Mobile.de API: Publishing vehicle', vehicle.id);
        
        if (!settings.apiKey || !settings.apiSecret) {
            return { success: false, errorMessage: 'Fehlende API-Zugangsdaten (Benutzername/Passwort)' };
        }

        // Use the customer number as the Seller-ID in the URL
        const sellerId = settings.customerNumber || '46761516'; // Fallback to provided number if missing
        const url = `https://services.mobile.de/hws/adverts/${sellerId}`;
        
        const xml = await this.generateXml(vehicle, settings);
        console.log('Mobile.de Outgoing XML:', xml);

        try {
            const auth = Buffer.from(`${settings.apiKey}:${settings.apiSecret}`).toString('base64');
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/xml',
                    'Accept': 'application/xml',
                    'Accept-Language': 'de'
                },
                body: xml
            });

            const responseText = await response.text();
            console.log(`Mobile.de API Response (${response.status}):`, responseText);

            if (response.ok) {
                // Mobile.de returns the path to the new advert in Location header or body
                // Often in form of /adverts/12345
                const match = responseText.match(/adverts\/(\d+)/);
                const externalId = match ? match[1] : `MOB-${vehicle.id}`;
                
                return {
                    success: true,
                    externalId: externalId
                };
            } else {
                return {
                    success: false,
                    errorMessage: `Mobile.de Fehler (${response.status}): ${responseText.substring(0, 200)}`
                };
            }
        } catch (error: any) {
            console.error('Mobile.de API Error:', error);
            return {
                success: false,
                errorMessage: `Verbindungsfehler: ${error.message}`
            };
        }
    }

    async updateVehicle(vehicle: any, settings: PortalConfig, externalId: string): Promise<PortalResponse> {
        console.log(`Mobile.de API: Updating vehicle ${vehicle.id} (External ID: ${externalId})`);
        
        const sellerId = settings.customerNumber || '46761516';
        const url = `https://services.mobile.de/hws/adverts/${sellerId}/${externalId}`;
        
        const xml = await this.generateXml(vehicle, settings);

        try {
            const auth = Buffer.from(`${settings.apiKey}:${settings.apiSecret}`).toString('base64');
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/xml',
                    'Accept': 'application/xml',
                    'Accept-Language': 'de'
                },
                body: xml
            });

            if (response.ok) {
                return { success: true, externalId };
            } else {
                const text = await response.text();
                return {
                    success: false,
                    errorMessage: `Mobile.de Update Fehler (${response.status}): ${text.substring(0, 200)}`
                };
            }
        } catch (error: any) {
            return { success: false, errorMessage: error.message };
        }
    }

    async deleteVehicle(externalId: string, settings: PortalConfig): Promise<PortalResponse> {
        console.log(`Mobile.de API: Deleting MOB ID: ${externalId}`);
        
        const sellerId = settings.customerNumber || '46761516';
        const url = `https://services.mobile.de/hws/adverts/${sellerId}/${externalId}`;

        try {
            const auth = Buffer.from(`${settings.apiKey}:${settings.apiSecret}`).toString('base64');
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Accept-Language': 'de'
                }
            });

            if (response.ok || response.status === 404) {
                return { success: true };
            } else {
                const text = await response.text();
                return {
                    success: false,
                    errorMessage: `Mobile.de Delete Fehler (${response.status}): ${text.substring(0, 200)}`
                };
            }
        } catch (error: any) {
            return { success: false, errorMessage: error.message };
        }
    }
}
