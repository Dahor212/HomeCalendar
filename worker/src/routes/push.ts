import { Hono } from 'hono'
import type { Env, Variables } from '../index'

const push = new Hono<{ Bindings: Env; Variables: Variables }>()

push.get('/vapid-public-key', (c) => c.json({ public_key: c.env.VAPID_PUBLIC_KEY }))

push.post('/subscribe', async (c) => {
  const { endpoint, p256dh_key, auth_key } = await c.req.json()
  if (!endpoint || !p256dh_key || !auth_key) return c.json({ detail: 'Chybí data' }, 400)
  const uid = c.get('userId')

  const existing = await c.env.DB.prepare(
    'SELECT id FROM push_subscriptions WHERE endpoint = ?'
  ).bind(endpoint).first<{ id: number }>()

  if (existing) {
    await c.env.DB.prepare(
      'UPDATE push_subscriptions SET user_id = ?, p256dh_key = ?, auth_key = ? WHERE id = ?'
    ).bind(uid, p256dh_key, auth_key, existing.id).run()
    return c.json({ id: existing.id, endpoint }, 200)
  }

  const { meta } = await c.env.DB.prepare(
    'INSERT INTO push_subscriptions (user_id, endpoint, p256dh_key, auth_key) VALUES (?, ?, ?, ?)'
  ).bind(uid, endpoint, p256dh_key, auth_key).run()
  return c.json({ id: meta.last_row_id, endpoint }, 201)
})

push.delete('/unsubscribe', async (c) => {
  const { endpoint } = await c.req.json()
  await c.env.DB.prepare(
    'DELETE FROM push_subscriptions WHERE endpoint = ? AND user_id = ?'
  ).bind(endpoint, c.get('userId')).run()
  return new Response(null, { status: 204 })
})

export default push
