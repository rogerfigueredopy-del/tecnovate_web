'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const SLIDES = [
  {
    bg: 'linear-gradient(135deg, #2d0a40 0%, #6b2177 40%, #b769bd 100%)',
    tag: '⚡ ZONA GAMER',
    title: 'Armá tu PC ideal',
    subtitle: 'Elegí cada componente, verificá compatibilidad y comprá todo junto',
    cta: 'Armar PC →',
    href: '/gamer',
    emoji: '🖥️',
    badge: 'NUEVO',
    badgeColor: '#fff',
    patternColor: 'rgba(255,255,255,0.04)',
  },
  {
    bg: 'linear-gradient(135deg, #1a0a30 0%, #3d1060 50%, #7b2d9e 100%)',
    tag: '💻 NOTEBOOKS 2025',
    title: 'RTX 50 Series\nya llegó',
    subtitle: 'Intel Core Ultra · AMD Ryzen AI · La nueva generación en stock',
    cta: 'Ver Notebooks →',
    href: '/products?category=Notebooks',
    emoji: '💻',
    badge: 'STOCK',
    badgeColor: '#b769bd',
    patternColor: 'rgba(183,105,189,0.06)',
  },
  {
    bg: 'linear-gradient(135deg, #1a0030 0%, #4a0a5c 50%, #9b4fa6 100%)',
    tag: '📱 CELULARES',
    title: 'iPhone 17 Pro Max\nen Paraguay',
    subtitle: 'Todos los modelos disponibles — Envío express Ciudad del Este',
    cta: 'Ver Celulares →',
    href: '/products?category=Celulares',
    emoji: '📱',
    badge: 'OFICIAL',
    badgeColor: '#d48fda',
    patternColor: 'rgba(183,105,189,0.05)',
  },
  {
    bg: 'linear-gradient(135deg, #200838 0%, #5c1a70 50%, #b769bd 100%)',
    tag: '🔥 OFERTAS ESPECIALES',
    title: 'Hasta 30% OFF\nen tecnología',
    subtitle: 'Descuentos exclusivos en notebooks, celulares y componentes gaming',
    cta: 'Ver Ofertas →',
    href: '/products?sale=true',
    emoji: '🏷️',
    badge: '-30%',
    badgeColor: '#ff4444',
    patternColor: 'rgba(255,255,255,0.03)',
  },
]

export function HeroSection() {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)

  const go = (idx: number) => {
    if (animating) return
    setAnimating(true)
    setCurrent(idx)
    setTimeout(() => setAnimating(false), 400)
  }

  useEffect(() => {
    const timer = setInterval(() => go((current + 1) % SLIDES.length), 5500)
    return () => clearInterval(timer)
  }, [current])

  const slide = SLIDES[current]

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: slide.bg,
        minHeight: '360px',
        transition: 'background 0.6s ease',
      }}
    >
      {/* Dot pattern background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      />

      {/* Big faded emoji background */}
      <div
        className="absolute right-0 top-0 bottom-0 flex items-center pointer-events-none select-none"
        style={{
          fontSize: '280px',
          opacity: 0.07,
          lineHeight: 1,
          paddingRight: '40px',
          transition: 'opacity 0.4s',
        }}
      >
        {slide.emoji}
      </div>

      {/* Content */}
      <div
        className="relative max-w-7xl mx-auto px-6 py-14 flex flex-col md:flex-row items-center gap-8"
        style={{ opacity: animating ? 0 : 1, transition: 'opacity 0.3s ease' }}
      >
        <div className="flex-1 min-w-0">
          {/* Tag + Badge */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span
              className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full"
              style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              {slide.tag}
            </span>
            <span
              className="text-xs font-black px-2 py-0.5 rounded"
              style={{ background: slide.badgeColor, color: '#1a0030' }}
            >
              {slide.badge}
            </span>
          </div>

          {/* Title */}
          <h1
            className="text-4xl md:text-5xl font-black text-white mb-3"
            style={{ lineHeight: 1.1, whiteSpace: 'pre-line', textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}
          >
            {slide.title}
          </h1>

          {/* Subtitle */}
          <p
            className="text-sm md:text-base mb-7"
            style={{ color: 'rgba(255,255,255,0.78)', maxWidth: '480px', lineHeight: 1.6 }}
          >
            {slide.subtitle}
          </p>

          {/* CTA */}
          <Link
            href={slide.href}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-black text-sm transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'white',
              color: '#7b2d9e',
              boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
            }}
          >
            {slide.cta}
          </Link>
        </div>

        {/* Right emoji visible on md+ */}
        <div
          className="hidden md:flex text-[120px] shrink-0"
          style={{ filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.4))', transition: 'all 0.4s' }}
        >
          {slide.emoji}
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === current ? '24px' : '8px',
              height: '8px',
              background: i === current ? 'white' : 'rgba(255,255,255,0.35)',
            }}
          />
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={() => go((current - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={() => go((current + 1) % SLIDES.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
      >
        <ChevronRight size={18} />
      </button>
    </section>
  )
}
