#!/usr/bin/env node
// Run once to generate VAPID keys for Web Push.
// Then add them to Cloudflare Secrets:
//   wrangler secret put VAPID_PRIVATE_KEY_JWK   (paste the JWK value)
//   wrangler secret put VAPID_PUBLIC_KEY         (paste the public key value)

const keyPair = await crypto.subtle.generateKey(
  { name: 'ECDSA', namedCurve: 'P-256' },
  true,
  ['sign', 'verify']
)

const privateJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey)
const publicRaw  = new Uint8Array(await crypto.subtle.exportKey('raw', keyPair.publicKey))

const b64url = (buf) =>
  btoa(String.fromCharCode(...buf)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')

console.log('\n=== VAPID Keys (copy to Cloudflare Secrets) ===\n')
console.log('VAPID_PRIVATE_KEY_JWK =')
console.log(JSON.stringify(privateJwk))
console.log('\nVAPID_PUBLIC_KEY =')
console.log(b64url(publicRaw))
console.log()
