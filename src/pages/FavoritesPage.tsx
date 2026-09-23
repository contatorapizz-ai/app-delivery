import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bike, Clock, Heart, Star } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AuthForm from '../components/auth/AuthForm'
import FavoriteButton from '../components/FavoriteButton'
import MediaTile from '../components/MediaTile'
import { fetchFavoriteStores } from '../data/favorites.api'
import { categoryMeta } from '../data/categories'
import { formatBRL, formatEta } from '../lib/format'
import type { Store } from '../types/domain'

export default function FavoritesPage() {
  const { session, loading } = useAuth()
  const [stores, setStores] = useState<Store[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!session) return
    fetchFavoriteStores(session.user.id)
      .then(setStores)
      .catch(() => setError(true))
  }, [session])

  if (loading) return <div className="h-64 animate-pulse rounded-2xl bg-neutral-200" />

  if (!session) {
    return <AuthForm title="Favoritos" subtitleLogin="Entre para ver suas lojas salvas." subtitleSignup="Crie sua conta." />
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-neutral-900">Favoritos</h1>
        <p className="text-sm text-neutral-500">Suas lojas salvas</p>
      </div>

      {error && <p className="text-sm text-red-600">Não foi possível carregar seus favoritos.</p>}

      {stores === null && !error && <div className="h-24 animate-pulse rounded-2xl bg-neutral-200" />}

      {stores && stores.length === 0 && (
        <p className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-neutral-300 py-16 text-center text-sm text-neutral-500">
          <Heart className="h-6 w-6 text-neutral-300" />
          Você ainda não favoritou nenhuma loja. Toque no coração em uma loja para salvá-la aqui.
        </p>
      )}

      {stores && stores.length > 0 && (
        <div className="space-y-2.5">
          {stores.map((store) => {
            const cat = categoryMeta(store.category)
            const CatIcon = cat.icon
            return (
              <div
                key={store.id}
                className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm"
              >
                <Link to={`/loja/${store.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                  <MediaTile
                    src={store.imageUrl}
                    alt={store.name}
                    icon={<CatIcon className="h-6 w-6" strokeWidth={1.5} />}
                    className="h-14 w-14 shrink-0 rounded-full"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-neutral-900">{store.name}</p>
                    <p className="truncate text-sm text-neutral-500">{cat.label}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-600">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-neutral-400" /> {formatEta(store.etaMinutes)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-accent text-accent" /> {store.rating.toFixed(1)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bike className="h-3.5 w-3.5 text-neutral-400" /> {formatBRL(store.deliveryFee)}
                      </span>
                    </div>
                  </div>
                </Link>
                <FavoriteButton storeId={store.id} className="h-9 w-9 shrink-0 border border-neutral-200" />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
