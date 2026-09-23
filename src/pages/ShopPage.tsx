import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, MessageCircle, Send, Share2, Sparkles, Star, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import MediaTile from '../components/MediaTile'
import { trackAdEvent } from '../data/ads.api'
import {
  addComment,
  fetchComments,
  fetchEngagement,
  fetchShowcase,
  toggleLike,
  type ShopEngagement,
  type ShowcaseItem,
} from '../data/shop.api'
import { formatBRL } from '../lib/format'
import type { ShopCommentRow } from '../types/database'

function ShareButton({ item }: { item: ShowcaseItem }) {
  async function handleShare() {
    const url = `${window.location.origin}/loja/${item.store.id}`
    const shareData = { title: item.product?.name ?? item.campaign.title, text: `${item.store.name} no Rapizz`, url }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // usuário cancelou o compartilhamento
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      alert('Link copiado!')
    } catch {
      // clipboard indisponível neste navegador
    }
  }

  return (
    <button onClick={handleShare} className="flex flex-col items-center gap-0.5 text-white">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-black/30 backdrop-blur">
        <Share2 className="h-5 w-5" />
      </span>
      <span className="text-[11px] font-semibold">Partilhar</span>
    </button>
  )
}

function CommentsSheet({ campaignId, onClose }: { campaignId: string; onClose: () => void }) {
  const { session, profile } = useAuth()
  const [comments, setComments] = useState<ShopCommentRow[] | null>(null)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchComments(campaignId)
      .then(setComments)
      .catch(() => setComments([]))
  }, [campaignId])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!session || !body.trim()) return
    setSending(true)
    try {
      const created = await addComment(campaignId, session.user.id, profile?.full_name || 'Cliente Rapizz', body.trim())
      setComments((prev) => [...(prev ?? []), created])
      setBody('')
    } catch {
      // erro silencioso — usuário pode tentar de novo
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="max-h-[70vh] w-full max-w-lg overflow-hidden rounded-t-2xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-neutral-200" />
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="font-bold text-neutral-900">Comentários</h3>
          <button onClick={onClose} className="text-neutral-400" aria-label="Fechar">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[40vh] space-y-3 overflow-y-auto px-4 pb-3">
          {comments === null && <p className="text-sm text-neutral-400">Carregando...</p>}
          {comments && comments.length === 0 && (
            <p className="py-6 text-center text-sm text-neutral-400">Seja o primeiro a comentar.</p>
          )}
          {comments?.map((c) => (
            <div key={c.id} className="text-sm">
              <span className="font-semibold text-neutral-900">{c.author_name}</span>{' '}
              <span className="text-neutral-600">{c.body}</span>
            </div>
          ))}
        </div>
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 border-t border-neutral-100 p-3"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}
        >
          <input
            disabled={!session}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={500}
            placeholder={session ? 'Adicione um comentário...' : 'Entre para comentar'}
            className="flex-1 rounded-full border border-neutral-200 px-3.5 py-2 text-sm outline-none focus:border-brand disabled:bg-neutral-50"
          />
          <button
            type="submit"
            disabled={!session || sending || !body.trim()}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-white disabled:opacity-40"
            aria-label="Enviar comentário"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}

