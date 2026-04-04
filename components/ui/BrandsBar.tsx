import Link from 'next/link'

// Orden: Gaming → Tecnología e Informática → Resto
const BRANDS = [
  // ── Gaming ──────────────────────────────────────────────────────
  { name: 'Razer',             img: '/brands/razer.png',            href: '/products?brand=RAZER' },
  { name: 'Redragon',          img: '/brands/redragon.png',         href: '/products?brand=REDRAGON' },
  { name: 'Corsair',           img: '/brands/corsair.png',          href: '/products?brand=CORSAIR' },
  { name: 'MSI',               img: '/brands/msi.png',              href: '/products?brand=MSI' },
  { name: 'ASUS',              img: '/brands/asus.png',             href: '/products?brand=ASUS' },
  { name: 'Gigabyte',          img: '/brands/gigabyte.png',         href: '/products?brand=GIGABYTE' },
  { name: 'Patriot',           img: '/brands/patriot.png',          href: '/products?brand=PATRIOT' },
  { name: 'Nintendo',          img: '/brands/nintendo.png',         href: '/products?brand=NINTENDO' },
  // ── Tecnología e Informática ────────────────────────────────────
  { name: 'Apple',             img: '/brands/apple.png',            href: '/products?brand=APPLE' },
  { name: 'Samsung',           img: '/brands/samsung.png',          href: '/products?brand=SAMSUNG' },
  { name: 'Xiaomi',            img: '/brands/xiaomi.png',           href: '/products?brand=XIAOMI' },
  { name: 'Sony',              img: '/brands/sony.png',             href: '/products?brand=SONY' },
  { name: 'Lenovo',            img: '/brands/lenovo.png',           href: '/products?brand=LENOVO' },
  { name: 'HP',                img: '/brands/hp.png',               href: '/products?brand=HP' },
  { name: 'Acer',              img: '/brands/acer.png',             href: '/products?brand=ACER' },
  { name: 'Motorola',          img: '/brands/motorola.png',         href: '/products?brand=MOTOROLA' },
  { name: 'Kingston',          img: '/brands/kingston.png',         href: '/products?brand=KINGSTON' },
  { name: 'SanDisk',           img: '/brands/sandisk.png',          href: '/products?brand=SANDISK' },
  { name: 'TP-Link',           img: '/brands/tp-link.png',          href: '/products?brand=TP-LINK' },
  { name: 'JBL',               img: '/brands/jbl.png',              href: '/products?brand=JBL' },
  // ── Otros ───────────────────────────────────────────────────────
  { name: 'Creality',          img: '/brands/creality.png',         href: '/products?brand=CREALITY' },
  { name: 'Lattafa',           img: '/brands/lattafa.png',          href: '/products?brand=LATTAFA' },
  { name: 'Maison',            img: '/brands/maison.png',           href: '/products?brand=MAISON' },
  { name: 'Armaf',             img: '/brands/armaf.png',            href: '/products?brand=ARMAF' },
  { name: "Victoria's Secret", img: '/brands/victorias-secret.png', href: "/products?brand=VICTORIA'S SECRET" },
]

export function BrandsBar() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-4">
      <style>{`
        @keyframes brandScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .brand-track {
          display: flex;
          gap: 12px;
          animation: brandScroll 30s linear infinite;
          width: max-content;
        }
        .brand-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="bg-white rounded-2xl px-5 py-4" style={{ border: '1px solid var(--border)' }}>
        {/* Título centrado */}
        <p className="text-xs font-black uppercase tracking-widest text-center mb-4" style={{ color: 'var(--text-muted)' }}>
          Marcas disponibles
        </p>

        {/* Carrusel automático con overflow oculto */}
        <div style={{ overflow: 'hidden', position: 'relative' }}>
          {/* Degradados laterales para efecto fade */}
          <div className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none" style={{ width: 40, background: 'linear-gradient(to right, white, transparent)' }} />
          <div className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none" style={{ width: 40, background: 'linear-gradient(to left, white, transparent)' }} />

          <div className="brand-track">
            {/* Duplicamos para loop infinito sin salto */}
            {[...BRANDS, ...BRANDS].map((b, i) => (
              <Link
                key={i}
                href={b.href}
                title={b.name}
                className="shrink-0 flex items-center justify-center rounded-xl transition-all hover:scale-105 hover:shadow-md"
                style={{ width: 72, height: 72, border: '1.5px solid var(--border)', background: 'white', padding: '6px' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.img} alt={b.name} style={{ width: 60, height: 60, objectFit: 'contain' }} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
