import { Hono } from 'hono'
import type { Env, Variables } from '../index'

const tasks = new Hono<{ Bindings: Env; Variables: Variables }>()

tasks.get('/', async (c) => {
  const completed = c.req.query('completed')
  const uid = c.get('userId')

  let sql = 'SELECT * FROM tasks WHERE (creator_id = ? OR assigned_to = ? OR shared = 1)'
  const params: unknown[] = [uid, uid]
  if (completed === 'true')  { sql += ' AND completed = 1' }
  if (completed === 'false') { sql += ' AND completed = 0' }
  sql += ' ORDER BY CASE WHEN due_date IS NULL THEN 1 ELSE 0 END, due_date ASC, created_at DESC'

  const { results } = await c.env.DB.prepare(sql).bind(...params).all()
  return c.json(results.map(normalise))
})

tasks.post('/', async (c) => {
  const body = await c.req.json()
  const { title, description = '', due_date = null, priority = 'medium', assigned_to = null, shared = 1, reminder_minutes = 60 } = body
  if (!title) return c.json({ detail: 'Chybí název' }, 400)

  const { meta } = await c.env.DB.prepare(
    `INSERT INTO tasks (title, description, due_date, priority, creator_id, assigned_to, shared, reminder_minutes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(title, description, due_date, priority, c.get('userId'), assigned_to, shared ? 1 : 0, reminder_minutes).run()

  const task = await c.env.DB.prepare('SELECT * FROM tasks WHERE id = ?').bind(meta.last_row_id).first()
  return c.json(normalise(task!), 201)
})

tasks.get('/:id', async (c) => {
  const uid = c.get('userId')
  const task = await c.env.DB.prepare(
    'SELECT * FROM tasks WHERE id = ? AND (creator_id = ? OR assigned_to = ? OR shared = 1)'
  ).bind(c.req.param('id'), uid, uid).first()
  if (!task) return c.json({ detail: 'Úkol nenalezen' }, 404)
  return c.json(normalise(task))
})

tasks.put('/:id', async (c) => {
  const uid = c.get('userId')
  const existing = await c.env.DB.prepare(
    'SELECT * FROM tasks WHERE id = ? AND creator_id = ?'
  ).bind(c.req.param('id'), uid).first<Record<string, unknown>>()
  if (!existing) return c.json({ detail: 'Úkol nenalezen nebo nemáte oprávnění' }, 404)

  const body = await c.req.json()
  const completed = body.completed != null ? body.completed : existing.completed
  const completedAt = completed && !existing.completed ? new Date().toISOString() : (!completed ? null : existing.completed_at)
  const resetReminder = 'due_date' in body ? 0 : existing.reminder_sent

  await c.env.DB.prepare(
    `UPDATE tasks SET
       title = ?, description = ?, due_date = ?, completed = ?, completed_at = ?,
       priority = ?, assigned_to = ?, shared = ?, reminder_minutes = ?, reminder_sent = ?
     WHERE id = ?`
  ).bind(
    body.title            ?? existing.title,
    body.description      ?? existing.description,
    body.due_date         ?? existing.due_date,
    completed ? 1 : 0,
    completedAt,
    body.priority         ?? existing.priority,
    body.assigned_to      ?? existing.assigned_to,
    body.shared != null    ? (body.shared ? 1 : 0) : existing.shared,
    body.reminder_minutes ?? existing.reminder_minutes,
    resetReminder,
    c.req.param('id'),
  ).run()

  const updated = await c.env.DB.prepare('SELECT * FROM tasks WHERE id = ?').bind(c.req.param('id')).first()
  return c.json(normalise(updated!))
})

tasks.put('/:id/toggle', async (c) => {
  const uid = c.get('userId')
  const task = await c.env.DB.prepare(
    'SELECT * FROM tasks WHERE id = ? AND (creator_id = ? OR assigned_to = ? OR shared = 1)'
  ).bind(c.req.param('id'), uid, uid).first<Record<string, unknown>>()
  if (!task) return c.json({ detail: 'Úkol nenalezen' }, 404)

  const nowCompleted = !task.completed
  const completedAt = nowCompleted ? new Date().toISOString() : null
  await c.env.DB.prepare(
    'UPDATE tasks SET completed = ?, completed_at = ? WHERE id = ?'
  ).bind(nowCompleted ? 1 : 0, completedAt, c.req.param('id')).run()

  const updated = await c.env.DB.prepare('SELECT * FROM tasks WHERE id = ?').bind(c.req.param('id')).first()
  return c.json(normalise(updated!))
})

tasks.delete('/:id', async (c) => {
  const { meta } = await c.env.DB.prepare(
    'DELETE FROM tasks WHERE id = ? AND creator_id = ?'
  ).bind(c.req.param('id'), c.get('userId')).run()
  if (!meta.changes) return c.json({ detail: 'Úkol nenalezen nebo nemáte oprávnění' }, 404)
  return new Response(null, { status: 204 })
})

function normalise(t: unknown) {
  const task = t as Record<string, unknown>
  return { ...task, completed: Boolean(task.completed), shared: Boolean(task.shared) }
}

export default tasks
