import Link from 'next/link'
import { HeroSection } from '@/components/ui/HeroSection'
import { CategoryGrid, GamerBanner, SectionTitle } from '@/components/ui/CategoryGrid'
import { ProductGrid } from '@/components/ui/ProductGrid'
import { getFeaturedProducts } from '@/lib/products'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function getHomeData() {
  try {
    const [featured, gaming, celulares, ofertas] = await Promise.all([
      prisma.product.findMany({
        where: { featured: true, status: 'ACTIVE' },
        include: { category: { select: { name: true, slug: true } } },
        take: 8, orderBy: { createdAt: 'desc' },
      }),
      prisma.product.findMany({
        where: { status: 'ACTIVE', category: { name: 'Gaming' } },
        include: { category: { select: { name: true, slug: true } } },
        take: 8, orderBy: { price: 'desc' },
      }),
      prisma.product.findMany({
        where: { status: 'ACTIVE', category: { name: 'Celulares' } },
        include: { category: { select: { name: true, slug: true } } },
        take: 8, orderBy: { price: 'desc' },
      }),
      prisma.product.findMany({
        where: { status: 'ACTIVE', oldPrice: { not: null } },
        include: { category: { select: { name: true, slug: true } } },
        take: 8, orderBy: { createdAt: 'desc' },
      }),
    ])
    return { featured, gaming, celulares, ofertas }
  } catch {
    return { featured: [], gaming: [], celulares: [], ofertas: [] }
  }
}

export default async function HomePage() {
  const { featured, gaming, celulares, ofertas } = await getHomeData()

  return (
    <div>
      <HeroSection />
      <CategoryGrid />

      {/* Info bar - Nissei style */}
      <div className="bg-white border-y" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🚚', title: 'Envío Express', desc: 'Ciudad del Este mismo día' },
            { icon: '💳', title: 'Pagos seguros', desc: 'Bancard · PayPal · Efectivo' },
            { icon: '🔄', title: 'Devoluciones', desc: '30 días sin preguntas' },
            { icon: '🛡️', title: 'Garantía oficial', desc: 'Todos los productos' },
          ].map(item => (
            <div key={item.title} className="flex items-center gap-3 py-1">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="text-sm font-700" style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '13px' }}>{item.title}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ofertas */}
      {ofertas.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>🔥 Ofertas Especiales</SectionTitle>
            <Link href="/products?sale=true" className="text-sm font-600" style={{ color: 'var(--accent)', fontWeight: 600 }}>
              Ver todas →
            </Link>
          </div>
          <ProductGrid products={ofertas} />
        </section>
      )}

      <GamerBanner />

      {/* Gaming */}
      {gaming.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>🎮 Zona Gaming</SectionTitle>
            <Link href="/products?category=Gaming" className="text-sm font-600" style={{ color: 'var(--accent)', fontWeight: 600 }}>
              Ver todo →
            </Link>
          </div>
          <ProductGrid products={gaming} />
        </section>
      )}

      {/* Celulares */}
      {celulares.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>📱 Celulares y Smartphones</SectionTitle>
            <Link href="/products?category=Celulares" className="text-sm font-600" style={{ color: 'var(--accent)', fontWeight: 600 }}>
              Ver todos →
            </Link>
          </div>
          <ProductGrid products={celulares} />
        </section>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>⭐ Productos Destacados</SectionTitle>
            <Link href="/products" className="text-sm font-600" style={{ color: 'var(--accent)', fontWeight: 600 }}>
              Ver todos →
            </Link>
          </div>
          <ProductGrid products={featured} />
        </section>
      )}

      {/* Banner */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/products?category=Notebooks" className="rounded-xl overflow-hidden relative flex items-center p-6 hover:-translate-y-1 transition-transform" style={{ background: 'linear-gradient(135deg, #1a3a6e, #0a1a3e)', minHeight: '160px' }}>
            <div>
              <p className="text-xs font-700 mb-1" style={{ color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase' }}>Últimos modelos</p>
              <h3 className="text-xl font-900 text-white mb-2" style={{ fontWeight: 900 }}>Notebooks 2025</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>Intel Core Ultra · AMD Ryzen AI</p>
            </div>
            <span className="absolute right-6 text-6xl opacity-20">💻</span>
          </Link>
          <Link href="/products?category=Componentes&q=rtx" className="rounded-xl overflow-hidden relative flex items-center p-6 hover:-translate-y-1 transition-transform" style={{ background: 'linear-gradient(135deg, #3d1a5c, #1a0a2e)', minHeight: '160px' }}>
            <div>
              <p className="text-xs font-700 mb-1" style={{ color: '#d48fda', fontWeight: 700, textTransform: 'uppercase' }}>RTX 50 Series</p>
              <h3 className="text-xl font-900 text-white mb-2" style={{ fontWeight: 900 }}>Tarjetas Gráficas</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>La nueva generación ya llegó</p>
            </div>
            <span className="absolute right-6 text-6xl opacity-20">🎮</span>
          </Link>
        </div>
      </section>
    </div>
  )
}
