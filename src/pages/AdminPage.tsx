import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchAdminClientOverview, fetchAdminTotals, type AdminClientOverviewRow, type AdminTotals } from '../data/ads.api'
import { formatBRL } from '../lib/format'

export default function AdminPage() {
  const { session, profile, loading } = useAuth()
  const [totals, setTotals] = useState<AdminTotals | null>(null)
  const [clients, setClients] = useState<AdminClientOverviewRow[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (profile?.role === 'admin') {
      Promise.all([fetchAdminTotals(), fetchAdminClientOverview()])
        .then(([t, c]) => {
          setTotals(t)
          setClients(c)
        })
        .catch(() => setError(true))
    }
  }, [profile])

  if (loading) return <div className="h-64 animate-pulse rounded-2xl bg-neutral-200" />

  if (!session || profile?.role !== 'admin') {
    return (
      <div className="mx-auto max-w-md space-y-3 rounded-2xl border border-neutral-200 bg-white p-6 text-center">
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
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-neutral-900">Painel administrativo</h1>
        <p className="text-sm text-neutral-500">Totais consolidados de Rapizz Ads e Fundo Motoboy.</p>
      </div>

      {error && <p className="text-sm text-red-600">Não foi possível carregar os dados.</p>}

      {totals && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <p className="text-xs text-neutral-500">Total Ads Arrecadado</p>
            <p className="mt-1 text-lg font-extrabold text-neutral-900">{formatBRL(totals.totalAdsCents / 100)}</p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <p className="text-xs text-neutral-500">Total Plataforma</p>
            <p className="mt-1 text-lg font-extrabold text-neutral-900">{formatBRL(totals.totalPlatformCents / 100)}</p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <p className="text-xs text-neutral-500">Total Fundo Motoboy</p>
            <p className="mt-1 text-lg font-extrabold text-neutral-900">{formatBRL(totals.totalFundCents / 100)}</p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <p className="text-xs text-neutral-500">Campanhas ativas</p>
            <p className="mt-1 text-lg font-extrabold text-neutral-900">{totals.activeCampaigns}</p>
          </div>
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500">Clientes (lojistas)</h2>

        {clients && clients.length === 0 && (
          <p className="rounded-xl border border-dashed border-neutral-300 py-8 text-center text-sm text-neutral-500">
            Nenhuma loja cadastrada ainda.
          </p>
        )}

        {clients && clients.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-xs uppercase text-neutral-500">
                  <th className="px-4 py-3 font-semibold">Loja</th>
                  <th className="px-4 py-3 font-semibold">Dono</th>
                  <th className="px-4 py-3 font-semibold">Campanhas</th>
                  <th className="px-4 py-3 font-semibold">Total investido</th>
                  <th className="px-4 py-3 font-semibold">Ativo agora</th>
                  <th className="px-4 py-3 font-semibold">Última campanha</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.store_id} className="border-b border-neutral-100 last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-neutral-900">{c.store_name}</p>
                      <p className="text-xs text-neutral-400">{c.category}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-neutral-700">{c.owner_name || '—'}</p>
                      <p className="text-xs text-neutral-400">{c.owner_email || 'sem dono vinculado'}</p>
                    </td>
                    <td className="px-4 py-3 text-neutral-700">{c.campaign_count}</td>
                    <td className="px-4 py-3 font-semibold text-neutral-900">
                      {formatBRL(c.total_budget_cents / 100)}
                    </td>
                    <td className="px-4 py-3 text-emerald-700">{formatBRL(c.active_budget_cents / 100)}</td>
                    <td className="px-4 py-3 text-xs text-neutral-400">
                      {c.last_campaign_at ? new Date(c.last_campaign_at).toLocaleDateString('pt-BR') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="rounded-lg bg-neutral-100 px-3 py-2 text-xs text-neutral-500">
        A distribuição individual por motoboy depende de um módulo de entregadores ainda não construído — por
        enquanto o fundo é calculado e registrado de forma agregada (50% plataforma / 50% fundo a cada campanha
        ativada).
      </p>
    </div>
  )
}
