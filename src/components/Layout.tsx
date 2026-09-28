import { NavLink, Outlet } from 'react-router-dom'
import { Heart, Home, Package, PlayCircle, Search } from 'lucide-react'
import LocationBar from './LocationBar'
import CartBar from './CartBar'
import { AccountNavItemMobile } from './AccountNavItem'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex flex-col items-center gap-0.5 px-3 py-1.5 text-[11px] font-medium ${
    isActive ? 'text-navy' : 'text-neutral-500'
  }`

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <LocationBar />

      <main className="w-full flex-1 px-4 pb-28 pt-5 lg:px-6">
        <Outlet />
      </main>

      <CartBar />

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-white"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-around">
          <NavLink to="/" end className={navLinkClass}>
            <Home className="h-5 w-5" strokeWidth={1.75} />
            Início
          </NavLink>
          <NavLink to="/shop" className={navLinkClass}>
            <PlayCircle className="h-5 w-5" strokeWidth={1.75} />
            Rapizz Shop
          </NavLink>
          <NavLink to="/busca" className={navLinkClass}>
            <Search className="h-5 w-5" strokeWidth={1.75} />
            Busca
          </NavLink>
          <NavLink to="/pedidos" className={navLinkClass}>
            <Package className="h-5 w-5" strokeWidth={1.75} />
            Pedidos
          </NavLink>
          <NavLink to="/favoritos" className={navLinkClass}>
            <Heart className="h-5 w-5" strokeWidth={1.75} />
            Favoritos
          </NavLink>
          <AccountNavItemMobile />
        </div>
      </nav>
    </div>
  )
}
