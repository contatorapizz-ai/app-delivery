import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Package, RefreshCw, Star } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useOrders } from '../context/OrdersContext'
import { useCart } from '../context/CartContext'
import { cancelOrder, fetchMyOrders, fetchProductsByStore, rateOrder } from '../data/api'
import { formatBRL } from '../lib/format'
import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL } from '../lib/orderLabels'
import { supabase } from '../lib/supabase'
import type { Order } from '../types/domain'

function RateForm({ order, onDone }: { order: Order; onDone: () => void }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [sending, setSending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    try {
      await rateOrder(order.id, rating, comment)
      onDone()
    } catch {
      // erro silencioso — usuário pode tentar de novo
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-2 rounded-lg bg-neutral-50 p-3">
      <p className="text-xs font-semibold text-neutral-700">Como foi seu pedido?</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} estrelas`}>
            <Star className={`h-5 w-5 ${n <= rating ? 'fill-accent text-accent' : 'text-neutral-300'}`} />
          </button>
        ))}
      </div>
      <input
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Comentário (opcional)"
        maxLength={300}
        className="w-full rounded-lg border border-neutral-200 p-2 text-xs outline-none focus:border-brand"
      />
      <button
        type="submit"
        disabled={sending}
        className="rounded-full bg-brand px-4 py-1.5 text-xs font-bold text-white disabled:opacity-50"
      >
        {sending ? 'Enviando...' : 'Enviar avaliação'}
      </button>
    </form>
  )
}

function OrderRow({ order, onChanged }: { order: Order; onChanged: () => void }) {
  const { storeId, clearCart, addItem } = useCart()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showRate, setShowRate] = useState(false)

  const canCancel = order.status === 'recebido' || order.status === 'aceito'

  async function handleCancel() {
    if (!window.confirm('Cancelar este pedido?')) return
    setBusy(true)
    setError(null)
    try {
      await cancelOrder(order.id)
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível cancelar.')
    } finally {
      setBusy(false)
    }
  }

  async function handleRepeat() {
    setBusy(true)
    setError(null)
    try {
      const products = await fetchProductsByStore(order.storeId)
      const available = products.filter((p) => p.isAvailable)
      const toAdd = order.items
        .map((item) => ({ item, product: available.find((p) => p.id === item.productId) }))
        .filter((x) => x.product)

      if (toAdd.length === 0) {
        setError('Nenhum item desse pedido está disponível agora.')
        return
      }
      if (storeId && storeId !== order.storeId) {
        if (!window.confirm('Seu carrinho tem itens de outra loja. Esvaziar e repetir este pedido?')) return
        clearCart()
      }
      for (const { item, product } of toAdd) {
        if (!product) continue
        addItem({ product, quantity: item.quantity, selectedOptions: item.selectedOptions, notes: item.notes })
      }
      if (toAdd.length < order.items.length) {
        alert(`${order.items.length - toAdd.length} item(ns) não estão mais disponíveis e foram ignorados.`)
      }
      navigate('/carrinho')
    } catch {
      setError('Não foi possível repetir o pedido agora.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-neutral-900">{order.storeName}</p>
          <p className="text-xs text-neutral-400">{new Date(order.createdAt).toLocaleString('pt-BR')}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${ORDER_STATUS_COLOR[order.status]}`}>
          {ORDER_STATUS_LABEL[order.status]}
        </span>
      </div>
      <ul className="mt-2 space-y-0.5 text-sm text-neutral-600">
        {order.items.map((item) => (
          <li key={item.id}>
            {item.quantity}x {item.name}
          </li>
        ))}
      </ul>
      {order.statusNote && (order.status === 'recusado' || order.status === 'cancelado') && (
        <p className="mt-1 text-xs italic text-neutral-500">Motivo: {order.statusNote}</p>
      )}
      <div className="mt-2 flex justify-between border-t border-neutral-100 pt-2 text-sm font-semibold text-neutral-900">
        <span>Total</span>
        <span>{formatBRL(order.total)}</span>
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={busy}
            className="rounded-full border border-red-200 px-4 py-1.5 text-xs font-bold text-red-600 disabled:opacity-50"
          >
            Cancelar
          </button>
        )}
        {(order.status === 'entregue' || order.status === 'cancelado' || order.status === 'recusado') && (
          <button
            onClick={handleRepeat}
            disabled={busy}
            className="rounded-full border border-neutral-200 px-4 py-1.5 text-xs font-bold text-neutral-600 disabled:opacity-50"
          >
            Repetir pedido
          </button>
        )}
        {order.status === 'entregue' && !order.rated && !showRate && (
          <button
            onClick={() => setShowRate(true)}
            className="rounded-full bg-brand px-4 py-1.5 text-xs font-bold text-white"
          >
            Avaliar
          </button>
        )}
      </div>

      {showRate && <RateForm order={order} onDone={() => { setShowRate(false); onChanged() }} />}
    </div>
  )
}

export default function OrdersPage() {
  const { session } = useAuth()
  const { orders: localOrders } = useOrders()
  const [remoteOrders, setRemoteOrders] = useState<Order[] | null>(null)
  const [error, setError] = useState(false)

  function load(customerId: string) {
    fetchMyOrders(customerId)
      .then(setRemoteOrders)
      .catch(() => setError(true))
  }

  useEffect(() => {
    if (!session) return
    load(session.user.id)
  }, [session])

  useEffect(() => {
    if (!session) return
    const channel = supabase
      .channel(`orders-customer-${session.user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `customer_id=eq.${session.user.id}` },
        () => load(session.user.id),
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  const orders = session ? remoteOrders : localOrders

  if (!session && localOrders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <Package className="h-12 w-12 text-neutral-300" strokeWidth={1.5} />
        <h1 className="text-lg font-bold text-neutral-900">Nenhum pedido ainda</h1>
        <p className="text-sm text-neutral-500">Seus pedidos aparecerão aqui após a finalização.</p>
        <Link to="/" className="mt-2 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white">
          Ver lojas
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-neutral-900">Meus pedidos</h1>
        {session && (
          <button onClick={() => load(session.user.id)} className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
            <RefreshCw className="h-3.5 w-3.5" /> Atualizar
          </button>
        )}
      </div>

      {!session && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-700">
          Você não está logado — esses pedidos ficam salvos só neste aparelho e não recebem atualização automática de
          status. Entre na sua conta pra acompanhar em tempo real.
        </p>
      )}

      {error && <p className="text-sm text-red-600">Não foi possível carregar seus pedidos.</p>}

      {orders === null && !error && (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-neutral-200" />
          ))}
        </div>
      )}

      {orders && orders.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 py-16 text-center text-sm text-neutral-500">
          Nenhum pedido ainda.
        </p>
      )}

      {orders && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} onChanged={() => session && load(session.user.id)} />
          ))}
        </div>
      )}
    </div>
  )
}
