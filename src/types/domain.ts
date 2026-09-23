export type StoreCategory =
  | 'lanche'
  | 'cachorro_quente'
  | 'pastel'
  | 'esfiha'
  | 'pizza'
  | 'porcao'
  | 'espetinho'
  | 'doces_bebidas'
  | 'acai'
  | 'sorvete'
  | 'milkshake'
  | 'pratinho'
  | 'marmitex'
  | 'restaurante'
  | 'saudavel'
  | 'padaria'
  | 'japonesa'
  | 'italiana'
  | 'mercado'
  | 'hortifruti'
  | 'emporios'
  | 'distribuidora_doces'
  | 'acougue'
  | 'pet'
  | 'suplementos'
  | 'farmacia'
  | 'gas_agua'

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
  city: string | null
  imageUrl: string | null
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
  imageUrl: string | null
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
