import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import AuthForm from '../components/auth/AuthForm'
import ImagePicker from '../components/ImagePicker'
import VideoPicker from '../components/VideoPicker'
import MediaTile from '../components/MediaTile'
import {
  activateCampaign,
  createCampaign,
  createStore,
  fetchCampaignMetrics,
  fetchMyCampaigns,
  fetchMyStore,
  updateStoreImage,
} from '../data/ads.api'
import { fetchProductsByStore } from '../data/api'
import { createProduct, deleteProduct, updateProduct } from '../data/products.api'
import { CATEGORIES } from '../data/categories'
import { CITIES, DEFAULT_CITY } from '../data/cities'
import type { Product, StoreCategory } from '../types/domain'
import { formatBRL } from '../lib/format'
import { FORMAT_LABEL, LIVE_FORMATS, OBJECTIVE_LABEL, STATUS_COLOR, STATUS_LABEL } from '../lib/adLabels'
import type { AdCampaignRow, AdFormat, AdObjective, StoreRow } from '../types/database'

function CreateStoreForm({ onCreated }: { onCreated: (store: StoreRow) => void }) {
  const { session, refreshProfile } = useAuth()
  const [name, setName] = useState('')
  const [category, setCategory] = useState<StoreCategory>(CATEGORIES[0].id)
  const [address, setAddress] = useState('')
  const [city, setCity] = useState(DEFAULT_CITY)
  const [whatsapp, setWhatsapp] = useState('')
  const [deliveryFee, setDeliveryFee] = useState('')
  const [minOrder, setMinOrder] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
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
        imageUrl,
        city,
      })
      // só promove quem ainda é 'cliente' (default) — nunca rebaixa admin/motoboy
      await supabase.from('profiles').update({ role: 'lojista' }).eq('id', session.user.id).eq('role', 'cliente')
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
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-brand"
        >
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
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
        <ImagePicker
          value={imageUrl}
          onChange={setImageUrl}
          icon="🏪"
          tileClassName="h-14 w-14 rounded-lg"
          iconClassName="text-lg"
        />
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
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
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
        videoUrl,
      })
      setTitle('')
      setDescription('')
      setBudget('')
      setStartsAt('')
      setEndsAt('')
      setVideoUrl(null)
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

      <VideoPicker value={videoUrl} onChange={setVideoUrl} />

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

