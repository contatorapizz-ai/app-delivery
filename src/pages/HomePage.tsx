import { useMemo, useState } from 'react'
import { STORES } from '../data/stores'
import { CATEGORIES } from '../data/categories'
import StoreCard from '../components/StoreCard'
import type { StoreCategory } from '../types/domain'

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<StoreCategory | null>(null)

  const filteredStores = useMemo(() => {
    const q = query.trim().toLowerCase()
    return STORES.filter((s) => {
      const matchesQuery = q.length === 0 || s.name.toLowerCase().includes(q)
      const matchesCategory = !activeCategory || s.category === activeCategory
      return matchesQuery && matchesCategory
    })
  }, [query, activeCategory])

  return (
    <div className="space-y-6">
      <section>
        <label htmlFor="search" className="sr-only">
          Buscar loja
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 shadow-sm">
          <span aria-hidden>🔍</span>
          <input
            id="search"
            type="search"
            inputMode="search"
            placeholder="Buscar loja, ex: pizza, açaí..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
          />
        </div>
      </section>

      <section>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          <button
            onClick={() => setActiveCategory(null)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium ${
              activeCategory === null
                ? 'border-brand bg-brand text-white'
                : 'border-neutral-200 bg-white text-neutral-600'
            }`}
          >
            Tudo
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id === activeCategory ? null : c.id)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium ${
                activeCategory === c.id
                  ? 'border-brand bg-brand text-white'
                  : 'border-neutral-200 bg-white text-neutral-600'
              }`}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-base font-bold text-neutral-900">Lojas perto de você</h2>
        {filteredStores.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-300 py-10 text-center text-sm text-neutral-500">
            Nenhuma loja encontrada para essa busca.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filteredStores.map((s) => (
              <StoreCard key={s.id} store={s} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
