import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Package, RefreshCw, Store as StoreIcon, TrendingUp } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AuthForm from '../components/auth/AuthForm'
import { fetchMyStore } from '../data/ads.api'
import {
  fetchStoreOrders,
  setStoreOpen,
  storeAcceptOrder,
  storeRejectOrder,
  storeSetPreparing,
  storeSetReady,
} from '../data/storeOrders.api'
import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL } from '../lib/orderLabels'
import { formatBRL } from '../lib/format'
import { supabase } from '../lib/supabase'
import type { Order } from '../types/domain'
import type { StoreRow } from '../types/database'

type Period = 'hoje' | '7dias' | '30dias'

function withinPeriod(dateIso: string, period: Period): boolean {
  const date = new Date(dateIso)
  const now = new Date()
  if (period === 'hoje') return date.toDateString() === now.toDateString()
  const days = period === '7dias' ? 7 : 30
  const cutoff = new Date(now)
  cutoff.setDate(cutoff.getDate() - days)
  return date >= cutoff
}

function OrderCard({ order, onChanged }: { order: Order; onChanged: () => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [prepMinutes, setPrepMinutes] = useState('30')

  async function run(action: () => Promise<void>) {
    setBusy(true)
    setError(null)
    try {
      await action()
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível concluir a ação.')
    } finally {
      setBusy(false)
    }
  }

  function handleReject() {
    const reason = window.prompt('Motivo da recusa (o cliente vai ver isso):')
    if (reason === null) return
    run(() => storeRejectOrder(order.id, reason))
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-neutral-900">{order.customerName}</p>
          <p className="text-xs text-neutral-500">{new Date(order.createdAt).toLocaleString('pt-BR')}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${ORDER_STATUS_COLOR[order.status]}`}>
          {ORDER_STATUS_LABEL[order.status]}
        </span>
      </div>

      <ul className="mt-2 space-y-0.5 text-sm text-neutral-600">
        {order.items.map((item) => (
          <li key={item.id}>
            {item.quantity}x {item.name}
            {item.notes && <span className="italic text-neutral-400"> — {item.notes}</span>}
          </li>
        ))}
      </ul>

      <p className="mt-2 text-xs text-neutral-500">Entrega: {order.address}</p>
      {order.statusNote && <p className="mt-1 text-xs italic text-neutral-400">Nota: {order.statusNote}</p>}

      <div className="mt-2 flex justify-between border-t border-neutral-100 pt-2 text-sm font-bold text-neutral-900">
        <span>Total</span>
        <span>{formatBRL(order.total)}</span>
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {order.status === 'recebido' && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-xs text-neutral-500">Preparo (min)</label>
            <input
              type="number"
              min="5"
              max="180"
              value={prepMinutes}
              onChange={(e) => setPrepMinutes(e.target.value)}
              className="w-16 rounded-lg border border-neutral-200 p-1.5 text-xs outline-none focus:border-brand"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              disabled={busy}
              className="flex-1 rounded-full border border-red-200 py-2 text-xs font-bold text-red-600 disabled:opacity-50"
            >
              Recusar
            </button>
            <button
              onClick={() => run(() => storeAcceptOrder(order.id, Number(prepMinutes) || undefined))}
              disabled={busy}
              className="flex-1 rounded-full bg-brand py-2 text-xs font-bold text-white disabled:opacity-50"
            >
              Aceitar pedido
            </button>
          </div>
        </div>
      )}

      {(order.status === 'aceito' || order.status === 'preparando') && (
        <button
          onClick={() => run(() => storeSetPreparing(order.id))}
          disabled={busy}
          className="mt-3 w-full rounded-full bg-brand py-2 text-xs font-bold text-white disabled:opacity-50"
        >
          Marcar em preparo
        </button>
      )}

      {order.status === 'em_preparo' && (
        <button
          onClick={() => run(() => storeSetReady(order.id))}
          disabled={busy}
          className="mt-3 w-full rounded-full bg-brand py-2 text-xs font-bold text-white disabled:opacity-50"
        >
          Marcar pronto para retirada
        </button>
      )}
    </div>
  )
}

export default function LojistaOrdersPage() {
  const { session, loading } = useAuth()
  const [store, setStore] = useState<StoreRow | null | undefined>(undefined)
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [period, setPeriod] = useState<Period>('hoje')
  const [error, setError] = useState(false)
  const [togglingOpen, setTogglingOpen] = useState(false)

  async function load(storeId: string) {
    try {
      const data = await fetchStoreOrders(storeId)
      setOrders(data)
    } catch {
      setError(true)
    }
  }

  useEffect(() => {
    if (!session) return
    let cancelled = false
    fetchMyStore(session.user.id).then((s) => {
      if (cancelled) return
      setStore(s ?? null)
      if (s) load(s.id)
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  useEffect(() => {
    if (!store) return
    const channel = supabase
      .channel(`orders-store-${store.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `store_id=eq.${store.id}` }, () =>
        load(store.id),
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store])

  async function handleToggleOpen() {
    if (!store) return
    setTogglingOpen(true)
    try {
      await setStoreOpen(store.id, !store.is_open)
      setStore({ ...store, is_open: !store.is_open })
    } catch {
      // erro silencioso — estado visual não muda se a chamada falhar
    } finally {
      setTogglingOpen(false)
    }
  }

  const newOrders = useMemo(() => (orders ?? []).filter((o) => o.status === 'recebido'), [orders])
  const preparingOrders = useMemo(
    () => (orders ?? []).filter((o) => ['aceito', 'preparando', 'em_preparo'].includes(o.status)),
    [orders],
  )
  const dispatchingOrders = useMemo(
    () => (orders ?? []).filter((o) => ['pronto_retirada', 'coletado', 'em_entrega'].includes(o.status)),
    [orders],
  )
  const historyOrders = useMemo(
    () => (orders ?? []).filter((o) => ['entregue', 'cancelado', 'recusado'].includes(o.status)),
    [orders],
  )

  const periodOrders = useMemo(() => (orders ?? []).filter((o) => withinPeriod(o.createdAt, period)), [orders, period])
  const periodDelivered = periodOrders.filter((o) => o.status === 'entregue')
  const revenue = periodDelivered.reduce((sum, o) => sum + o.total, 0)
  const avgTicket = periodDelivered.length > 0 ? revenue / periodDelivered.length : 0

  if (loading) return <div className="h-64 animate-pulse rounded-2xl bg-neutral-200" />
  if (!session) {
    return <AuthForm title="Área do lojista" subtitleLogin="Entre para gerenciar seus pedidos." subtitleSignup="Crie sua conta." />
  }
  if (store === undefined) return <div className="h-64 animate-pulse rounded-2xl bg-neutral-200" />
  if (store === null) {
    return (
      <div className="mx-auto max-w-md space-y-3 rounded-2xl border border-neutral-200 bg-white p-6 text-center">
        <StoreIcon className="mx-auto h-8 w-8 text-neutral-300" strokeWidth={1.5} />
        <h1 className="text-lg font-bold text-neutral-900">Você ainda não tem uma loja</h1>
        <p className="text-sm text-neutral-500">Cadastre sua loja em Rapizz Ads pra começar a receber pedidos.</p>
        <Link to="/anunciar" className="inline-block rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white">
          Cadastrar loja
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-neutral-900">{store.name}</h1>
          <p className="text-sm text-neutral-500">Pedidos e desempenho da loja.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/anunciar" className="text-xs font-semibold text-neutral-500 underline">
            Cardápio e Ads
          </Link>
          <button
            onClick={handleToggleOpen}
            disabled={togglingOpen}
            className={`rounded-full px-4 py-2 text-xs font-bold disabled:opacity-50 ${
              store.is_open ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-200 text-neutral-600'
            }`}
          >
            {store.is_open ? 'Loja aberta' : 'Loja fechada'} · toque pra {store.is_open ? 'fechar' : 'abrir'}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {(['hoje', '7dias', '30dias'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                period === p ? 'border-brand bg-brand text-white' : 'border-neutral-200 text-neutral-600'
              }`}
            >
              {p === 'hoje' ? 'Hoje' : p === '7dias' ? '7 dias' : '30 dias'}
            </button>
          ))}
        </div>
        <button
          onClick={() => load(store.id)}
          className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Atualizar
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-3 text-center">
          <Package className="mx-auto h-4 w-4 text-accent" />
          <p className="mt-1 text-lg font-extrabold text-neutral-900">{periodOrders.length}</p>
          <p className="text-[11px] text-neutral-500">Pedidos</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-3 text-center">
          <TrendingUp className="mx-auto h-4 w-4 text-accent" />
          <p className="mt-1 text-lg font-extrabold text-neutral-900">{formatBRL(revenue)}</p>
          <p className="text-[11px] text-neutral-500">Vendas entregues</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-3 text-center">
          <Clock className="mx-auto h-4 w-4 text-accent" />
          <p className="mt-1 text-lg font-extrabold text-neutral-900">{formatBRL(avgTicket)}</p>
          <p className="text-[11px] text-neutral-500">Ticket médio</p>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">Não foi possível carregar os pedidos.</p>}

      {orders === null && !error && <div className="h-40 animate-pulse rounded-2xl bg-neutral-200" />}

      {orders && (
        <div className="space-y-6">
          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500">
              Novos pedidos {newOrders.length > 0 && `(${newOrders.length})`}
            </h2>
            {newOrders.length === 0 ? (
              <p className="rounded-xl border border-dashed border-neutral-300 py-6 text-center text-sm text-neutral-500">
                Nenhum pedido novo aguardando aceite.
              </p>
            ) : (
              <div className="space-y-2">
                {newOrders.map((o) => (
                  <OrderCard key={o.id} order={o} onChanged={() => load(store.id)} />
                ))}
              </div>
            )}
          </section>

          {preparingOrders.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500">Em preparo</h2>
              <div className="space-y-2">
                {preparingOrders.map((o) => (
                  <OrderCard key={o.id} order={o} onChanged={() => load(store.id)} />
                ))}
              </div>
            </section>
          )}

          {dispatchingOrders.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500">Prontos / a caminho</h2>
              <div className="space-y-2">
                {dispatchingOrders.map((o) => (
                  <OrderCard key={o.id} order={o} onChanged={() => load(store.id)} />
                ))}
              </div>
            </section>
          )}

          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500">Histórico</h2>
            {historyOrders.length === 0 ? (
              <p className="rounded-xl border border-dashed border-neutral-300 py-6 text-center text-sm text-neutral-500">
                Nenhum pedido concluído ainda.
              </p>
            ) : (
              <div className="space-y-2">
                {historyOrders.slice(0, 20).map((o) => (
                  <div key={o.id} className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-3">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{o.customerName}</p>
                      <p className="text-xs text-neutral-400">{new Date(o.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="text-right">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${ORDER_STATUS_COLOR[o.status]}`}>
                        {ORDER_STATUS_LABEL[o.status]}
                      </span>
                      <p className="mt-0.5 text-xs font-semibold text-neutral-700">{formatBRL(o.total)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

