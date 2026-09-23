import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, HelpCircle, Heart, LogOut, Megaphone, Package, Settings, User, Wrench } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AuthForm from '../components/auth/AuthForm'

const ROLE_LABEL: Record<string, string> = {
  cliente: 'Cliente',
  lojista: 'Lojista',
  motoboy: 'Motoboy',
  admin: 'Administrador',
}

function MenuLink({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-neutral-100 text-neutral-600">
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      <ChevronRight className="h-4 w-4 text-neutral-300" />
    </Link>
  )
}

export default function AccountPage() {
  const { session, profile, loading, signOut } = useAuth()
  const [signingOut, setSigningOut] = useState(false)
  const [showAuth, setShowAuth] = useState(false)

  if (loading) return <div className="h-64 animate-pulse rounded-2xl bg-neutral-200" />

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
    setSigningOut(false)
  }

  const initial = (profile?.full_name || session?.user.email || '?').charAt(0).toUpperCase()
  const role = profile?.role ?? 'cliente'

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-navy via-brand to-accent p-5 text-white shadow-sm">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white/15 text-xl font-bold">
            {session ? initial : <User className="h-6 w-6" strokeWidth={1.75} />}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold">
              {session ? `Olá, ${profile?.full_name || 'você'}!` : 'Olá, visitante!'}
            </h1>
            {session ? (
              <>
                <p className="truncate text-sm text-white/80">{session.user.email}</p>
                <span className="mt-1 inline-block rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold">
                  {ROLE_LABEL[role] ?? role}
                </span>
              </>
            ) : (
              <button
                onClick={() => setShowAuth((v) => !v)}
                className="mt-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-brand"
              >
                Entrar / Cadastrar
              </button>
            )}
          </div>
        </div>
      </div>

      {!session && showAuth && (
        <AuthForm title="Minha conta" subtitleLogin="Entre para ver seus dados." subtitleSignup="Crie sua conta." />
      )}

      <div className="divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        {session && (role === 'lojista' || role === 'admin') && (
          <MenuLink to="/anunciar" icon={<Megaphone className="h-4 w-4" />} label="Rapizz Ads — minhas campanhas" />
        )}
        {session && role === 'admin' && (
          <MenuLink to="/admin" icon={<Wrench className="h-4 w-4" />} label="Painel administrativo" />
        )}
        <MenuLink to="/pedidos" icon={<Package className="h-4 w-4" />} label="Meus Pedidos" />
        <MenuLink to="/favoritos" icon={<Heart className="h-4 w-4" />} label="Favoritos" />
        <MenuLink to="/suporte" icon={<HelpCircle className="h-4 w-4" />} label="Suporte Rapizz" />
        <MenuLink to="/configuracoes" icon={<Settings className="h-4 w-4" />} label="Configurações" />
      </div>

      {session && (
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-red-200 py-2.5 text-sm font-bold text-red-600 disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          {signingOut ? 'Saindo...' : 'Sair da conta'}
        </button>
      )}
    </div>
  )
}
