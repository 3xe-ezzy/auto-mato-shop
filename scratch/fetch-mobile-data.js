async function main() {
    const customerNumber = '46761516';
    const apiKey = 'ahmedabdalla';
    const apiSecret = 'IjlnxmgoPV0z';
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

    const headers = {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/vnd.de.mobile.api+xml'
    };

    try {
        console.log('Fetching makes...');
        const makesResponse = await fetch('https://services.mobile.de/refdata/classes/Car/makes', { headers });
        const makesXml = await makesResponse.text();

        // VW
        const vwMatch = makesXml.match(/<refType><name>([^<]+)<\/name><description>Volkswagen<\/description>/);
        if (vwMatch) {
            const vwId = vwMatch[1];
            console.log(`Found VW ID: ${vwId}`);
            const vwModelsResponse = await fetch(`https://services.mobile.de/refdata/classes/Car/makes/${vwId}/models`, { headers });
            const vwModelsXml = await vwModelsResponse.text();
            const fs = require('fs');
            fs.writeFileSync('scratch/vw_models.xml', vwModelsXml);
            console.log('Saved VW models to scratch/vw_models.xml');
        } else {
            console.log('VW (Volkswagen) not found');
            // Try to find VW name
             const vwApproxMatch = makesXml.match(/<name>([^<]*VW[^<]*)<\/name>/);
             if (vwApproxMatch) console.log('Approx VW match:', vwApproxMatch[1]);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
