import Link from 'next/link'
import { HeroSection }       from '@/components/ui/HeroSection'
import { GamerBanner }       from '@/components/ui/CategoryGrid'
import { InfoBar }           from '@/components/ui/InfoBar'
import { BrandsBar }         from '@/components/ui/BrandsBar'
import { CategorySection }   from '@/components/ui/CategorySection'
import { MasonrySection }    from '@/components/ui/MasonrySection'
import { prisma }            from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function getHomeData() {
  try {
    const [ofertas, celulares, gaming, notebooks, componentes, accesorios, networking, impresoras, perfumes] = await Promise.all([
      prisma.product.findMany({ where: { status:'ACTIVE', oldPrice:{ not:null } },                                           include:{ category:{ select:{ name:true, slug:true } } }, take:16, orderBy:{ createdAt:'desc' } }),
      prisma.product.findMany({ where: { status:'ACTIVE', category:{ name:'Celulares' } },                                   include:{ category:{ select:{ name:true, slug:true } } }, take:16, orderBy:{ price:'desc' } }),
      prisma.product.findMany({ where: { status:'ACTIVE', category:{ name:'Gaming' } },                                      include:{ category:{ select:{ name:true, slug:true } } }, take:16, orderBy:{ price:'desc' } }),
      prisma.product.findMany({ where: { status:'ACTIVE', category:{ name:'Notebooks' } },                                   include:{ category:{ select:{ name:true, slug:true } } }, take:16, orderBy:{ price:'desc' } }),
      prisma.product.findMany({ where: { status:'ACTIVE', category:{ name:'Componentes PC' } },                              include:{ category:{ select:{ name:true, slug:true } } }, take:16, orderBy:{ price:'desc' } }),
      prisma.product.findMany({ where: { status:'ACTIVE', category:{ name:'Accesorios' }, NOT:{ name:{ contains:'perfume', mode:'insensitive' } } }, include:{ category:{ select:{ name:true, slug:true } } }, take:16, orderBy:{ createdAt:'desc' } }),
      prisma.product.findMany({ where: { status:'ACTIVE', category:{ name:'Networking' } },                                  include:{ category:{ select:{ name:true, slug:true } } }, take:16, orderBy:{ price:'desc' } }),
      prisma.product.findMany({ where: { status:'ACTIVE', category:{ name:'Impresoras' } },                                  include:{ category:{ select:{ name:true, slug:true } } }, take:16, orderBy:{ price:'desc' } }),
      prisma.product.findMany({ where: { status:'ACTIVE', name:{ contains:'perfume', mode:'insensitive' } },                 include:{ category:{ select:{ name:true, slug:true } } }, take:16, orderBy:{ createdAt:'desc' } }),
    ])
    return { ofertas, celulares, gaming, notebooks, componentes, accesorios, networking, impresoras, perfumes }
  } catch {
    return { ofertas:[], celulares:[], gaming:[], notebooks:[], componentes:[], accesorios:[], networking:[], impresoras:[], perfumes:[] }
  }
}

export default async function HomePage() {
  const { ofertas, celulares, gaming, notebooks, componentes, accesorios, networking, impresoras, perfumes } = await getHomeData()

  // Masonry: mezcla de varias categorías para la sección visual
  const masonryProducts = [
    ...gaming.slice(0, 3),
    ...celulares.slice(0, 2),
    ...notebooks.slice(0, 2),
    ...componentes.slice(0, 2),
    ...accesorios.slice(0, 2),
  ].slice(0, 9)

  return (
    <div style={{ background: 'var(--bg-secondary)' }}>

      <HeroSection />
      <InfoBar />

      <CategorySection title="Ofertas Especiales"        href="/products?sale=true"              products={ofertas}      color="#dc2626"  bannerKey="Ofertas"      />
      <GamerBanner />
      <CategorySection title="Celulares y Smartphones"   href="/products?category=Celulares"     products={celulares}    color="#7b2d9e"  bannerKey="Celulares"    />
      <CategorySection title="Zona Gaming"               href="/products?category=Gaming"        products={gaming}       color="#9b4fa6"  bannerKey="Gaming"       />
      <CategorySection title="Notebooks 2025"            href="/products?category=Notebooks"     products={notebooks}    color="#b769bd"  bannerKey="Notebooks"    />

      <BrandsBar />

      <CategorySection title="Componentes PC"            href="/products?category=Componentes"   products={componentes}  color="#7b2d9e"  bannerKey="Componentes"  />

      {/* Sección masonry estilo outlet */}
      <MasonrySection products={masonryProducts} />

      <CategorySection title="Perfumes y Fragancias"     href="/products?q=perfume"              products={perfumes}     color="#c2185b"  bannerKey="Accesorios"   />
      <CategorySection title="Accesorios"                href="/products?category=Accesorios"    products={accesorios}   color="#9b4fa6"  bannerKey="Accesorios"   />
      <CategorySection title="Networking y Smart Home"   href="/products?category=Networking"    products={networking}   color="#0a7b50"  bannerKey="Networking"   />
      <CategorySection title="Impresoras y 3D"           href="/products?category=Impresoras"    products={impresoras}   color="#bf6c00"  bannerKey="Impresoras"   />

      {/* CTA */}
      <section className="relative overflow-hidden py-14 my-5 mx-4 rounded-2xl"
        style={{ background: 'linear-gradient(135deg,#2d0a40,#7b2d9e,#b769bd)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle,white 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative max-w-xl mx-auto text-center text-white px-4">
          <h2 className="text-3xl font-black mb-3">¿Necesitás asesoría?</h2>
          <p className="opacity-80 mb-6 text-sm leading-relaxed">Nuestro equipo de Ciudad del Este te ayuda a elegir el equipo ideal para tu presupuesto.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/contact" className="px-7 py-3 rounded-xl font-black text-sm transition-all hover:scale-105" style={{ background:'white', color:'#7b2d9e' }}>
              Contactanos
            </Link>
            <Link href="/products" className="px-7 py-3 rounded-xl font-black text-sm border-2 transition-all hover:bg-white/10" style={{ borderColor:'rgba(255,255,255,0.4)', color:'white' }}>
              Ver productos
            </Link>
          </div>
        </div>
      </section>

      <div className="pb-8" />
    </div>
  )
}
