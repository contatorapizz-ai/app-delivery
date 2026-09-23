import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { CITIES } from '../data/cities'
import { useSelectedCity } from '../hooks/useSelectedCity'

export default function LocationBar() {
  const { session, profile } = useAuth()
  const { city, setCity } = useSelectedCity()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  async function selectCity(next: string) {
    setSaving(true)
    try {
      await setCity(next)
      setOpen(false)
    } catch {
      // erro silencioso — o seletor continua aberto pra tentar de novo
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border-b border-neutral-100 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 lg:px-8">
        <button onClick={() => setOpen((v) => !v)} className="min-w-0 text-left">
          <span className="flex items-center gap-1 text-sm font-bold text-navy">
            📍 <span className="truncate">{city}</span> <span className="text-neutral-400">›</span>
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
            💬
          </Link>
          <Link
            to="/notificacoes"
            aria-label="Notificações"
            className="grid h-9 w-9 place-items-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          >
            🔔
          </Link>
        </div>
      </div>

      {open && (
        <div className="border-t border-neutral-100 px-4 py-2.5 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {CITIES.map((c) => (
              <button
                key={c}
                disabled={saving}
                onClick={() => selectCity(c)}
                className={`rounded-full border px-3 py-1 text-xs font-medium disabled:opacity-50 ${
                  c === city ? 'border-brand bg-brand-light text-brand' : 'border-neutral-200 text-neutral-600'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          {!session && (
            <p className="mt-2 text-[11px] text-neutral-400">
              Entre na sua conta pra salvar a cidade no seu perfil e ela valer em qualquer aparelho.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
