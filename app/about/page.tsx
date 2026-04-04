import { Heart, Zap, Shield, Users, Clock, MapPin, Phone, Mail } from 'lucide-react'

const VALUES = [
  { icon: Zap,    title: 'Innovación',   desc: 'Siempre a la vanguardia de las últimas tendencias tecnológicas.' },
  { icon: Shield, title: 'Honestidad',   desc: 'Transparencia en precios, productos y atención al cliente.' },
  { icon: Heart,  title: 'Pasión',       desc: 'Amamos la tecnología y eso se nota en cada producto que ofrecemos.' },
  { icon: Users,  title: 'Comunidad',    desc: 'Construimos una comunidad conectada por la innovación.' },
]

export default function AboutPage() {
  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>
      <div className='relative overflow-hidden' style={{ background: 'linear-gradient(160deg,#150030,#3b1075,#7c3aed)', minHeight: 220 }}>
        <div className='absolute inset-0' style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.05) 1px,transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className='relative max-w-4xl mx-auto px-6 py-16 text-center'>
          <p className='text-xs font-black uppercase tracking-widest mb-3' style={{ color: '#d8b4fe' }}>Empresa paraguaya · Asunción</p>
          <h1 className='text-4xl font-black text-white mb-4'>Quiénes somos</h1>
          <p className='text-lg' style={{ color: 'rgba(255,255,255,0.75)' }}>Tecnología que conecta. Innovación que inspira.</p>
        </div>
      </div>
      <div className='max-w-4xl mx-auto px-6 py-12 space-y-10'>
        <div className='bg-white rounded-2xl p-8' style={{ border: '1.5px solid var(--border)' }}>
          <h2 className='text-2xl font-black mb-5' style={{ color: 'var(--text-primary)' }}>Nuestra historia</h2>
          <div className='space-y-4 text-base leading-relaxed' style={{ color: 'var(--text-secondary)' }}>
            <p>En <strong style={{ color: 'var(--accent)' }}>Tecnovate</strong>, creemos que la tecnología transforma vidas. Nacimos del amor por la innovación y por la pasión de acercar lo mejor de la tecnología y la comunicación a las personas.</p>
            <p>Somos una empresa paraguaya comprometida en ofrecer novedades tecnológicas al mejor precio del mercado, con un enfoque en la calidad, la honestidad y la atención personalizada.</p>
            <p>Más que vender productos, queremos construir una comunidad conectada por la innovación. Seleccionamos cuidadosamente cada artículo, apostando siempre a marcas líderes y tendencias que potencien el día a día de nuestros clientes.</p>
            <p className='font-bold' style={{ color: 'var(--accent)' }}>Trabajamos cada día con un propósito claro: hacer que la tecnología sea accesible, emocionante y parte de tu vida.</p>
          </div>
        </div>
        <div>
          <h2 className='text-2xl font-black mb-6' style={{ color: 'var(--text-primary)' }}>Nuestros valores</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className='bg-white rounded-2xl p-6 flex gap-4' style={{ border: '1.5px solid var(--border)' }}>
                <div className='w-12 h-12 rounded-xl flex items-center justify-center shrink-0' style={{ background: 'var(--accent-bg)' }}>
                  <Icon size={22} style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <h3 className='font-black mb-1' style={{ color: 'var(--text-primary)' }}>{title}</h3>
                  <p className='text-sm' style={{ color: 'var(--text-secondary)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className='bg-white rounded-2xl p-8' style={{ border: '1.5px solid var(--border)' }}>
          <h2 className='text-xl font-black mb-5' style={{ color: 'var(--text-primary)' }}>Dónde encontrarnos</h2>
          <div className='grid sm:grid-cols-2 gap-4'>
            {[
              { icon: MapPin, label: 'Ubicación',value: 'Asunción, Paraguay — Envíos a todo el país' },
              { icon: Phone,  label: 'WhatsApp', value: '+595 971 117959' },
              { icon: Mail,   label: 'Email',    value: 'tecnovate.py@gmail.com' },
              { icon: Clock,  label: 'Horario',  value: 'Lun–Vie 8:00–18:00  |  Sáb 9:00–13:00' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className='flex items-center gap-3 p-4 rounded-xl' style={{ background: 'var(--bg-secondary)' }}>
                <Icon size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <div>
                  <p className='text-xs font-black uppercase' style={{ color: 'var(--text-muted)' }}>{label}</p>
                  <p className='text-sm font-semibold' style={{ color: 'var(--text-primary)' }}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className='rounded-2xl p-8 text-center' style={{ background: 'linear-gradient(135deg,#150030,#7c3aed)' }}>
          <p className='text-2xl font-black text-white mb-2'>Bienvenido a TECNOVATE</p>
          <p style={{ color: 'rgba(255,255,255,0.8)' }}>Tecnología que conecta. Innovación que inspira.</p>
        </div>
      </div>
    </div>
  )
}
