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

const xml9 = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<ad>
    <vehicleClass>Car</vehicleClass>
    <vehicle>
        <makeLabel>BMW</makeLabel>
        <modelLabel>320</modelLabel>
        <specifics>
            <mileage>50000</mileage>
            <firstRegistration>2020-01</firstRegistration>
            <fuel>PETROL</fuel>
            <transmission>MANUAL_GEAR</transmission>
            <power>110</power>
        </specifics>
    </vehicle>
    <price>
        <consumerValue>15000</consumerValue>
        <currency>EUR</currency>
    </price>
</ad>`;

const xml10 = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<ad>
    <vehicleClass>Car</vehicleClass>
    <category>Limousine</category>
    <vehicle>
        <makeLabel>BMW</makeLabel>
        <modelLabel>320</modelLabel>
        <specifics>
            <mileage>50000</mileage>
            <firstRegistration>2020-01</firstRegistration>
            <fuel>PETROL</fuel>
            <transmission>MANUAL_GEAR</transmission>
            <power>110</power>
        </specifics>
    </vehicle>
    <price>
        <amount value="15000" />
        <currency>EUR</currency>
    </price>
</ad>`;

async function run() {
    await test(xml9, 'consumerValue tag');
    await test(xml10, 'amount value tag');
}

run();
