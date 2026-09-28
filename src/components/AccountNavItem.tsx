import { NavLink } from 'react-router-dom'
import { User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function AccountNavItemMobile() {
  const { session, profile } = useAuth()
  const initial = (profile?.full_name || session?.user.email || '?').charAt(0).toUpperCase()

  return (
    <NavLink
      to="/conta"
      className={({ isActive }) =>
        `flex flex-col items-center gap-0.5 px-3 py-1.5 text-[11px] font-medium ${isActive ? 'text-navy' : 'text-neutral-500'}`
      }
    >
      {session ? (
        <span className="grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-brand to-accent text-[10px] font-bold text-white">
          {initial}
        </span>
      ) : (
        <User className="h-5 w-5" strokeWidth={1.75} />
      )}
      Perfil
    </NavLink>
  )
}
