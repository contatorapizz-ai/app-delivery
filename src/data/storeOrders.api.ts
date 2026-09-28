import { supabase } from '../lib/supabase'
import { mapOrder } from '../lib/mappers'
import type { Order } from '../types/domain'
import type { OrderRow } from '../types/database'

export async function fetchStoreOrders(storeId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, store:stores(name)')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) throw error
  return ((data ?? []) as (OrderRow & { store: { name: string } | null })[]).map((row) =>
    mapOrder(row, row.store?.name ?? 'Loja'),
  )
}

export async function storeAcceptOrder(orderId: string, prepMinutes?: number): Promise<void> {
  const { error } = await supabase.rpc('store_accept_order', {
    p_order_id: orderId,
    p_prep_minutes: prepMinutes ?? null,
  })
  if (error) throw error
}

export async function storeRejectOrder(orderId: string, reason: string): Promise<void> {
  const { error } = await supabase.rpc('store_reject_order', { p_order_id: orderId, p_reason: reason })
  if (error) throw error
}

export async function storeSetPreparing(orderId: string): Promise<void> {
  const { error } = await supabase.rpc('store_set_preparing', { p_order_id: orderId })
  if (error) throw error
}

export async function storeSetReady(orderId: string): Promise<void> {
  const { error } = await supabase.rpc('store_set_ready', { p_order_id: orderId })
  if (error) throw error
}

export async function setStoreOpen(storeId: string, isOpen: boolean): Promise<void> {
  const { error } = await supabase.from('stores').update({ is_open: isOpen }).eq('id', storeId)
  if (error) throw error
}

export async function setProductAvailable(productId: string, isAvailable: boolean): Promise<void> {
  const { error } = await supabase.from('products').update({ is_available: isAvailable }).eq('id', productId)
  if (error) throw error
}
