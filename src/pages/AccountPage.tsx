import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Bike, ChevronRight, ClipboardList, HelpCircle, Heart, LogOut, Megaphone, Package, Settings, Store, User, Wrench } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AuthForm from '../components/auth/AuthForm'

const ROLE_LABEL: Record<string, string> = {
  cliente: 'Cliente',
  lojista: 'Lojista',
  motoboy: 'Motoboy',
  admin: 'Administrador',
}

type MenuTone = 'accent' | 'brand' | 'navy' | 'neutral' | 'red'

const TONE_CLASS: Record<MenuTone, string> = {
  accent: 'bg-accent/15 text-accent',
  brand: 'bg-brand/15 text-brand',
  navy: 'bg-navy/10 text-navy',
  neutral: 'bg-neutral-100 text-neutral-600',
  red: 'bg-red-100 text-red-600',
}

function MenuRow({ icon, label, tone = 'neutral' }: { icon: ReactNode; label: string; tone?: MenuTone }) {
  return (
    <>
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${TONE_CLASS[tone]}`}>{icon}</span>
      <span className="flex-1">{label}</span>
      <ChevronRight className="h-4 w-4 text-neutral-300" />
    </>
  )
}

function MenuLink({ to, icon, label, tone }: { to: string; icon: ReactNode; label: string; tone?: MenuTone }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-sm font-semibold text-neutral-800 shadow-sm hover:bg-neutral-50"
    >
      <MenuRow icon={icon} label={label} tone={tone} />
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
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-navy via-indigo-800 to-blue-900 p-5 text-white shadow-sm">
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
                className="mt-1.5 rounded-full bg-accent px-4 py-1.5 text-xs font-bold text-white"
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

      <div className="space-y-2.5">
        {session && role === 'lojista' && (
          <MenuLink to="/lojista" icon={<ClipboardList className="h-4 w-4" />} label="Pedidos da loja" tone="navy" />
        )}
        {session && role === 'lojista' && (
          <MenuLink
            to="/anunciar"
            icon={<Megaphone className="h-4 w-4" />}
            label="Rapizz Ads — minhas campanhas"
            tone="accent"
          />
        )}
        {session && role === 'motoboy' && (
          <MenuLink to="/entregador" icon={<Bike className="h-4 w-4" />} label="Minhas entregas" tone="navy" />
        )}
        {session && role === 'admin' && (
          <MenuLink to="/admin" icon={<Wrench className="h-4 w-4" />} label="Painel administrativo" tone="neutral" />
        )}
        <MenuLink to="/pedidos" icon={<Package className="h-4 w-4" />} label="Meus Pedidos" tone="accent" />
        {session && role === 'cliente' && (
          <MenuLink to="/entregador" icon={<Bike className="h-4 w-4" />} label="Seja um entregador" tone="navy" />
        )}
        {session && role === 'cliente' && (
          <MenuLink to="/vender" icon={<Store className="h-4 w-4" />} label="Cadastrar minha loja" tone="accent" />
        )}
        <MenuLink to="/favoritos" icon={<Heart className="h-4 w-4" />} label="Favoritos" tone="brand" />
        <MenuLink to="/suporte" icon={<HelpCircle className="h-4 w-4" />} label="Suporte Rapizz" tone="navy" />
        <MenuLink to="/configuracoes" icon={<Settings className="h-4 w-4" />} label="Configurações" tone="neutral" />
        {session && (
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-left text-sm font-semibold text-neutral-800 shadow-sm hover:bg-neutral-50 disabled:opacity-50"
          >
            <MenuRow icon={<LogOut className="h-4 w-4" />} label={signingOut ? 'Saindo...' : 'Sair'} tone="red" />
          </button>
        )}
      </div>
    </div>
  )
}
