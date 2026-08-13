import path from 'node:path'

import {defineConfig} from 'vitest/config'

// Minimal config: just resolves the `@/*` import alias used throughout the
// app (see tsconfig.json) so test files can import route/lib modules the
// same way application code does. No React/JSX plugin — the current test
// suite only covers pure logic (lib/, API routes), not component rendering.
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'node',
  },
})
