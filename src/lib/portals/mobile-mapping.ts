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
        'Mercedes-Benz': 'MERCEDES-BENZ'
    },
    models: {
        'GLC': 'GLC 220',
        'C-Klasse': 'C 220',
        'E-Klasse': 'E 220',
        'S-Klasse': 'S 350'
    }
};

export function mapToMobileValue(category: keyof typeof MOBILE_DE_MAPPING, value: string | null | undefined): string {
    if (!value) return '';
    const categoryMap = MOBILE_DE_MAPPING[category];
    return (categoryMap as any)[value] || value.toUpperCase().replace(/\s+/g, '_');
}
