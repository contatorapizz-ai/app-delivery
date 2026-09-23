import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { categoryMeta } from '../../data/categories'
import { fetchActiveCampaignsByFormat, trackAdEvent } from '../../data/ads.api'
import { fetchStoreById } from '../../data/api'
import MediaTile from '../MediaTile'
import type { AdCampaignRow } from '../../types/database'
import type { Store } from '../../types/domain'

interface StoryItem {
  campaign: AdCampaignRow
  store: Store
}

export default function StoryPremiumRow() {
  const [items, setItems] = useState<StoryItem[]>([])

  useEffect(() => {
    let cancelled = false
    fetchActiveCampaignsByFormat('story_premium', 5)
      .then(async (campaigns) => {
        const resolved = await Promise.all(
          campaigns.map(async (campaign) => {
            const store = await fetchStoreById(campaign.store_id)
            return store ? { campaign, store } : null
          }),
        )
        if (cancelled) return
        const valid = resolved.filter((r): r is StoryItem => r !== null)
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
      <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4">
        {items.map(({ campaign, store }) => {
          const cat = categoryMeta(store.category)
          return (
            <Link
              key={campaign.id}
              to={`/loja/${store.id}`}
              onClick={() => trackAdEvent(campaign.id, 'clique')}
              className="flex shrink-0 flex-col items-center gap-1.5"
            >
              <MediaTile
                src={store.imageUrl}
                alt={store.name}
                icon={<cat.icon className="h-7 w-7" strokeWidth={1.5} />}
                className="h-16 w-16 rounded-full ring-2 ring-accent ring-offset-2"
              />
              <span className="max-w-16 truncate text-xs font-medium text-neutral-700">{store.name}</span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
