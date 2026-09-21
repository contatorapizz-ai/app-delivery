import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Order } from '../types/domain'
import { readJSON, writeJSON } from '../lib/storage'

const ORDERS_KEY = 'rapizz.orders.v1'

interface OrdersContextValue {
  orders: Order[]
  addOrder: (order: Order) => void
}

const OrdersContext = createContext<OrdersContextValue | null>(null)

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(() => readJSON(ORDERS_KEY, [] as Order[]))

  useEffect(() => {
    writeJSON(ORDERS_KEY, orders)
  }, [orders])

  const addOrder = useCallback((order: Order) => {
    setOrders((prev) => [order, ...prev])
  }, [])

  const value = useMemo(() => ({ orders, addOrder }), [orders, addOrder])

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
}

export function useOrders(): OrdersContextValue {
  const ctx = useContext(OrdersContext)
  if (!ctx) throw new Error('useOrders precisa estar dentro de <OrdersProvider>')
  return ctx
}
