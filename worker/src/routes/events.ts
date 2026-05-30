import { Hono } from 'hono'
import type { Env, Variables } from '../index'

const events = new Hono<{ Bindings: Env; Variables: Variables }>()

events.get('/', async (c) => {
  const start = c.req.query('start')
  const end   = c.req.query('end')
  const uid   = c.get('userId')

  let sql = 'SELECT * FROM events WHERE (creator_id = ? OR shared = 1)'
  const params: unknown[] = [uid]
  if (start) { sql += ' AND start >= ?'; params.push(start) }
  if (end)   { sql += ' AND start <= ?'; params.push(end) }
  sql += ' ORDER BY start ASC'

  const { results } = await c.env.DB.prepare(sql).bind(...params).all()
  return c.json(results.map(normalise))
})

events.post('/', async (c) => {
  const body = await c.req.json()
  const { title, description = '', start, end = null, all_day = 0, color = '#3B82F6', shared = 1, reminder_minutes = 30 } = body
  if (!title || !start) return c.json({ detail: 'Chybí povinná pole' }, 400)

  const { meta } = await c.env.DB.prepare(
    `INSERT INTO events (title, description, start, end, all_day, color, creator_id, shared, reminder_minutes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(title, description, start, end, all_day ? 1 : 0, color, c.get('userId'), shared ? 1 : 0, reminder_minutes).run()

  const ev = await c.env.DB.prepare('SELECT * FROM events WHERE id = ?').bind(meta.last_row_id).first()
  return c.json(normalise(ev!), 201)
})

events.get('/:id', async (c) => {
  const ev = await c.env.DB.prepare(
    'SELECT * FROM events WHERE id = ? AND (creator_id = ? OR shared = 1)'
  ).bind(c.req.param('id'), c.get('userId')).first()
  if (!ev) return c.json({ detail: 'Událost nenalezena' }, 404)
  return c.json(normalise(ev))
})

events.put('/:id', async (c) => {
  const uid = c.get('userId')
  const existing = await c.env.DB.prepare(
    'SELECT * FROM events WHERE id = ? AND creator_id = ?'
  ).bind(c.req.param('id'), uid).first<Record<string, unknown>>()
  if (!existing) return c.json({ detail: 'Událost nenalezena nebo nemáte oprávnění' }, 404)

  const body = await c.req.json()
  const resetReminder = 'start' in body ? 0 : existing.reminder_sent

  await c.env.DB.prepare(
    `UPDATE events SET
       title = ?, description = ?, start = ?, end = ?, all_day = ?,
       color = ?, shared = ?, reminder_minutes = ?, reminder_sent = ?
     WHERE id = ?`
  ).bind(
    body.title            ?? existing.title,
    body.description      ?? existing.description,
    body.start            ?? existing.start,
    body.end              ?? existing.end,
    body.all_day != null   ? (body.all_day ? 1 : 0) : existing.all_day,
    body.color            ?? existing.color,
    body.shared != null    ? (body.shared ? 1 : 0)  : existing.shared,
    body.reminder_minutes ?? existing.reminder_minutes,
    resetReminder,
    c.req.param('id'),
  ).run()

  const updated = await c.env.DB.prepare('SELECT * FROM events WHERE id = ?').bind(c.req.param('id')).first()
  return c.json(normalise(updated!))
})

events.delete('/:id', async (c) => {
  const { meta } = await c.env.DB.prepare(
    'DELETE FROM events WHERE id = ? AND creator_id = ?'
  ).bind(c.req.param('id'), c.get('userId')).run()
  if (!meta.changes) return c.json({ detail: 'Událost nenalezena nebo nemáte oprávnění' }, 404)
  return new Response(null, { status: 204 })
})

function normalise(ev: unknown) {
  const e = ev as Record<string, unknown>
  return { ...e, all_day: Boolean(e.all_day), shared: Boolean(e.shared), reminder_sent: Boolean(e.reminder_sent) }
}

export default events
