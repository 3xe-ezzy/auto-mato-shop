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

        const fs = require('fs');

        const fetchModels = async (makeName, fileName) => {
            const match = makesXml.match(new RegExp(`<refType><name>([^<]+)</name><description>${makeName}</description>`));
            if (match) {
                const id = match[1];
                console.log(`Found ${makeName} ID: ${id}`);
                const response = await fetch(`https://services.mobile.de/refdata/classes/Car/makes/${id}/models`, { headers });
                const xml = await response.text();
                fs.writeFileSync(`scratch/${fileName}.xml`, xml);
                console.log(`Saved ${makeName} models to scratch/${fileName}.xml`);
            } else {
                console.log(`${makeName} not found`);
            }
        };

        await fetchModels('Audi', 'audi_models');
        await fetchModels('BMW', 'bmw_models');

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
