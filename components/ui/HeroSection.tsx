'use client'
import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const SLIDES = [
  { img: '/banners/banner-soundpeats.png',   href: '/products?q=soundpeats',                  alt: 'SoundPeats' },
  { img: '/banners/banner-drone.png',        href: '/products?q=drone',                       alt: 'Drone 360' },
  { img: '/banners/banner-rtx5070.png',      href: '/products?category=Componentes&q=rtx',    alt: 'RTX 5070' },
  { img: '/banners/banner-anahickmann.png',  href: '/products?q=ana+hickmann',                alt: 'Ana Hickmann' },
  { img: '/banners/banner-macbook.png',      href: '/products?category=Notebooks&q=macbook',  alt: 'MacBook' },
]

export function HeroSection() {
  const [current, setCurrent]     = useState(0)
  const [animating, setAnimating] = useState(false)

  const go = useCallback((idx: number) => {
    if (animating) return
    setAnimating(true)
    setCurrent(idx)
    setTimeout(() => setAnimating(false), 500)
  }, [animating])

  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % SLIDES.length), 5000)
    return () => clearInterval(t)
  }, [])

  return (
    /* ── altura fija 380px — nunca se estira más ── */
    <section className="relative overflow-hidden w-full bg-black" style={{ height: '380px' }}>

      {SLIDES.map((slide, i) => (
        <Link
          key={i}
          href={slide.href}
          className="absolute inset-0 transition-opacity duration-500"
          style={{ opacity: i === current ? 1 : 0, pointerEvents: i === current ? 'auto' : 'none' }}
          tabIndex={i === current ? 0 : -1}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slide.img}
            alt={slide.alt}
            className="w-full h-full"
            style={{ objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        </Link>
      ))}

      <button onClick={() => go((current - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{ background: 'rgba(0,0,0,0.38)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
        <ChevronLeft size={20} />
      </button>
      <button onClick={() => go((current + 1) % SLIDES.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{ background: 'rgba(0,0,0,0.38)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
        <ChevronRight size={20} />
      </button>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => go(i)}
            className="rounded-full transition-all duration-300"
            style={{ width: i === current ? '24px' : '8px', height: '8px', background: i === current ? 'var(--accent)' : 'rgba(255,255,255,0.5)' }} />
        ))}
      </div>
    </section>
  )
}
