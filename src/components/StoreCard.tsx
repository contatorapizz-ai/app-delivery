import { Link } from 'react-router-dom'
import type { Store } from '../types/domain'
import { categoryMeta } from '../data/categories'
import { formatBRL, formatEta } from '../lib/format'
import MediaTile from './MediaTile'

export default function StoreCard({ store }: { store: Store }) {
  const cat = categoryMeta(store.category)

  return (
    <Link
      to={store.isOpen ? `/loja/${store.id}` : '#'}
      aria-disabled={!store.isOpen}
      className={`group block overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] ${
        store.isOpen ? '' : 'pointer-events-none opacity-60'
      }`}
    >
      <MediaTile
        src={store.imageUrl}
        alt={store.name}
        icon={cat.emoji}
        className="h-24 w-full lg:h-32"
        imgClassName="transition duration-300 group-hover:scale-105"
        iconClassName="text-4xl lg:text-5xl"
      />
      <div className="p-3 lg:p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-neutral-900 lg:text-lg">{store.name}</h3>
          {!store.isOpen && (
            <span className="shrink-0 rounded-full bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-600">
              Fechado
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-neutral-500">{cat.label}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-600 lg:text-sm">
          <span>⭐ {store.rating.toFixed(1)}</span>
          <span>⏱ {formatEta(store.etaMinutes)}</span>
          <span>🛵 {formatBRL(store.deliveryFee)}</span>
        </div>
      </div>
    </Link>
  )
}
