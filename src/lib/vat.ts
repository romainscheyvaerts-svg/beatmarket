// ============================================================================
// 🇪🇺 BeatMarket — Moteur de Calcul TVA Européenne
// ============================================================================
// Gestion automatique de la TVA selon le pays de l'acheteur
// Conforme aux règles EU pour les services numériques (MOSS/OSS)
// ============================================================================

import type { VatCalculation } from '@/types';

// ---- Taux de TVA par pays EU (services numériques) ----

interface VatRateConfig {
  country: string;
  countryName: string;
  standardRate: number;   // Taux standard
  digitalRate: number;    // Taux pour services numériques (souvent = standard)
  currency: string;
}

export const EU_VAT_RATES: Record<string, VatRateConfig> = {
  FR: { country: 'FR', countryName: 'France',       standardRate: 0.20, digitalRate: 0.20, currency: 'EUR' },
  BE: { country: 'BE', countryName: 'Belgique',     standardRate: 0.21, digitalRate: 0.21, currency: 'EUR' },
  DE: { country: 'DE', countryName: 'Allemagne',    standardRate: 0.19, digitalRate: 0.19, currency: 'EUR' },
  NL: { country: 'NL', countryName: 'Pays-Bas',     standardRate: 0.21, digitalRate: 0.21, currency: 'EUR' },
  IT: { country: 'IT', countryName: 'Italie',       standardRate: 0.22, digitalRate: 0.22, currency: 'EUR' },
  ES: { country: 'ES', countryName: 'Espagne',      standardRate: 0.21, digitalRate: 0.21, currency: 'EUR' },
  PT: { country: 'PT', countryName: 'Portugal',     standardRate: 0.23, digitalRate: 0.23, currency: 'EUR' },
  AT: { country: 'AT', countryName: 'Autriche',     standardRate: 0.20, digitalRate: 0.20, currency: 'EUR' },
  IE: { country: 'IE', countryName: 'Irlande',      standardRate: 0.23, digitalRate: 0.23, currency: 'EUR' },
  LU: { country: 'LU', countryName: 'Luxembourg',   standardRate: 0.17, digitalRate: 0.17, currency: 'EUR' },
  FI: { country: 'FI', countryName: 'Finlande',     standardRate: 0.255,digitalRate: 0.255,currency: 'EUR' },
  SE: { country: 'SE', countryName: 'Suède',        standardRate: 0.25, digitalRate: 0.25, currency: 'SEK' },
  DK: { country: 'DK', countryName: 'Danemark',     standardRate: 0.25, digitalRate: 0.25, currency: 'DKK' },
  PL: { country: 'PL', countryName: 'Pologne',      standardRate: 0.23, digitalRate: 0.23, currency: 'PLN' },
  CZ: { country: 'CZ', countryName: 'Tchéquie',     standardRate: 0.21, digitalRate: 0.21, currency: 'CZK' },
  RO: { country: 'RO', countryName: 'Roumanie',     standardRate: 0.19, digitalRate: 0.19, currency: 'RON' },
  HU: { country: 'HU', countryName: 'Hongrie',      standardRate: 0.27, digitalRate: 0.27, currency: 'HUF' },
  BG: { country: 'BG', countryName: 'Bulgarie',     standardRate: 0.20, digitalRate: 0.20, currency: 'BGN' },
  HR: { country: 'HR', countryName: 'Croatie',      standardRate: 0.25, digitalRate: 0.25, currency: 'EUR' },
  GR: { country: 'GR', countryName: 'Grèce',        standardRate: 0.24, digitalRate: 0.24, currency: 'EUR' },
  SK: { country: 'SK', countryName: 'Slovaquie',    standardRate: 0.20, digitalRate: 0.20, currency: 'EUR' },
  SI: { country: 'SI', countryName: 'Slovénie',     standardRate: 0.22, digitalRate: 0.22, currency: 'EUR' },
  LT: { country: 'LT', countryName: 'Lituanie',    standardRate: 0.21, digitalRate: 0.21, currency: 'EUR' },
  LV: { country: 'LV', countryName: 'Lettonie',     standardRate: 0.21, digitalRate: 0.21, currency: 'EUR' },
  EE: { country: 'EE', countryName: 'Estonie',      standardRate: 0.22, digitalRate: 0.22, currency: 'EUR' },
  CY: { country: 'CY', countryName: 'Chypre',       standardRate: 0.19, digitalRate: 0.19, currency: 'EUR' },
  MT: { country: 'MT', countryName: 'Malte',        standardRate: 0.18, digitalRate: 0.18, currency: 'EUR' },
};

// Pays de l'entreprise (BeatMarket basée en France)
const PLATFORM_COUNTRY = 'FR';

// ---- Fonctions principales ----

/**
 * Calcule la TVA pour une commande de services numériques (beats/licences)
 * 
 * Règles EU pour les services numériques (B2C) :
 * - La TVA est appliquée au taux du pays de l'ACHETEUR
 * - Si l'acheteur est hors EU → Pas de TVA (exonération export)
 * - Si l'acheteur est un professionnel EU avec numéro TVA → Auto-liquidation (reverse charge)
 * 
 * @param subtotalCents - Montant HT en centimes EUR
 * @param buyerCountry  - Code pays ISO de l'acheteur (ex: "FR", "BE")
 * @param buyerVatNumber - Numéro TVA intracommunautaire (optionnel, pour B2B)
 * @returns VatCalculation
 */
