import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { fetchProductsByStore, fetchStoreById } from '../data/api'
import { categoryMeta } from '../data/categories'
import { formatBRL, formatEta } from '../lib/format'
import type { Product, Store } from '../types/domain'
import AddToCartSheet from '../components/AddToCartSheet'
import { useCart } from '../context/CartContext'

export default function StorePage() {
  const { storeId } = useParams<{ storeId: string }>()
  const [store, setStore] = useState<Store | null | undefined>(undefined)
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const { storeId: cartStoreId, clearCart } = useCart()

  useEffect(() => {
    if (!storeId) return
    let cancelled = false
    setStore(undefined)
    Promise.all([fetchStoreById(storeId), fetchProductsByStore(storeId)])
      .then(([s, p]) => {
        if (cancelled) return
        setStore(s ?? null)
        setProducts(p)
      })
      .catch(() => {
        if (!cancelled) setStore(null)
      })
    return () => {
      cancelled = true
    }
  }, [storeId])

  const grouped = useMemo(() => {
    const map = new Map<string, Product[]>()
    for (const p of products) {
      const list = map.get(p.menuCategory) ?? []
      list.push(p)
      map.set(p.menuCategory, list)
    }
    return Array.from(map.entries())
  }, [products])

  if (store === undefined) {
    return <div className="h-64 animate-pulse rounded-2xl bg-neutral-200" />
  }

  if (store === null) return <Navigate to="/" replace />

  const cat = categoryMeta(store.category)

  function handleSelectProduct(product: Product) {
    if (cartStoreId && cartStoreId !== product.storeId) {
      const confirmed = window.confirm(
        'Seu carrinho tem itens de outra loja. Deseja esvaziar o carrinho e adicionar itens desta loja?',
      )
      if (!confirmed) return
      clearCart()
    }
    setSelectedProduct(product)
  }

  return (
    <div className="space-y-5">
      <Link to="/" className="text-sm text-neutral-500 hover:text-neutral-700">
        ← Voltar
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
        <div className="lg:col-span-2">
          <div
            className={`flex h-32 items-center justify-center rounded-2xl bg-gradient-to-br ${cat.gradient} text-6xl lg:h-44 lg:text-7xl`}
          >
            {cat.emoji}
          </div>
        </div>

        <aside className="rounded-2xl border border-neutral-200 bg-white p-4 lg:sticky lg:top-24 lg:row-span-2">
          <h1 className="text-xl font-extrabold text-neutral-900">{store.name}</h1>
          <p className="mt-0.5 text-sm text-neutral-500">{cat.label}</p>
          <p className="mt-2 text-sm text-neutral-600">{store.address}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-neutral-700">
            <span className="rounded-lg bg-neutral-50 px-2.5 py-2">⭐ {store.rating.toFixed(1)} avaliação</span>
            <span className="rounded-lg bg-neutral-50 px-2.5 py-2">⏱ {formatEta(store.etaMinutes)}</span>
            <span className="rounded-lg bg-neutral-50 px-2.5 py-2">🛵 {formatBRL(store.deliveryFee)}</span>
            <span className="rounded-lg bg-neutral-50 px-2.5 py-2">🧾 mín. {formatBRL(store.minOrder)}</span>
          </div>
          {!store.isOpen && (
            <p className="mt-3 rounded-lg bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-600">
              Esta loja está fechada no momento.
            </p>
          )}
        </aside>

        <div className="space-y-6 lg:col-span-2">
          {grouped.map(([category, items]) => (
            <section key={category}>
              <h2 className="mb-2 text-base font-bold text-neutral-900">{category}</h2>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {items.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    disabled={!store.isOpen}
                    className="flex w-full items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 text-left shadow-sm transition hover:border-brand/40 hover:shadow disabled:opacity-50"
                  >
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-brand-light text-2xl">
                      {product.emoji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-neutral-900">{product.name}</span>
                      <span className="block truncate text-xs text-neutral-500">{product.description}</span>
                      <span className="mt-0.5 block text-sm font-semibold text-brand">
                        {formatBRL(product.price)}
                      </span>
                    </span>
                    <span aria-hidden className="text-xl text-neutral-300">＋</span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {selectedProduct && (
        <AddToCartSheet product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  )
}
