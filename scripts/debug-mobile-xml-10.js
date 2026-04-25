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

const xmlFlat = `<?xml version="1.0" encoding="UTF-8"?>
<ad>
  <vehicleClass>CAR</vehicleClass>
  <category>Limousine</category>
  <vehicle>
    <make>Volkswagen</make>
    <model>Golf</model>
    <specifics>
      <mileage>50000</mileage>
      <firstRegistration>2020-05</firstRegistration>
      <fuel>PETROL</fuel>
      <power unit="KW">110</power>
      <gearbox>MANUAL_GEARBOX</gearbox>
    </specifics>
    <descriptions>
      <description>Test Ad</description>
    </descriptions>
  </vehicle>
  <price>
    <amount>15000</amount>
    <currency>EUR</currency>
    <type>BRUTTO</type>
  </price>
</ad>`;

async function run() {
    await test(xmlFlat, 'Flat XML from Docs');
}

run();