export function calculateVAT(
  subtotalCents: number,
  buyerCountry: string,
  buyerVatNumber?: string | null
): VatCalculation {
  const countryCode = buyerCountry.toUpperCase();
  const vatConfig = EU_VAT_RATES[countryCode];

  // ---- Cas 1 : Acheteur hors EU → Pas de TVA ----
  if (!vatConfig) {
    return {
      country: countryCode,
      vatRate: 0,
      subtotal: subtotalCents,
      vatAmount: 0,
      total: subtotalCents,
      isReverseCharge: false,
    };
  }

  // ---- Cas 2 : B2B intra-EU avec numéro TVA valide → Auto-liquidation ----
  // (L'acheteur pro dans un autre pays EU déclare lui-même la TVA)
  if (
    buyerVatNumber &&
    isValidVatNumber(buyerVatNumber) &&
    countryCode !== PLATFORM_COUNTRY
  ) {
    return {
      country: countryCode,
      vatRate: vatConfig.digitalRate,
      subtotal: subtotalCents,
      vatAmount: 0, // Pas de TVA facturée (auto-liquidation)
      total: subtotalCents,
      isReverseCharge: true,
    };
  }

  // ---- Cas 3 : B2C dans l'EU → TVA au taux du pays de l'acheteur ----
  const vatRate = vatConfig.digitalRate;
  const vatAmount = Math.round(subtotalCents * vatRate);
  const total = subtotalCents + vatAmount;

  return {
    country: countryCode,
    vatRate,
    subtotal: subtotalCents,
    vatAmount,
    total,
    isReverseCharge: false,
  };
}

/**
 * Obtient le taux de TVA pour un pays donné
 */
export function getVatRate(countryCode: string): number {
  const config = EU_VAT_RATES[countryCode.toUpperCase()];
  return config?.digitalRate ?? 0;
}

/**
 * Vérifie si un pays est dans l'UE
 */
export function isEUCountry(countryCode: string): boolean {
  return countryCode.toUpperCase() in EU_VAT_RATES;
}

/**
 * Validation basique du format d'un numéro de TVA intracommunautaire
 * Format : 2 lettres (code pays) + 2 à 13 caractères alphanumériques
 * 
 * Pour une validation complète, utiliser l'API VIES de la Commission Européenne :
 * https://ec.europa.eu/taxation_customs/vies/
 */
export function isValidVatNumber(vatNumber: string): boolean {
  if (!vatNumber) return false;
  const cleaned = vatNumber.replace(/[\s.-]/g, '').toUpperCase();
  // Format basique : XX + 2-13 caractères alphanumériques
  const vatRegex = /^[A-Z]{2}[0-9A-Z]{2,13}$/;
  return vatRegex.test(cleaned);
}

/**
 * Validation avancée du numéro de TVA via l'API VIES (Commission Européenne)
 * À utiliser côté serveur uniquement
 */
export async function validateVatNumberVIES(vatNumber: string): Promise<{
  valid: boolean;
  name?: string;
  address?: string;
}> {
  const cleaned = vatNumber.replace(/[\s.-]/g, '').toUpperCase();
  const countryCode = cleaned.substring(0, 2);
  const number = cleaned.substring(2);

  try {
    const response = await fetch(
      `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${countryCode}/vat/${number}`
    );

    if (!response.ok) {
      return { valid: false };
    }

    const data = await response.json();
    return {
      valid: data.isValid === true,
      name: data.name || undefined,
      address: data.address || undefined,
    };
  } catch {
    // En cas d'erreur réseau, on retourne invalide par sécurité
    console.error('Erreur lors de la validation VIES du numéro TVA');
    return { valid: false };
  }
}

/**
 * Formate un montant en centimes vers un prix lisible
 */
export function formatPrice(cents: number, locale = 'fr-FR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
}

/**
 * Formate le taux de TVA pour affichage
 */
export function formatVatRate(rate: number): string {
  return `${(rate * 100).toFixed(rate % 0.01 === 0 ? 0 : 1)}%`;
}

/**
 * Génère le résumé de la TVA pour l'affichage dans le checkout
 */
export function getVatSummary(calculation: VatCalculation): {
  label: string;
  subtotalFormatted: string;
  vatFormatted: string;
  totalFormatted: string;
  vatRateFormatted: string;
  note: string;
} {
  const country = EU_VAT_RATES[calculation.country]?.countryName ?? calculation.country;

  let note = '';
  if (calculation.isReverseCharge) {
    note = 'Auto-liquidation de la TVA (article 196 de la directive 2006/112/CE)';
  } else if (calculation.vatRate === 0) {
    note = 'Exonération de TVA (vente hors UE)';
  } else {
    note = `TVA ${formatVatRate(calculation.vatRate)} (${country})`;
  }

  return {
    label: `TVA (${country})`,
    subtotalFormatted: formatPrice(calculation.subtotal),
    vatFormatted: formatPrice(calculation.vatAmount),
    totalFormatted: formatPrice(calculation.total),
    vatRateFormatted: formatVatRate(calculation.vatRate),
    note,
  };
}

// ---- Exemples d'utilisation ----
/*
  // Acheteur français (B2C)
  const result1 = calculateVAT(2999, 'FR');
  // → { vatRate: 0.20, vatAmount: 600, total: 3599, ... }

  // Acheteur belge (B2C)
  const result2 = calculateVAT(2999, 'BE');
  // → { vatRate: 0.21, vatAmount: 630, total: 3629, ... }

  // Acheteur américain (hors EU)
  const result3 = calculateVAT(2999, 'US');
  // → { vatRate: 0, vatAmount: 0, total: 2999, ... }

  // Entreprise belge avec TVA (B2B intra-EU)
  const result4 = calculateVAT(2999, 'BE', 'BE0123456789');
  // → { vatRate: 0.21, vatAmount: 0, total: 2999, isReverseCharge: true }
*/
