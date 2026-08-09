import {Fraunces, Public_Sans} from 'next/font/google'

import './globals.css'

const headingFont = Fraunces({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['500', '600', '700'],
})

const bodyFont = Public_Sans({
  subsets: ['latin'],
  variable: '--font-body',
})

export const metadata = {
  title: 'LA Forward Voter Guide',
  description: "LA Forward's endorsements and analysis for upcoming races and ballot measures.",
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body>{children}</body>
    </html>
  )
}
