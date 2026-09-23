import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatBRL } from '../lib/format'

export default function CartBar() {
  const { itemsCount, itemsTotal } = useCart()
  const location = useLocation()

  if (itemsCount === 0 || location.pathname === '/carrinho') return null

  return (
    <div
      className="fixed inset-x-0 z-20 px-4 lg:hidden"
      style={{ bottom: 'calc(env(safe-area-inset-bottom) + 4.5rem)' }}
    >
      <Link
        to="/carrinho"
        className="mx-auto flex max-w-3xl items-center justify-between rounded-2xl bg-gradient-to-r from-brand to-accent px-4 py-3 text-sm font-bold text-white shadow-lg shadow-brand/30"
      >
        <span className="flex items-center gap-1.5">
          <ShoppingCart className="h-4 w-4" /> {itemsCount} {itemsCount === 1 ? 'item' : 'itens'}
        </span>
        <span>Ver carrinho · {formatBRL(itemsTotal)}</span>
      </Link>
    </div>
  )
}
