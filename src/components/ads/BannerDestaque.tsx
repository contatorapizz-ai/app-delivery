import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { categoryMeta } from '../../data/categories'
import { fetchActiveCampaignsByFormat, trackAdEvent } from '../../data/ads.api'
import { fetchStoreById } from '../../data/api'
import type { AdCampaignRow } from '../../types/database'
import type { Store } from '../../types/domain'

export default function BannerDestaque() {
  const [campaign, setCampaign] = useState<AdCampaignRow | null>(null)
  const [store, setStore] = useState<Store | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchActiveCampaignsByFormat('banner_destaque', 1)
      .then(async ([first]) => {
        if (!first || cancelled) return
        const s = await fetchStoreById(first.store_id)
        if (cancelled || !s) return
        setCampaign(first)
        setStore(s)
        trackAdEvent(first.id, 'impressao')
      })
      .catch(() => {
        if (!cancelled) setCampaign(null)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (!campaign || !store) return null

  const cat = categoryMeta(store.category)

  return (
    <Link
      to={`/loja/${store.id}`}
      onClick={() => trackAdEvent(campaign.id, 'clique')}
      className={`relative block overflow-hidden rounded-2xl bg-gradient-to-r ${cat.gradient} p-5 text-white shadow-sm transition hover:opacity-95`}
    >
      <span className="absolute right-3 top-3 rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
        Patrocinado
      </span>
      <p className="text-xs font-semibold uppercase tracking-wide text-white/80">{store.name}</p>
      <h3 className="mt-1 max-w-sm text-lg font-extrabold leading-snug">{campaign.title}</h3>
      {campaign.description && <p className="mt-1 max-w-sm text-sm text-white/85">{campaign.description}</p>}
    </Link>
  )
}
