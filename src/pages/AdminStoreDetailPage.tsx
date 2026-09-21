import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchAdminStoreDetail, type AdminStoreDetail } from '../data/ads.api'
import { deleteAccount, deleteStore } from '../data/adminUsers.api'
import { categoryMeta } from '../data/categories'
import { formatBRL } from '../lib/format'
import { FORMAT_LABEL, OBJECTIVE_LABEL, STATUS_COLOR, STATUS_LABEL } from '../lib/adLabels'
import type { StoreCategory } from '../types/domain'

export default function AdminStoreDetailPage() {
  const { storeId } = useParams<{ storeId: string }>()
  const { profile, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [detail, setDetail] = useState<AdminStoreDetail | null | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  function load() {
    if (!storeId) return
    fetchAdminStoreDetail(storeId)
      .then(setDetail)
      .catch(() => setDetail(null))
  }

  useEffect(() => {
    if (profile?.role === 'admin') load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, storeId])

  if (authLoading) return <div className="h-64 animate-pulse rounded-2xl bg-neutral-200" />

  if (profile?.role !== 'admin') {
    return (
      <div className="mx-auto max-w-md space-y-3 rounded-2xl border border-neutral-200 bg-white p-6 text-center">
        <h1 className="text-lg font-bold text-neutral-900">Acesso restrito</h1>
        <p className="text-sm text-neutral-500">Esta área é exclusiva para administradores.</p>
      </div>
    )
  }

  if (detail === undefined) return <div className="h-64 animate-pulse rounded-2xl bg-neutral-200" />
  if (detail === null) return <p className="text-center text-sm text-red-600">Não foi possível carregar essa loja.</p>

  const { store, owner, campaigns } = detail
  const cat = categoryMeta(store.category as StoreCategory)

  async function handleDeleteStore() {
    if (!confirm(`Excluir a loja "${store.name}" e todas as campanhas dela? Essa ação não pode ser desfeita.`)) return
    setBusy(true)
    setError(null)
    try {
      await deleteStore(store.id)
      navigate('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível excluir a loja.')
      setBusy(false)
    }
  }

  async function handleDeleteAccount() {
    if (!owner) return
    if (
      !confirm(
        `Excluir a CONTA de ${owner.full_name || owner.email} (${owner.email})? Isso apaga o login dessa pessoa — a loja continua existindo, só fica sem dono. Essa ação não pode ser desfeita.`,
      )
    )
      return
    setBusy(true)
    setError(null)
    try {
      await deleteAccount(owner.id)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível excluir a conta.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/admin" className="text-sm text-neutral-500 hover:text-neutral-700">
        ← Voltar ao painel
      </Link>

      <div className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <span
          className={`grid h-16 w-16 shrink-0 place-items-center rounded-full bg-gradient-to-br ${cat.gradient} text-3xl`}
        >
          {cat.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-extrabold text-neutral-900">{store.name}</h1>
          <p className="text-sm text-neutral-500">
            {cat.label} · {store.is_open ? 'Aberta' : 'Fechada'}
          </p>
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <section className="space-y-2 rounded-2xl border border-neutral-200 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500">Dados da loja</h2>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-neutral-500">Endereço</dt>
              <dd className="text-right text-neutral-900">{store.address || '—'}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-neutral-500">WhatsApp</dt>
              <dd className="text-neutral-900">{store.whatsapp || '—'}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-neutral-500">Taxa de entrega</dt>
              <dd className="text-neutral-900">{formatBRL(store.delivery_fee_cents / 100)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-neutral-500">Pedido mínimo</dt>
              <dd className="text-neutral-900">{formatBRL(store.min_order_cents / 100)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-neutral-500">Criada em</dt>
              <dd className="text-neutral-900">{new Date(store.created_at).toLocaleDateString('pt-BR')}</dd>
            </div>
          </dl>
          <button
            onClick={handleDeleteStore}
            disabled={busy}
            className="mt-2 w-full rounded-full border border-red-200 py-2 text-xs font-bold text-red-600 disabled:opacity-50"
          >
            Excluir loja e campanhas
          </button>
        </section>

        <section className="space-y-2 rounded-2xl border border-neutral-200 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500">Dono da loja</h2>
          {owner ? (
            <>
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-neutral-500">Nome</dt>
                  <dd className="text-neutral-900">{owner.full_name || '—'}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-neutral-500">E-mail</dt>
                  <dd className="truncate text-neutral-900">{owner.email || '—'}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-neutral-500">Papel</dt>
                  <dd className="text-neutral-900">{owner.role}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-neutral-500">Conta criada em</dt>
                  <dd className="text-neutral-900">{new Date(owner.created_at).toLocaleDateString('pt-BR')}</dd>
                </div>
              </dl>
              <button
                onClick={handleDeleteAccount}
                disabled={busy || owner.role === 'admin'}
                className="mt-2 w-full rounded-full border border-red-200 py-2 text-xs font-bold text-red-600 disabled:opacity-50"
              >
                {owner.role === 'admin' ? 'Não é possível excluir um admin por aqui' : 'Excluir conta do lojista'}
              </button>
            </>
          ) : (
            <p className="text-sm text-neutral-500">Sem dono vinculado a essa loja.</p>
          )}
        </section>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500">Campanhas ({campaigns.length})</h2>
        {campaigns.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-300 py-6 text-center text-sm text-neutral-500">
            Nenhuma campanha criada por essa loja.
          </p>
        ) : (
          <div className="space-y-2">
            {campaigns.map((c) => (
              <div key={c.id} className="rounded-xl border border-neutral-200 bg-white p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-neutral-900">{c.title}</p>
                    <p className="text-xs text-neutral-500">
                      {FORMAT_LABEL[c.format]} · {OBJECTIVE_LABEL[c.objective]}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLOR[c.status]}`}>
                    {STATUS_LABEL[c.status]}
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-neutral-500">
                  <span>Orçamento {formatBRL(c.budget_cents / 100)}</span>
                  <span>
                    {new Date(c.starts_at).toLocaleDateString('pt-BR')} – {new Date(c.ends_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
