import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchActiveCampaignsByFormat, trackAdEvent } from '../../data/ads.api'
import { fetchStoreById, fetchProductsByStore } from '../../data/api'
import MediaTile from '../MediaTile'
import { formatBRL } from '../../lib/format'
import type { AdCampaignRow } from '../../types/database'
import type { Product, Store } from '../../types/domain'

interface SponsoredItem {
  campaign: AdCampaignRow
  store: Store
  product: Product | null
}

export default function ProdutoPatrocinado() {
  const [items, setItems] = useState<SponsoredItem[]>([])

  useEffect(() => {
    let cancelled = false
    fetchActiveCampaignsByFormat('produto_patrocinado', 8)
      .then(async (campaigns) => {
        const resolved = await Promise.all(
          campaigns.map(async (campaign) => {
            const store = await fetchStoreById(campaign.store_id)
            if (!store) return null
            let product: Product | null = null
            if (campaign.product_id) {
              const products = await fetchProductsByStore(campaign.store_id)
              product = products.find((p) => p.id === campaign.product_id) ?? null
            }
            return { campaign, store, product }
          }),
        )
        if (cancelled) return
        const valid = resolved.filter((r): r is SponsoredItem => r !== null)
        setItems(valid)
        valid.forEach((item) => trackAdEvent(item.campaign.id, 'impressao'))
      })
      .catch(() => {
        if (!cancelled) setItems([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (items.length === 0) return null

  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-neutral-500">
        Produtos em destaque
        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold normal-case text-neutral-400">
          Patrocinado
        </span>
      </h2>
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4">
        {items.map(({ campaign, store, product }) => (
          <Link
            key={campaign.id}
            to={`/loja/${store.id}`}
            onClick={() => trackAdEvent(campaign.id, 'clique')}
            className="flex w-40 shrink-0 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:shadow"
          >
            <MediaTile src={product?.imageUrl} alt={product?.name ?? campaign.title} icon="⭐" className="h-20 w-full" iconClassName="text-2xl" />
            <div className="p-2.5">
              <p className="truncate text-sm font-semibold text-neutral-900">{product?.name ?? campaign.title}</p>
              <p className="truncate text-xs text-neutral-500">{store.name}</p>
              {product && <p className="mt-0.5 text-sm font-semibold text-brand">{formatBRL(product.price)}</p>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
