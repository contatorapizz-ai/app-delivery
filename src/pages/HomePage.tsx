import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORIES } from '../data/categories'
import StoreCard from '../components/StoreCard'
import PromoCarousel from '../components/PromoCarousel'
import BannerDestaque from '../components/ads/BannerDestaque'
import StoryPremiumRow from '../components/ads/StoryPremiumRow'
import ProdutoPatrocinado from '../components/ads/ProdutoPatrocinado'
import { fetchStores } from '../data/api'
import { CITY_CHANGED_EVENT, getSelectedCity } from '../lib/location'
import type { Store, StoreCategory } from '../types/domain'

type SortOption = 'relevancia' | 'avaliacao' | 'entrega' | 'taxa'

const SORT_LABEL: Record<SortOption, string> = {
  relevancia: 'Todos',
  avaliacao: 'Mais avaliadas',
  entrega: 'Menor tempo de entrega',
  taxa: 'Menor taxa de entrega',
}

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<StoreCategory | null>(null)
  const [sort, setSort] = useState<SortOption>('relevancia')
  const [city, setCity] = useState(getSelectedCity)
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchStores()
      .then((data) => {
        if (!cancelled) setStores(data)
      })
      .catch(() => {
        if (!cancelled) setLoadError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    function onCityChanged() {
      setCity(getSelectedCity())
    }
    window.addEventListener(CITY_CHANGED_EVENT, onCityChanged)
    return () => window.removeEventListener(CITY_CHANGED_EVENT, onCityChanged)
  }, [])

  const filteredStores = useMemo(() => {
    const list = stores.filter((s) => {
      const matchesCategory = !activeCategory || s.category === activeCategory
      const matchesCity = !s.city || s.city === city
      return matchesCategory && matchesCity
    })
    const sorted = [...list]
    if (sort === 'avaliacao') sorted.sort((a, b) => b.rating - a.rating)
    else if (sort === 'entrega') sorted.sort((a, b) => a.etaMinutes[0] - b.etaMinutes[0])
    else if (sort === 'taxa') sorted.sort((a, b) => a.deliveryFee - b.deliveryFee)
    return sorted
  }, [stores, activeCategory, city, sort])

  const openCount = stores.filter((s) => s.isOpen).length

  return (
    <div className="space-y-8">
      <Link
        to="/busca"
        className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-400 shadow-sm"
      >
        <span aria-hidden>🔍</span>
        Buscar comidas, lojas ou produtos...
      </Link>

      <PromoCarousel />

      <StoryPremiumRow />

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-neutral-500">
          Explore categorias · {openCount} lojas abertas agora
        </h2>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:px-0">
          <button
            onClick={() => setActiveCategory(null)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
              activeCategory === null
                ? 'border-brand bg-brand text-white'
                : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
            }`}
          >
            Todos
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

      <BannerDestaque />

      <ProdutoPatrocinado />

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold text-neutral-900">Estabelecimentos</h2>
          <label className="flex items-center gap-1.5 text-sm text-neutral-500">
            Ordenar por:
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-sm font-semibold text-neutral-900 outline-none focus:border-brand"
            >
              {Object.entries(SORT_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-44 animate-pulse rounded-2xl bg-neutral-200" />
            ))}
          </div>
        ) : loadError ? (
          <p className="rounded-xl border border-dashed border-neutral-300 py-16 text-center text-sm text-neutral-500">
            Não foi possível carregar as lojas agora. Tente novamente em instantes.
          </p>
        ) : filteredStores.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-300 py-16 text-center text-sm text-neutral-500">
            Nenhuma loja encontrada em {city} para essa categoria.
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
