import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import {
  activateCampaign,
  createCampaign,
  createStore,
  fetchCampaignMetrics,
  fetchMyCampaigns,
  fetchMyStore,
} from '../data/ads.api'
import { CATEGORIES } from '../data/categories'
import type { StoreCategory } from '../types/domain'
import { formatBRL } from '../lib/format'
import type { AdCampaignRow, AdCampaignStatus, AdFormat, AdObjective, StoreRow } from '../types/database'

const STATUS_LABEL: Record<AdCampaignStatus, string> = {
  rascunho: 'Rascunho',
  pendente_pagamento: 'Aguardando pagamento',
  ativa: 'Ativa',
  pausada: 'Pausada',
  concluida: 'Concluída',
  rejeitada: 'Rejeitada',
}

const STATUS_COLOR: Record<AdCampaignStatus, string> = {
  rascunho: 'bg-neutral-200 text-neutral-600',
  pendente_pagamento: 'bg-amber-100 text-amber-700',
  ativa: 'bg-emerald-100 text-emerald-700',
  pausada: 'bg-neutral-200 text-neutral-600',
  concluida: 'bg-sky-100 text-sky-700',
  rejeitada: 'bg-red-100 text-red-700',
}

const OBJECTIVE_LABEL: Record<AdObjective, string> = {
  vendas: 'Vendas',
  cliques: 'Cliques',
  alcance: 'Alcance',
  conversoes: 'Conversões',
  reconhecimento_marca: 'Reconhecimento de marca',
}

const FORMAT_LABEL: Record<AdFormat, string> = {
  story_premium: 'Story Premium',
  loja_patrocinada: 'Loja Patrocinada',
  banner_destaque: 'Banner Destaque',
  promocao_relampago: 'Promoção Relâmpago',
  produto_patrocinado: 'Produto Patrocinado',
  categoria_patrocinada: 'Categoria Patrocinada',
  marca_patrocinada: 'Marca Patrocinada',
}

// Formatos com superfície implementada no app do cliente nesta fase.
const LIVE_FORMATS: AdFormat[] = ['story_premium', 'banner_destaque', 'produto_patrocinado']

