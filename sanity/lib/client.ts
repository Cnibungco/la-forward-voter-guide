import {createClient} from 'next-sanity'

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-01-01'

if (!projectId) {
  // Fail loudly at build time rather than silently rendering an empty guide.
  // A future maintainer debugging "why is the site blank" should hit this,
  // not a quiet empty array from a misconfigured client.
  throw new Error(
    'Missing NEXT_PUBLIC_SANITY_PROJECT_ID. Set it in .env.local (see .env.example).'
  )
}

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // Single production dataset, no draft/review workflow (PRD §4) — CDN reads
  // are fine since there's no preview-of-unpublished-content requirement.
  useCdn: true,
})
