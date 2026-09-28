import { Link } from 'react-router-dom'
import { Clock, Star } from 'lucide-react'
import type { Store } from '../types/domain'
import { categoryMeta } from '../data/categories'
import { formatEta } from '../lib/format'
import MediaTile from './MediaTile'
import FavoriteButton from './FavoriteButton'

export default function StoreRow({ store }: { store: Store }) {
  const cat = categoryMeta(store.category)
  const Icon = cat.icon

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
      <Link
        to={store.isOpen ? `/loja/${store.id}` : '#'}
        aria-disabled={!store.isOpen}
        className={`flex min-w-0 flex-1 items-center gap-3 ${store.isOpen ? '' : 'pointer-events-none opacity-60'}`}
      >
        <MediaTile
          src={store.imageUrl}
          alt={store.name}
          icon={<Icon className="h-6 w-6" strokeWidth={1.5} />}
          className="h-14 w-14 shrink-0 rounded-full"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-navy" aria-hidden />
            <p className="truncate font-semibold text-neutral-900">{store.name}</p>
            {!store.isOpen && (
              <span className="shrink-0 rounded-full bg-neutral-200 px-2 py-0.5 text-[11px] font-medium text-neutral-600">
                Fechado
              </span>
            )}
          </div>
          <p className="truncate text-sm text-neutral-500">{cat.label}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-600">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-neutral-400" /> {formatEta(store.etaMinutes)}
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-accent text-accent" /> {store.rating.toFixed(1)}
            </span>
          </div>
        </div>
      </Link>
      <FavoriteButton storeId={store.id} className="h-9 w-9 shrink-0 border border-neutral-200" />
    </div>
  )
}
