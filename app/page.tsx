import Link from 'next/link'
import { HeroSection } from '@/components/ui/HeroSection'
import { CategoryGrid, GamerBanner, PromosBanner, SectionTitle, INFO_ITEMS } from '@/components/ui/CategoryGrid'
import { ProductGrid } from '@/components/ui/ProductGrid'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function getHomeData() {
  try {
    const [featured, gaming, celulares, ofertas, notebooks] = await Promise.all([
      prisma.product.findMany({
        where: { featured: true, status: 'ACTIVE' },
        include: { category: { select: { name: true, slug: true } } },
        take: 8,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.findMany({
        where: { status: 'ACTIVE', category: { name: 'Gaming' } },
        include: { category: { select: { name: true, slug: true } } },
        take: 8,
        orderBy: { price: 'desc' },
      }),
      prisma.product.findMany({
        where: { status: 'ACTIVE', category: { name: 'Celulares' } },
        include: { category: { select: { name: true, slug: true } } },
        take: 8,
        orderBy: { price: 'desc' },
      }),
      prisma.product.findMany({
        where: { status: 'ACTIVE', oldPrice: { not: null } },
        include: { category: { select: { name: true, slug: true } } },
        take: 8,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.findMany({
        where: { status: 'ACTIVE', category: { name: 'Notebooks' } },
        include: { category: { select: { name: true, slug: true } } },
        take: 8,
        orderBy: { price: 'desc' },
      }),
    ])
    return { featured, gaming, celulares, ofertas, notebooks }
  } catch {
    return { featured: [], gaming: [], celulares: [], ofertas: [], notebooks: [] }
  }
}

export default async function HomePage() {
  const { featured, gaming, celulares, ofertas, notebooks } = await getHomeData()

  return (
    <div style={{ background: 'var(--bg-secondary)' }}>

      {/* Hero carousel */}
      <HeroSection />

      {/* Category icons */}
      <CategoryGrid />

      {/* Info bar */}
      <div className="bg-white border-y" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-2 md:grid-cols-4 gap-4">
          {INFO_ITEMS.map(({ Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3 py-1">
              <Icon />
              <div>
                <p className="text-sm" style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '13px' }}>{title}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ofertas */}
      {ofertas.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 rounded-full" style={{ background: 'var(--accent)' }} />
              <SectionTitle>🔥 Ofertas Especiales</SectionTitle>
            </div>
            <Link
              href="/products?sale=true"
              className="text-sm font-bold px-4 py-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--accent)', border: '1px solid var(--accent)', background: 'var(--accent-bg)' }}
            >
              Ver todas →
            </Link>
          </div>
          <ProductGrid products={ofertas} />
        </section>
      )}

      {/* Gamer Banner */}
      <GamerBanner />

      {/* Gaming */}
      {gaming.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 rounded-full" style={{ background: '#9b4fa6' }} />
              <SectionTitle>🎮 Zona Gaming</SectionTitle>
            </div>
            <Link
              href="/products?category=Gaming"
              className="text-sm font-bold px-4 py-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--accent)', border: '1px solid var(--accent)', background: 'var(--accent-bg)' }}
            >
              Ver todo →
            </Link>
          </div>
          <ProductGrid products={gaming} />
        </section>
      )}

      {/* Notebooks */}
      {notebooks.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 rounded-full" style={{ background: '#7b2d9e' }} />
              <SectionTitle>💻 Notebooks 2025</SectionTitle>
            </div>
            <Link
              href="/products?category=Notebooks"
              className="text-sm font-bold px-4 py-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--accent)', border: '1px solid var(--accent)', background: 'var(--accent-bg)' }}
            >
              Ver todos →
            </Link>
          </div>
          <ProductGrid products={notebooks} />
        </section>
      )}

      {/* Celulares */}
      {celulares.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 rounded-full" style={{ background: '#c47fcb' }} />
              <SectionTitle>📱 Celulares y Smartphones</SectionTitle>
            </div>
            <Link
              href="/products?category=Celulares"
              className="text-sm font-bold px-4 py-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--accent)', border: '1px solid var(--accent)', background: 'var(--accent-bg)' }}
            >
              Ver todos →
            </Link>
          </div>
          <ProductGrid products={celulares} />
        </section>
      )}

      {/* Promos banners */}
      <PromosBanner />

      {/* Destacados */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 rounded-full" style={{ background: '#d48fda' }} />
              <SectionTitle>⭐ Productos Destacados</SectionTitle>
            </div>
            <Link
              href="/products"
              className="text-sm font-bold px-4 py-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--accent)', border: '1px solid var(--accent)', background: 'var(--accent-bg)' }}
            >
              Ver todos →
            </Link>
          </div>
          <ProductGrid products={featured} />
        </section>
      )}

      {/* CTA final */}
      <section
        className="relative overflow-hidden py-16 my-6 mx-4 rounded-2xl"
        style={{ background: 'linear-gradient(135deg, #2d0a40 0%, #7b2d9e 50%, #b769bd 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}
        />
        <div className="relative max-w-xl mx-auto text-center text-white px-4">
          <div className="text-5xl mb-4">💜</div>
          <h2 className="text-3xl font-black mb-3">¿Necesitás asesoría?</h2>
          <p className="opacity-80 mb-6 text-sm leading-relaxed">
            Nuestro equipo de Ciudad del Este te ayuda a elegir el equipo ideal para tu presupuesto.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/contact"
              className="px-7 py-3 rounded-xl font-black text-sm transition-all hover:scale-105"
              style={{ background: 'white', color: '#7b2d9e' }}
            >
              Contactanos
            </Link>
            <Link
              href="/products"
              className="px-7 py-3 rounded-xl font-black text-sm border-2 transition-all hover:bg-white/10"
              style={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white' }}
            >
              Ver productos
            </Link>
          </div>
        </div>
      </section>

      <div className="pb-8" />
    </div>
  )
}
