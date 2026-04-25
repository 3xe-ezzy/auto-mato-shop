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

const xml7 = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<ad>
    <vehicleClass>Car</vehicleClass>
    <vehicle>
        <makeLabel>BMW</makeLabel>
        <modelLabel>320</modelLabel>
        <specifics>
            <category>Limousine</category>
            <mileage>50000</mileage>
            <firstRegistration>2020-01</firstRegistration>
            <fuel>PETROL</fuel>
            <transmission>MANUAL_GEAR</transmission>
            <power>110</power>
        </specifics>
        <description>Test Ad from API</description>
    </vehicle>
    <price>
        <consumerPriceAmount>15000</consumerPriceAmount>
        <currency>EUR</currency>
    </price>
</ad>`;

async function run() {
    await test(xml7, 'Full camelCase and price fix');
}

run();
