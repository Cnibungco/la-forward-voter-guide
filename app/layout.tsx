import {GoogleAnalytics} from '@next/third-parties/google'
import {Barlow_Condensed, Work_Sans} from 'next/font/google'

import {CampaignDisclaimer} from '@/components/CampaignDisclaimer'
import {DonatePrompt} from '@/components/DonatePrompt'
import {MatchProvider} from '@/components/MatchProvider'
import {SiteHeader} from '@/components/SiteHeader'
import {VercelAnalytics} from '@/components/VercelAnalytics'

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

export const metadata = {
  title: 'LA Forward Voter Guide',
  description: "LA Forward's endorsements and analysis for upcoming races and ballot measures.",
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
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
