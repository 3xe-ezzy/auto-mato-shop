/**
 * mobile.de API Value Mapping
 * Maps our internal database values to official mobile.de XML schema keys.
 */

export const MOBILE_DE_MAPPING = {
    fuel: {
        'Petrol': 'PETROL',
        'Benzin': 'PETROL',
        'Diesel': 'DIESEL',
        'Hybrid': 'HYBRID',
        'Electric': 'ELECTRICITY',
        'LPG': 'LPG',
        'CNG': 'CNG'
    },
    transmission: {
        'Manual': 'MANUAL_GEAR',
        'Schaltgetriebe': 'MANUAL_GEAR',
        'Automatic': 'AUTOMATIC_GEAR',
        'Automatik': 'AUTOMATIC_GEAR',
        'Semi-Automatic': 'SEMIAUTOMATIC_GEAR'
    },
    condition: {
        'New': 'NEW',
        'Neu': 'NEW',
        'Used': 'USED',
        'Gebraucht': 'USED'
    },
    emissionClass: {
        'Euro 6': 'EURO6',
        'Euro 6d': 'EURO6D',
        'Euro 6d-TEMP': 'EURO6D_TEMP',
        'Euro 5': 'EURO5',
        'Euro 4': 'EURO4'
    },
    makes: {
        'Volkswagen': 'VW',
        'Mercedes-Benz': 'MERCEDES-BENZ',
        'Audi': 'AUDI',
        'BMW': 'BMW'
    },
    category: {
        'Limousine': 'Limousine',
        'SUV': 'OffRoad',
        'Kombi': 'EstateCar',
        'Kleinwagen': 'SmallCar',
        'Sportwagen': 'SportsCar',
        'Van': 'Van'
    },
    models: {
        // Hier können spezifische Overrides rein
    }
};

export function mapToMobileValue(category: string, value: string | null | undefined): string {
    if (!value) return '';
    
    const mapping = (MOBILE_DE_MAPPING as any)[category];
    if (mapping && mapping[value]) {
        return mapping[value];
    }

    // Default transformation for keys (Uppercase)
    // Mobile.de reference data often uses spaces (e.g. "C 180" or "Golf IV").
    // We only remove special characters like dots and hyphens if necessary, 
    // but we keep spaces as they are in the official reference data.
    return value.toString().trim().toUpperCase()
        .replace(/-/g, ' ') // Replace hyphen with space to match "MERCEDES-BENZ" -> "MERCEDES BENZ" ? No, keep hyphen for makes.
        .replace(/\./g, '');
}
