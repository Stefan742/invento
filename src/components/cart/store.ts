'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type CartLine = { kitId: number; quantity: number }

type CartState = {
  lines: CartLine[]
  isOpen: boolean
  add: (kitId: number, quantity: number, max: number) => void
  setQuantity: (kitId: number, quantity: number, max: number) => void
  remove: (kitId: number) => void
  clear: () => void
  open: () => void
  close: () => void
}

const clamp = (n: number, max: number) => Math.max(1, Math.min(max, Math.floor(n)))

/** Safe localStorage: private mode or blocked storage must never break the cart. */
const safeStorage = createJSONStorage(() => {
  try {
    const probe = '__invento_probe__'
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return window.localStorage
  } catch {
    const mem = new Map<string, string>()
    return {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => void mem.set(k, v),
      removeItem: (k: string) => void mem.delete(k),
    }
  }
})

/**
 * The cart only stores kit ids and quantities (strictly functional storage, no personal data).
 * Titles, prices and availability always come fresh from the server-provided catalog.
 */
export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,
      add: (kitId, quantity, max) =>
        set((s) => {
          const existing = s.lines.find((l) => l.kitId === kitId)
          const lines = existing
            ? s.lines.map((l) => (l.kitId === kitId ? { ...l, quantity: clamp(l.quantity + quantity, max) } : l))
            : [...s.lines, { kitId, quantity: clamp(quantity, max) }]
          return { lines }
        }),
      setQuantity: (kitId, quantity, max) =>
        set((s) => ({ lines: s.lines.map((l) => (l.kitId === kitId ? { ...l, quantity: clamp(quantity, max) } : l)) })),
      remove: (kitId) => set((s) => ({ lines: s.lines.filter((l) => l.kitId !== kitId) })),
      clear: () => set({ lines: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    {
      name: 'invento-cart-v1',
      storage: safeStorage,
      partialize: (s) => ({ lines: s.lines }),
      // Rehydrated after mount (CartProvider) so server and first client render match.
      skipHydration: true,
    },
  ),
)

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.quantity, 0)
