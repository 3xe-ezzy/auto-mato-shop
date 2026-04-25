const apiKey = 'ahmedabdalla';
const apiSecret = 'DZqyWg2mph2E';
const sellerId = '46761516';
const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

async function test(xml, label) {
    console.log(`Testing: ${label}`);
    try {
        const response = await fetch(`https://services.mobile.de/seller-api/sellers/${sellerId}/ads`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/vnd.de.mobile.api+xml',
                'Accept': 'application/vnd.de.mobile.api+xml'
            },
            body: xml
        });
        const text = await response.text();
        console.log(`Status: ${response.status}`);
        console.log(`Response: ${text.substring(0, 500)}`);
        console.log('-------------------');
    } catch (err) {
        console.error(err);
    }
}

const xml1 = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<ad xmlns="http://services.mobile.de/schema/ad" 
    xmlns:vehicle="http://services.mobile.de/schema/vehicle">
    <vehicle>
        <vehicle:make-label>BMW</vehicle:make-label>
        <vehicle:model-label>320</vehicle:model-label>
        <vehicle:specifics>
            <vehicle:mileage value="50000" />
            <vehicle:first-registration>2020-01</vehicle:first-registration>
            <vehicle:fuel>PETROL</vehicle:fuel>
            <vehicle:transmission>MANUAL_GEAR</vehicle:transmission>
            <vehicle:power value="110" unit="KW" />
        </vehicle:specifics>
        <vehicle:description>Test</vehicle:description>
    </vehicle>
    <price value="15000">
        <currency>EUR</currency>
    </price>
</ad>`;

const xml2 = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<ad xmlns:vehicle="http://services.mobile.de/schema/vehicle">
    <vehicle>
        <vehicle:make-label>BMW</vehicle:make-label>
        <vehicle:model-label>320</vehicle:model-label>
        <vehicle:specifics>
            <vehicle:mileage value="50000" />
            <vehicle:first-registration>2020-01</vehicle:first-registration>
            <vehicle:fuel>PETROL</vehicle:fuel>
            <vehicle:transmission>MANUAL_GEAR</vehicle:transmission>
            <vehicle:power value="110" unit="KW" />
        </vehicle:specifics>
        <vehicle:description>Test</vehicle:description>
    </vehicle>
    <price value="15000">
        <currency>EUR</currency>
    </price>
</ad>`;

async function run() {
    await test(xml1, 'Default Namespace');
    await test(xml2, 'No Namespace');
}

run();
