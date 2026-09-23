import { supabase } from '../lib/supabase'
import { mapProduct, mapStore } from '../lib/mappers'
import type { Product, Store } from '../types/domain'
import type { AdCampaignRow, ProductRow, StoreRow } from '../types/database'

export interface ShowcaseItem {
  campaign: AdCampaignRow
  product: Product | null
  store: Store
}

export async function fetchShowcase(): Promise<ShowcaseItem[]> {
  const today = new Date().toISOString().slice(0, 10)
  const { data: campaigns, error } = await supabase
    .from('ad_campaigns')
    .select('*')
    .in('format', ['produto_patrocinado', 'banner_destaque', 'story_premium'])
    .eq('status', 'ativa')
    .lte('starts_at', today)
    .gte('ends_at', today)
    .order('created_at', { ascending: false })
    .limit(24)
  if (error) throw error

  const rows = (campaigns ?? []) as AdCampaignRow[]
  if (rows.length === 0) return []

  const storeIds = Array.from(new Set(rows.map((c) => c.store_id)))
  const productIds = rows.map((c) => c.product_id).filter((id): id is string => Boolean(id))

  const [{ data: stores, error: storesError }, { data: products, error: productsError }] = await Promise.all([
    supabase.from('stores').select('*').in('id', storeIds),
    productIds.length > 0 ? supabase.from('products').select('*').in('id', productIds) : Promise.resolve({ data: [], error: null }),
  ])
  if (storesError) throw storesError
  if (productsError) throw productsError

  const storeMap = new Map(((stores ?? []) as StoreRow[]).map((s) => [s.id, mapStore(s)]))
  const productMap = new Map(((products ?? []) as ProductRow[]).map((p) => [p.id, mapProduct(p)]))

  const items: ShowcaseItem[] = []
  for (const c of rows) {
    const store = storeMap.get(c.store_id)
    if (!store) continue
    items.push({ campaign: c, store, product: c.product_id ? (productMap.get(c.product_id) ?? null) : null })
  }
  return items
}
