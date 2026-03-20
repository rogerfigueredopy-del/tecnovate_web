import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Providers } from '@/components/Providers'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Tecnovate - Tecnología de Primera en Paraguay',
  description: 'Computadoras, notebooks, gaming, celulares y más. Envíos a todo Paraguay.',
  keywords: 'tecnología, computadoras, gaming, Paraguay, Ciudad del Este',
  openGraph: {
    title: 'Tecnovate',
    description: 'Tecnología de Primera en Paraguay',
    siteName: 'Tecnovate',
    locale: 'es_PY',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>
          <div style={{ minHeight: '100vh', background: '#f7f7fc', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              {children}
            </main>
            <Footer />
          </div>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'white',
                color: '#1a1a2e',
                border: '1px solid #e8e8f2',
                borderRadius: '10px',
                fontSize: '14px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              },
              success: {
                iconTheme: { primary: '#b769bd', secondary: 'white' },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
