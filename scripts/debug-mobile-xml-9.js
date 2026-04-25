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
        console.log(`Response: ${text.substring(0, 1000)}`);
        console.log('-------------------');
    } catch (err) {
        console.error(err);
    }
}

const xml11 = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<ad>
    <vehicle-class>Car</vehicle-class>
    <vehicle>
        <make-label>BMW</make-label>
        <model-label>320</model-label>
        <specifics>
            <mileage value="50000" />
            <first-registration>2020-01</first-registration>
            <fuel>PETROL</fuel>
            <transmission>MANUAL_GEAR</transmission>
            <power value="110" unit="KW" />
        </specifics>
    </vehicle>
    <price currency="EUR">
        <consumer-price-amount value="15000" />
    </price>
</ad>`;

async function run() {
    await test(xml11, 'Hyphenated No Namespaces');
}

run();
