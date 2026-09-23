import type { StoreRow, ProductRow, ProductOptionGroupRow } from '../types/database'
import type { Product, ProductOptionGroup, Store, StoreCategory } from '../types/domain'

export function centsToReais(cents: number): number {
  return Math.round(cents) / 100
}

export function reaisToCents(reais: number): number {
  return Math.round(reais * 100)
}

export function mapStore(row: StoreRow): Store {
  return {
    id: row.id,
    name: row.name,
    category: row.category as StoreCategory,
    rating: Number(row.rating),
    etaMinutes: [row.eta_min, row.eta_max],
    deliveryFee: centsToReais(row.delivery_fee_cents),
    minOrder: centsToReais(row.min_order_cents),
    isOpen: row.is_open,
    whatsapp: row.whatsapp,
    address: row.address,
    imageUrl: row.image_url,
    city: row.city,
  }
}

function mapOptionGroup(g: ProductOptionGroupRow): ProductOptionGroup {
  return {
    id: g.id,
    label: g.label,
    required: g.required,
    multiple: g.multiple,
    choices: g.choices.map((c) => ({
      id: c.id,
      label: c.label,
      priceDelta: centsToReais(c.priceDeltaCents),
    })),
  }
}

export function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    storeId: row.store_id,
    name: row.name,
    description: row.description,
    price: centsToReais(row.price_cents),
    emoji: row.emoji,
    imageUrl: row.image_url,
    menuCategory: row.menu_category,
    optionGroups: (row.option_groups ?? []).map(mapOptionGroup),
  }
}
