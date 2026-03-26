import Link from 'next/link'
import { HeroSection }     from '@/components/ui/HeroSection'
import { CategoryGrid, GamerBanner, PromosBanner } from '@/components/ui/CategoryGrid'
import { InfoBar }         from '@/components/ui/InfoBar'
import { BrandsBar }       from '@/components/ui/BrandsBar'
import { CategorySection } from '@/components/ui/CategorySection'
import { prisma }          from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function getHomeData() {
  try {
    const [ofertas, celulares, gaming, notebooks, componentes, destacados] = await Promise.all([
      prisma.product.findMany({ where: { status: 'ACTIVE', oldPrice: { not: null } },             include: { category: { select: { name: true, slug: true } } }, take: 12, orderBy: { createdAt: 'desc' } }),
      prisma.product.findMany({ where: { status: 'ACTIVE', category: { name: 'Celulares' } },     include: { category: { select: { name: true, slug: true } } }, take: 12, orderBy: { price: 'desc' } }),
      prisma.product.findMany({ where: { status: 'ACTIVE', category: { name: 'Gaming' } },        include: { category: { select: { name: true, slug: true } } }, take: 12, orderBy: { price: 'desc' } }),
      prisma.product.findMany({ where: { status: 'ACTIVE', category: { name: 'Notebooks' } },     include: { category: { select: { name: true, slug: true } } }, take: 12, orderBy: { price: 'desc' } }),
      prisma.product.findMany({ where: { status: 'ACTIVE', category: { name: 'Componentes' } },   include: { category: { select: { name: true, slug: true } } }, take: 12, orderBy: { price: 'desc' } }),
      prisma.product.findMany({ where: { status: 'ACTIVE', featured: true },                      include: { category: { select: { name: true, slug: true } } }, take: 12, orderBy: { createdAt: 'desc' } }),
    ])
    return { ofertas, celulares, gaming, notebooks, componentes, destacados }
  } catch {
    return { ofertas: [], celulares: [], gaming: [], notebooks: [], componentes: [], destacados: [] }
  }
}

export default async function HomePage() {
  const { ofertas, celulares, gaming, notebooks, componentes, destacados } = await getHomeData()

  return (
    <div style={{ background: 'var(--bg-secondary)' }}>

      {/* Hero 380px fijo */}
      <HeroSection />

      {/* Categorías */}
      <CategoryGrid />

      {/* Info bar */}
      <InfoBar />

      {/* Ofertas */}
      <CategorySection title="Ofertas Especiales"       href="/products?sale=true"             products={ofertas}     color="#dc2626"  bannerKey="Ofertas"     />

      {/* Banner Zona Gamer */}
      <GamerBanner />

      {/* Celulares */}
      <CategorySection title="Celulares y Smartphones"  href="/products?category=Celulares"    products={celulares}   color="#7b2d9e"  bannerKey="Celulares"   />

      {/* Gaming */}
      <CategorySection title="Zona Gaming"              href="/products?category=Gaming"       products={gaming}      color="#9b4fa6"  bannerKey="Gaming"      />

      {/* Notebooks */}
      <CategorySection title="Notebooks 2025"           href="/products?category=Notebooks"    products={notebooks}   color="#b769bd"  bannerKey="Notebooks"   />

      {/* Marcas */}
      <BrandsBar />

      {/* Componentes */}
      <CategorySection title="Componentes PC"           href="/products?category=Componentes"  products={componentes} color="#7b2d9e"  bannerKey="Componentes" />

      {/* Banners promo */}
      <PromosBanner />

      {/* Destacados */}
      <CategorySection title="Productos Destacados"     href="/products"                       products={destacados}  color="#d48fda"  bannerKey="Destacados"  />

      {/* CTA */}
      <section className="relative overflow-hidden py-14 my-5 mx-4 rounded-2xl"
        style={{ background: 'linear-gradient(135deg, #2d0a40 0%, #7b2d9e 50%, #b769bd 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative max-w-xl mx-auto text-center text-white px-4">
          <h2 className="text-3xl font-black mb-3">¿Necesitás asesoría?</h2>
          <p className="opacity-80 mb-6 text-sm leading-relaxed">
            Nuestro equipo de Ciudad del Este te ayuda a elegir el equipo ideal para tu presupuesto.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/contact" className="px-7 py-3 rounded-xl font-black text-sm transition-all hover:scale-105"
              style={{ background: 'white', color: '#7b2d9e' }}>
              Contactanos
            </Link>
            <Link href="/products" className="px-7 py-3 rounded-xl font-black text-sm border-2 transition-all hover:bg-white/10"
              style={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white' }}>
              Ver productos
            </Link>
          </div>
        </div>
      </section>

      <div className="pb-8" />
    </div>
  )
}
