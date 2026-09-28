import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AuthForm from '../components/auth/AuthForm'
import StoreRow from '../components/StoreRow'
import { fetchFavoriteStores } from '../data/favorites.api'
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
          {stores.map((store) => (
            <StoreRow key={store.id} store={store} />
          ))}
        </div>
      )}
    </div>
  )
}
