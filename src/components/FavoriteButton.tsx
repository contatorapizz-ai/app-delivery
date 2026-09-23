import { useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useFavorites } from '../context/FavoritesContext'

export default function FavoriteButton({ storeId, className = '' }: { storeId: string; className?: string }) {
  const { session } = useAuth()
  const { isFavorite, toggleFavorite } = useFavorites()
  const navigate = useNavigate()
  const active = isFavorite(storeId)

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!session) {
      navigate('/conta')
      return
    }
    toggleFavorite(storeId).catch(() => {
      // erro silencioso — botão volta ao estado anterior automaticamente
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={active ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      aria-pressed={active}
      className={`grid place-items-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:scale-105 ${className}`}
    >
      <Heart className={`h-4 w-4 ${active ? 'fill-brand text-brand' : 'text-neutral-400'}`} aria-hidden />
    </button>
  )
}
