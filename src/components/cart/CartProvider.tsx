'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

import { CartDrawer } from './CartDrawer'
import { useCart } from './store'

export type CatalogKit = {
  id: number
  slug: string
  title: string
  price: number | null
  orderable: boolean
  image: { src: string; width: number; height: number; alt: string } | null
}

export type CartRules = {
  ordersOpen: boolean
  ordersClosedMessage: string | null
  maxQuantityPerLine: number
  shippingFee: number | null
  shippingNote: string | null
}

type Ctx = {
  catalog: CatalogKit[]
  rules: CartRules
  hydrated: boolean
  announce: (message: string) => void
}

const CartContext = createContext<Ctx | null>(null)

export function useCartContext() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCartContext outside CartProvider')
  return ctx
}

export function CartProvider({ catalog, rules, children }: { catalog: CatalogKit[]; rules: CartRules; children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const unsub = useCart.persist.onFinishHydration(() => setHydrated(true))
    void useCart.persist.rehydrate()
    return unsub
  }, [])

  return (
    <CartContext.Provider value={{ catalog, rules, hydrated, announce: setMessage }}>
      {children}
      <CartDrawer />
      {/* Screen-reader announcements for cart updates. */}
      <p className="sr-only" role="status" aria-live="polite">
        {message}
      </p>
    </CartContext.Provider>
  )
}
