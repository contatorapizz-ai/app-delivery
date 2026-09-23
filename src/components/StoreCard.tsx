import { Link } from 'react-router-dom'
import { Bike, Clock, Star } from 'lucide-react'
import type { Store } from '../types/domain'
import { categoryMeta } from '../data/categories'
import { formatBRL, formatEta } from '../lib/format'
import MediaTile from './MediaTile'
import FavoriteButton from './FavoriteButton'

export default function StoreCard({ store }: { store: Store }) {
  const cat = categoryMeta(store.category)
  const Icon = cat.icon

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]">
      <Link
        to={store.isOpen ? `/loja/${store.id}` : '#'}
        aria-disabled={!store.isOpen}
        className={`block ${store.isOpen ? '' : 'pointer-events-none opacity-60'}`}
      >
        <MediaTile
          src={store.imageUrl}
          alt={store.name}
          icon={<Icon className="h-10 w-10 lg:h-12 lg:w-12" strokeWidth={1.5} />}
          className="h-24 w-full lg:h-32"
          imgClassName="transition duration-300 group-hover:scale-105"
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
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-accent text-accent" /> {store.rating.toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-neutral-400" /> {formatEta(store.etaMinutes)}
            </span>
            <span className="flex items-center gap-1">
              <Bike className="h-3.5 w-3.5 text-neutral-400" /> {formatBRL(store.deliveryFee)}
            </span>
          </div>
        </div>
      </Link>
      <FavoriteButton storeId={store.id} className="absolute right-2 top-2 z-10 h-8 w-8" />
    </div>
  )
}
