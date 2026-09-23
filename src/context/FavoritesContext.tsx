import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { addFavorite, fetchFavoriteStoreIds, removeFavorite } from '../data/favorites.api'

interface FavoritesContextValue {
  isFavorite: (storeId: string) => boolean
  toggleFavorite: (storeId: string) => Promise<void>
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!session) {
      setFavoriteIds(new Set())
      return
    }
    let cancelled = false
    fetchFavoriteStoreIds(session.user.id)
      .then((ids) => {
        if (!cancelled) setFavoriteIds(ids)
      })
      .catch(() => {
        if (!cancelled) setFavoriteIds(new Set())
      })
    return () => {
      cancelled = true
    }
  }, [session])

  const isFavorite = useCallback((storeId: string) => favoriteIds.has(storeId), [favoriteIds])

  const toggleFavorite = useCallback(
    async (storeId: string) => {
      if (!session) throw new Error('Entre para favoritar lojas.')
      const currentlyFavorite = favoriteIds.has(storeId)
      setFavoriteIds((prev) => {
        const next = new Set(prev)
        if (currentlyFavorite) next.delete(storeId)
        else next.add(storeId)
        return next
      })
      try {
        if (currentlyFavorite) await removeFavorite(session.user.id, storeId)
        else await addFavorite(session.user.id, storeId)
      } catch (err) {
        setFavoriteIds((prev) => {
          const next = new Set(prev)
          if (currentlyFavorite) next.add(storeId)
          else next.delete(storeId)
          return next
        })
        throw err
      }
    },
    [session, favoriteIds],
  )

  return <FavoritesContext.Provider value={{ isFavorite, toggleFavorite }}>{children}</FavoritesContext.Provider>
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites precisa estar dentro de <FavoritesProvider>')
  return ctx
}
