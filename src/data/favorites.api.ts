import { supabase } from '../lib/supabase'
import { mapStore } from '../lib/mappers'
import type { Store } from '../types/domain'
import type { StoreRow } from '../types/database'

export async function fetchFavoriteStoreIds(profileId: string): Promise<Set<string>> {
  const { data, error } = await supabase.from('favorites').select('store_id').eq('profile_id', profileId)
  if (error) throw error
  return new Set((data ?? []).map((row) => row.store_id as string))
}

export async function fetchFavoriteStores(profileId: string): Promise<Store[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('store:stores(*)')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? [])
    .map((row) => row.store as unknown as StoreRow | null)
    .filter((store): store is StoreRow => store !== null)
    .map(mapStore)
}

export async function addFavorite(profileId: string, storeId: string): Promise<void> {
  const { error } = await supabase.from('favorites').insert({ profile_id: profileId, store_id: storeId })
  if (error) throw error
}

export async function removeFavorite(profileId: string, storeId: string): Promise<void> {
  const { error } = await supabase.from('favorites').delete().eq('profile_id', profileId).eq('store_id', storeId)
  if (error) throw error
}
