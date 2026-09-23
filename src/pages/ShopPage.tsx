import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MediaTile from '../components/MediaTile'
import { trackAdEvent } from '../data/ads.api'
import { fetchShowcase, type ShowcaseItem } from '../data/shop.api'
import { formatBRL } from '../lib/format'

export default function ShopPage() {
  const [items, setItems] = useState<ShowcaseItem[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchShowcase()
      .then((data) => {
        if (cancelled) return
        setItems(data)
        data.forEach((item) => trackAdEvent(item.campaign.id, 'impressao'))
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-neutral-900">Rapizz Shop</h1>
        <p className="text-sm text-neutral-500">Vitrine de produtos e lojas em destaque.</p>
      </div>

      <p className="rounded-xl bg-neutral-100 px-4 py-3 text-xs leading-relaxed text-neutral-500">
        Aqui aparecem os produtos e lojas que investiram em destaque no Rapizz Ads. Transmissão ao vivo ainda não
        existe nesta fase — os itens abaixo são reais, só não são vídeo.
      </p>

      {error && <p className="text-sm text-red-600">Não foi possível carregar a vitrine agora.</p>}

      {items === null && !error && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-neutral-200" />
          ))}
        </div>
      )}

      {items && items.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 py-16 text-center text-sm text-neutral-500">
          Nenhum destaque ativo no momento. Lojistas podem criar uma campanha em Rapizz Ads.
        </p>
      )}

      {items && items.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map(({ campaign, product, store }) => (
            <Link
              key={campaign.id}
              to={`/loja/${store.id}`}
              onClick={() => trackAdEvent(campaign.id, 'clique')}
              className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <MediaTile
                src={product?.imageUrl ?? store.imageUrl}
                alt={product?.name ?? campaign.title}
                icon="⭐"
                className="h-28 w-full"
                iconClassName="text-3xl"
              />
              <div className="p-3">
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                  Patrocinado
                </span>
                <p className="mt-1.5 truncate text-sm font-semibold text-neutral-900">
                  {product?.name ?? campaign.title}
                </p>
                <p className="truncate text-xs text-neutral-500">{store.name}</p>
                {product && <p className="mt-0.5 text-sm font-semibold text-brand">{formatBRL(product.price)}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
