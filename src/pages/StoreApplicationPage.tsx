import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Clock, ShieldX } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AuthForm from '../components/auth/AuthForm'
import { CATEGORIES } from '../data/categories'
import { applyAsLojista, fetchMyStoreApplication, type StoreApplication } from '../data/storeApplications.api'
import { errorMessage } from '../lib/errors'

function ApplicationForm({ onSubmitted }: { onSubmitted: (app: StoreApplication) => void }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<string>(CATEGORIES[0].id)
  const [address, setAddress] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const app = await applyAsLojista({ name: name.trim(), category, address: address.trim(), whatsapp: whatsapp.trim() })
      onSubmitted(app)
    } catch (err) {
      setError(errorMessage(err, 'Não foi possível enviar o cadastro.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-3 rounded-2xl border border-neutral-200 bg-white p-6">
      <div>
        <h1 className="text-xl font-extrabold text-neutral-900">Cadastrar minha loja</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Preencha os dados da sua loja. Um administrador confere e aprova antes dela ficar visível no Rapizz.
        </p>
      </div>
      <div>
        <label htmlFor="storeName" className="mb-1 block text-xs font-medium text-neutral-600">
          Nome da loja
        </label>
        <input
          id="storeName"
          required
          value={name}
          maxLength={80}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-brand"
          placeholder="Ex: Pizzaria do Zé"
        />
      </div>
      <div>
        <label htmlFor="storeCategory" className="mb-1 block text-xs font-medium text-neutral-600">
          Categoria
        </label>
        <select
          id="storeCategory"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-brand"
        >
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="storeAddress" className="mb-1 block text-xs font-medium text-neutral-600">
          Endereço
        </label>
        <input
          id="storeAddress"
          required
          value={address}
          maxLength={200}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-brand"
          placeholder="Rua, número, bairro, cidade"
        />
      </div>
      <div>
        <label htmlFor="storeWhatsapp" className="mb-1 block text-xs font-medium text-neutral-600">
          WhatsApp da loja
        </label>
        <input
          id="storeWhatsapp"
          required
          inputMode="tel"
          value={whatsapp}
          maxLength={20}
          onChange={(e) => setWhatsapp(e.target.value)}
          className="w-full rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-brand"
          placeholder="5511999999999"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-brand py-2.5 text-sm font-bold text-white disabled:opacity-50"
      >
        {loading ? 'Enviando...' : 'Enviar cadastro'}
      </button>
    </form>
  )
}

export default function StoreApplicationPage() {
  const { session, profile, loading: authLoading, refreshProfile } = useAuth()
  const [application, setApplication] = useState<StoreApplication | null | undefined>(undefined)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!session) return
    fetchMyStoreApplication(session.user.id)
      .then(setApplication)
      .catch(() => setError(true))
  }, [session])

  if (authLoading) return <div className="h-64 animate-pulse rounded-2xl bg-neutral-200" />

  if (!session) {
    return <AuthForm title="Vender no Rapizz" subtitleLogin="Entre pra cadastrar sua loja." subtitleSignup="Crie sua conta pra cadastrar sua loja." />
  }

  if (profile?.role === 'lojista') return <Navigate to="/lojista" replace />

  if (application === undefined && !error) {
    return <div className="h-64 animate-pulse rounded-2xl bg-neutral-200" />
  }

  if (error) {
    return <p className="text-center text-sm text-red-600">Não foi possível carregar seu cadastro agora.</p>
  }

  if (application?.approval_status === 'pendente') {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
        <Clock className="h-8 w-8 text-amber-500" strokeWidth={1.5} />
        <h1 className="text-lg font-bold text-neutral-900">Cadastro em análise</h1>
        <p className="text-sm text-neutral-600">
          Recebemos o cadastro de <strong>{application.name}</strong>. Um administrador vai conferir e aprovar em
          breve — assim que aprovado, essa área vira o painel da sua loja.
        </p>
      </div>
    )
  }

  if (application?.approval_status === 'bloqueada') {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <ShieldX className="h-8 w-8 text-red-500" strokeWidth={1.5} />
        <h1 className="text-lg font-bold text-neutral-900">Cadastro não aprovado</h1>
        <p className="text-sm text-neutral-600">
          O cadastro de <strong>{application.name}</strong> não foi aprovado. Fale com o suporte pra entender o motivo.
        </p>
      </div>
    )
  }

  return (
    <ApplicationForm
      onSubmitted={(app) => {
        setApplication(app)
        refreshProfile()
      }}
    />
  )
}
