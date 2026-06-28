import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { BrandIntroCurtain } from '@/components/brand-intro-curtain'
import { GrainOverlay } from '@/components/grain-overlay'
import { Providers } from '@/app/providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

// TODO(client): set the site-wide title, description and favicon/app icons.
export const metadata: Metadata = {
  title: '{{BRAND_NAME}} — {{TAGLINE}}',
  description: '{{SITE_DESCRIPTION}}',
  icons: {
    // TODO(client): replace these with the client's favicon / app icon assets.
    icon: '/images/logo-mark-dark.png',
    apple: '/images/logo-mark-dark@2x.png',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <Providers>
          <BrandIntroCurtain />
          <GrainOverlay />
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
