import { supabase } from '../lib/supabase'
import { mapProduct, mapStore } from '../lib/mappers'
import type { Product, Store } from '../types/domain'
import type { AdCampaignRow, ProductRow, ShopCommentRow, StoreRow } from '../types/database'

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

export interface ShopEngagement {
  likeCount: number
  commentCount: number
  likedByMe: boolean
}

export async function fetchEngagement(
  campaignIds: string[],
  profileId: string | null,
): Promise<Record<string, ShopEngagement>> {
  const result: Record<string, ShopEngagement> = {}
  for (const id of campaignIds) result[id] = { likeCount: 0, commentCount: 0, likedByMe: false }
  if (campaignIds.length === 0) return result

  const [{ data: likes, error: likesError }, { data: comments, error: commentsError }] = await Promise.all([
    supabase.from('shop_likes').select('campaign_id, profile_id').in('campaign_id', campaignIds),
    supabase.from('shop_comments').select('campaign_id').in('campaign_id', campaignIds),
  ])
  if (likesError) throw likesError
  if (commentsError) throw commentsError

  for (const like of (likes ?? []) as { campaign_id: string; profile_id: string }[]) {
    result[like.campaign_id].likeCount += 1
    if (profileId && like.profile_id === profileId) result[like.campaign_id].likedByMe = true
  }
  for (const comment of (comments ?? []) as { campaign_id: string }[]) {
    result[comment.campaign_id].commentCount += 1
  }
  return result
}

export async function toggleLike(campaignId: string, profileId: string, currentlyLiked: boolean): Promise<void> {
  if (currentlyLiked) {
    const { error } = await supabase
      .from('shop_likes')
      .delete()
      .eq('campaign_id', campaignId)
      .eq('profile_id', profileId)
    if (error) throw error
  } else {
    const { error } = await supabase.from('shop_likes').insert({ campaign_id: campaignId, profile_id: profileId })
    if (error) throw error
  }
}

export async function fetchComments(campaignId: string): Promise<ShopCommentRow[]> {
  const { data, error } = await supabase
    .from('shop_comments')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as ShopCommentRow[]
}

export async function addComment(campaignId: string, profileId: string, authorName: string, body: string): Promise<ShopCommentRow> {
  const { data, error } = await supabase
    .from('shop_comments')
    .insert({ campaign_id: campaignId, profile_id: profileId, author_name: authorName, body })
    .select('*')
    .single()
  if (error) throw error
  return data as ShopCommentRow
}