function AuthForm() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [signupDone, setSignupDone] = useState(false)

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
        <h1 className="text-lg font-bold text-neutral-900">Confira seu e-mail</h1>
        <p className="text-sm text-neutral-500">
          Se o seu cadastro pedir confirmação, enviamos um link para <strong>{email}</strong>. Depois de confirmar
          (ou já, se a confirmação estiver desativada), volte aqui e entre normalmente.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-sm space-y-4 rounded-2xl border border-neutral-200 bg-white p-6">
      <div>
        <h1 className="text-xl font-extrabold text-neutral-900">Rapizz Ads</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {mode === 'login' ? 'Entre para gerenciar suas campanhas.' : 'Crie sua conta de lojista.'}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === 'signup' && (
          <input
            type="text"
            required
            placeholder="Nome da loja ou responsável"
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

function CreateStoreForm({ onCreated }: { onCreated: (store: StoreRow) => void }) {
  const { session, refreshProfile } = useAuth()
  const [name, setName] = useState('')
  const [category, setCategory] = useState<StoreCategory>(CATEGORIES[0].id)
  const [address, setAddress] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [deliveryFee, setDeliveryFee] = useState('')
  const [minOrder, setMinOrder] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!session) return
    setError(null)
    setLoading(true)
    try {
      const store = await createStore({
        ownerId: session.user.id,
        name,
        category,
        address,
        whatsapp,
        deliveryFee: Number(deliveryFee) || 0,
        minOrder: Number(minOrder) || 0,
      })
      await supabase.from('profiles').update({ role: 'lojista' }).eq('id', session.user.id)
      await refreshProfile()
      onCreated(store)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a loja.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4 rounded-2xl border border-neutral-200 bg-white p-6">
      <div>
        <h1 className="text-xl font-extrabold text-neutral-900">Cadastre sua loja</h1>
        <p className="mt-1 text-sm text-neutral-500">Você precisa de uma loja no Rapizz para anunciar.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          required
          placeholder="Nome da loja"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-brand"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as StoreCategory)}
          className="w-full rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-brand"
        >
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.label}
            </option>
          ))}
        </select>
        <input
          required
          placeholder="Endereço"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-brand"
        />
        <input
          required
          placeholder="WhatsApp (só números, com DDI)"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))}
          className="w-full rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-brand"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            required
            type="number"
            step="0.01"
            min="0"
            placeholder="Taxa de entrega (R$)"
            value={deliveryFee}
            onChange={(e) => setDeliveryFee(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-brand"
          />
          <input
            required
            type="number"
            step="0.01"
            min="0"
            placeholder="Pedido mínimo (R$)"
            value={minOrder}
            onChange={(e) => setMinOrder(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-brand"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-brand py-2.5 text-sm font-bold text-white disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Criar loja'}
        </button>
      </form>
    </div>
  )
}

function CampaignForm({ storeId, onCreated }: { storeId: string; onCreated: () => void }) {
  const [objective, setObjective] = useState<AdObjective>('vendas')
  const [format, setFormat] = useState<AdFormat>('story_premium')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [budget, setBudget] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await createCampaign({
        storeId,
        objective,
        format,
        title,
        description,
        budget: Number(budget) || 0,
        startsAt,
        endsAt,
      })
      setTitle('')
      setDescription('')
      setBudget('')
      setStartsAt('')
      setEndsAt('')
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a campanha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-5">
      <h2 className="text-base font-bold text-neutral-900">Nova campanha</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Objetivo</label>
          <select
            value={objective}
            onChange={(e) => setObjective(e.target.value as AdObjective)}
            className="w-full rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-brand"
          >
            {Object.entries(OBJECTIVE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Formato</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as AdFormat)}
            className="w-full rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-brand"
          >
            {Object.entries(FORMAT_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
                {!LIVE_FORMATS.includes(value as AdFormat) ? ' (em breve)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!LIVE_FORMATS.includes(format) && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Este formato ainda não tem exibição no app do cliente — a campanha fica registrada, mas não aparece
          publicamente até a Fase 2.
        </p>
      )}

      <input
        required
        placeholder="Título do anúncio"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={80}
        className="w-full rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-brand"
      />
      <textarea
        placeholder="Descrição curta (opcional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={160}
        rows={2}
        className="w-full resize-none rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-brand"
      />

      <div className="grid grid-cols-3 gap-3">
        <input
          required
          type="number"
          step="0.01"
          min="1"
          placeholder="Orçamento (R$)"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="col-span-1 w-full rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-brand"
        />
        <input
          required
          type="date"
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
          className="w-full rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-brand"
        />
        <input
          required
          type="date"
          value={endsAt}
          onChange={(e) => setEndsAt(e.target.value)}
          className="w-full rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-brand"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-brand py-2.5 text-sm font-bold text-white disabled:opacity-50 sm:w-auto sm:px-8"
      >
        {loading ? 'Criando...' : 'Criar campanha'}
      </button>
    </form>
  )
}

function CampaignRow({ campaign, onChanged }: { campaign: AdCampaignRow; onChanged: () => void }) {
  const [metrics, setMetrics] = useState<{ impressions: number; clicks: number } | null>(null)
  const [activating, setActivating] = useState(false)

  useEffect(() => {
    if (campaign.status === 'ativa') {
      fetchCampaignMetrics(campaign.id).then(setMetrics).catch(() => setMetrics(null))
    }
  }, [campaign.id, campaign.status])

  async function handleActivate() {
    setActivating(true)
    try {
      await activateCampaign(campaign.id)
      onChanged()
    } catch {
      // erro silencioso — status permanece inalterado, lojista pode tentar de novo
    } finally {
      setActivating(false)
    }
  }

  const ctr = metrics && metrics.impressions > 0 ? ((metrics.clicks / metrics.impressions) * 100).toFixed(1) : null

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-neutral-900">{campaign.title}</p>
          <p className="text-xs text-neutral-500">
            {FORMAT_LABEL[campaign.format]} · {OBJECTIVE_LABEL[campaign.objective]}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLOR[campaign.status]}`}>
          {STATUS_LABEL[campaign.status]}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
        <span>Orçamento {formatBRL(campaign.budget_cents / 100)}</span>
        <span>
          {new Date(campaign.starts_at).toLocaleDateString('pt-BR')} – {new Date(campaign.ends_at).toLocaleDateString('pt-BR')}
        </span>
      </div>

      {campaign.status === 'ativa' && metrics && (
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg bg-neutral-50 py-2">
            <p className="font-bold text-neutral-900">{metrics.impressions}</p>
            <p className="text-neutral-500">Impressões</p>
          </div>
          <div className="rounded-lg bg-neutral-50 py-2">
            <p className="font-bold text-neutral-900">{metrics.clicks}</p>
            <p className="text-neutral-500">Cliques</p>
          </div>
          <div className="rounded-lg bg-neutral-50 py-2">
            <p className="font-bold text-neutral-900">{ctr ?? '—'}%</p>
            <p className="text-neutral-500">CTR</p>
          </div>
        </div>
      )}

      {(campaign.status === 'rascunho' || campaign.status === 'pendente_pagamento') && (
        <button
          onClick={handleActivate}
          disabled={activating}
          className="mt-3 w-full rounded-full bg-brand py-2 text-xs font-bold text-white disabled:opacity-50"
        >
          {activating ? 'Ativando...' : 'Simular pagamento e ativar'}
        </button>
      )}
    </div>
  )
}

export default function LojistaPage() {
  const { session, loading } = useAuth()
  const [store, setStore] = useState<StoreRow | null | undefined>(undefined)
  const [campaigns, setCampaigns] = useState<AdCampaignRow[]>([])

  async function loadStoreAndCampaigns() {
    if (!session) return
    const s = await fetchMyStore(session.user.id)
    setStore(s ?? null)
    if (s) {
      const c = await fetchMyCampaigns(s.id)
      setCampaigns(c)
    }
  }

  useEffect(() => {
    if (session) loadStoreAndCampaigns()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  if (loading) return <div className="h-64 animate-pulse rounded-2xl bg-neutral-200" />
  if (!session) return <AuthForm />
  if (store === undefined) return <div className="h-64 animate-pulse rounded-2xl bg-neutral-200" />
  if (store === null) return <CreateStoreForm onCreated={() => loadStoreAndCampaigns()} />

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-neutral-900">Rapizz Ads — {store.name}</h1>
        <p className="text-sm text-neutral-500">Crie campanhas e acompanhe o desempenho dos seus anúncios.</p>
      </div>

      <CampaignForm storeId={store.id} onCreated={loadStoreAndCampaigns} />

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500">Minhas campanhas</h2>
        {campaigns.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-300 py-8 text-center text-sm text-neutral-500">
            Nenhuma campanha criada ainda.
          </p>
        ) : (
          <div className="space-y-3">
            {campaigns.map((c) => (
              <CampaignRow key={c.id} campaign={c} onChanged={loadStoreAndCampaigns} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
