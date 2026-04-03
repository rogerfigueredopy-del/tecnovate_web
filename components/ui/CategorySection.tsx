'use client'
import Link from 'next/link'
import { useRef, useState, useEffect, useCallback } from 'react'
import { ShoppingCart, ChevronRight, ChevronLeft } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

const CATEGORY_BANNERS: Record<string, { bg: string; title: string; sub: string; badge: string; img?: string }> = {
  Celulares:   { bg: 'linear-gradient(135deg,#0a0a1a,#1a0a30,#3d1060)', badge: 'NUEVO',  title: 'iPhone 17\nPro Max',        sub: 'Chip A19 Pro · Titanio · 5G',         img: '/banners/cat-celulares.png' },
  Gaming:      { bg: 'linear-gradient(135deg,#0a0020,#1a0040,#4a0a70)', badge: 'RTX 50', title: 'Zona\nGaming',              sub: 'Notebooks · GPUs · Accesorios',        img: '/banners/cat-gaming.png' },
  Notebooks:   { bg: 'linear-gradient(135deg,#1a0030,#3d1060,#7b2d9e)', badge: '2025',   title: 'MacBook\nPro M4',           sub: 'Intel Ultra · AMD Ryzen AI',           img: '/banners/cat-notebooks.png' },
  Componentes: { bg: 'linear-gradient(135deg,#0d0020,#2d0060,#5b1a9e)', badge: 'STOCK',  title: 'Armá\ntu PC',               sub: 'CPU · GPU · RAM · SSD',               img: '/banners/cat-componentes.png' },
  Monitores:   { bg: 'linear-gradient(135deg,#0a1020,#1a2040,#2d4080)', badge: '4K',     title: 'Monitores\nOLED',           sub: '144Hz · IPS · Curvo' },
  Accesorios:  { bg: 'linear-gradient(135deg,#0a0a1a,#1a0a30,#2d1060)', badge: 'VR',     title: 'Meta Quest\n3S & 3',        sub: 'Realidad Virtual · Lentes VR',         img: '/banners/cat-accesorios.png' },
  Networking:  { bg: 'linear-gradient(135deg,#001a0a,#003d20,#0a7b50)', badge: 'WIFI 6', title: 'Networking\n& Smart Home',  sub: 'Routers · Cámaras · Tablets',          img: '/banners/cat-networking.png' },
  Impresoras:  { bg: 'linear-gradient(135deg,#1a0a00,#3d2000,#7b4a00)', badge: '3D',     title: 'Impresoras\n& Filamentos',  sub: 'Creality · HP · Epson',               img: '/banners/cat-impresoras.png' },
  Ofertas:     { bg: 'linear-gradient(135deg,#200010,#4a0020,#9b1a50)', badge: '-30%',   title: 'Ofertas\nEspeciales',       sub: 'Precios increíbles · Stock limitado' },
  Destacados:  { bg: 'linear-gradient(135deg,#0a0a20,#1a1040,#3d2080)', badge: '★',      title: 'Productos\nDestacados',     sub: 'Lo mejor de nuestra tienda' },
  Perfumes:    { bg: 'linear-gradient(135deg,#1a000a,#3d0a20,#7b1a50)', badge: 'SALE',   title: 'Perfumes\ny Fragancias',    sub: 'Lattafa · Maison · Armaf',             img: '/banners/cat-perfumes.png' },
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
          {/* Flechas */}
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
        {banner && (
          <Link href={href}
            className="shrink-0 w-44 rounded-2xl overflow-hidden relative flex flex-col justify-end p-4 transition-all hover:scale-[1.02]"
            style={{ background: banner.bg, minHeight: '320px' }}>
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.06) 1px,transparent 1px)', backgroundSize: '18px 18px' }} />
            {banner.img && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={banner.img} alt={banner.title} className="absolute inset-0 w-full h-full object-cover object-center" style={{ opacity: 0.55 }} />
            )}
            <div className="absolute top-0 right-0 w-full h-1/2" style={{ background: 'radial-gradient(ellipse at top right,rgba(183,105,189,0.35),transparent 70%)' }} />
            <div className="relative z-10">
              <span className="inline-block text-xs font-black px-2 py-0.5 rounded-lg mb-3" style={{ background: 'rgba(255,255,255,0.18)', color: 'white', border: '1px solid rgba(255,255,255,0.25)' }}>
                {banner.badge}
              </span>
              <p className="text-lg font-black text-white leading-tight mb-1" style={{ whiteSpace: 'pre-line' }}>{banner.title}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>{banner.sub}</p>
              <div className="mt-3 text-xs font-black text-white opacity-60">Ver →</div>
            </div>
          </Link>
        )}

        <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {products.map(p => <MiniCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  )
}
