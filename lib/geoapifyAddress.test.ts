import {describe, expect, it} from 'vitest'

import {
  addressPickFromFeature,
  censusAddressFromFeature,
  censusMatchConfirmsHouseNumber,
  hasHouseNumber,
  isIncompleteAddress,
  isZipOnlyAddress,
} from './geoapifyAddress'

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

  it('treats the neighborhood Geoapify returns for a zip as not a street address', () => {
    expect(
      addressPickFromFeature({
        result_type: 'suburb',
        name: 'Los Angeles',
        city: 'Los Angeles',
        state_code: 'CA',
        postcode: '90012',
        address_line1: 'Los Angeles',
        formatted: 'Civic Center, Los Angeles, CA 90012, United States of America',
      }),
    ).toEqual({kind: 'incomplete'})
  })

  it('treats a Geoapify postcode suggestion as a zip, not an address to geocode', () => {
    expect(
      addressPickFromFeature({
        result_type: 'postcode',
        postcode: '90012',
        city: 'Los Angeles',
        state_code: 'CA',
        address_line1: '90012',
        formatted: '90012, Los Angeles, CA, United States of America',
      }),
    ).toEqual({kind: 'incomplete'})
  })

  it('treats a zip-led formatted line as a zip when result_type is missing', () => {
    expect(
      addressPickFromFeature({
        formatted: '90012, Los Angeles, CA, United States of America',
      }),
    ).toEqual({kind: 'incomplete'})
  })

  it('treats a street with no house number as incomplete', () => {
    expect(
      addressPickFromFeature({
        result_type: 'street',
        street: 'Spring Street',
        city: 'Los Angeles',
        state_code: 'CA',
        postcode: '90012',
        formatted: 'Spring Street, Los Angeles, CA 90012, United States of America',
      }),
    ).toEqual({kind: 'incomplete'})
  })

  it('treats a PO Box as incomplete even when a number is present', () => {
    expect(
      addressPickFromFeature({
        housenumber: '100',
        street: 'PO Box',
        city: 'Los Angeles',
        state_code: 'CA',
        postcode: '90012',
        formatted: 'PO Box 100, Los Angeles, CA 90012, United States of America',
      }),
    ).toEqual({kind: 'incomplete'})
  })

  it('keeps a formatted street address that Geoapify did not split into parts', () => {
    expect(
      addressPickFromFeature({
        formatted: '200 N Spring St, Los Angeles, CA 90012, United States of America',
      }),
    ).toEqual({kind: 'address', address: '200 N Spring St, Los Angeles, CA 90012'})
  })

  it('keeps a street address whose house number happens to be five digits', () => {
    expect(
      addressPickFromFeature({
        housenumber: '90012',
        street: 'Santa Monica Boulevard',
        city: 'Los Angeles',
        state_code: 'CA',
        postcode: '90067',
      }),
    ).toEqual({
      kind: 'address',
      address: '90012 Santa Monica Boulevard, Los Angeles, CA 90067',
    })
  })

  it('recognizes a typed zip, including ZIP+4 and a trailing place name', () => {
    expect(isZipOnlyAddress('90012')).toBe(true)
    expect(isZipOnlyAddress('90012-1234')).toBe(true)
    expect(isZipOnlyAddress('  90012, Los Angeles, CA ')).toBe(true)
    expect(isZipOnlyAddress('969 Marview Avenue, Los Angeles, CA 90012')).toBe(false)
    expect(isZipOnlyAddress('90012 Santa Monica Blvd, Los Angeles, CA 90067')).toBe(false)
  })

  it('requires a house number before a line can be geocoded', () => {
    expect(hasHouseNumber('200 N Spring St, Los Angeles, CA 90012')).toBe(true)
    expect(hasHouseNumber('90012 Santa Monica Blvd, Los Angeles, CA 90067')).toBe(true)
    expect(hasHouseNumber('90012')).toBe(false)
    expect(hasHouseNumber('90012, Los Angeles, CA')).toBe(false)
    expect(hasHouseNumber('Spring Street, Los Angeles, CA 90012')).toBe(false)
    expect(isIncompleteAddress('PO Box 100, Los Angeles, CA 90012')).toBe(true)
  })

  it('confirms the submitted house number against the Census match', () => {
    expect(
      censusMatchConfirmsHouseNumber('200 N Spring St, Los Angeles, CA 90012', '200 N SPRING ST, LOS ANGELES, CA, 90012'),
    ).toBe(true)
    expect(
      censusMatchConfirmsHouseNumber('200 N Spring St, Los Angeles, CA 90012', '100 N SPRING ST, LOS ANGELES, CA, 90012'),
    ).toBe(false)
    expect(
      censusMatchConfirmsHouseNumber('250 N Spring St, Los Angeles, CA 90012', 'N SPRING ST, LOS ANGELES, CA, 90012', {
        from: '200',
        to: '298',
      }),
    ).toBe(true)
    expect(
      censusMatchConfirmsHouseNumber('251 N Spring St, Los Angeles, CA 90012', 'N SPRING ST, LOS ANGELES, CA, 90012', {
        from: '200',
        to: '298',
      }),
    ).toBe(false)
    expect(
      censusMatchConfirmsHouseNumber(
        '90012 N Spring St, Los Angeles, CA 90012',
        '100 N SPRING ST, LOS ANGELES, CA, 90012',
      ),
    ).toBe(false)
    expect(
      censusMatchConfirmsHouseNumber(
        '200 N Spring St, Los Angeles, CA 90012',
        '100 N SPRING ST, LOS ANGELES, CA, 90012',
        {from: '100', to: '298'},
      ),
    ).toBe(false)
    expect(
      censusMatchConfirmsHouseNumber('200A N Spring St, Los Angeles, CA 90012', '200 N SPRING ST, LOS ANGELES, CA, 90012'),
    ).toBe(false)
    expect(
      censusMatchConfirmsHouseNumber(
        '200A N Spring St, Los Angeles, CA 90012',
        '200A N SPRING ST, LOS ANGELES, CA, 90012',
      ),
    ).toBe(true)
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
