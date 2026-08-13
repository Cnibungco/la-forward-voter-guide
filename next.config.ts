import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{protocol: 'https', hostname: 'cdn.sanity.io'}],
  },
  // Ensures the boundary GeoJSON read by `app/api/match-ballot/route.ts`
  // (via `fs.readFileSync`, not an import) is included in the deployed
  // serverless function bundle — see data/boundaries/README.md.
  outputFileTracingIncludes: {
    '/api/match-ballot': ['./data/boundaries/*.geojson'],
  },
}

export default nextConfig
