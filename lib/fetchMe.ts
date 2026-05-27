import type { CurrentUser } from '@/app/components/home/Header'

/**
 * Fetches the current user.
 * Returns null if unauthenticated (401) — caller should redirect to login.
 * Throws if the backend is temporarily unreachable (5xx) — caller should NOT log out.
 */
export async function fetchMe(): Promise<CurrentUser | null> {
  const res = await fetch('/api/me')

  if (res.status === 401) return null

  if (!res.ok) {
    throw new Error(`/api/me returned ${res.status}`)
  }

  return res.json()
}
