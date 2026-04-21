const https = require('https');

function test(xml) {
    const b64Auth = Buffer.from('ahmedabdalla:DZqyWg2mph2E').toString('base64');
    const sellerId = '46761516';
    const options = {
        hostname: 'services.mobile.de',
        path: `/seller-api/sellers/${sellerId}/ads`,
        method: 'POST',
        headers: {
            'Authorization': `Basic ${b64Auth}`,
            'Content-Type': 'application/vnd.de.mobile.api+xml',
            'Accept': 'application/vnd.de.mobile.api+xml'
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: data }));
        });
        req.on('error', reject);
        req.write(xml);
        req.end();
    });
}

async function main() {
    const variations = [
        {
            name: "No Namespace Root",
            xml: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<ad>
    <vehicle xmlns:v="http://services.mobile.de/schema/vehicle">
        <v:make-label>Audi</v:make-label>
        <v:model-label>A3</v:model-label>
    </vehicle>
    <price value="10000" xmlns:ad="http://services.mobile.de/schema/ad">
        <ad:currency>EUR</ad:currency>
    </price>
</ad>`
        },
        {
            name: "Seller Ad 1.1 Namespace",
            xml: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<ad xmlns="http://services.mobile.de/schema/seller/seller-ad-1.1" xmlns:vehicle="http://services.mobile.de/schema/seller/vehicle-1.0">
    <vehicle>
        <vehicle:make-label>Audi</vehicle:make-label>
        <vehicle:model-label>A3</vehicle:model-label>
    </vehicle>
    <price value="10000">
        <currency>EUR</currency>
    </price>
</ad>`
        }
    ];

    for (const v of variations) {
        console.log(`Testing variation: ${v.name}`);
        const res = await test(v.xml);
        console.log(`Status: ${res.status}`);
        console.log(`Body: ${res.body.substring(0, 300)}`);
        console.log('---');
    }
}

main().catch(console.error);
