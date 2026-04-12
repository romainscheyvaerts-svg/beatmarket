// ============================================================================
// 🛒 BeatMarket — Zustand Store pour le Panier
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Track, LicenseType } from '@/types';

interface CartItem {
  id: string;         // `${trackId}-${licenseType}`
  trackId: string;
  track: Track;
  licenseType: LicenseType;
  price: number;      // centimes EUR
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (track: Track, licenseType: LicenseType, price: number) => void;
  removeItem: (itemId: string) => void;
  updateLicense: (itemId: string, newLicenseType: LicenseType, newPrice: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // Computed (via getters)
  getItemCount: () => number;
  getSubtotal: () => number;
  hasTrack: (trackId: string) => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (track, licenseType, price) => {
        const { items } = get();
        const itemId = `${track.id}-${licenseType}`;

        // Vérifier si le track est déjà dans le panier (même licence)
        const existingItem = items.find((item) => item.id === itemId);
        if (existingItem) return;

        // Vérifier si le track est déjà dans le panier (autre licence)
        // → Remplacer par la nouvelle licence
        const existingTrackItem = items.find((item) => item.trackId === track.id);
        if (existingTrackItem) {
          set({
            items: items.map((item) =>
              item.trackId === track.id
                ? { ...item, id: itemId, licenseType, price }
                : item
            ),
          });
          return;
        }

        // Ajouter le nouvel item
        const newItem: CartItem = {
          id: itemId,
          trackId: track.id,
          track,
          licenseType,
          price,
        };

        set({ items: [...items, newItem] });
      },

      removeItem: (itemId) => {
        set({ items: get().items.filter((item) => item.id !== itemId) });
      },

      updateLicense: (itemId, newLicenseType, newPrice) => {
        const { items } = get();
        set({
          items: items.map((item) => {
            if (item.id !== itemId) return item;
            return {
              ...item,
              id: `${item.trackId}-${newLicenseType}`,
              licenseType: newLicenseType,
              price: newPrice,
            };
          }),
        });
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set({ isOpen: !get().isOpen }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getItemCount: () => get().items.length,

      getSubtotal: () =>
        get().items.reduce((total, item) => total + item.price, 0),

      hasTrack: (trackId) =>
        get().items.some((item) => item.trackId === trackId),
    }),
    {
      name: 'beatmarket-cart', // Clé localStorage
      partialize: (state) => ({ items: state.items }), // Ne persister que les items
    }
  )
);
