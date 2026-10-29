/**
 * Remembers, per server instance, that Census's `geographies` endpoint just
 * failed, so /api/match-ballot skips straight to its fallback instead of
 * making every voter wait out the same timeout during an outage. Fluid
 * Compute reuses instances across requests, so one failure covers the
 * requests that follow it. Lives outside the route file because a Next.js
 * route may only export its handlers, and the tests need `reset`.
 */
const COOLDOWN_MS = 60_000

let skipUntil = 0

export const geographiesCooldown = {
  active: () => Date.now() < skipUntil,
  trip: () => {
    skipUntil = Date.now() + COOLDOWN_MS
  },
  reset: () => {
    skipUntil = 0
  },
}
