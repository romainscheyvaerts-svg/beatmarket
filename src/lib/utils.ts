// ============================================================================
// 🔧 BeatMarket — Utilitaires
// ============================================================================

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Fusionne les classes Tailwind de manière intelligente
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Génère un slug à partir d'un titre
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
}

/**
 * Génère un numéro de commande unique
 * Format: BM-2024-XXXXX
 */
export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `BM-${year}-${random}`;
}

/**
 * Génère un numéro de facture séquentiel
 * Format: INV-2024-00001
 */
export function generateInvoiceNumber(sequence: number): string {
  const year = new Date().getFullYear();
  return `INV-${year}-${sequence.toString().padStart(5, '0')}`;
}

/**
 * Formate la durée en secondes vers "M:SS"
 */
export function formatDuration(seconds: number | null): string {
  if (!seconds || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formate la clé musicale pour l'affichage
 * C_SHARP_MINOR → C# Minor
 */
export function formatMusicKey(key: string | null): string {
  if (!key) return '';
  return key
    .replace('_SHARP', '#')
    .replace('_MAJOR', ' Major')
    .replace('_MINOR', ' Minor')
    .replace('_', ' ');
}

/**
 * Convertit les centimes en euros formatés
 */
export function centsToEuros(cents: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
}

/**
 * Tronque un texte avec "..."
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Délai (pour debounce, etc.)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Debounce une fonction
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
