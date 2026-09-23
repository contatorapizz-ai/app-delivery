import { supabase } from '../lib/supabase'
import { mapProduct, reaisToCents } from '../lib/mappers'
import type { Product } from '../types/domain'
import type { ProductRow } from '../types/database'

export async function createProduct(input: {
  storeId: string
  name: string
  description: string
  price: number
  menuCategory: string
  imageUrl: string | null
}): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert({
      store_id: input.storeId,
      name: input.name,
      description: input.description,
      price_cents: reaisToCents(input.price),
      menu_category: input.menuCategory,
      image_url: input.imageUrl,
    })
    .select('*')
    .single()
  if (error) throw error
  return mapProduct(data as ProductRow)
}

export async function updateProduct(
  productId: string,
  input: { name: string; description: string; price: number; menuCategory: string; imageUrl: string | null },
): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({
      name: input.name,
      description: input.description,
      price_cents: reaisToCents(input.price),
      menu_category: input.menuCategory,
      image_url: input.imageUrl,
    })
    .eq('id', productId)
  if (error) throw error
}

export async function deleteProduct(productId: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', productId)
  if (error) throw error
}
