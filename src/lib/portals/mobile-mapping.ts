/**
 * mobile.de API Value Mapping
 * Maps our internal database values to mobile.de XML schema values.
 */

export const MOBILE_DE_MAPPING = {
    fuel: {
        'Petrol': 'PETROL',
        'Diesel': 'DIESEL',
        'Hybrid': 'HYBRID',
        'Electric': 'ELECTRICITY',
        'LPG': 'LPG',
        'CNG': 'CNG'
    },
    transmission: {
        'Manual': 'MANUAL_GEAR',
        'Automatic': 'AUTOMATIC_GEAR',
        'Semi-Automatic': 'SEMIAUTOMATIC_GEAR'
    },
    condition: {
        'New': 'NEW',
        'Used': 'USED'
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
    models: {
        // Models are now selected from the official mobile.de list in the UI.
        // We can add specific overrides here if needed.
    },
    category: {
        // We can add specific overrides here if needed.
    }
};

export function mapToMobileValue(category: keyof typeof MOBILE_DE_MAPPING, value: string | null | undefined): string {
    if (!value) return '';
    const categoryMap = MOBILE_DE_MAPPING[category];
    if ((categoryMap as any)[value]) {
        return (categoryMap as any)[value];
    }
    // For models, we usually want to keep the name as is if we're using official names
    if (category === 'models') {
        return value;
    }
    return value.toUpperCase().replace(/\s+/g, '_');
}
