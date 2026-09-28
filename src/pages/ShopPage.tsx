import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, MessageCircle, PlayCircle, Send, Share2, ShoppingBag, Sparkles, Star, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
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
import { formatBRL, formatCompactNumber } from '../lib/format'
import type { ShopCommentRow } from '../types/database'

type ShopTab = 'para_voce' | 'ofertas' | 'ao_vivo'

const TABS: { id: ShopTab; label: string }[] = [
  { id: 'para_voce', label: 'Para você' },
  { id: 'ofertas', label: 'Ofertas' },
  { id: 'ao_vivo', label: 'Ao Vivo' },
]

function useCountdown(target: Date) {
  const [msLeft, setMsLeft] = useState(() => target.getTime() - Date.now())
  useEffect(() => {
    const timer = setInterval(() => setMsLeft(target.getTime() - Date.now()), 1000)
    return () => clearInterval(timer)
  }, [target])
  if (msLeft <= 0) return null
  const totalSeconds = Math.floor(msLeft / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  if (days > 0) return `${days}d ${pad(hours)}:${pad(minutes)}`
  return `${pad(hours === 0 ? minutes : hours)}:${pad(hours === 0 ? seconds : minutes)}`
}

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

function OfferStrip({ item }: { item: ShowcaseItem }) {
  const countdown = useCountdown(new Date(`${item.campaign.ends_at}T23:59:59`))
  if (!item.product || !countdown) return null

  return (
    <Link
      to={`/loja/${item.store.id}`}
      onClick={() => trackAdEvent(item.campaign.id, 'clique')}
      className="flex items-center justify-between gap-3 bg-gradient-to-r from-brand to-brand-dark px-4 py-2.5 text-white"
    >
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide text-white/80">Oferta do vídeo</p>
        <p className="truncate text-sm font-bold">{item.product.name}</p>
        <p className="text-sm font-extrabold">{formatBRL(item.product.price)}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-xs font-mono font-bold tabular-nums">{countdown}</span>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-brand">Comprar</span>
      </div>
    </Link>
  )
}

function ShopCard({
  item,
  engagement,
  onToggleLike,
  onBuy,
}: {
  item: ShowcaseItem
  engagement: ShopEngagement
  onToggleLike: () => void
  onBuy: () => void
}) {
  const [showComments, setShowComments] = useState(false)
  const { campaign, product, store } = item

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-black" style={{ aspectRatio: '9 / 16', maxHeight: '78vh' }}>
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

      <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/60 to-transparent p-4">
        <p className="flex items-center gap-1.5 text-sm font-extrabold text-white">
          <PlayCircle className="h-4 w-4" /> Rapizz Shop
        </p>
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 pb-0 pt-16 text-white">
        <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-white/70">
          {store.name} · <Star className="h-3 w-3 fill-accent text-accent" /> {store.rating.toFixed(1)}
        </p>
        <h3 className="mt-1 text-lg font-extrabold leading-snug">{product?.name ?? campaign.title}</h3>
        {(product?.description || campaign.description) && (
          <p className="mt-1 line-clamp-2 text-sm text-white/85">{product?.description || campaign.description}</p>
        )}

        <OfferStrip item={item} />

        {product && (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-black/70 p-2.5 backdrop-blur">
            <div className="flex min-w-0 items-center gap-2.5">
              <MediaTile
                src={product.imageUrl}
                alt={product.name}
                icon={<Sparkles className="h-4 w-4 text-accent" />}
                className="h-11 w-11 shrink-0 rounded-xl"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{product.name}</p>
                <p className="text-sm font-extrabold text-accent">{formatBRL(product.price)}</p>
              </div>
            </div>
            <button
              onClick={onBuy}
              className="shrink-0 rounded-full bg-accent px-5 py-2 text-sm font-bold text-white"
            >
              Comprar
            </button>
          </div>
        )}
        {!product && (
          <div className="mt-3 pb-1">
            <Link
              to={`/loja/${store.id}`}
              onClick={() => trackAdEvent(campaign.id, 'clique')}
              className="inline-block rounded-full bg-accent px-5 py-2 text-sm font-bold text-white"
            >
              Ver na loja
            </Link>
          </div>
        )}
      </div>

      <div className="absolute right-3 top-1/2 flex -translate-y-1/2 flex-col items-center gap-4">
        <button onClick={onToggleLike} className="flex flex-col items-center gap-0.5 text-white">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-black/30 backdrop-blur">
            <Heart className={`h-5 w-5 ${engagement.likedByMe ? 'fill-brand text-brand' : ''}`} />
          </span>
          <span className="text-[11px] font-semibold">{formatCompactNumber(engagement.likeCount)}</span>
        </button>
        <button onClick={() => setShowComments(true)} className="flex flex-col items-center gap-0.5 text-white">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-black/30 backdrop-blur">
            <MessageCircle className="h-5 w-5" />
          </span>
          <span className="text-[11px] font-semibold">{formatCompactNumber(engagement.commentCount)}</span>
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
  const { storeId: cartStoreId, clearCart, addItem } = useCart()
  const [tab, setTab] = useState<ShopTab>('para_voce')
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

  function handleBuy(item: ShowcaseItem) {
    if (!item.product) return
    if (cartStoreId && cartStoreId !== item.store.id) {
      if (!window.confirm('Seu carrinho tem itens de outra loja. Esvaziar e adicionar este produto?')) return
      clearCart()
    }
    addItem({ product: item.product, quantity: 1, selectedOptions: [] })
    trackAdEvent(item.campaign.id, 'clique')
    navigate('/carrinho')
  }

  const visibleItems = items?.filter((item) => {
    if (tab === 'ofertas') return item.product !== null
    if (tab === 'ao_vivo') return false
    return true
  })

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="flex items-center gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              tab === t.id ? 'bg-navy text-white' : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">Não foi possível carregar a vitrine agora.</p>}

      {items === null && !error && <div className="aspect-[9/16] max-h-[75vh] animate-pulse rounded-3xl bg-neutral-200" />}

      {tab === 'ao_vivo' && (
        <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-neutral-300 py-16 text-center">
          <ShoppingBag className="h-8 w-8 text-neutral-300" />
          <p className="max-w-xs text-sm text-neutral-500">
            Nenhuma transmissão ao vivo agora. O Rapizz ainda não tem infraestrutura de streaming ao vivo contratada
            — por isso não exibimos vídeos gravados como se fossem uma live.
          </p>
        </div>
      )}

      {tab !== 'ao_vivo' && visibleItems && visibleItems.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 py-16 text-center text-sm text-neutral-500">
          {tab === 'ofertas'
            ? 'Nenhuma oferta com produto vinculado no momento.'
            : 'Nenhum destaque ativo no momento. Lojistas podem criar uma campanha em Rapizz Ads.'}
        </p>
      )}

      {tab !== 'ao_vivo' && visibleItems && visibleItems.length > 0 && (
        <div className="space-y-4">
          {visibleItems.map((item) => (
            <ShopCard
              key={item.campaign.id}
              item={item}
              engagement={engagement[item.campaign.id] ?? { likeCount: 0, commentCount: 0, likedByMe: false }}
              onToggleLike={() => handleToggleLike(item.campaign.id)}
              onBuy={() => handleBuy(item)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
