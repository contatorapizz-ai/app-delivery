import { supabase } from '../lib/supabase'
import { mapProduct, mapStore, reaisToCents } from '../lib/mappers'
import type { CartItem, Order, Store, Product } from '../types/domain'
import type { OrderRow, StoreRow, ProductRow } from '../types/database'

export async function fetchStores(): Promise<Store[]> {
  const { data, error } = await supabase.from('stores').select('*').order('name')
  if (error) throw error
  return (data as StoreRow[]).map(mapStore)
}

export async function fetchStoreById(id: string): Promise<Store | undefined> {
  const { data, error } = await supabase.from('stores').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data ? mapStore(data as StoreRow) : undefined
}

export async function fetchProductsByStore(storeId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', storeId)
    .order('menu_category')
  if (error) throw error
  return (data as ProductRow[]).map(mapProduct)
}

export async function createOrder(params: {
  storeId: string
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  total: number
  customerName: string
  customerPhone: string
  address: string
  notes?: string
}): Promise<Order> {
  const { data: auth } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('orders')
    .insert({
      store_id: params.storeId,
      customer_id: auth.user?.id ?? null,
      customer_name: params.customerName,
      customer_phone: params.customerPhone,
      address: params.address,
      notes: params.notes ?? null,
      items: params.items as unknown as never,
      subtotal_cents: reaisToCents(params.subtotal),
      delivery_fee_cents: reaisToCents(params.deliveryFee),
      total_cents: reaisToCents(params.total),
    })
    .select('*')
    .single()

  if (error) throw error
  const row = data as OrderRow

  return {
    id: row.id,
    storeId: row.store_id,
    storeName: '',
    items: params.items,
    total: params.total,
    deliveryFee: params.deliveryFee,
    status: row.status,
    createdAt: row.created_at,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    address: row.address,
    notes: row.notes ?? undefined,
  }
}
