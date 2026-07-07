import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:5090'

type ProxyOptions = {
  method?: string
  /** JSON-serializable body. Ignored if `formData` is set. */
  body?: unknown
  /** Pass a FormData instance through as-is (no Content-Type override). */
  formData?: FormData
  /** Return an empty response instead of forwarding the backend's JSON body. */
  noContent?: boolean
  /** Status to use on success (default: 200, or 204 when `noContent` is set). */
  successStatus?: number
}

/**
 * Forwards a request to the Go backend with the session cookie attached,
 * and mirrors its response (or error) back to the client.
 */
export async function backendProxy(path: string, options: ProxyOptions = {}) {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session_token')
  if (!sessionToken) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const headers: Record<string, string> = { Cookie: `session_token=${sessionToken.value}` }
  let body: BodyInit | undefined

  if (options.formData) {
    body = options.formData
  } else if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(options.body)
  }

  try {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body,
    })

    if (!res.ok) {
      const message = await res.text().catch(() => '')
      return NextResponse.json({ error: message || 'Erreur' }, { status: res.status })
    }

    if (options.noContent) {
      return new NextResponse(null, { status: options.successStatus ?? 204 })
    }

    const data = await res.json().catch(() => null)
    return NextResponse.json(data, { status: options.successStatus ?? 200 })
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
