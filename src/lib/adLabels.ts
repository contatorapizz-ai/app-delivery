import type { AdCampaignStatus, AdFormat, AdObjective } from '../types/database'

export const STATUS_LABEL: Record<AdCampaignStatus, string> = {
  rascunho: 'Rascunho',
  pendente_pagamento: 'Aguardando pagamento',
  ativa: 'Ativa',
  pausada: 'Pausada',
  concluida: 'Concluída',
  rejeitada: 'Rejeitada',
}

export const STATUS_COLOR: Record<AdCampaignStatus, string> = {
  rascunho: 'bg-neutral-200 text-neutral-600',
  pendente_pagamento: 'bg-amber-100 text-amber-700',
  ativa: 'bg-emerald-100 text-emerald-700',
  pausada: 'bg-neutral-200 text-neutral-600',
  concluida: 'bg-sky-100 text-sky-700',
  rejeitada: 'bg-red-100 text-red-700',
}

export const OBJECTIVE_LABEL: Record<AdObjective, string> = {
  vendas: 'Vendas',
  cliques: 'Cliques',
  alcance: 'Alcance',
  conversoes: 'Conversões',
  reconhecimento_marca: 'Reconhecimento de marca',
}

export const FORMAT_LABEL: Record<AdFormat, string> = {
  story_premium: 'Story Premium',
  loja_patrocinada: 'Loja Patrocinada',
  banner_destaque: 'Banner Destaque',
  promocao_relampago: 'Promoção Relâmpago',
  produto_patrocinado: 'Produto Patrocinado',
  categoria_patrocinada: 'Categoria Patrocinada',
  marca_patrocinada: 'Marca Patrocinada',
}

// Formatos com superfície implementada no app do cliente nesta fase.
export const LIVE_FORMATS: AdFormat[] = ['story_premium', 'banner_destaque', 'produto_patrocinado']
