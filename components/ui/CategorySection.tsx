'use client'
import Link from 'next/link'
import { useRef, useState, useEffect, useCallback } from 'react'
import { ShoppingCart, ChevronRight, ChevronLeft, Smartphone, Gamepad2, Laptop, Cpu, Monitor, Headphones, Wifi, Printer, Tag, Star, Sparkles } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { LucideIcon } from 'lucide-react'

const CATEGORY_BANNERS: Record<string, {
  bg: string; accent: string; title: string; sub: string; badge?: string;
  icon: LucideIcon; shape: string
}> = {
  Celulares:   { bg: 'linear-gradient(160deg,#0d0525,#2a0a5e,#5b1fa0)', accent: '#c084fc', title: 'iPhone 17\nPro Max',       sub: 'Chip A19 Pro · Titanio · 5G',        icon: Smartphone, shape: 'linear-gradient(135deg,rgba(192,132,252,0.25),rgba(139,92,246,0.1))' },
  Gaming:      { bg: 'linear-gradient(160deg,#060118,#1a0050,#4c0d8f)', accent: '#a78bfa', title: 'Zona\nGaming',             sub: 'Notebooks · GPUs · Accesorios',       icon: Gamepad2,   shape: 'linear-gradient(135deg,rgba(167,139,250,0.22),rgba(109,40,217,0.08))' },
  Notebooks:   { bg: 'linear-gradient(160deg,#150030,#3b1075,#7c3aed)', accent: '#d8b4fe', title: 'MacBook\nPro M4',          sub: 'Intel Ultra · AMD Ryzen AI',          icon: Laptop,     shape: 'linear-gradient(135deg,rgba(216,180,254,0.2),rgba(124,58,237,0.08))' },
  Componentes: { bg: 'linear-gradient(160deg,#0a0120,#200a55,#4c1d95)', accent: '#c4b5fd', title: 'Armá\ntu PC',              sub: 'CPU · GPU · RAM · SSD',               icon: Cpu,        shape: 'linear-gradient(135deg,rgba(196,181,253,0.22),rgba(76,29,149,0.1))' },
  Monitores:   { bg: 'linear-gradient(160deg,#071020,#0f2060,#1e3a8a)', accent: '#93c5fd', title: 'Monitores\nOLED',          sub: '144Hz · IPS · Curvo',                 icon: Monitor,    shape: 'linear-gradient(135deg,rgba(147,197,253,0.2),rgba(30,58,138,0.08))' },
  Accesorios:  { bg: 'linear-gradient(160deg,#0d0525,#2a0a5e,#5b1fa0)', accent: '#e879f9', title: 'Meta Quest\n3S & 3',       sub: 'Realidad Virtual · Lentes VR',        icon: Headphones, shape: 'linear-gradient(135deg,rgba(232,121,249,0.22),rgba(168,85,247,0.08))' },
  Networking:  { bg: 'linear-gradient(160deg,#011a0a,#023d1a,#065f46)', accent: '#6ee7b7', title: 'Networking\n& Smart Home', sub: 'Routers · Cámaras · Tablets',         icon: Wifi,       shape: 'linear-gradient(135deg,rgba(110,231,183,0.2),rgba(6,95,70,0.08))' },
  Impresoras:  { bg: 'linear-gradient(160deg,#1a0800,#3d1a00,#92400e)', accent: '#fcd34d', title: 'Impresoras\n& Filamentos', sub: 'Creality · HP · Epson',               icon: Printer,    shape: 'linear-gradient(135deg,rgba(252,211,77,0.2),rgba(146,64,14,0.1))' },
  Ofertas:     { bg: 'linear-gradient(160deg,#1f0015,#4c0030,#9d174d)', accent: '#f9a8d4', title: 'Ofertas\nEspeciales',      sub: 'Precios increíbles · Stock limitado', icon: Tag,        shape: 'linear-gradient(135deg,rgba(249,168,212,0.22),rgba(157,23,77,0.08))' },
  Destacados:  { bg: 'linear-gradient(160deg,#08082a,#181060,#312e81)', accent: '#a5b4fc', title: 'Productos\nDestacados',    sub: 'Lo mejor de nuestra tienda',          icon: Star,       shape: 'linear-gradient(135deg,rgba(165,180,252,0.2),rgba(49,46,129,0.08))' },
  Perfumes:    { bg: 'linear-gradient(160deg,#1a0010,#4a0828,#831843)', accent: '#f0abfc', title: 'Perfumes\ny Fragancias',   sub: 'Lattafa · Maison · Armaf',            icon: Sparkles,   shape: 'linear-gradient(135deg,rgba(240,171,252,0.22),rgba(131,24,67,0.08))' },
}

