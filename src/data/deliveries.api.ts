import { supabase } from '../lib/supabase'
import type { DeliveryRow } from '../types/database'

export interface AvailableDelivery {
  delivery: DeliveryRow
  storeName: string
  storeAddress: string
}

export async function fetchAvailableDeliveries(): Promise<AvailableDelivery[]> {
  const { data, error } = await supabase
    .from('deliveries')
    .select('*, store:stores(name, address)')
    .eq('status', 'disponivel')
    .is('motoboy_id', null)
    .order('offered_at', { ascending: true })
  if (error) throw error
  return ((data ?? []) as (DeliveryRow & { store: { name: string; address: string } | null })[]).map((row) => ({
    delivery: row,
    storeName: row.store?.name ?? 'Loja',
    storeAddress: row.store?.address ?? '',
  }))
}

export async function fetchMyActiveDeliveries(motoboyId: string): Promise<DeliveryRow[]> {
  const { data, error } = await supabase
    .from('deliveries')
    .select('*')
    .eq('motoboy_id', motoboyId)
    .in('status', ['aceita', 'coletada', 'em_entrega'])
    .order('accepted_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as DeliveryRow[]
}

export async function fetchMyDeliveryHistory(motoboyId: string): Promise<DeliveryRow[]> {
  const { data, error } = await supabase
    .from('deliveries')
    .select('*')
    .eq('motoboy_id', motoboyId)
    .in('status', ['concluida', 'cancelada'])
    .order('delivered_at', { ascending: false })
    .limit(100)
  if (error) throw error
  return (data ?? []) as DeliveryRow[]
}

export async function fetchDeliveryCodesByOrder(orderIds: string[]): Promise<Record<string, string>> {
  if (orderIds.length === 0) return {}
  const { data, error } = await supabase.from('deliveries').select('order_id, delivery_code').in('order_id', orderIds)
  if (error) throw error
  const result: Record<string, string> = {}
  for (const row of (data ?? []) as { order_id: string; delivery_code: string }[]) {
    result[row.order_id] = row.delivery_code
  }
  return result
}

export async function acceptDelivery(deliveryId: string): Promise<void> {
  const { error } = await supabase.rpc('accept_delivery', { p_delivery_id: deliveryId })
  if (error) throw error
}

export async function markPickedUp(deliveryId: string): Promise<void> {
  const { error } = await supabase.rpc('mark_picked_up', { p_delivery_id: deliveryId })
  if (error) throw error
}

export async function markEnRoute(deliveryId: string): Promise<void> {
  const { error } = await supabase.rpc('mark_en_route', { p_delivery_id: deliveryId })
  if (error) throw error
}

export async function confirmDelivery(deliveryId: string, code: string): Promise<void> {
  const { error } = await supabase.rpc('confirm_delivery', { p_delivery_id: deliveryId, p_code: code })
  if (error) throw error
}

export async function reportDeliveryIssue(deliveryId: string, note: string): Promise<void> {
  const { error } = await supabase.rpc('report_delivery_issue', { p_delivery_id: deliveryId, p_note: note })
  if (error) throw error
}
