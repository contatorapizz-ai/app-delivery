export type StoreCategory =
  | 'pizza'
  | 'hamburguer'
  | 'japonesa'
  | 'acai'
  | 'mercado'
  | 'farmacia'
  | 'doces'
  | 'brasileira'

export interface Store {
  id: string
  name: string
  category: StoreCategory
  rating: number
  etaMinutes: [number, number]
  deliveryFee: number
  minOrder: number
  isOpen: boolean
  whatsapp: string
  address: string
}

export interface ProductOptionChoice {
  id: string
  label: string
  priceDelta: number
}

export interface ProductOptionGroup {
  id: string
  label: string
  required: boolean
  multiple: boolean
  choices: ProductOptionChoice[]
}

export interface Product {
  id: string
  storeId: string
  name: string
  description: string
  price: number
  emoji: string
  menuCategory: string
  optionGroups?: ProductOptionGroup[]
}

export interface CartSelectedOption {
  groupId: string
  groupLabel: string
  choiceId: string
  choiceLabel: string
  priceDelta: number
}

export interface CartItem {
  id: string
  productId: string
  storeId: string
  name: string
  unitPrice: number
  quantity: number
  notes?: string
  selectedOptions: CartSelectedOption[]
}

export type OrderStatus = 'recebido' | 'preparando' | 'em_entrega' | 'entregue' | 'cancelado'

export interface Order {
  id: string
  storeId: string
  storeName: string
  items: CartItem[]
  total: number
  deliveryFee: number
  status: OrderStatus
  createdAt: string
  customerName: string
  customerPhone: string
  address: string
  notes?: string
}
