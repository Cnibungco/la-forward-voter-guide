import {GoogleAnalytics} from '@next/third-parties/google'
import type {Metadata} from 'next'
import {Barlow_Condensed, Work_Sans} from 'next/font/google'

import {CampaignDisclaimer} from '@/components/CampaignDisclaimer'
import {DonatePrompt} from '@/components/DonatePrompt'
import {JsonLd} from '@/components/JsonLd'
import {MatchProvider} from '@/components/MatchProvider'
import {SiteHeader} from '@/components/SiteHeader'
import {SITE_NAME, SITE_URL, headerTagline, siteDescription, siteTitle} from '@/lib/copy'
import {getGuide} from '@/lib/guide'
import {siteStructuredData} from '@/lib/seo'
import {resolvedElectionName} from '@/lib/siteSettings'

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

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const {settings} = await getGuide()
  const electionName = resolvedElectionName(settings)
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: siteTitle(electionName),
      template: `%s · ${SITE_NAME}`,
    },
    description: siteDescription(electionName),
    applicationName: SITE_NAME,
    openGraph: {
      siteName: SITE_NAME,
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
    },
  }
}

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const {settings} = await getGuide()
  const electionName = resolvedElectionName(settings)
  const description = siteDescription(electionName)

  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <JsonLd data={siteStructuredData(description)} />
        <MatchProvider>
          <SiteHeader tagline={headerTagline(electionName)} />
          {children}
          <DonatePrompt />
        </MatchProvider>
        <footer>
          <CampaignDisclaimer />
        </footer>
      </body>
      {gaId && process.env.NODE_ENV === 'production' && (
        <GoogleAnalytics gaId={gaId} />
      )}
    </html>
  )
}
