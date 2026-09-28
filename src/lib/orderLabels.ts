import type { OrderStatus } from '../types/domain'

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  recebido: 'Aguardando aceite',
  aceito: 'Aceito',
  preparando: 'Em preparo',
  em_preparo: 'Em preparo',
  pronto_retirada: 'Pronto para retirada',
  coletado: 'Coletado pelo entregador',
  em_entrega: 'Saiu para entrega',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
  recusado: 'Recusado pela loja',
}

export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  recebido: 'bg-amber-100 text-amber-700',
  aceito: 'bg-sky-100 text-sky-700',
  preparando: 'bg-sky-100 text-sky-700',
  em_preparo: 'bg-sky-100 text-sky-700',
  pronto_retirada: 'bg-indigo-100 text-indigo-700',
  coletado: 'bg-purple-100 text-purple-700',
  em_entrega: 'bg-purple-100 text-purple-700',
  entregue: 'bg-emerald-100 text-emerald-700',
  cancelado: 'bg-neutral-200 text-neutral-600',
  recusado: 'bg-red-100 text-red-700',
}

export const ACTIVE_ORDER_STATUSES: OrderStatus[] = [
  'recebido',
  'aceito',
  'preparando',
  'em_preparo',
  'pronto_retirada',
  'coletado',
  'em_entrega',
]
