import { useNavigate } from 'react-router-dom'
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
      className={`grid place-items-center rounded-full bg-white/90 text-lg shadow-sm backdrop-blur transition hover:scale-105 ${className}`}
    >
      <span aria-hidden className={active ? 'text-brand' : 'text-neutral-400'}>
        {active ? '♥' : '♡'}
      </span>
    </button>
  )
}
