import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import AuthForm from '../components/auth/AuthForm'
import { supabase } from '../lib/supabase'
import { readJSON, writeJSON } from '../lib/storage'

const NOTIFICATIONS_KEY = 'rapizz.notifications.v1'

export default function SettingsPage() {
  const { session, profile, loading, refreshProfile } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notifications, setNotifications] = useState(() => readJSON(NOTIFICATIONS_KEY, true))

  if (loading) return <div className="h-64 animate-pulse rounded-2xl bg-neutral-200" />

  if (!session) {
    return (
      <AuthForm title="Configurações" subtitleLogin="Entre para gerenciar sua conta." subtitleSignup="Crie sua conta." />
    )
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!session) return
    setSaving(true)
    setSaved(false)
    setError(null)
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ full_name: fullName.trim(), phone: phone.trim() || null })
        .eq('id', session.user.id)
      if (updateError) throw updateError
      await refreshProfile()
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar.')
    } finally {
      setSaving(false)
    }
  }

  function toggleNotifications() {
    setNotifications((prev) => {
      const next = !prev
      writeJSON(NOTIFICATIONS_KEY, next)
      return next
    })
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-neutral-900">Configurações</h1>
        <p className="text-sm text-neutral-500">Gerencie seus dados e preferências.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500">Dados pessoais</h2>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Seu nome"
          className="w-full rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-brand"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Telefone (opcional)"
          className="w-full rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-brand"
        />
        <input
          disabled
          value={session.user.email ?? ''}
          className="w-full rounded-lg border border-neutral-200 bg-neutral-50 p-2.5 text-sm text-neutral-400"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {saved && <p className="text-sm text-emerald-600">Salvo!</p>}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-full bg-brand py-2.5 text-sm font-bold text-white disabled:opacity-50"
        >
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </form>

      <div className="rounded-2xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-neutral-500">Preferências</h2>
        <label className="flex items-center justify-between gap-3">
          <span className="text-sm text-neutral-700">Notificações de pedidos e promoções</span>
          <button
            type="button"
            role="switch"
            aria-checked={notifications}
            onClick={toggleNotifications}
            className={`relative h-6 w-11 shrink-0 rounded-full transition ${notifications ? 'bg-brand' : 'bg-neutral-300'}`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${notifications ? 'left-5' : 'left-0.5'}`}
            />
          </button>
        </label>
        <p className="mt-1 text-xs text-neutral-400">Guardado só neste aparelho.</p>
      </div>
    </div>
  )
}