function MiniCard({ product }: { product: any }) {
  const addItem  = useCartStore(s => s.addItem)
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : null

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    addItem({ id: product.id, name: product.name, brand: product.brand, price: product.price, image: product.images?.[0] || '', slug: product.slug })
    toast.success('¡Agregado!')
  }

  return (
    <Link href={`/products/${product.slug}`}
      className="shrink-0 w-44 bg-white rounded-2xl overflow-hidden flex flex-col transition-all hover:-translate-y-1 hover:shadow-lg"
      style={{ border: '1px solid var(--border)' }}>
      <div className="relative bg-white flex items-center justify-center" style={{ height: '140px', padding: '10px' }}>
        {product.images?.[0]
          ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain" />
          : <div className="text-4xl opacity-20">📦</div>}
        {discount && discount > 0 && (
          <span className="absolute top-2 left-2 text-white text-xs font-black px-1.5 py-0.5 rounded-lg" style={{ background: '#dc2626', fontSize: '10px' }}>
            -{discount}%
          </span>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <p className="text-xs font-black uppercase mb-0.5" style={{ color: 'var(--accent)', fontSize: '10px' }}>{product.brand}</p>
        <p className="text-xs leading-snug line-clamp-2 flex-1 mb-2" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{product.name}</p>
        {product.oldPrice && <p className="text-xs line-through" style={{ color: 'var(--text-muted)' }}>{formatPrice(product.oldPrice)}</p>}
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm font-black" style={{ color: 'var(--accent)' }}>{formatPrice(product.price)}</p>
          <button onClick={handleAdd} disabled={product.stock === 0}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white transition-all hover:scale-110 disabled:opacity-40"
            style={{ background: 'var(--accent)' }}>
            <ShoppingCart size={14} />
          </button>
        </div>
      </div>
    </Link>
  )
}

interface Props { title: string; href: string; products: any[]; color?: string; bannerKey?: string }

export function CategorySection({ title, href, products, color = 'var(--accent)', bannerKey }: Props) {
  if (!products.length) return null
  const banner     = CATEGORY_BANNERS[bannerKey || title]
  const scrollRef  = useRef<HTMLDivElement>(null)
  const [canLeft,  setCanLeft]  = useState(false)
  const [canRight, setCanRight] = useState(true)

  const updateArrows = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateArrows()
    el.addEventListener('scroll', updateArrows, { passive: true })
    return () => el.removeEventListener('scroll', updateArrows)
  }, [updateArrows, products])

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'left' ? -600 : 600, behavior: 'smooth' })
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-6 rounded-full" style={{ background: color }} />
          <h2 className="text-base font-black" style={{ color: 'var(--text-primary)' }}>{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => scroll('left')} disabled={!canLeft}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-20 hover:scale-110"
            style={{ border: `1.5px solid ${color}`, color, background: `${color}12` }}>
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => scroll('right')} disabled={!canRight}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-20 hover:scale-110"
            style={{ border: `1.5px solid ${color}`, color, background: `${color}12` }}>
            <ChevronRight size={16} />
          </button>
          <Link href={href}
            className="flex items-center gap-1 text-xs font-black px-3 py-1.5 rounded-xl transition-all hover:scale-105"
            style={{ color, border: `1px solid ${color}`, background: `${color}10` }}>
            Ver todos <ChevronRight size={13} />
          </Link>
        </div>
      </div>

      {/* Carrusel */}
      <div className="flex gap-3 overflow-hidden relative">
        {banner && (() => {
          const Icon = banner.icon
          return (
            <Link href={href}
              className="shrink-0 w-44 rounded-2xl overflow-hidden relative flex flex-col justify-between transition-all hover:scale-[1.02] hover:shadow-2xl"
              style={{ background: banner.bg, minHeight: '320px' }}>

              {/* Fondo de puntos */}
              <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.05) 1px,transparent 1px)', backgroundSize: '16px 16px' }} />

              {/* Formas geométricas decorativas */}
              <div className="absolute top-0 left-0 right-0" style={{ height: '180px', background: banner.shape }} />
              <div className="absolute rounded-full" style={{ width: '160px', height: '160px', top: '-40px', right: '-40px', background: `${banner.accent}18`, border: `1px solid ${banner.accent}30` }} />
              <div className="absolute rounded-full" style={{ width: '80px', height: '80px', top: '30px', left: '-20px', background: `${banner.accent}10`, border: `1px solid ${banner.accent}20` }} />
              {/* Línea diagonal decorativa */}
              <div className="absolute" style={{ width: '2px', height: '90px', top: '40px', left: '50%', background: `linear-gradient(to bottom, ${banner.accent}60, transparent)`, transform: 'rotate(20deg)', borderRadius: '2px' }} />

              {/* Ícono central */}
              <div className="relative z-10 flex flex-col items-center justify-center pt-10 pb-4">
                <div className="rounded-2xl flex items-center justify-center mb-3"
                  style={{ width: '64px', height: '64px', background: `${banner.accent}22`, border: `1.5px solid ${banner.accent}50`, boxShadow: `0 0 24px ${banner.accent}30` }}>
                  <Icon size={30} color={banner.accent} strokeWidth={1.5} />
                </div>
                {/* Puntos decorativos */}
                <div className="flex gap-1.5 mt-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="rounded-full" style={{ width: '5px', height: '5px', background: i === 1 ? banner.accent : `${banner.accent}40` }} />
                  ))}
                </div>
              </div>

              {/* Texto inferior */}
              <div className="relative z-10 p-4">
                {/* Línea separadora */}
                <div className="mb-3" style={{ height: '1px', background: `linear-gradient(to right, ${banner.accent}60, transparent)` }} />
                <span className="inline-block text-xs font-black px-2 py-0.5 rounded-md mb-2"
                  style={{ background: `${banner.accent}25`, color: banner.accent, border: `1px solid ${banner.accent}40`, fontSize: '10px', letterSpacing: '0.05em' }}>
                  {banner.badge}
                </span>
                <p className="text-base font-black text-white leading-tight mb-1.5" style={{ whiteSpace: 'pre-line' }}>{banner.title}</p>
                <p className="text-xs leading-snug" style={{ color: 'rgba(255,255,255,0.55)', fontSize: '10px' }}>{banner.sub}</p>
                <div className="mt-3 flex items-center gap-1 text-xs font-black" style={{ color: banner.accent }}>
                  Ver todo <ChevronRight size={11} />
                </div>
              </div>
            </Link>
          )
        })()}

        <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {products.map(p => <MiniCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  )
}
