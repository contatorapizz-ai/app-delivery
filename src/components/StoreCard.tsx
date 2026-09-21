import { Link } from 'react-router-dom'
import type { Store } from '../types/domain'
import { categoryMeta } from '../data/categories'
import { formatBRL, formatEta } from '../lib/format'

export default function StoreCard({ store }: { store: Store }) {
  const cat = categoryMeta(store.category)

  return (
    <Link
      to={store.isOpen ? `/loja/${store.id}` : '#'}
      aria-disabled={!store.isOpen}
      className={`block overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition active:scale-[0.99] ${
        store.isOpen ? '' : 'pointer-events-none opacity-60'
      }`}
    >
      <div className={`flex h-24 items-center justify-center bg-gradient-to-br ${cat.gradient} text-5xl`}>
        {cat.emoji}
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-neutral-900">{store.name}</h3>
          {!store.isOpen && (
            <span className="shrink-0 rounded-full bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-600">
              Fechado
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-neutral-500">{cat.label}</p>
        <div className="mt-2 flex items-center gap-3 text-xs text-neutral-600">
          <span>⭐ {store.rating.toFixed(1)}</span>
          <span>⏱ {formatEta(store.etaMinutes)}</span>
          <span>🛵 {formatBRL(store.deliveryFee)}</span>
        </div>
      </div>
    </Link>
  )
}
