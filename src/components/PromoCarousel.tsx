import { useRef, useState } from 'react'

interface Slide {
  eyebrow: string
  title: string
  subtitle: string
  cta: string
  gradient: string
}

const SLIDES: Slide[] = [
  {
    eyebrow: 'PROMOÇÃO',
    title: 'Entrega Expressa',
    subtitle: 'Peça agora e receba em minutos',
    cta: 'Aproveitar →',
    gradient: 'from-navy via-brand to-navy',
  },
  {
    eyebrow: 'NOVIDADE',
    title: 'Rapizz Ads',
    subtitle: 'Sua loja em destaque pra quem está pertinho',
    cta: 'Anunciar →',
    gradient: 'from-brand to-accent',
  },
  {
    eyebrow: 'FUNDO MOTOBOY',
    title: 'Você entrega, você ganha',
    subtitle: 'Parte de cada campanha vai direto pros entregadores',
    cta: 'Entenda →',
    gradient: 'from-navy to-purple-700',
  },
]

export default function PromoCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  function handleScroll() {
    const el = scrollRef.current
    if (!el || el.clientWidth === 0) return
    setActive(Math.round(el.scrollLeft / el.clientWidth))
  }

  return (
    <div>
      <div ref={scrollRef} onScroll={handleScroll} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto">
        {SLIDES.map((slide) => (
          <div
            key={slide.title}
            className={`w-full shrink-0 snap-center overflow-hidden rounded-3xl bg-gradient-to-br ${slide.gradient} px-6 py-8 text-white shadow-lg shadow-navy/20 sm:px-10 sm:py-12`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-white/80">{slide.eyebrow}</p>
            <h2 className="mt-1 text-2xl font-extrabold leading-tight sm:text-3xl">{slide.title}</h2>
            <p className="mt-2 max-w-md text-sm text-white/85 sm:text-base">{slide.subtitle}</p>
            <span className="mt-4 inline-block rounded-full bg-white/15 px-4 py-2 text-xs font-bold backdrop-blur">
              {slide.cta}
            </span>
          </div>
        ))}
      </div>
      {SLIDES.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {SLIDES.map((slide, i) => (
            <span
              key={slide.title}
              className={`h-1.5 rounded-full transition-all ${i === active ? 'w-5 bg-brand' : 'w-1.5 bg-neutral-300'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
