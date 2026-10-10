import {GoogleAnalytics} from '@next/third-parties/google'
import type {Metadata} from 'next'
import {Barlow_Condensed, Work_Sans} from 'next/font/google'

import {CampaignDisclaimer} from '@/components/CampaignDisclaimer'
import {DonatePrompt} from '@/components/DonatePrompt'
import {JsonLd} from '@/components/JsonLd'
import {MatchProvider} from '@/components/MatchProvider'
import {SiteHeader} from '@/components/SiteHeader'
import {VercelAnalytics} from '@/components/VercelAnalytics'
import {
  HERO_IMAGE_ALT,
  HERO_IMAGE_HEIGHT,
  HERO_IMAGE_SRC,
  HERO_IMAGE_WIDTH,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from '@/lib/copy'
import {siteStructuredData} from '@/lib/seo'

import './globals.css'

const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim()

const headingFont = Barlow_Condensed({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['600', '700', '800'],
})

const bodyFont = Work_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    siteName: SITE_NAME,
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: HERO_IMAGE_SRC,
        width: HERO_IMAGE_WIDTH,
        height: HERO_IMAGE_HEIGHT,
        alt: HERO_IMAGE_ALT,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: [HERO_IMAGE_SRC],
  },
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <JsonLd data={siteStructuredData()} />
        <MatchProvider>
          <SiteHeader />
          {children}
          <DonatePrompt />
        </MatchProvider>
        <footer>
          <CampaignDisclaimer />
        </footer>
        <VercelAnalytics />
      </body>
      {gaId && process.env.NODE_ENV === 'production' && (
        <GoogleAnalytics gaId={gaId} />
      )}
    </html>
  )
}
