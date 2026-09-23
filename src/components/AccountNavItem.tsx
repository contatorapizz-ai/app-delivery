import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function AccountNavItemMobile() {
  const { session, profile } = useAuth()
  const initial = (profile?.full_name || session?.user.email || '?').charAt(0).toUpperCase()

  return (
    <NavLink
      to="/conta"
      className={({ isActive }) =>
        `flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs font-medium ${isActive ? 'text-brand' : 'text-neutral-500'}`
      }
    >
      {session ? (
        <span className="grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-brand to-navy text-[10px] font-bold text-white">
          {initial}
        </span>
      ) : (
        <span className="text-xl leading-none">👤</span>
      )}
      Perfil
    </NavLink>
  )
}

export function AccountNavItemDesktop() {
  const { session, profile } = useAuth()
  const initial = (profile?.full_name || session?.user.email || '?').charAt(0).toUpperCase()

  return (
    <NavLink
      to="/conta"
      className={({ isActive }) =>
        `flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
          isActive ? 'bg-brand-light text-brand' : 'text-neutral-600 hover:bg-neutral-100'
        }`
      }
    >
      {session ? (
        <>
          <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-brand to-navy text-xs font-bold text-white">
            {initial}
          </span>
          <span className="max-w-32 truncate">{profile?.full_name || session.user.email}</span>
        </>
      ) : (
        <>👤 Entrar</>
      )}
    </NavLink>
  )
}
