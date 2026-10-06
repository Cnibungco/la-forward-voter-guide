import {describe, expect, it} from 'vitest'

import {CAMPAIGN_DISCLAIMER} from '@/lib/copy'

describe('CAMPAIGN_DISCLAIMER', () => {
  it('keeps the counsel wording, including the donor line', () => {
    expect(CAMPAIGN_DISCLAIMER).toMatchObject({
      paidForPrefix: 'Paid for LA Forward Action Fund, ',
      address: '2012 Business Center Dr #130 Irvine, CA 92612',
      majorFundingBy: 'Major Funding by:',
      donor: 'Elizabeth Thomas in the amount of $5,000',
      notAuthorized: 'Not Authorized by any candidate or a committee controlled by a candidate.',
      fundingDetailsPrefix: 'Funding details at ',
      ethicsLabel: 'ethics.lacity.gov',
      ethicsHref: 'https://ethics.lacity.gov',
    })
  })

  it('keeps the street # inside the maps query instead of ending the URL', () => {
    const href = CAMPAIGN_DISCLAIMER.addressHref
    expect(href.startsWith('https://www.google.com/maps/search/?')).toBe(true)
    expect(href.includes('#')).toBe(false)
    expect(href.includes('%23130')).toBe(true)
  })
})
