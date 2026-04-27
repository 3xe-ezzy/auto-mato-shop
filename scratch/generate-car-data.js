const fs = require('fs');

const extracted = JSON.parse(fs.readFileSync('scratch/extracted_models.json', 'utf-8'));

const otherMakes = {
    "Renault": [
        "Twingo", "Clio", "Megane", "Captur",
        "Kadjar", "Austral", "Arkana", "Scenic", "Zoe"
    ],
    "Toyota": [
        "Aygo", "Yaris", "Yaris Cross", "Corolla",
        "Prius", "C-HR", "RAV4", "Hilux",
        "Land Cruiser", "Camry", "Supra"
    ],
    "Ford": [
        "Ka", "Fiesta", "Focus", "Mondeo",
        "Kuga", "Puma", "S-Max", "Galaxy",
        "Mustang", "Ranger", "Explorer"
    ],
    "Opel": [
        "Adam", "Corsa", "Astra", "Insignia",
        "Mokka", "Crossland", "Grandland",
        "Zafira", "Vivaro"
    ],
    "Skoda": [
        "Citigo", "Fabia", "Scala",
        "Octavia", "Superb",
        "Kamiq", "Karoq", "Kodiaq", "Enyaq"
    ],
    "Hyundai": [
        "i10", "i20", "i30",
        "Tucson", "Santa Fe", "Kona",
        "Ioniq", "Ioniq 5", "Ioniq 6"
    ],
    "Kia": [
        "Picanto", "Rio", "Ceed",
        "Sportage", "Sorento", "Niro", "EV6"
    ],
    "Nissan": [
        "Micra", "Note", "Juke",
        "Qashqai", "X-Trail", "Leaf", "Ariya"
    ],
    "Peugeot": [
        "108", "208", "308", "508",
        "2008", "3008", "5008"
    ],
    "Fiat": [
        "500", "Panda", "Tipo", "Punto",
        "Doblo", "Qubo", "500X"
    ],
    "Mazda": [
        "Mazda2", "Mazda3", "Mazda6",
        "CX-3", "CX-30", "CX-5", "MX-5"
    ],
    "Volvo": [
        "V40", "V60", "V90",
        "S60", "S90",
        "XC40", "XC60", "XC90"
    ],
    "Seat": [
        "Mii", "Ibiza", "Leon",
        "Arona", "Ateca", "Tarraco"
    ],
    "Cupra": [
        "Born", "Leon", "Ateca", "Formentor"
    ],
    "Tesla": [
        "Model 3", "Model Y",
        "Model S", "Model X"
    ],
    "Porsche": [
        "911", "Cayenne", "Macan",
        "Panamera", "Taycan"
    ]
};

const allData = {
    "Audi": extracted["Audi"],
    "BMW": extracted["BMW"],
    "Mercedes-Benz": extracted["Mercedes-Benz"],
    "Volkswagen": extracted["Volkswagen"],
    ...otherMakes
};

let content = "export const carData: Record<string, string[]> = {\n";

for (const [make, models] of Object.entries(allData)) {
    content += `    "${make}": [\n`;
    // Chunk models to keep lines reasonably short
    const chunks = [];
    for (let i = 0; i < models.length; i += 5) {
        chunks.push(models.slice(i, i + 5).map(m => `"${m}"`).join(", "));
    }
    content += `        ${chunks.join(",\n        ")}\n`;
    content += "    ],\n\n";
}

content = content.trimEnd().replace(/,$/, "") + "\n}\n";

fs.writeFileSync('scratch/new_car_data.ts', content);
console.log('New car data generated.');
