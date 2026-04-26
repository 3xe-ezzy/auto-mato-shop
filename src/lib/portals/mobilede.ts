import { PortalListing } from './sync-service';
import { mapToMobileValue } from './mobile-mapping';

export class MobileDeAdapter {
    private baseUrl = 'https://services.mobile.de/seller-api/v1';

    async sync(listing: PortalListing): Promise<{ externalId?: string; error?: string }> {
        try {
            const xml = this.buildVehicleXml(listing);
            const auth = Buffer.from(`${listing.portal.apiKey}:${listing.portal.apiSecret}`).toString('base64');

            // If we have an externalId, it's an update (PUT), otherwise a create (POST)
            const method = listing.externalId ? 'PUT' : 'POST';
            const url = listing.externalId 
                ? `${this.baseUrl}/ads/${listing.externalId}` 
                : `${this.baseUrl}/ads`;

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
                console.error('Mobile.de Sync Error:', response.status, responseText);
                return { error: `Mobile.de API Error: ${response.status} - ${responseText}` };
            }

            // Extract externalId from response (Location header or body)
            let externalId = listing.externalId;
            if (method === 'POST') {
                const location = response.headers.get('Location');
                if (location) {
                    externalId = location.split('/').pop();
                }
            }

            return { externalId };
        } catch (error: any) {
            console.error('Mobile.de Portal Error:', error);
            return { error: error.message };
        }
    }

    private buildVehicleXml(listing: PortalListing): string {
        const v = listing.vehicle;
        const escape = (str: string) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
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
            <vehicle:make key="${mapToMobileValue('make', v.make) || v.make}"/>
            <vehicle:model key="${mapToMobileValue('model', v.model) || v.model}"/>
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
