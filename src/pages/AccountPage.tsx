import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthForm from '../components/auth/AuthForm'

const ROLE_LABEL: Record<string, string> = {
  cliente: 'Cliente',
  lojista: 'Lojista',
  motoboy: 'Motoboy',
  admin: 'Administrador',
}

export default function AccountPage() {
  const { session, profile, loading, signOut } = useAuth()
  const [signingOut, setSigningOut] = useState(false)

  if (loading) return <div className="h-64 animate-pulse rounded-2xl bg-neutral-200" />

  if (!session) {
    return <AuthForm title="Minha conta" subtitleLogin="Entre para ver seus dados." subtitleSignup="Crie sua conta." />
  }

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
    setSigningOut(false)
  }

  const initial = (profile?.full_name || session.user.email || '?').charAt(0).toUpperCase()
  const role = profile?.role ?? 'cliente'

  return (
    <div className="mx-auto max-w-sm space-y-4">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-brand to-navy text-2xl font-bold text-white">
          {initial}
        </span>
        <h1 className="mt-3 text-lg font-bold text-neutral-900">{profile?.full_name || 'Sem nome cadastrado'}</h1>
        <p className="text-sm text-neutral-500">{session.user.email}</p>
        <span className="mt-2 inline-block rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand">
          {ROLE_LABEL[role] ?? role}
        </span>
      </div>

      <div className="space-y-2 rounded-2xl border border-neutral-200 bg-white p-2 shadow-sm">
        {(role === 'lojista' || role === 'admin') && (
          <Link
            to="/anunciar"
            className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            📣 Rapizz Ads — minhas campanhas
            <span className="text-neutral-300">→</span>
          </Link>
        )}
        {role === 'admin' && (
          <Link
            to="/admin"
            className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            🛠️ Painel administrativo
            <span className="text-neutral-300">→</span>
          </Link>
        )}
        <Link
          to="/pedidos"
          className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          📦 Meus pedidos
          <span className="text-neutral-300">→</span>
        </Link>
      </div>

      <button
        onClick={handleSignOut}
        disabled={signingOut}
        className="w-full rounded-full border border-red-200 py-2.5 text-sm font-bold text-red-600 disabled:opacity-50"
      >
        {signingOut ? 'Saindo...' : 'Sair da conta'}
      </button>
    </div>
  )
}
