import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bike, MailCheck, Store, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

type SignupRole = 'cliente' | 'motoboy' | 'lojista'

const ROLE_DESTINATION: Record<Exclude<SignupRole, 'cliente'>, string> = {
  motoboy: '/entregador',
  lojista: '/vender',
}

export default function AuthForm({
  title = 'Entrar no Rapizz',
  subtitleLogin = 'Entre com sua conta.',
  subtitleSignup = 'Crie sua conta.',
}: {
  title?: string
  subtitleLogin?: string
  subtitleSignup?: string
}) {
  const { session, signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [signupRole, setSignupRole] = useState<SignupRole>('cliente')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [signupDone, setSignupDone] = useState(false)

  useEffect(() => {
    if (signupDone && session && signupRole !== 'cliente') {
      navigate(ROLE_DESTINATION[signupRole])
    }
  }, [signupDone, session, signupRole, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const message = mode === 'login' ? await signIn(email, password) : await signUp(email, password, fullName)
    setLoading(false)
    if (message) {
      setError(message)
    } else if (mode === 'signup') {
      setSignupDone(true)
    }
  }

  if (signupDone) {
    return (
      <div className="mx-auto max-w-sm space-y-2 rounded-2xl border border-neutral-200 bg-white p-6 text-center">
        <MailCheck className="mx-auto h-8 w-8 text-brand" strokeWidth={1.5} />
        <h1 className="text-lg font-bold text-neutral-900">Confira seu e-mail</h1>
        <p className="text-sm text-neutral-500">
          Se o seu cadastro pedir confirmação, enviamos um link para <strong>{email}</strong>. Depois de confirmar
          (ou já, se a confirmação estiver desativada), volte aqui e entre normalmente.
        </p>
        {signupRole === 'motoboy' && (
          <p className="rounded-lg bg-neutral-50 p-3 text-xs text-neutral-500">
            Depois de entrar, vá em <strong>Perfil → Seja um entregador</strong> pra completar seu cadastro de
            motoboy (dados do veículo). Ele passa por aprovação da administração antes de ficar disponível.
          </p>
        )}
        {signupRole === 'lojista' && (
          <p className="rounded-lg bg-neutral-50 p-3 text-xs text-neutral-500">
            Depois de entrar, vá em <strong>Perfil → Cadastrar minha loja</strong> pra enviar os dados da sua loja.
            Ela passa por aprovação da administração antes de aparecer no Rapizz.
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-sm space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div>
        <h1 className="text-xl font-extrabold text-neutral-900">{title}</h1>
        <p className="mt-1 text-sm text-neutral-500">{mode === 'login' ? subtitleLogin : subtitleSignup}</p>
      </div>

      {mode === 'signup' && (
        <div>
          <p className="mb-1.5 text-xs font-semibold text-neutral-600">O que você é?</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSignupRole('cliente')}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-semibold transition ${
                signupRole === 'cliente' ? 'border-navy bg-navy text-white' : 'border-neutral-200 text-neutral-600'
              }`}
            >
              <User className="h-4 w-4" /> Cliente
            </button>
            <button
              type="button"
              onClick={() => setSignupRole('motoboy')}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-semibold transition ${
                signupRole === 'motoboy' ? 'border-navy bg-navy text-white' : 'border-neutral-200 text-neutral-600'
              }`}
            >
              <Bike className="h-4 w-4" /> Entregador
            </button>
            <button
              type="button"
              onClick={() => setSignupRole('lojista')}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-semibold transition ${
                signupRole === 'lojista' ? 'border-navy bg-navy text-white' : 'border-neutral-200 text-neutral-600'
              }`}
            >
              <Store className="h-4 w-4" /> Lojista
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === 'signup' && (
          <input
            type="text"
            required
            placeholder="Seu nome"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-brand"
          />
        )}
        <input
          type="email"
          required
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-brand"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Senha (mín. 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-brand"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-brand py-2.5 text-sm font-bold text-white disabled:opacity-50"
        >
          {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
        </button>
      </form>
      <button
        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
        className="w-full text-center text-xs font-medium text-neutral-500 underline"
      >
        {mode === 'login' ? 'Ainda não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}
      </button>
    </div>
  )
}