function ShopCard({
  item,
  engagement,
  onToggleLike,
}: {
  item: ShowcaseItem
  engagement: ShopEngagement
  onToggleLike: () => void
}) {
  const [showComments, setShowComments] = useState(false)
  const { campaign, product, store } = item

  return (
    <div className="relative aspect-[9/16] w-full max-h-[75vh] overflow-hidden rounded-3xl bg-black">
      {campaign.video_url ? (
        <video
          src={campaign.video_url}
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          onPlay={() => trackAdEvent(campaign.id, 'impressao')}
        />
      ) : (
        <MediaTile
          src={product?.imageUrl ?? store.imageUrl}
          alt={product?.name ?? campaign.title}
          icon={<Sparkles className="h-10 w-10 text-accent" strokeWidth={1.5} />}
          className="h-full w-full"
        />
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 pt-16 text-white">
        <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-white/70">
          {store.name} · <Star className="h-3 w-3 fill-accent text-accent" /> {store.rating.toFixed(1)}
        </p>
        <h3 className="mt-1 text-lg font-extrabold leading-snug">{product?.name ?? campaign.title}</h3>
        {(product?.description || campaign.description) && (
          <p className="mt-1 line-clamp-2 text-sm text-white/85">{product?.description || campaign.description}</p>
        )}
        <div className="mt-3 flex items-center justify-between gap-3">
          {product && <span className="text-lg font-extrabold">{formatBRL(product.price)}</span>}
          <Link
            to={`/loja/${store.id}`}
            onClick={() => trackAdEvent(campaign.id, 'clique')}
            className="rounded-full bg-brand px-5 py-2 text-sm font-bold"
          >
            Ver na loja
          </Link>
        </div>
      </div>

      <div className="absolute right-3 top-1/2 flex -translate-y-1/2 flex-col items-center gap-4">
        <button onClick={onToggleLike} className="flex flex-col items-center gap-0.5 text-white">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-black/30 backdrop-blur">
            <Heart className={`h-5 w-5 ${engagement.likedByMe ? 'fill-brand text-brand' : ''}`} />
          </span>
          <span className="text-[11px] font-semibold">{engagement.likeCount}</span>
        </button>
        <button onClick={() => setShowComments(true)} className="flex flex-col items-center gap-0.5 text-white">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-black/30 backdrop-blur">
            <MessageCircle className="h-5 w-5" />
          </span>
          <span className="text-[11px] font-semibold">{engagement.commentCount}</span>
        </button>
        <ShareButton item={item} />
      </div>

      {showComments && <CommentsSheet campaignId={campaign.id} onClose={() => setShowComments(false)} />}
    </div>
  )
}

export default function ShopPage() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState<ShowcaseItem[] | null>(null)
  const [engagement, setEngagement] = useState<Record<string, ShopEngagement>>({})
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchShowcase()
      .then(async (data) => {
        if (cancelled) return
        setItems(data)
        const eng = await fetchEngagement(
          data.map((i) => i.campaign.id),
          session?.user.id ?? null,
        )
        if (!cancelled) setEngagement(eng)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
    }
  }, [session])

  async function handleToggleLike(campaignId: string) {
    if (!session) {
      navigate('/conta')
      return
    }
    const current = engagement[campaignId] ?? { likeCount: 0, commentCount: 0, likedByMe: false }
    const nextLiked = !current.likedByMe
    setEngagement((prev) => ({
      ...prev,
      [campaignId]: { ...current, likedByMe: nextLiked, likeCount: current.likeCount + (nextLiked ? 1 : -1) },
    }))
    try {
      await toggleLike(campaignId, session.user.id, current.likedByMe)
    } catch {
      setEngagement((prev) => ({ ...prev, [campaignId]: current }))
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-neutral-900">Rapizz Shop</h1>
        <p className="text-sm text-neutral-500">Produtos e lojas em destaque. Curta, comente e compartilhe.</p>
      </div>

      {error && <p className="text-sm text-red-600">Não foi possível carregar a vitrine agora.</p>}

      {items === null && !error && <div className="aspect-[9/16] max-h-[75vh] animate-pulse rounded-3xl bg-neutral-200" />}

      {items && items.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 py-16 text-center text-sm text-neutral-500">
          Nenhum destaque ativo no momento. Lojistas podem criar uma campanha em Rapizz Ads.
        </p>
      )}

      {items && items.length > 0 && (
        <div className="space-y-4">
          {items.map((item) => (
            <ShopCard
              key={item.campaign.id}
              item={item}
              engagement={engagement[item.campaign.id] ?? { likeCount: 0, commentCount: 0, likedByMe: false }}
              onToggleLike={() => handleToggleLike(item.campaign.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
