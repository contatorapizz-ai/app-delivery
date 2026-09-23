import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, ChevronRight, MapPin, MessageCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useMyAddress } from '../hooks/useMyAddress'

export default function LocationBar() {
  const { session, profile } = useAuth()
  const { address, setAddress } = useMyAddress()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(address)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleOpen() {
    setDraft(address)
    setError(null)
    setOpen(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await setAddress(draft.trim())
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar o endereço.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border-b border-neutral-100 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 lg:px-8">
        <button onClick={handleOpen} className="min-w-0 text-left">
          <span className="flex items-center gap-1 text-sm font-bold text-navy">
            <MapPin className="h-4 w-4 shrink-0 text-brand" />
            <span className="truncate">{address || 'Definir endereço'}</span>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
          </span>
          <span className="block text-xs text-neutral-400">
            {session ? `Olá, ${profile?.full_name?.split(' ')[0] || 'você'}` : 'entre ou cadastre-se'}
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/suporte"
            aria-label="Suporte"
            className="grid h-9 w-9 place-items-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          >
            <MessageCircle className="h-4 w-4" />
          </Link>
          <Link
            to="/notificacoes"
            aria-label="Notificações"
            className="grid h-9 w-9 place-items-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          >
            <Bell className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {open && (
        <form onSubmit={handleSave} className="border-t border-neutral-100 px-4 py-2.5 lg:px-8">
          <div className="flex gap-2">
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Rua, número, bairro, cidade"
              className="w-full rounded-lg border border-neutral-200 p-2 text-sm outline-none focus:border-brand"
            />
            <button
              type="submit"
              disabled={saving}
              className="shrink-0 rounded-lg bg-brand px-4 text-sm font-bold text-white disabled:opacity-50"
            >
              {saving ? '...' : 'Salvar'}
            </button>
          </div>
          {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
          {!session && (
            <p className="mt-1.5 text-[11px] text-neutral-400">
              Entre na sua conta pra salvar o endereço no seu perfil e ele valer em qualquer aparelho.
            </p>
          )}
        </form>
      )}
    </div>
  )
}
