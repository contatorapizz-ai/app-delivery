import type { StoreCategory } from '../types/domain'

export interface CategoryMeta {
  id: StoreCategory
  label: string
  emoji: string
  gradient: string
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'lanche', label: 'Lanche', emoji: '🥪', gradient: 'from-amber-600 to-yellow-500' },
  { id: 'cachorro_quente', label: 'Cachorro-quente', emoji: '🌭', gradient: 'from-red-500 to-orange-500' },
  { id: 'pastel', label: 'Pastel', emoji: '🥟', gradient: 'from-amber-500 to-orange-400' },
  { id: 'esfiha', label: 'Esfiha', emoji: '🫓', gradient: 'from-orange-500 to-amber-500' },
  { id: 'pizza', label: 'Pizza', emoji: '🍕', gradient: 'from-red-500 to-orange-500' },
  { id: 'porcao', label: 'Porção', emoji: '🍤', gradient: 'from-amber-600 to-red-500' },
  { id: 'espetinho', label: 'Espetinho', emoji: '🍢', gradient: 'from-red-600 to-amber-600' },
  { id: 'doces_bebidas', label: 'Doce & Bebida', emoji: '🧋', gradient: 'from-pink-400 to-rose-400' },
  { id: 'acai', label: 'Açaí', emoji: '🍇', gradient: 'from-purple-600 to-fuchsia-500' },
  { id: 'sorvete', label: 'Sorvete', emoji: '🍦', gradient: 'from-sky-400 to-blue-400' },
  { id: 'milkshake', label: 'Milkshake', emoji: '🥤', gradient: 'from-pink-400 to-purple-400' },
  { id: 'pratinho', label: 'Pratinho', emoji: '🍽️', gradient: 'from-lime-600 to-green-600' },
  { id: 'marmitex', label: 'Marmitex', emoji: '🍱', gradient: 'from-emerald-600 to-lime-600' },
  { id: 'restaurante', label: 'Restaurante', emoji: '🍴', gradient: 'from-neutral-600 to-neutral-800' },
  { id: 'saudavel', label: 'Saudável', emoji: '🥗', gradient: 'from-green-500 to-emerald-500' },
  { id: 'padaria', label: 'Padaria', emoji: '🥐', gradient: 'from-amber-500 to-yellow-400' },
  { id: 'japonesa', label: 'Japonesa', emoji: '🍣', gradient: 'from-rose-500 to-pink-500' },
  { id: 'italiana', label: 'Italiana', emoji: '🍝', gradient: 'from-red-600 to-emerald-600' },
  { id: 'mercado', label: 'Mercado', emoji: '🛒', gradient: 'from-emerald-600 to-teal-500' },
  { id: 'hortifruti', label: 'Hortifruti', emoji: '🥬', gradient: 'from-lime-500 to-green-500' },
  { id: 'emporios', label: 'Empórios', emoji: '🧺', gradient: 'from-amber-600 to-orange-600' },
  { id: 'distribuidora_doces', label: 'Dist. Doces', emoji: '🍬', gradient: 'from-pink-500 to-rose-500' },
  { id: 'acougue', label: 'Açougue', emoji: '🥩', gradient: 'from-red-600 to-rose-600' },
  { id: 'pet', label: 'Comida Pet', emoji: '🐾', gradient: 'from-violet-500 to-purple-500' },
  { id: 'suplementos', label: 'Suplementos', emoji: '🥤', gradient: 'from-yellow-500 to-amber-600' },
  { id: 'farmacia', label: 'Farmácia', emoji: '💊', gradient: 'from-sky-500 to-blue-600' },
  { id: 'gas_agua', label: 'Gás & Água', emoji: '🚰', gradient: 'from-blue-500 to-cyan-500' },
]

export function categoryMeta(id: StoreCategory): CategoryMeta {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0]
}
