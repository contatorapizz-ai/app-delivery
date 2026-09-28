import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bike, CheckCircle2, MapPin, Navigation, Package, RefreshCw, Store as StoreIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AuthForm from '../components/auth/AuthForm'
import {
  fetchMyMotoboyProfile,
  registerMotoboy,
  setMotoboyAvailability,
} from '../data/motoboy.api'
import {
  acceptDelivery,
  confirmDelivery,
  fetchAvailableDeliveries,
  fetchMyActiveDeliveries,
  fetchMyDeliveryHistory,
  markEnRoute,
  markPickedUp,
  reportDeliveryIssue,
  type AvailableDelivery,
} from '../data/deliveries.api'
import { errorMessage } from '../lib/errors'
import { formatBRL } from '../lib/format'
import { supabase } from '../lib/supabase'
import type { DeliveryRow, MotoboyProfileRow } from '../types/database'

function RegisterForm({ profileId, onRegistered }: { profileId: string; onRegistered: () => void }) {
  const [vehicleType, setVehicleType] = useState('moto')
  const [plate, setPlate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await registerMotoboy(profileId, vehicleType, plate)
      onRegistered()
    } catch (err) {
      setError(errorMessage(err, 'Não foi possível enviar o cadastro.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-3 rounded-2xl border border-neutral-200 bg-white p-6">
      <div>
        <h1 className="text-xl font-extrabold text-neutral-900">Cadastro de entregador</h1>
        <p className="mt-1 text-sm text-neutral-500">Depois de enviar, um admin precisa aprovar seu cadastro.</p>
      </div>
      <select
        value={vehicleType}
        onChange={(e) => setVehicleType(e.target.value)}
        className="w-full rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-brand"
      >
        <option value="moto">Moto</option>
        <option value="bike">Bike</option>
        <option value="carro">Carro</option>
      </select>
      <input
        placeholder="Placa (se tiver)"
        value={plate}
        onChange={(e) => setPlate(e.target.value)}
        className="w-full rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-brand"
      />
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

function ActiveDeliveryCard({ delivery, onChanged }: { delivery: DeliveryRow; onChanged: () => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [issueOpen, setIssueOpen] = useState(false)
  const [issueNote, setIssueNote] = useState('')

  async function run(action: () => Promise<void>) {
    setBusy(true)
    setError(null)
    try {
      await action()
      onChanged()
    } catch (err) {
      setError(errorMessage(err, 'Não foi possível concluir a ação.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-2xl border border-brand/30 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand">Entrega ativa</p>
      <p className="mt-1 text-sm text-neutral-600">{delivery.dropoff_label || 'Entrega para cliente Rapizz'}</p>
      <p className="mt-1 text-sm font-bold text-neutral-900">Taxa: {formatBRL(delivery.fee_cents / 100)}</p>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        {delivery.status === 'aceita' && (
          <button
            onClick={() => run(() => markPickedUp(delivery.id))}
            disabled={busy}
            className="flex-1 rounded-full bg-brand py-2.5 text-xs font-bold text-white disabled:opacity-50"
          >
            Pedido coletado
          </button>
        )}
        {delivery.status === 'coletada' && (
          <button
            onClick={() => run(() => markEnRoute(delivery.id))}
            disabled={busy}
            className="flex-1 rounded-full bg-brand py-2.5 text-xs font-bold text-white disabled:opacity-50"
          >
            Cheguei ao destino / saí pra entrega
          </button>
        )}
        {delivery.status === 'em_entrega' && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              run(() => confirmDelivery(delivery.id, code))
            }}
            className="flex w-full gap-2"
          >
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Código do cliente"
              maxLength={4}
              className="flex-1 rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-brand"
            />
            <button
              type="submit"
              disabled={busy || code.trim().length === 0}
              className="rounded-full bg-emerald-600 px-4 text-xs font-bold text-white disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>

      <div className="mt-2">
        {issueOpen ? (
          <div className="flex gap-2">
            <input
              value={issueNote}
              onChange={(e) => setIssueNote(e.target.value)}
              placeholder="Descreva a ocorrência"
              className="flex-1 rounded-lg border border-neutral-200 p-2 text-xs outline-none focus:border-brand"
            />
            <button
              onClick={() =>
                run(async () => {
                  await reportDeliveryIssue(delivery.id, issueNote)
                  setIssueNote('')
                  setIssueOpen(false)
                })
              }
              disabled={busy || !issueNote.trim()}
              className="rounded-full border border-neutral-200 px-3 text-xs font-semibold text-neutral-600 disabled:opacity-50"
            >
              Registrar
            </button>
          </div>
        ) : (
          <button onClick={() => setIssueOpen(true)} className="text-xs font-semibold text-neutral-400 underline">
            Registrar ocorrência
          </button>
        )}
      </div>
    </div>
  )
}

export default function MotoboyPage() {
  const { session, loading, refreshProfile } = useAuth()
  const [motoboyProfile, setMotoboyProfile] = useState<MotoboyProfileRow | null | undefined>(undefined)
  const [available, setAvailable] = useState<AvailableDelivery[] | null>(null)
  const [active, setActive] = useState<DeliveryRow[]>([])
  const [history, setHistory] = useState<DeliveryRow[]>([])
  const [error, setError] = useState(false)

  async function loadAll(motoboyId: string) {
    try {
      const [avail, act, hist] = await Promise.all([
        fetchAvailableDeliveries(),
        fetchMyActiveDeliveries(motoboyId),
        fetchMyDeliveryHistory(motoboyId),
      ])
      setAvailable(avail)
      setActive(act)
      setHistory(hist)
    } catch {
      setError(true)
    }
  }

  useEffect(() => {
    if (!session) return
    let cancelled = false
    fetchMyMotoboyProfile(session.user.id).then((p) => {
      if (cancelled) return
      setMotoboyProfile(p ?? null)
      if (p?.status === 'aprovado') loadAll(session.user.id)
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  useEffect(() => {
    if (!session || motoboyProfile?.status !== 'aprovado') return
    const channel = supabase
      .channel(`deliveries-motoboy-${session.user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deliveries' }, () => loadAll(session.user.id))
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, motoboyProfile])

  async function handleAccept(deliveryId: string) {
    if (!session) return
    try {
      await acceptDelivery(deliveryId)
      loadAll(session.user.id)
    } catch (err) {
      alert(errorMessage(err, 'Não foi possível aceitar.'))
      loadAll(session.user.id)
    }
  }

  async function handleToggleAvailability() {
    if (!session || !motoboyProfile) return
    const next = !motoboyProfile.is_available
    setMotoboyProfile({ ...motoboyProfile, is_available: next })
    try {
      await setMotoboyAvailability(session.user.id, next)
    } catch {
      setMotoboyProfile(motoboyProfile)
    }
  }

  if (loading) return <div className="h-64 animate-pulse rounded-2xl bg-neutral-200" />
  if (!session) {
    return <AuthForm title="Área do entregador" subtitleLogin="Entre para ver suas entregas." subtitleSignup="Crie sua conta." />
  }
  if (motoboyProfile === undefined) return <div className="h-64 animate-pulse rounded-2xl bg-neutral-200" />

  if (motoboyProfile === null) {
    return (
      <RegisterForm
        profileId={session.user.id}
        onRegistered={async () => {
          await refreshProfile()
          setMotoboyProfile({
            profile_id: session.user.id,
            vehicle_type: 'moto',
            vehicle_plate: null,
            status: 'em_analise',
            is_available: false,
            created_at: '',
            updated_at: '',
          })
        }}
      />
    )
  }

  if (motoboyProfile.status === 'em_analise') {
    return (
      <div className="mx-auto max-w-md space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
        <Bike className="mx-auto h-8 w-8 text-amber-500" strokeWidth={1.5} />
        <h1 className="text-lg font-bold text-neutral-900">Cadastro em análise</h1>
        <p className="text-sm text-neutral-600">Um administrador vai aprovar seu cadastro em breve.</p>
      </div>
    )
  }

  if (motoboyProfile.status === 'bloqueado') {
    return (
      <div className="mx-auto max-w-md space-y-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <Bike className="mx-auto h-8 w-8 text-red-500" strokeWidth={1.5} />
        <h1 className="text-lg font-bold text-neutral-900">Cadastro bloqueado</h1>
        <p className="text-sm text-neutral-600">Fale com o suporte Rapizz pra mais informações.</p>
        <Link to="/suporte" className="inline-block text-xs font-semibold text-brand underline">
          Ir para o suporte
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-neutral-900">Entregas</h1>
          <p className="text-sm text-neutral-500">{active.length > 0 ? 'Você tem entrega em andamento' : 'Fique disponível pra receber ofertas'}</p>
        </div>
        <button
          onClick={handleToggleAvailability}
          disabled={active.length > 0}
          className={`rounded-full px-4 py-2 text-xs font-bold disabled:opacity-50 ${
            motoboyProfile.is_available ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-200 text-neutral-600'
          }`}
        >
          {motoboyProfile.is_available ? 'Disponível' : 'Indisponível'}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">Não foi possível carregar as entregas.</p>}

      {active.length > 0 && (
        <div className="space-y-3">
          {active.map((d) => (
            <ActiveDeliveryCard key={d.id} delivery={d} onChanged={() => loadAll(session.user.id)} />
          ))}
        </div>
      )}

      {active.length === 0 && (
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500">Entregas disponíveis</h2>
            <button onClick={() => loadAll(session.user.id)} className="flex items-center gap-1 text-xs font-semibold text-neutral-500">
              <RefreshCw className="h-3.5 w-3.5" /> Atualizar
            </button>
          </div>
          {!motoboyProfile.is_available ? (
            <p className="rounded-xl border border-dashed border-neutral-300 py-8 text-center text-sm text-neutral-500">
              Fique "Disponível" pra ver as ofertas de entrega.
            </p>
          ) : available === null ? (
            <div className="h-24 animate-pulse rounded-2xl bg-neutral-200" />
          ) : available.length === 0 ? (
            <p className="rounded-xl border border-dashed border-neutral-300 py-8 text-center text-sm text-neutral-500">
              Nenhuma entrega disponível agora.
            </p>
          ) : (
            <div className="space-y-2">
              {available.map(({ delivery, storeName, storeAddress }) => (
                <div key={delivery.id} className="rounded-xl border border-neutral-200 bg-white p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                    <StoreIcon className="h-4 w-4 text-neutral-400" /> {storeName}
                  </div>
                  <p className="mt-1 flex items-start gap-1.5 text-xs text-neutral-500">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {storeAddress}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-brand">{formatBRL(delivery.fee_cents / 100)}</span>
                    <button
                      onClick={() => handleAccept(delivery.id)}
                      className="rounded-full bg-brand px-4 py-1.5 text-xs font-bold text-white"
                    >
                      Aceitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {history.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500">Histórico e ganhos</h2>
          <div className="rounded-2xl border border-neutral-200 bg-white p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">Total concluído</span>
              <span className="font-bold text-neutral-900">
                {formatBRL(history.filter((d) => d.status === 'concluida').reduce((s, d) => s + d.fee_cents / 100, 0))}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            {history.slice(0, 15).map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-3 text-sm">
                <span className="flex items-center gap-1.5 text-neutral-600">
                  <Package className="h-3.5 w-3.5" />
                  {d.delivered_at ? new Date(d.delivered_at).toLocaleDateString('pt-BR') : '—'}
                </span>
                <span className={`font-semibold ${d.status === 'concluida' ? 'text-emerald-600' : 'text-neutral-400'}`}>
                  {d.status === 'concluida' ? formatBRL(d.fee_cents / 100) : 'Cancelada'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="flex items-start gap-2 rounded-xl bg-neutral-100 px-4 py-3 text-xs leading-relaxed text-neutral-500">
        <Navigation className="mt-0.5 h-4 w-4 shrink-0" />
        Rastreamento de localização em tempo real ainda não está ligado — isso depende de permissão de GPS do
        navegador funcionando em segundo plano, o que a versão web não garante. A rota até o destino abre no seu
        app de navegação (Google Maps/Waze) pelo endereço do pedido.
      </p>
    </div>
  )
}

