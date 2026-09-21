import { Link } from 'react-router-dom'
import { useOrders } from '../context/OrdersContext'
import { formatBRL } from '../lib/format'
import type { OrderStatus } from '../types/domain'

const STATUS_LABEL: Record<OrderStatus, string> = {
  recebido: 'Pedido recebido',
  preparando: 'Em preparo',
  em_entrega: 'Saiu para entrega',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
}

const STATUS_COLOR: Record<OrderStatus, string> = {
  recebido: 'bg-sky-100 text-sky-700',
  preparando: 'bg-amber-100 text-amber-700',
  em_entrega: 'bg-purple-100 text-purple-700',
  entregue: 'bg-emerald-100 text-emerald-700',
  cancelado: 'bg-neutral-200 text-neutral-600',
}

export default function OrdersPage() {
  const { orders } = useOrders()

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <span className="text-5xl">📦</span>
        <h1 className="text-lg font-bold text-neutral-900">Nenhum pedido ainda</h1>
        <p className="text-sm text-neutral-500">Seus pedidos aparecerão aqui após a finalização.</p>
        <Link to="/" className="mt-2 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white">
          Ver lojas
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-neutral-900">Meus pedidos</h1>
      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="rounded-xl border border-neutral-200 bg-white p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-neutral-900">{order.storeName}</p>
                <p className="text-xs text-neutral-400">
                  {new Date(order.createdAt).toLocaleString('pt-BR')}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLOR[order.status]}`}>
                {STATUS_LABEL[order.status]}
              </span>
            </div>
            <ul className="mt-2 space-y-0.5 text-sm text-neutral-600">
              {order.items.map((item) => (
                <li key={item.id}>
                  {item.quantity}x {item.name}
                </li>
              ))}
            </ul>
            <div className="mt-2 flex justify-between border-t border-neutral-100 pt-2 text-sm font-semibold text-neutral-900">
              <span>Total</span>
              <span>{formatBRL(order.total)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
