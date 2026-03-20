'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const SLIDES = [
  {
    bg: 'linear-gradient(135deg, #1a0a2e 0%, #3d1a5c 50%, #1a0a2e 100%)',
    tag: '⚡ ZONA GAMER',
    title: 'Armá tu PC ideal',
    subtitle: 'Elegí cada componente, verificá compatibilidad y comprá todo junto',
    cta: 'Armar PC →',
    href: '/gamer',
    img: '🖥️',
    accent: '#b769bd',
  },
  {
    bg: 'linear-gradient(135deg, #0a1a3e 0%, #1a3a6e 50%, #0a1a3e 100%)',
    tag: '💻 NOTEBOOKS',
    title: 'Notebooks Gaming',
    subtitle: 'RTX 50 Series · Intel Core Ultra · AMD Ryzen AI — Los mejores precios',
    cta: 'Ver Notebooks →',
    href: '/products?category=Gaming&q=notebook',
    img: '💻',
    accent: '#4a9eff',
  },
  {
    bg: 'linear-gradient(135deg, #1a2a0a 0%, #2a4a1a 50%, #1a2a0a 100%)',
    tag: '📱 CELULARES',
    title: 'iPhone 16 Pro & Galaxy S25',
    subtitle: 'Los smartphones más potentes del mercado — Stock disponible',
    cta: 'Ver Celulares →',
    href: '/products?category=Celulares',
    img: '📱',
    accent: '#22c55e',
  },
]

export function HeroSection() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setCurrent(c => (c + 1) % SLIDES.length), 5000)
    return () => clearInterval(timer)
  }, [])

  const slide = SLIDES[current]

  return (
    <section className="relative overflow-hidden" style={{ background: slide.bg, minHeight: '320px', transition: 'background 0.5s' }}>
      <div className="max-w-7xl mx-auto px-4 py-14 flex items-center">
        <div className="flex-1">
          <span className="inline-block text-xs font-800 px-3 py-1 rounded-full mb-4" style={{ background: `${slide.accent}22`, color: slide.accent, fontWeight: 800, border: `1px solid ${slide.accent}44` }}>
            {slide.tag}
          </span>
          <h1 className="text-4xl font-900 text-white mb-3" style={{ fontWeight: 900, lineHeight: 1.15 }}>
            {slide.title}
          </h1>
          <p className="text-base mb-6" style={{ color: 'rgba(255,255,255,0.75)', maxWidth: '500px' }}>
            {slide.subtitle}
          </p>
          <Link
            href={slide.href}
            className="inline-block px-6 py-3 rounded-xl font-700 text-white transition-transform hover:-translate-y-0.5"
            style={{ background: slide.accent, fontWeight: 700 }}
          >
            {slide.cta}
          </Link>
        </div>
        <div className="hidden md:flex text-9xl opacity-20 mr-8">{slide.img}</div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="rounded-full transition-all"
            style={{
              width: i === current ? '20px' : '8px',
              height: '8px',
              background: i === current ? 'white' : 'rgba(255,255,255,0.4)',
            }}
          />
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={() => setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={() => setCurrent(c => (c + 1) % SLIDES.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}
      >
        <ChevronRight size={18} />
      </button>
    </section>
  )
}
