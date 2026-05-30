const enc = new TextEncoder()

function b64url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function d64url(s: string): Uint8Array {
  const pad = '='.repeat((4 - (s.length % 4)) % 4)
  return Uint8Array.from(atob((s + pad).replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
}

// PBKDF2-SHA256 password hashing (100 000 iterations)
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    key, 256
  )
  return `${b64url(salt)}:${b64url(hash)}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltStr, hashStr] = stored.split(':')
  if (!saltStr || !hashStr) return false
  const salt = d64url(saltStr)
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    key, 256
  )
  return b64url(hash) === hashStr
}

// JWT (HS256 via HMAC-SHA256)
export async function createToken(userId: number, secret: string): Promise<string> {
  const header  = b64url(enc.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })))
  const payload = b64url(enc.encode(JSON.stringify({
    sub: String(userId),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,  // 7 days
  })))
  const input = `${header}.${payload}`
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(input))
  return `${input}.${b64url(sig)}`
}

export async function verifyToken(token: string, secret: string): Promise<{ sub: string }> {
  const parts = token.split('.')
  if (parts.length !== 3) throw new Error('Invalid token')
  const [header, payload, sig] = parts
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
  )
  const valid = await crypto.subtle.verify(
    'HMAC', key, d64url(sig), enc.encode(`${header}.${payload}`)
  )
  if (!valid) throw new Error('Invalid signature')
  const data = JSON.parse(atob((payload + '===').slice(0, payload.length + (4 - payload.length % 4) % 4)))
  if (data.exp && data.exp < Math.floor(Date.now() / 1000)) throw new Error('Token expired')
  return data
}
