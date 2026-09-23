import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Search, X } from 'lucide-react'
import StoreCard from '../components/StoreCard'
import { fetchStores } from '../data/api'
import { readJSON, writeJSON } from '../lib/storage'
import type { Store } from '../types/domain'

const RECENT_KEY = 'rapizz.recentSearches.v1'
const POPULAR = ['Pizza', 'Hambúrguer', 'Açaí', 'Sushi', 'Mercado', 'Farmácia']

function loadRecent(): string[] {
  return readJSON(RECENT_KEY, [] as string[])
}

function saveRecent(list: string[]) {
  writeJSON(RECENT_KEY, list.slice(0, 8))
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [recent, setRecent] = useState<string[]>(loadRecent)
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchStores()
      .then(setStores)
      .finally(() => setLoading(false))
  }, [])

  function commitSearch(term: string) {
    const trimmed = term.trim()
    setQuery(trimmed)
    if (!trimmed) return
    setRecent((prev) => {
      const next = [trimmed, ...prev.filter((t) => t.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8)
      saveRecent(next)
      return next
    })
  }

  function clearRecent() {
    setRecent([])
    saveRecent([])
  }

  function removeRecent(term: string) {
    setRecent((prev) => {
      const next = prev.filter((t) => t !== term)
      saveRecent(next)
      return next
    })
  }

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return stores.filter((s) => s.name.toLowerCase().includes(q))
  }, [stores, query])

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          aria-label="Voltar"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-neutral-100 text-neutral-600"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex flex-1 items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitSearch(query)
            }}
            placeholder="Buscar comidas, lojas ou produtos..."
            className="w-full bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
          />
        </div>
      </div>

      {query.trim() ? (
        loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-44 animate-pulse rounded-2xl bg-neutral-200" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-300 py-16 text-center text-sm text-neutral-500">
            Nenhum resultado para &ldquo;{query}&rdquo;.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {results.map((s) => (
              <StoreCard key={s.id} store={s} />
            ))}
          </div>
        )
      ) : (
        <>
          {recent.length > 0 && (
            <section>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-bold text-neutral-900">Buscas recentes</h2>
                <button onClick={clearRecent} className="text-xs font-semibold text-brand">
                  Limpar tudo
                </button>
              </div>
              <div className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white">
                {recent.map((term) => (
                  <div key={term} className="flex items-center justify-between px-4 py-3">
                    <button
                      onClick={() => commitSearch(term)}
                      className="flex items-center gap-2 text-sm text-neutral-700"
                    >
                      <Clock className="h-4 w-4 text-neutral-400" aria-hidden />
                      {term}
                    </button>
                    <button
                      onClick={() => removeRecent(term)}
                      aria-label={`Remover ${term}`}
                      className="text-neutral-300 hover:text-neutral-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-2 text-sm font-bold text-neutral-900">Populares agora</h2>
            <div className="flex flex-wrap gap-2">
              {POPULAR.map((term) => (
                <button
                  key={term}
                  onClick={() => commitSearch(term)}
                  className="rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-sm font-medium text-neutral-700"
                >
                  {term}
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
