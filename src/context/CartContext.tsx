import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { CartItem, CartSelectedOption, Product } from '../types/domain'
import { readJSON, writeJSON } from '../lib/storage'

const CART_KEY = 'rapizz.cart.v1'

interface AddItemInput {
  product: Product
  quantity: number
  selectedOptions: CartSelectedOption[]
  notes?: string
}

interface CartContextValue {
  items: CartItem[]
  storeId: string | null
  addItem: (input: AddItemInput) => void
  removeItem: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  clearCart: () => void
  itemsTotal: number
  itemsCount: number
}

const CartContext = createContext<CartContextValue | null>(null)

function computeUnitPrice(product: Product, selectedOptions: CartSelectedOption[]): number {
  return product.price + selectedOptions.reduce((sum, opt) => sum + opt.priceDelta, 0)
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => readJSON(CART_KEY, [] as CartItem[]))

  useEffect(() => {
    writeJSON(CART_KEY, items)
  }, [items])

  const storeId = items[0]?.storeId ?? null

  const addItem = useCallback(({ product, quantity, selectedOptions, notes }: AddItemInput) => {
    setItems((prev) => {
      const sameStore = prev.length === 0 || prev[0].storeId === product.storeId
      const base = sameStore ? prev : []
      const unitPrice = computeUnitPrice(product, selectedOptions)
      const cartItemId = `${product.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const newItem: CartItem = {
        id: cartItemId,
        productId: product.id,
        storeId: product.storeId,
        name: product.name,
        unitPrice,
        quantity,
        notes,
        selectedOptions,
      }
      return [...base, newItem]
    })
  }, [])

  const removeItem = useCallback((cartItemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== cartItemId))
  }, [])

  const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((i) => i.id !== cartItemId)
      return prev.map((i) => (i.id === cartItemId ? { ...i, quantity } : i))
    })
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const itemsTotal = useMemo(
    () => items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    [items],
  )
  const itemsCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items])

  const value = useMemo(
    () => ({ items, storeId, addItem, removeItem, updateQuantity, clearCart, itemsTotal, itemsCount }),
    [items, storeId, addItem, removeItem, updateQuantity, clearCart, itemsTotal, itemsCount],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart precisa estar dentro de <CartProvider>')
  return ctx
}
