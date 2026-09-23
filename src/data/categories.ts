import {
  Beef,
  Candy,
  CandyCane,
  Carrot,
  ChefHat,
  Croissant,
  Dumbbell,
  Fish,
  Flame,
  IceCreamCone,
  type LucideIcon,
  Milk,
  PawPrint,
  Pill,
  Pizza,
  Salad,
  Sandwich,
  ShoppingBasket,
  ShoppingCart,
  Soup,
  Droplets,
  UtensilsCrossed,
} from 'lucide-react'
import type { StoreCategory } from '../types/domain'

export interface CategoryMeta {
  id: StoreCategory
  label: string
  icon: LucideIcon
  gradient: string
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'lanche', label: 'Lanche', icon: Sandwich, gradient: 'from-amber-600 to-yellow-500' },
  { id: 'cachorro_quente', label: 'Cachorro-quente', icon: Flame, gradient: 'from-red-500 to-orange-500' },
  { id: 'pastel', label: 'Pastel', icon: UtensilsCrossed, gradient: 'from-amber-500 to-orange-400' },
  { id: 'esfiha', label: 'Esfiha', icon: Croissant, gradient: 'from-orange-500 to-amber-500' },
  { id: 'pizza', label: 'Pizza', icon: Pizza, gradient: 'from-red-500 to-orange-500' },
  { id: 'porcao', label: 'Porção', icon: UtensilsCrossed, gradient: 'from-amber-600 to-red-500' },
  { id: 'espetinho', label: 'Espetinho', icon: Flame, gradient: 'from-red-600 to-amber-600' },
  { id: 'doces_bebidas', label: 'Doce & Bebida', icon: Candy, gradient: 'from-pink-400 to-rose-400' },
  { id: 'acai', label: 'Açaí', icon: IceCreamCone, gradient: 'from-purple-600 to-fuchsia-500' },
  { id: 'sorvete', label: 'Sorvete', icon: IceCreamCone, gradient: 'from-sky-400 to-blue-400' },
  { id: 'milkshake', label: 'Milkshake', icon: Milk, gradient: 'from-pink-400 to-purple-400' },
  { id: 'pratinho', label: 'Pratinho', icon: Soup, gradient: 'from-lime-600 to-green-600' },
  { id: 'marmitex', label: 'Marmitex', icon: ChefHat, gradient: 'from-emerald-600 to-lime-600' },
  { id: 'restaurante', label: 'Restaurante', icon: ChefHat, gradient: 'from-neutral-600 to-neutral-800' },
  { id: 'saudavel', label: 'Saudável', icon: Salad, gradient: 'from-green-500 to-emerald-500' },
  { id: 'padaria', label: 'Padaria', icon: Croissant, gradient: 'from-amber-500 to-yellow-400' },
  { id: 'japonesa', label: 'Japonesa', icon: Fish, gradient: 'from-rose-500 to-pink-500' },
  { id: 'italiana', label: 'Italiana', icon: Soup, gradient: 'from-red-600 to-emerald-600' },
  { id: 'mercado', label: 'Mercado', icon: ShoppingCart, gradient: 'from-emerald-600 to-teal-500' },
  { id: 'hortifruti', label: 'Hortifruti', icon: Carrot, gradient: 'from-lime-500 to-green-500' },
  { id: 'emporios', label: 'Empórios', icon: ShoppingBasket, gradient: 'from-amber-600 to-orange-600' },
  { id: 'distribuidora_doces', label: 'Dist. Doces', icon: CandyCane, gradient: 'from-pink-500 to-rose-500' },
  { id: 'acougue', label: 'Açougue', icon: Beef, gradient: 'from-red-600 to-rose-600' },
  { id: 'pet', label: 'Comida Pet', icon: PawPrint, gradient: 'from-violet-500 to-purple-500' },
  { id: 'suplementos', label: 'Suplementos', icon: Dumbbell, gradient: 'from-yellow-500 to-amber-600' },
  { id: 'farmacia', label: 'Farmácia', icon: Pill, gradient: 'from-sky-500 to-blue-600' },
  { id: 'gas_agua', label: 'Gás & Água', icon: Droplets, gradient: 'from-blue-500 to-cyan-500' },
]

export function categoryMeta(id: StoreCategory): CategoryMeta {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0]
}
