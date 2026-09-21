import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useOrders } from '../context/OrdersContext'
import { createOrder, fetchStoreById } from '../data/api'
import { formatBRL } from '../lib/format'
import type { Order, Store } from '../types/domain'

export default function CartPage() {
  const { items, storeId, updateQuantity, removeItem, itemsTotal, clearCart } = useCart()
  const { addOrder } = useOrders()
  const navigate = useNavigate()

  const [store, setStore] = useState<Store | undefined>(undefined)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!storeId) {
      setStore(undefined)
      return
    }
    let cancelled = false
    fetchStoreById(storeId).then((s) => {
      if (!cancelled) setStore(s)
    })
    return () => {
      cancelled = true
    }
  }, [storeId])

  const deliveryFee = store?.deliveryFee ?? 0
  const total = itemsTotal + deliveryFee
  const belowMinimum = store ? itemsTotal < store.minOrder : false

  const canSubmit = useMemo(
    () => items.length > 0 && !belowMinimum && customerName.trim().length > 1 && customerPhone.trim().length >= 8 && address.trim().length > 5,
    [items.length, belowMinimum, customerName, customerPhone, address],
  )

  function buildWhatsAppMessage(order: Order): string {
    const lines: string[] = []
    lines.push(`*Novo pedido — Rapizz*`)
    lines.push(`Loja: ${order.storeName}`)
    lines.push('')
    for (const item of order.items) {
      lines.push(`• ${item.quantity}x ${item.name} — ${formatBRL(item.unitPrice * item.quantity)}`)
      for (const opt of item.selectedOptions) {
        lines.push(`   ${opt.groupLabel}: ${opt.choiceLabel}`)
      }
      if (item.notes) lines.push(`   Obs: ${item.notes}`)
    }
    lines.push('')
    lines.push(`Taxa de entrega: ${formatBRL(order.deliveryFee)}`)
    lines.push(`*Total: ${formatBRL(order.total)}*`)
    lines.push('')
    lines.push(`Cliente: ${order.customerName}`)
    lines.push(`Telefone: ${order.customerPhone}`)
    lines.push(`Endereço: ${order.address}`)
    if (order.notes) lines.push(`Obs. do pedido: ${order.notes}`)
    return lines.join('\n')
  }

  async function handleFinalize() {
    if (!store || !canSubmit || submitting) return
    setSubmitting(true)

    const trimmedNotes = notes.trim() || undefined

    try {
      await createOrder({
        storeId: store.id,
        items,
        subtotal: itemsTotal,
        deliveryFee,
        total,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        address: address.trim(),
        notes: trimmedNotes,
      })
    } catch {
      // segue o fluxo mesmo se a gravação remota falhar — o pedido não pode travar por isso
    }

    const order: Order = {
      id: `${Date.now()}`,
      storeId: store.id,
      storeName: store.name,
      items,
      total,
      deliveryFee,
      status: 'recebido',
      createdAt: new Date().toISOString(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      address: address.trim(),
      notes: trimmedNotes,
    }

    addOrder(order)
    clearCart()

    const message = buildWhatsAppMessage(order)
    const url = `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank', 'noopener,noreferrer')

    navigate('/pedidos')
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <span className="text-5xl">🛒</span>
        <h1 className="text-lg font-bold text-neutral-900">Seu carrinho está vazio</h1>
        <p className="text-sm text-neutral-500">Adicione itens de uma loja para continuar.</p>
        <Link to="/" className="mt-2 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white">
          Ver lojas
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-neutral-900">Seu carrinho</h1>
        {store && <p className="text-sm text-neutral-500">{store.name}</p>}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
        <div className="space-y-5 lg:col-span-2">
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="rounded-xl border border-neutral-200 bg-white p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-neutral-900">{item.name}</p>
                    {item.selectedOptions.map((opt) => (
                      <p key={opt.choiceId} className="text-xs text-neutral-500">
                        {opt.groupLabel}: {opt.choiceLabel}
                      </p>
                    ))}
                    {item.notes && <p className="text-xs italic text-neutral-500">Obs: {item.notes}</p>}
                  </div>
                  <p className="shrink-0 font-semibold text-brand">{formatBRL(item.unitPrice * item.quantity)}</p>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-3 rounded-full border border-neutral-200 px-3 py-1">
                    <button
                      aria-label="Diminuir"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="text-lg font-bold text-neutral-600"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      aria-label="Aumentar"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="text-lg font-bold text-neutral-600"
                    >
                      +
                    </button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-xs font-medium text-neutral-400">
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>

          {store && belowMinimum && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
              Pedido mínimo de {formatBRL(store.minOrder)}. Faltam {formatBRL(store.minOrder - itemsTotal)}.
            </p>
          )}

          <section className="space-y-3 rounded-xl border border-neutral-200 bg-white p-3">
            <h2 className="text-sm font-bold text-neutral-900">Dados para entrega</h2>
            <div>
              <label htmlFor="name" className="mb-1 block text-xs font-medium text-neutral-600">
                Nome completo
              </label>
              <input
                id="name"
                value={customerName}
                maxLength={80}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-brand"
                placeholder="Seu nome"
              />
            </div>
            <div>
              <label htmlFor="phone" className="mb-1 block text-xs font-medium text-neutral-600">
                Telefone / WhatsApp
              </label>
              <input
                id="phone"
                value={customerPhone}
                maxLength={20}
                inputMode="tel"
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-brand"
                placeholder="(27) 99999-9999"
              />
            </div>
            <div>
              <label htmlFor="address" className="mb-1 block text-xs font-medium text-neutral-600">
                Endereço de entrega
              </label>
              <textarea
                id="address"
                value={address}
                maxLength={200}
                rows={2}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full resize-none rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-brand"
                placeholder="Rua, número, bairro, ponto de referência"
              />
            </div>
            <div>
              <label htmlFor="orderNotes" className="mb-1 block text-xs font-medium text-neutral-600">
                Observações do pedido (opcional)
              </label>
              <textarea
                id="orderNotes"
                value={notes}
                maxLength={200}
                rows={2}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full resize-none rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-brand"
              />
            </div>
          </section>
        </div>

        <aside className="space-y-4 rounded-xl border border-neutral-200 bg-white p-4 lg:sticky lg:top-24">
          <h2 className="text-sm font-bold text-neutral-900">Resumo do pedido</h2>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal</span>
              <span>{formatBRL(itemsTotal)}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Taxa de entrega</span>
              <span>{formatBRL(deliveryFee)}</span>
            </div>
            <div className="flex justify-between border-t border-neutral-100 pt-1 font-bold text-neutral-900">
              <span>Total</span>
              <span>{formatBRL(total)}</span>
            </div>
          </div>

          <button
            onClick={handleFinalize}
            disabled={!canSubmit || submitting}
            className="w-full rounded-full bg-brand py-3.5 text-sm font-bold text-white disabled:opacity-40"
          >
            {submitting ? 'Enviando...' : 'Finalizar pedido pelo WhatsApp'}
          </button>
          <p className="text-center text-xs text-neutral-400">
            Você será direcionado ao WhatsApp da loja para confirmar o pagamento e a entrega.
          </p>
        </aside>
      </div>
    </div>
  )
}
