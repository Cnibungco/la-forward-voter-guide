import {describe, expect, it} from 'vitest'

import {censusAddressFromFeature} from './geoapifyAddress'

describe('censusAddressFromFeature', () => {
  it('builds a Census-friendly line from structured components', () => {
    expect(
      censusAddressFromFeature({
        housenumber: '969',
        street: 'Marview Avenue',
        city: 'Los Angeles',
        state_code: 'CA',
        postcode: '90012',
        formatted: '969 Marview Avenue, Angeleno Heights, Echo Park, Los Angeles, CA 90012, United States of America',
      }),
    ).toBe('969 Marview Avenue, Los Angeles, CA 90012')
  })

  it('keeps a typed house number on a street that OSM only knows by name', () => {
    expect(
      censusAddressFromFeature({
        housenumber: '1004',
        street: 'Dore Street',
        city: 'West Covina',
        state_code: 'CA',
        postcode: '91792',
      }),
    ).toBe('1004 Dore Street, West Covina, CA 91792')
  })

  it('falls back to formatted, stripping the country suffix', () => {
    expect(
      censusAddressFromFeature({
        formatted: '969 Marview Avenue, Los Angeles, CA 90012, United States of America',
      }),
    ).toBe('969 Marview Avenue, Los Angeles, CA 90012')
  })

  it('returns null when there is nothing usable', () => {
    expect(censusAddressFromFeature(null)).toBeNull()
    expect(censusAddressFromFeature(undefined)).toBeNull()
    expect(censusAddressFromFeature({})).toBeNull()
    expect(censusAddressFromFeature({formatted: 'United States of America'})).toBeNull()
  })

  it('coerces numeric housenumber and postcode from Geoapify', () => {
    expect(
      censusAddressFromFeature({
        housenumber: 969,
        street: 'Marview Avenue',
        city: 'Los Angeles',
        state_code: 'CA',
        postcode: 90012,
      }),
    ).toBe('969 Marview Avenue, Los Angeles, CA 90012')
  })

  it('falls back to state when state_code is missing', () => {
    expect(
      censusAddressFromFeature({
        housenumber: '200',
        street: 'N Spring St',
        city: 'Los Angeles',
        state: 'CA',
        postcode: '90012',
      }),
    ).toBe('200 N Spring St, Los Angeles, CA 90012')
  })

  it('omits a whitespace-only housenumber from the structured line', () => {
    expect(
      censusAddressFromFeature({
        housenumber: '  ',
        street: 'Marview Avenue',
        city: 'Los Angeles',
        state_code: 'CA',
        postcode: '90012',
      }),
    ).toBe('Marview Avenue, Los Angeles, CA 90012')
  })

  it('falls back to formatted when structured components are all blank', () => {
    expect(
      censusAddressFromFeature({
        housenumber: '  ',
        street: '',
        city: '  ',
        formatted: '969 Marview Avenue, Los Angeles, CA 90012, United States',
      }),
    ).toBe('969 Marview Avenue, Los Angeles, CA 90012')
  })
})
