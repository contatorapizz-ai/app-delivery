import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, type LucideIcon, Megaphone, ShieldCheck, Zap } from 'lucide-react'

interface Slide {
  eyebrow: string
  title: string
  subtitle: string
  cta: string
  gradient: string
  icon: LucideIcon
}

const SLIDES: Slide[] = [
  {
    eyebrow: 'PROMOÇÃO',
    title: 'Entrega Expressa',
    subtitle: 'Peça agora e receba em minutos',
    cta: 'Aproveitar',
    gradient: 'from-navy to-brand',
    icon: Zap,
  },
  {
    eyebrow: 'NOVIDADE',
    title: 'Rapizz Ads',
    subtitle: 'Sua loja em destaque pra quem está pertinho',
    cta: 'Anunciar',
    gradient: 'from-brand to-accent',
    icon: Megaphone,
  },
  {
    eyebrow: 'FUNDO MOTOBOY',
    title: 'Você entrega, você ganha',
    subtitle: 'Parte de cada campanha vai direto pros entregadores',
    cta: 'Entenda',
    gradient: 'from-navy to-accent',
    icon: ShieldCheck,
  },
]

const AUTO_ADVANCE_MS = 6000

export default function PromoCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  const scrollToSlide = useCallback((index: number) => {
    const el = scrollRef.current
    if (!el) return
    const clamped = (index + SLIDES.length) % SLIDES.length
    el.scrollTo({ left: clamped * el.clientWidth, behavior: 'smooth' })
  }, [])

  function handleScroll() {
    const el = scrollRef.current
    if (!el || el.clientWidth === 0) return
    setActive(Math.round(el.scrollLeft / el.clientWidth))
  }

  useEffect(() => {
    if (paused || SLIDES.length <= 1) return
    const timer = setInterval(() => scrollToSlide(active + 1), AUTO_ADVANCE_MS)
    return () => clearInterval(timer)
  }, [active, paused, scrollToSlide])

  return (
    <div
      className="group relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto rounded-3xl shadow-lg shadow-navy/15"
      >
        {SLIDES.map((slide) => (
          <div
            key={slide.title}
            className={`relative w-full shrink-0 snap-center overflow-hidden bg-gradient-to-br ${slide.gradient} px-6 py-8 text-white sm:px-10 sm:py-12`}
          >
            <slide.icon
              className="pointer-events-none absolute -right-4 -top-4 h-32 w-32 text-white/10 sm:h-40 sm:w-40"
              strokeWidth={1.25}
              aria-hidden
            />
            <p className="text-xs font-semibold uppercase tracking-wide text-white/80">{slide.eyebrow}</p>
            <h2 className="mt-1 text-2xl font-extrabold leading-tight sm:text-3xl">{slide.title}</h2>
            <p className="relative mt-2 max-w-md text-sm text-white/85 sm:text-base">{slide.subtitle}</p>
            <span className="relative mt-4 inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-xs font-bold text-neutral-900">
              {slide.cta}
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </div>
        ))}
      </div>

      {SLIDES.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => scrollToSlide(active - 1)}
            aria-label="Promoção anterior"
            className="absolute left-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-neutral-700 opacity-0 shadow transition group-hover:opacity-100 sm:grid"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollToSlide(active + 1)}
            aria-label="Próxima promoção"
            className="absolute right-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-neutral-700 opacity-0 shadow transition group-hover:opacity-100 sm:grid"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="mt-3 flex justify-center gap-1.5">
            {SLIDES.map((slide, i) => (
              <button
                key={slide.title}
                type="button"
                onClick={() => scrollToSlide(i)}
                aria-label={`Ir para promoção ${i + 1}`}
                className="p-1"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all ${i === active ? 'w-5 bg-brand' : 'w-1.5 bg-neutral-300'}`}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
