import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import TabBar from '@/components/layout/TabBar'
import Header from '@/components/layout/Header'
import SyncProvider from '@/components/SyncProvider'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const viewport = {
  themeColor: '#17B29F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'Stitch Finance App',
  description: 'Aplicativo de gestão financeira pessoal PWA simplificado e Delta Zero',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#17B29F" />
      </head>
      <body className="bg-slate-50 text-slate-900 mx-auto max-w-md min-h-screen relative flex flex-col antialiased shadow-xl sm:overflow-hidden">
        {/* Usamos max-w-md para simular uma tela de celular no Desktop. Em mobile real ocupará 100%. */}

        <Header />

        <SyncProvider>
          {/* Main Content Area */}
          <main className="flex-1 w-full overflow-y-auto no-scrollbar pb-24 pt-16 bg-white rounded-t-3xl sm:-mt-2 relative z-10">
            {children}
          </main>

          {/* Bottom Navigation Control */}
          <TabBar />
        </SyncProvider>

      </body>
    </html>
  )
}
