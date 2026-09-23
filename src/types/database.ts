export type UserRole = 'cliente' | 'lojista' | 'motoboy' | 'admin'
export type DbOrderStatus = 'recebido' | 'preparando' | 'em_entrega' | 'entregue' | 'cancelado'
export type AdObjective = 'vendas' | 'cliques' | 'alcance' | 'conversoes' | 'reconhecimento_marca'
export type AdFormat =
  | 'story_premium'
  | 'loja_patrocinada'
  | 'banner_destaque'
  | 'promocao_relampago'
  | 'produto_patrocinado'
  | 'categoria_patrocinada'
  | 'marca_patrocinada'
export type AdCampaignStatus = 'rascunho' | 'pendente_pagamento' | 'ativa' | 'pausada' | 'concluida' | 'rejeitada'
export type AdEventType = 'impressao' | 'clique'
export type WalletTxType =
  | 'bonus_rapizz_ads'
  | 'participacao_publicitaria'
  | 'fundo_motoboy'
  | 'bonus_assinatura'
  | 'ajuste_manual'

export interface ProfileRow {
  id: string
  role: UserRole
  full_name: string
  email: string | null
  phone: string | null
  created_at: string
}

export interface WalletRow {
  id: string
  profile_id: string
  balance_cents: number
  created_at: string
}

export interface WalletTransactionRow {
  id: string
  wallet_id: string
  type: WalletTxType
  amount_cents: number
  description: string | null
  created_at: string
}

export interface StoreRow {
  id: string
  owner_id: string | null
  name: string
  category: string
  address: string
  whatsapp: string
  rating: number
  eta_min: number
  eta_max: number
  delivery_fee_cents: number
  min_order_cents: number
  is_open: boolean
  image_url: string | null
  created_at: string
}

export interface ProductOptionChoiceRow {
  id: string
  label: string
  priceDeltaCents: number
}

export interface ProductOptionGroupRow {
  id: string
  label: string
  required: boolean
  multiple: boolean
  choices: ProductOptionChoiceRow[]
}

export interface ProductRow {
  id: string
  store_id: string
  name: string
  description: string
  price_cents: number
  emoji: string
  image_url: string | null
  menu_category: string
  option_groups: ProductOptionGroupRow[]
  created_at: string
}

export interface OrderRow {
  id: string
  store_id: string
  customer_id: string | null
  customer_name: string
  customer_phone: string
  address: string
  notes: string | null
  items: unknown[]
  subtotal_cents: number
  delivery_fee_cents: number
  total_cents: number
  status: DbOrderStatus
  created_at: string
}

export interface AdCampaignRow {
  id: string
  store_id: string
  objective: AdObjective
  format: AdFormat
  title: string
  description: string
  product_id: string | null
  budget_cents: number
  status: AdCampaignStatus
  segmentation: Record<string, unknown>
  starts_at: string
  ends_at: string
  created_at: string
  activated_at: string | null
}

export interface AdEventRow {
  id: string
  campaign_id: string
  type: AdEventType
  session_id: string | null
  created_at: string
}

export interface FundLedgerRow {
  id: string
  source_table: string
  source_id: string
  gross_cents: number
  platform_cents: number
  fund_cents: number
  created_at: string
}
