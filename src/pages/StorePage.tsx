import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { getProductsByStore, getStoreById } from '../data/stores'
import { categoryMeta } from '../data/categories'
import { formatBRL, formatEta } from '../lib/format'
import type { Product } from '../types/domain'
import AddToCartSheet from '../components/AddToCartSheet'
import { useCart } from '../context/CartContext'

export default function StorePage() {
  const { storeId } = useParams<{ storeId: string }>()
  const store = storeId ? getStoreById(storeId) : undefined
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const { storeId: cartStoreId, clearCart } = useCart()

  const products = useMemo(() => (storeId ? getProductsByStore(storeId) : []), [storeId])

  const grouped = useMemo(() => {
    const map = new Map<string, Product[]>()
    for (const p of products) {
      const list = map.get(p.menuCategory) ?? []
      list.push(p)
      map.set(p.menuCategory, list)
    }
    return Array.from(map.entries())
  }, [products])

  if (!store) return <Navigate to="/" replace />

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
      <Link to="/" className="text-sm text-neutral-500">
        ← Voltar
      </Link>

      <div className={`flex h-28 items-center justify-center rounded-2xl bg-gradient-to-br ${cat.gradient} text-6xl`}>
        {cat.emoji}
      </div>

      <div>
        <h1 className="text-xl font-extrabold text-neutral-900">{store.name}</h1>
        <p className="text-sm text-neutral-500">{cat.label} · {store.address}</p>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-neutral-600">
          <span>⭐ {store.rating.toFixed(1)}</span>
          <span>⏱ {formatEta(store.etaMinutes)}</span>
          <span>🛵 Entrega {formatBRL(store.deliveryFee)}</span>
          <span>🧾 Pedido mín. {formatBRL(store.minOrder)}</span>
        </div>
        {!store.isOpen && (
          <p className="mt-2 rounded-lg bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-600">
            Esta loja está fechada no momento.
          </p>
        )}
      </div>

      {grouped.map(([category, items]) => (
        <section key={category}>
          <h2 className="mb-2 text-base font-bold text-neutral-900">{category}</h2>
          <div className="space-y-2">
            {items.map((product) => (
              <button
                key={product.id}
                onClick={() => handleSelectProduct(product)}
                disabled={!store.isOpen}
                className="flex w-full items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 text-left shadow-sm disabled:opacity-50"
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

      {selectedProduct && (
        <AddToCartSheet product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  )
}
