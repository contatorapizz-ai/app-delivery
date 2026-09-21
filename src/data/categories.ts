import type { StoreCategory } from '../types/domain'

export interface CategoryMeta {
  id: StoreCategory
  label: string
  emoji: string
  gradient: string
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'pizza', label: 'Pizzarias', emoji: '🍕', gradient: 'from-red-500 to-orange-500' },
  { id: 'hamburguer', label: 'Hambúrguer', emoji: '🍔', gradient: 'from-amber-600 to-yellow-500' },
  { id: 'japonesa', label: 'Japonesa', emoji: '🍣', gradient: 'from-rose-500 to-pink-500' },
  { id: 'acai', label: 'Açaí', emoji: '🍇', gradient: 'from-purple-600 to-fuchsia-500' },
  { id: 'mercado', label: 'Mercado', emoji: '🛒', gradient: 'from-emerald-600 to-teal-500' },
  { id: 'farmacia', label: 'Farmácia', emoji: '💊', gradient: 'from-sky-500 to-blue-600' },
  { id: 'doces', label: 'Doces', emoji: '🍰', gradient: 'from-pink-400 to-rose-400' },
  { id: 'brasileira', label: 'Comida Brasileira', emoji: '🍛', gradient: 'from-lime-600 to-green-600' },
]

export function categoryMeta(id: StoreCategory): CategoryMeta {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0]
}
