import { NavLink, Outlet } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import Logo from './Logo'
import { AccountNavItemDesktop, AccountNavItemMobile } from './AccountNavItem'

const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs font-medium ${
    isActive ? 'text-brand' : 'text-neutral-500'
  }`

const desktopNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive ? 'bg-brand-light text-brand' : 'text-neutral-600 hover:bg-neutral-100'
  }`

function CartBadge({ variant }: { variant: 'mobile' | 'desktop' }) {
  const { itemsCount } = useCart()
  if (itemsCount === 0) return null
  return (
    <span
      className={`absolute flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white ${
        variant === 'mobile' ? '-top-0.5 right-1' : '-right-1 -top-1'
      }`}
    >
      {itemsCount}
    </span>
  )
}

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 lg:px-8">
          <NavLink to="/">
            <Logo />
          </NavLink>

          <nav className="hidden items-center gap-1 lg:flex">
            <NavLink to="/" end className={desktopNavLinkClass}>
              Início
            </NavLink>
            <NavLink to="/pedidos" className={desktopNavLinkClass}>
              Meus pedidos
            </NavLink>
            <NavLink to="/carrinho" className={desktopNavLinkClass}>
              <span className="relative">
                🛒 Carrinho
                <CartBadge variant="desktop" />
              </span>
            </NavLink>
            <NavLink
              to="/anunciar"
              className={({ isActive }) =>
                `ml-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  isActive ? 'border-brand bg-brand text-white' : 'border-neutral-300 text-neutral-600 hover:border-brand hover:text-brand'
                }`
              }
            >
              📣 Anunciar
            </NavLink>
            <div className="ml-2 border-l border-neutral-200 pl-2">
              <AccountNavItemDesktop />
            </div>
          </nav>

          <NavLink
            to="/anunciar"
            className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-600 lg:hidden"
          >
            📣 Anunciar
          </NavLink>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-5 lg:px-8 lg:pb-10">
        <Outlet />
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-white lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-around">
          <NavLink to="/" end className={mobileNavLinkClass}>
            <span className="text-xl leading-none">🏠</span>
            Início
          </NavLink>
          <NavLink to="/carrinho" className={mobileNavLinkClass} aria-label="Carrinho">
            <span className="relative text-xl leading-none">
              🛒
              <CartBadge variant="mobile" />
            </span>
            Carrinho
          </NavLink>
          <NavLink to="/pedidos" className={mobileNavLinkClass}>
            <span className="text-xl leading-none">📦</span>
            Pedidos
          </NavLink>
          <AccountNavItemMobile />
        </div>
      </nav>
    </div>
  )
}
