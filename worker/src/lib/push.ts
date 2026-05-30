// RFC 8291 – Message Encryption for Web Push
// RFC 8292 – VAPID authentication
// Implemented with Web Crypto API (works natively in Cloudflare Workers)

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

function concat(...arrs: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(arrs.reduce((n, a) => n + a.length, 0))
  let off = 0
  for (const a of arrs) { out.set(a, off); off += a.length }
  return out
}

async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array | string, len: number): Promise<Uint8Array> {
  const infoBytes = typeof info === 'string' ? enc.encode(info) : info
  const key = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits'])
  return new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt, info: infoBytes }, key, len * 8
  ))
}

async function encryptPayload(payload: string, p256dh: string, auth: string): Promise<Uint8Array> {
  const subPubRaw = d64url(p256dh)

  const subscriberPub = await crypto.subtle.importKey(
    'raw', subPubRaw, { name: 'ECDH', namedCurve: 'P-256' }, false, []
  )
  const serverKP = (await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  )) as any
  const serverPubRaw = new Uint8Array((await crypto.subtle.exportKey('raw', serverKP.publicKey as CryptoKey)) as ArrayBuffer)

  const sharedSecret = new Uint8Array(await crypto.subtle.deriveBits(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { name: 'ECDH', namedCurve: 'P-256', public: subscriberPub } as any,
    serverKP.privateKey as CryptoKey, 256
  ))

  const salt = crypto.getRandomValues(new Uint8Array(16))
  const authBytes = d64url(auth)

  // IKM: HKDF(auth, ECDH_output, "WebPush: info\x00" + subPub + serverPub)
  const ikm = await hkdf(
    authBytes, sharedSecret,
    concat(enc.encode('WebPush: info\x00'), subPubRaw, serverPubRaw),
    32
  )

  const cek   = await hkdf(salt, ikm, 'Content-Encoding: aes128gcm\x00', 16)
  const nonce = await hkdf(salt, ikm, 'Content-Encoding: nonce\x00', 12)

  const aesKey = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt'])
  const padded = concat(enc.encode(payload), new Uint8Array([0x02]))
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce }, aesKey, padded
  ))

  // aes128gcm body: salt(16) + rs(4 big-endian) + idlen(1) + keyid(65) + ciphertext
  const rs = new Uint8Array(4)
  new DataView(rs.buffer).setUint32(0, 4096, false)
  return concat(salt, rs, new Uint8Array([65]), serverPubRaw, ciphertext)
}

export async function sendWebPush(
  endpoint: string,
  p256dh: string,
  auth: string,
  data: string,
  vapidPrivKeyJwk: string,
  vapidPubKey: string,
  subject: string
): Promise<void> {
  const body = await encryptPayload(data, p256dh, auth)

  // VAPID JWT (ES256 / ECDSA P-256)
  const origin = new URL(endpoint).origin
  const now = Math.floor(Date.now() / 1000)
  const jwtHeader  = b64url(enc.encode(JSON.stringify({ alg: 'ES256', typ: 'JWT' })))
  const jwtClaims  = b64url(enc.encode(JSON.stringify({ aud: origin, exp: now + 43200, sub: subject })))
  const sigInput   = enc.encode(`${jwtHeader}.${jwtClaims}`)

  const privKey = await crypto.subtle.importKey(
    'jwk', JSON.parse(vapidPrivKeyJwk),
    { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']
  )
  const sig = new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privKey, sigInput))
  const jwt = `${jwtHeader}.${jwtClaims}.${b64url(sig)}`

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `vapid t=${jwt},k=${vapidPubKey}`,
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'aes128gcm',
      TTL: '86400',
    },
    body,
  })

  if (!res.ok && res.status !== 201) {
    throw new Error(`Push failed ${res.status}: ${await res.text()}`)
  }
}
