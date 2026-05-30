import { sendWebPush } from './push'

interface Env {
  DB: D1Database
  VAPID_PRIVATE_KEY_JWK: string
  VAPID_PUBLIC_KEY: string
  VAPID_SUBJECT: string
}

interface Sub { endpoint: string; p256dh_key: string; auth_key: string }

async function notifyUser(env: Env, userId: number, title: string, body: string, url: string) {
  const { results } = await env.DB.prepare(
    'SELECT endpoint, p256dh_key, auth_key FROM push_subscriptions WHERE user_id = ?'
  ).bind(userId).all<Sub>()

  const stale: string[] = []
  for (const sub of results) {
    try {
      await sendWebPush(sub.endpoint, sub.p256dh_key, sub.auth_key,
        JSON.stringify({ title, body, url }),
        env.VAPID_PRIVATE_KEY_JWK, env.VAPID_PUBLIC_KEY, env.VAPID_SUBJECT)
    } catch (e: any) {
      if (e.message?.includes('410') || e.message?.includes('404')) stale.push(sub.endpoint)
    }
  }
  for (const ep of stale) {
    await env.DB.prepare('DELETE FROM push_subscriptions WHERE endpoint = ?').bind(ep).run()
  }
}

async function notifyAll(env: Env, title: string, body: string, url: string) {
  const { results } = await env.DB.prepare('SELECT id FROM users WHERE is_active = 1').all<{ id: number }>()
  await Promise.all(results.map(u => notifyUser(env, u.id, title, body, url)))
}

export async function checkReminders(env: Env) {
  const now = new Date().toISOString()
  const offsetFn = (minutes: number) => new Date(Date.now() + minutes * 60_000).toISOString()

  // Fetch events needing reminder: start is in the future and reminder window has arrived
  const { results: events } = await env.DB.prepare(`
    SELECT id, title, creator_id, shared, reminder_minutes, start
    FROM events
    WHERE reminder_sent = 0
      AND start > ?
      AND datetime(start, '-' || reminder_minutes || ' minutes') <= ?
  `).bind(now, now).all<{
    id: number; title: string; creator_id: number; shared: number; reminder_minutes: number; start: string
  }>()

  for (const ev of events) {
    const body = `Začíná za ${ev.reminder_minutes} min: ${ev.title}`
    if (ev.shared) await notifyAll(env, '📅 Připomínka události', body, '/')
    else await notifyUser(env, ev.creator_id, '📅 Připomínka události', body, '/')
    await env.DB.prepare('UPDATE events SET reminder_sent = 1 WHERE id = ?').bind(ev.id).run()
  }

  // Fetch tasks needing reminder
  const { results: tasks } = await env.DB.prepare(`
    SELECT id, title, creator_id, assigned_to, shared, reminder_minutes, due_date
    FROM tasks
    WHERE reminder_sent = 0
      AND completed = 0
      AND due_date IS NOT NULL
      AND due_date > ?
      AND datetime(due_date, '-' || reminder_minutes || ' minutes') <= ?
  `).bind(now, now).all<{
    id: number; title: string; creator_id: number; assigned_to: number | null; shared: number; reminder_minutes: number
  }>()

  for (const task of tasks) {
    const body = `Termín za ${task.reminder_minutes} min: ${task.title}`
    if (task.shared) await notifyAll(env, '✅ Připomínka úkolu', body, '/tasks')
    else {
      const uid = task.assigned_to ?? task.creator_id
      await notifyUser(env, uid, '✅ Připomínka úkolu', body, '/tasks')
    }
    await env.DB.prepare('UPDATE tasks SET reminder_sent = 1 WHERE id = ?').bind(task.id).run()
  }
}
