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

  const openCount = STORES.filter((s) => s.isOpen).length

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand via-brand to-brand-dark px-6 py-8 text-white shadow-lg shadow-red-900/10 sm:px-10 sm:py-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-100">Rapizz Delivery</p>
        <h1 className="mt-1 max-w-lg text-2xl font-extrabold leading-tight sm:text-3xl lg:text-4xl">
          Peça comida das melhores lojas perto de você
        </h1>
        <p className="mt-2 max-w-md text-sm text-red-50/90 sm:text-base">
          {openCount} lojas abertas agora · entrega rápida · pedido direto pelo WhatsApp
        </p>

        <div className="mt-6 max-w-xl">
          <label htmlFor="search" className="sr-only">
            Buscar loja
          </label>
          <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 shadow-sm">
            <span aria-hidden className="text-neutral-400">🔍</span>
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
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-neutral-500">Categorias</h2>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:px-0">
          <button
            onClick={() => setActiveCategory(null)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
              activeCategory === null
                ? 'border-brand bg-brand text-white'
                : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
            }`}
          >
            Tudo
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id === activeCategory ? null : c.id)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
                activeCategory === c.id
                  ? 'border-brand bg-brand text-white'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
              }`}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-900">Lojas perto de você</h2>
          <span className="text-sm text-neutral-400">{filteredStores.length} encontradas</span>
        </div>
        {filteredStores.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-300 py-16 text-center text-sm text-neutral-500">
            Nenhuma loja encontrada para essa busca.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredStores.map((s) => (
              <StoreCard key={s.id} store={s} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
