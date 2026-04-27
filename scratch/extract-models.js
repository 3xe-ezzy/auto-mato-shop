const fs = require('fs');

function extractModels(xmlPath) {
    if (!fs.existsSync(xmlPath)) return [];
    const xml = fs.readFileSync(xmlPath, 'utf-8');
    const matches = xml.matchAll(/<refType><name>([^<]+)<\/name><description>([^<]+)<\/description>/g);
    const models = [];
    for (const match of matches) {
        if (match[1] !== 'ANDERE') {
            models.push(match[2]);
        }
    }
    return models;
}

const mbModels = extractModels('scratch/mercedes_models.xml');
const vwModels = extractModels('scratch/vw_models.xml');
const audiModels = extractModels('scratch/audi_models.xml');
const bmwModels = extractModels('scratch/bmw_models.xml');

fs.writeFileSync('scratch/extracted_models.json', JSON.stringify({
    'Mercedes-Benz': mbModels,
    'Volkswagen': vwModels,
    'Audi': audiModels,
    'BMW': bmwModels
}, null, 2));

console.log('Extraction complete.');
