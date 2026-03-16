import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Providers } from '@/components/Providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tecnovate - Tecnología de Primera en Paraguay',
  description: 'Computadoras, notebooks, gaming, celulares y más. Envíos a todo Paraguay.',
  keywords: 'tecnología, computadoras, gaming, Paraguay, Ciudad del Este',
  openGraph: {
    title: 'Tecnovate',
    description: 'Tecnología de Primera en Paraguay',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'Tecnovate',
    locale: 'es_PY',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#1a1a26',
                color: '#e8e8f0',
                border: '1px solid #2a2a3e',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
