import { NavLink, Outlet } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function CartBadgeLink() {
  const { itemsCount } = useCart()
  return (
    <NavLink
      to="/carrinho"
      className={({ isActive }) =>
        `relative flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs font-medium ${
          isActive ? 'text-brand' : 'text-neutral-500'
        }`
      }
      aria-label="Carrinho"
    >
      <span className="text-xl leading-none">🛒</span>
      Carrinho
      {itemsCount > 0 && (
        <span className="absolute -top-0.5 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
          {itemsCount}
        </span>
      )}
    </NavLink>
  )
}

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <NavLink to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-red-500 to-brand-dark text-lg">
              🍕
            </span>
            <span className="text-lg font-extrabold tracking-tight text-neutral-900">Rapizz</span>
          </NavLink>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24 pt-4">
        <Outlet />
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-white"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-around">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs font-medium ${
                isActive ? 'text-brand' : 'text-neutral-500'
              }`
            }
          >
            <span className="text-xl leading-none">🏠</span>
            Início
          </NavLink>
          <CartBadgeLink />
          <NavLink
            to="/pedidos"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs font-medium ${
                isActive ? 'text-brand' : 'text-neutral-500'
              }`
            }
          >
            <span className="text-xl leading-none">📦</span>
            Pedidos
          </NavLink>
        </div>
      </nav>
    </div>
  )
}
