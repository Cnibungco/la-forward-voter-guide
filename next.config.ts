import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{protocol: 'https', hostname: 'cdn.sanity.io'}],
    // Logo and banner still go through the optimizer. The default 60s
    // lifetime would re-download them on a busy day. Posters do not:
    // they are served from Sanity (see lib/image.ts).
    minimumCacheTTL: 60 * 60 * 24 * 31,
  },
  // Ensures the boundary GeoJSON read by `app/api/match-ballot/route.ts`
  // (via `fs.readFileSync`, not an import) is included in the deployed
  // serverless function bundle — see data/boundaries/README.md.
  outputFileTracingIncludes: {
    '/api/match-ballot': ['./data/boundaries/*.geojson'],
  },
}

export default nextConfig
