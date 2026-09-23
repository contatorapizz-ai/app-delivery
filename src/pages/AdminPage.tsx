import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Bike, Building2, ChevronRight, Lock, Megaphone, Plus, Wallet } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { fetchAdminClientOverview, fetchAdminTotals, type AdminClientOverviewRow, type AdminTotals } from '../data/ads.api'
import { createLojista } from '../data/adminUsers.api'
import { categoryMeta } from '../data/categories'
import { formatBRL } from '../lib/format'
import type { StoreCategory } from '../types/domain'

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
        <span className="text-accent">{icon}</span>
        {label}
      </div>
      <p className="mt-2 text-xl font-extrabold text-neutral-900">{value}</p>
    </div>
  )
}

function ClientCard({ client }: { client: AdminClientOverviewRow }) {
  const cat = categoryMeta((client.category as StoreCategory) ?? 'pizza')
  const initial = client.store_name.charAt(0).toUpperCase()

  return (
    <Link
      to={`/admin/lojas/${client.store_id}`}
      className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:items-center"
    >
      <span
        className={`grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br ${cat.gradient} text-lg font-extrabold text-white`}
      >
        {initial}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p className="truncate font-semibold text-neutral-900">{client.store_name}</p>
          <p className="shrink-0 text-sm font-extrabold text-neutral-900">
            {formatBRL(client.total_budget_cents / 100)}
          </p>
        </div>
        <p className="truncate text-sm text-neutral-500">
          {client.owner_name || 'Sem dono vinculado'}
          {client.owner_email && <span className="text-neutral-400"> · {client.owner_email}</span>}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
            {client.campaign_count} {client.campaign_count === 1 ? 'campanha' : 'campanhas'}
          </span>
          {client.active_budget_cents > 0 && (
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              Ativo: {formatBRL(client.active_budget_cents / 100)}
            </span>
          )}
          <span className="text-xs text-neutral-400">
            {client.last_campaign_at
              ? `última em ${new Date(client.last_campaign_at).toLocaleDateString('pt-BR')}`
              : 'sem campanhas'}
          </span>
        </div>
      </div>
      <ChevronRight aria-hidden className="hidden h-5 w-5 shrink-0 self-center text-neutral-300 sm:block" />
    </Link>
  )
}

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  const bytes = new Uint32Array(14)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => chars[b % chars.length]).join('')
}

function AddLojistaForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const password = generatePassword()
    try {
      await createLojista({ email: email.trim().toLowerCase(), fullName: fullName.trim(), password })
      setCreated({ email: email.trim().toLowerCase(), password })
      setEmail('')
      setFullName('')
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a conta.')
    } finally {
      setLoading(false)
    }
  }

  if (created) {
    return (
      <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-sm font-semibold text-emerald-800">Conta criada! Anote a senha agora — não será mostrada de novo.</p>
        <div className="rounded-lg bg-white p-3 text-sm">
          <p>
            <span className="text-neutral-500">E-mail:</span> <strong>{created.email}</strong>
          </p>
          <p>
            <span className="text-neutral-500">Senha:</span>{' '}
            <strong className="font-mono">{created.password}</strong>
          </p>
        </div>
        <button
          onClick={() => {
            setCreated(null)
            setOpen(false)
          }}
          className="text-xs font-semibold text-emerald-700 underline"
        >
          Fechar
        </button>
      </div>
    )
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-neutral-300 py-3 text-sm font-semibold text-neutral-600 hover:border-brand hover:text-brand"
      >
        <Plus className="h-4 w-4" /> Adicionar lojista
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4">
      <h3 className="text-sm font-bold text-neutral-900">Nova conta de lojista</h3>
      <p className="text-xs text-neutral-500">
        Cria o login já confirmado (sem precisar de e-mail de confirmação). Uma senha aleatória é gerada — você
        repassa pra pessoa.
      </p>
      <input
        required
        placeholder="Nome"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="w-full rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-brand"
      />
      <input
        required
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-brand"
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
          {loading ? 'Criando...' : 'Criar conta'}
        </button>
      </div>
    </form>
  )
}

export default function AdminPage() {
  const { session, profile, loading } = useAuth()
  const [totals, setTotals] = useState<AdminTotals | null>(null)
  const [clients, setClients] = useState<AdminClientOverviewRow[] | null>(null)
  const [error, setError] = useState(false)

  function loadData() {
    if (profile?.role === 'admin') {
      Promise.all([fetchAdminTotals(), fetchAdminClientOverview()])
        .then(([t, c]) => {
          setTotals(t)
          setClients(c)
        })
        .catch(() => setError(true))
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  if (loading) return <div className="h-64 animate-pulse rounded-2xl bg-neutral-200" />

  if (!session || profile?.role !== 'admin') {
    return (
      <div className="mx-auto max-w-md space-y-3 rounded-2xl border border-neutral-200 bg-white p-6 text-center">
        <Lock className="mx-auto h-8 w-8 text-neutral-300" strokeWidth={1.5} />
        <h1 className="text-lg font-bold text-neutral-900">Acesso restrito</h1>
        <p className="text-sm text-neutral-500">
          Esta área é exclusiva para administradores. Se você deveria ter acesso, peça para promover seu usuário
          rodando <code className="rounded bg-neutral-100 px-1">update profiles set role='admin' where id='...'</code> no
          SQL Editor do Supabase.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-xl font-extrabold text-neutral-900">Painel administrativo</h1>
        <p className="text-sm text-neutral-500">Totais consolidados de Rapizz Ads e Fundo Motoboy.</p>
      </div>

      {error && <p className="text-sm text-red-600">Não foi possível carregar os dados.</p>}

      {totals && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={<Wallet className="h-4 w-4" />} label="Total Ads Arrecadado" value={formatBRL(totals.totalAdsCents / 100)} />
          <StatCard icon={<Building2 className="h-4 w-4" />} label="Total Plataforma" value={formatBRL(totals.totalPlatformCents / 100)} />
          <StatCard icon={<Bike className="h-4 w-4" />} label="Total Fundo Motoboy" value={formatBRL(totals.totalFundCents / 100)} />
          <StatCard icon={<Megaphone className="h-4 w-4" />} label="Campanhas ativas" value={String(totals.activeCampaigns)} />
        </div>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500">Clientes (lojistas)</h2>
        </div>

        <AddLojistaForm onCreated={loadData} />

        {clients && clients.length === 0 && (
          <p className="rounded-xl border border-dashed border-neutral-300 py-8 text-center text-sm text-neutral-500">
            Nenhuma loja cadastrada ainda.
          </p>
        )}

        {clients && clients.length > 0 && (
          <div className="space-y-2.5">
            {clients.map((c) => (
              <ClientCard key={c.store_id} client={c} />
            ))}
          </div>
        )}
      </section>

      <p className="rounded-xl bg-neutral-100 px-4 py-3 text-xs leading-relaxed text-neutral-500">
        A distribuição individual por motoboy depende de um módulo de entregadores ainda não construído — por
        enquanto o fundo é calculado e registrado de forma agregada (50% plataforma / 50% fundo a cada campanha
        ativada).
      </p>
    </div>
  )
}