function StoreImageEditor({ store, onUpdated }: { store: StoreRow; onUpdated: (url: string | null) => void }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleChange(url: string | null) {
    setSaving(true)
    setError(null)
    try {
      await updateStoreImage(store.id, url)
      onUpdated(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar a foto.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <p className="mb-2 text-sm font-semibold text-neutral-900">Foto da loja</p>
      <ImagePicker
        value={store.image_url}
        onChange={handleChange}
        icon="🏪"
        tileClassName="h-16 w-16 rounded-xl"
        iconClassName="text-2xl"
      />
      {saving && <p className="mt-1.5 text-xs text-neutral-400">Salvando...</p>}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  )
}

function ProductForm({ storeId, onCreated }: { storeId: string; onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [menuCategory, setMenuCategory] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await createProduct({
        storeId,
        name,
        description,
        price: Number(price) || 0,
        menuCategory: menuCategory.trim() || 'Geral',
        imageUrl,
      })
      setName('')
      setDescription('')
      setPrice('')
      setMenuCategory('')
      setImageUrl(null)
      setOpen(false)
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar o item.')
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border border-dashed border-neutral-300 py-3 text-sm font-semibold text-neutral-600 hover:border-brand hover:text-brand"
      >
        + Adicionar item ao cardápio
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4">
      <h3 className="text-sm font-bold text-neutral-900">Novo item</h3>
      <input
        required
        placeholder="Nome do item"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-brand"
      />
      <input
        placeholder="Descrição (opcional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-brand"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          required
          type="number"
          step="0.01"
          min="0"
          placeholder="Preço (R$)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-brand"
        />
        <input
          required
          placeholder="Categoria (ex: Pizzas)"
          value={menuCategory}
          onChange={(e) => setMenuCategory(e.target.value)}
          className="w-full rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-brand"
        />
      </div>
      <ImagePicker
        value={imageUrl}
        onChange={setImageUrl}
        icon="🍽️"
        tileClassName="h-14 w-14 rounded-lg"
        iconClassName="text-lg"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 rounded-full border border-neutral-200 py-2 text-sm font-semibold text-neutral-600"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-full bg-brand py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Adicionar'}
        </button>
      </div>
    </form>
  )
}

function ProductRow({ product, onChanged }: { product: Product; onChanged: () => void }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(product.name)
  const [description, setDescription] = useState(product.description)
  const [price, setPrice] = useState(String(product.price))
  const [menuCategory, setMenuCategory] = useState(product.menuCategory)
  const [imageUrl, setImageUrl] = useState<string | null>(product.imageUrl)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await updateProduct(product.id, {
        name,
        description,
        price: Number(price) || 0,
        menuCategory: menuCategory.trim() || 'Geral',
        imageUrl,
      })
      setEditing(false)
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`Excluir "${product.name}" do cardápio? Essa ação não pode ser desfeita.`)) return
    try {
      await deleteProduct(product.id)
      onChanged()
    } catch {
      // erro silencioso — lojista pode tentar de novo
    }
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3">
        <MediaTile
          src={product.imageUrl}
          alt={product.name}
          icon="🍽️"
          className="h-12 w-12 shrink-0 rounded-lg"
          iconClassName="text-lg"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-neutral-900">{product.name}</p>
          <p className="truncate text-xs text-neutral-500">
            {product.menuCategory} · {formatBRL(product.price)}
          </p>
        </div>
        <button onClick={() => setEditing(true)} className="shrink-0 text-xs font-semibold text-neutral-500 hover:text-brand">
          Editar
        </button>
        <button onClick={handleDelete} className="shrink-0 text-xs font-semibold text-red-500 hover:text-red-700">
          Excluir
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="space-y-2 rounded-xl border border-brand/30 bg-white p-3">
      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome"
        className="w-full rounded-lg border border-neutral-200 p-2 text-sm outline-none focus:border-brand"
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descrição"
        className="w-full rounded-lg border border-neutral-200 p-2 text-sm outline-none focus:border-brand"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          required
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Preço (R$)"
          className="w-full rounded-lg border border-neutral-200 p-2 text-sm outline-none focus:border-brand"
        />
        <input
          required
          value={menuCategory}
          onChange={(e) => setMenuCategory(e.target.value)}
          placeholder="Categoria"
          className="w-full rounded-lg border border-neutral-200 p-2 text-sm outline-none focus:border-brand"
        />
      </div>
      <ImagePicker
        value={imageUrl}
        onChange={setImageUrl}
        icon="🍽️"
        tileClassName="h-12 w-12 rounded-lg"
        iconClassName="text-base"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="flex-1 rounded-full border border-neutral-200 py-1.5 text-xs font-semibold text-neutral-600"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-full bg-brand py-1.5 text-xs font-bold text-white disabled:opacity-50"
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}

function ProductsSection({ storeId }: { storeId: string }) {
  const [products, setProducts] = useState<Product[] | null>(null)

  function load() {
    fetchProductsByStore(storeId)
      .then(setProducts)
      .catch(() => setProducts([]))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId])

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500">Meu cardápio</h2>
      <ProductForm storeId={storeId} onCreated={load} />
      {products === null ? (
        <div className="h-20 animate-pulse rounded-xl bg-neutral-200" />
      ) : products.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 py-8 text-center text-sm text-neutral-500">
          Nenhum item cadastrado ainda.
        </p>
      ) : (
        <div className="space-y-2">
          {products.map((p) => (
            <ProductRow key={p.id} product={p} onChanged={load} />
          ))}
        </div>
      )}
    </section>
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
  if (!session)
    return (
      <AuthForm
        title="Rapizz Ads"
        subtitleLogin="Entre para gerenciar suas campanhas."
        subtitleSignup="Crie sua conta de lojista."
      />
    )
  if (store === undefined) return <div className="h-64 animate-pulse rounded-2xl bg-neutral-200" />
  if (store === null) return <CreateStoreForm onCreated={() => loadStoreAndCampaigns()} />

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-neutral-900">{store.name}</h1>
        <p className="text-sm text-neutral-500">Gerencie seu cardápio e suas campanhas do Rapizz Ads.</p>
      </div>

      <StoreImageEditor store={store} onUpdated={(image_url) => setStore({ ...store, image_url })} />

      <ProductsSection storeId={store.id} />

      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500">Rapizz Ads</h2>
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
