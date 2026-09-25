import {createClient} from 'next-sanity'

function readEnv(name: string): string {
  const raw = process.env[name]
  if (!raw) return ''
  // Vercel/dashboard pastes often include wrapping quotes or stray spaces,
  // which Sanity then rejects as an invalid dataset/project id.
  return raw.trim().replace(/^['"]|['"]$/g, '')
}

const PROJECT_ID_PATTERN = /^[-a-z0-9]+$/i
const DATASET_PATTERN = /^(~[a-z0-9][-\w]{0,63}|[a-z0-9][-\w]{0,63})$/
const API_VERSION_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const envProjectId = readEnv('NEXT_PUBLIC_SANITY_PROJECT_ID')
const envDataset = readEnv('NEXT_PUBLIC_SANITY_DATASET')
const envApiVersion = readEnv('NEXT_PUBLIC_SANITY_API_VERSION')

// Public identifier — same value as studio-la-forward-voter-guide's
// sanity.config.ts. Defaulted so `next build` (including Vercel) works
// without a dashboard env var. Override with NEXT_PUBLIC_SANITY_PROJECT_ID
// only if the Sanity project itself changes.
export const projectId = PROJECT_ID_PATTERN.test(envProjectId) ? envProjectId : 'wcogcahu'
// Locked to the single production dataset (see docs/backend-strategy.md).
// An invalid Vercel value must not take down the build.
export const dataset = DATASET_PATTERN.test(envDataset) ? envDataset : 'production'
export const apiVersion = API_VERSION_PATTERN.test(envApiVersion)
  ? envApiVersion
  : '2025-01-01'

if (!projectId) {
  // Fail loudly at build time rather than silently rendering an empty guide.
  // A future maintainer debugging "why is the site blank" should hit this,
  // not a quiet empty array from a misconfigured client.
  throw new Error(
    'Missing NEXT_PUBLIC_SANITY_PROJECT_ID. Set it in .env.local or in the Vercel project Environment Variables (see .env.example).'
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
