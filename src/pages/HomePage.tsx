import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { CATEGORIES } from '../data/categories'
import StoreRow from '../components/StoreRow'
import PromoCarousel from '../components/PromoCarousel'
import BannerDestaque from '../components/ads/BannerDestaque'
import StoryPremiumRow from '../components/ads/StoryPremiumRow'
import ProdutoPatrocinado from '../components/ads/ProdutoPatrocinado'
import { fetchStores } from '../data/api'
import type { Store, StoreCategory } from '../types/domain'

type SortOption = 'relevancia' | 'avaliacao' | 'entrega' | 'taxa'

const SORT_LABEL: Record<SortOption, string> = {
  relevancia: 'Todos',
  avaliacao: 'Mais avaliadas',
  entrega: 'Menor tempo de entrega',
  taxa: 'Menor taxa de entrega',
}

function CategoryTile({
  label,
  icon: Icon,
  gradient,
  active,
  onClick,
}: {
  label: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  gradient: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-16 shrink-0 flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 text-center transition ${
        active ? 'border-navy bg-navy text-white' : 'border-neutral-200 bg-white text-neutral-700'
      }`}
    >
      <span
        className={`grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br ${gradient} text-white ${
          active ? 'ring-2 ring-white/40' : ''
        }`}
      >
        <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
      </span>
      <span className="w-full truncate text-[11px] font-semibold leading-tight">{label}</span>
    </button>
  )
}

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<StoreCategory | null>(null)
  const [sort, setSort] = useState<SortOption>('relevancia')
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

  const filteredStores = useMemo(() => {
    const list = activeCategory ? stores.filter((s) => s.category === activeCategory) : stores
    const sorted = [...list]
    if (sort === 'avaliacao') sorted.sort((a, b) => b.rating - a.rating)
    else if (sort === 'entrega') sorted.sort((a, b) => a.etaMinutes[0] - b.etaMinutes[0])
    else if (sort === 'taxa') sorted.sort((a, b) => a.deliveryFee - b.deliveryFee)
    return sorted
  }, [stores, activeCategory, sort])

  return (
    <div className="space-y-6">
      <Link
        to="/busca"
        className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-400 shadow-sm"
      >
        <Search className="h-4 w-4" aria-hidden />
        Buscar comidas, lojas ou produtos...
      </Link>

      <PromoCarousel />

      <section>
        <div className="mb-3 overflow-hidden rounded-2xl bg-neutral-900 px-5 py-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">Explore</p>
          <p className="text-lg font-extrabold text-white">Categorias.</p>
        </div>
        <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4">
          <CategoryTile
            label="Todos"
            icon={Search}
            gradient="from-neutral-600 to-neutral-800"
            active={activeCategory === null}
            onClick={() => setActiveCategory(null)}
          />
          {CATEGORIES.map((c) => (
            <CategoryTile
              key={c.id}
              label={c.label}
              icon={c.icon}
              gradient={c.gradient}
              active={activeCategory === c.id}
              onClick={() => setActiveCategory(c.id === activeCategory ? null : c.id)}
            />
          ))}
        </div>
      </section>

      <StoryPremiumRow />

      <BannerDestaque />

      <ProdutoPatrocinado />

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-extrabold text-neutral-900">Estabelecimentos.</h2>
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
          <div className="space-y-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-neutral-200" />
            ))}
          </div>
        ) : loadError ? (
          <p className="rounded-xl border border-dashed border-neutral-300 py-16 text-center text-sm text-neutral-500">
            Não foi possível carregar as lojas agora. Tente novamente em instantes.
          </p>
        ) : filteredStores.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-300 py-16 text-center text-sm text-neutral-500">
            Nenhuma loja encontrada para essa categoria.
          </p>
        ) : (
          <div className="space-y-2.5">
            {filteredStores.map((s) => (
              <StoreRow key={s.id} store={s} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
