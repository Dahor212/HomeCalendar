import { Hono } from 'hono'
import type { Env, Variables } from '../index'
import { hashPassword, verifyPassword, createToken } from '../lib/auth'

const auth = new Hono<{ Bindings: Env; Variables: Variables }>()

auth.post('/register', async (c) => {
  const { username, email, password } = await c.req.json()
  if (!username || !email || !password) return c.json({ detail: 'Chybí povinná pole' }, 400)

  const existing = await c.env.DB.prepare(
    'SELECT id FROM users WHERE username = ? OR email = ?'
  ).bind(username, email).first()
  if (existing) return c.json({ detail: 'Uživatel nebo email již existuje' }, 400)

  const hashed = await hashPassword(password)
  const { meta } = await c.env.DB.prepare(
    'INSERT INTO users (username, email, hashed_password) VALUES (?, ?, ?)'
  ).bind(username, email, hashed).run()

  const user = { id: meta.last_row_id, username, email, is_active: 1 }
  const token = await createToken(user.id as number, c.env.SECRET_KEY)
  return c.json({ access_token: token, token_type: 'bearer', user }, 201)
})

auth.post('/login', async (c) => {
  const { username, password } = await c.req.json()
  const user = await c.env.DB.prepare(
    'SELECT id, username, email, hashed_password, is_active FROM users WHERE username = ?'
  ).bind(username).first<{ id: number; username: string; email: string; hashed_password: string; is_active: number }>()

  if (!user || !(await verifyPassword(password, user.hashed_password)))
    return c.json({ detail: 'Nesprávné jméno nebo heslo' }, 401)
  if (!user.is_active) return c.json({ detail: 'Účet je deaktivován' }, 403)

  const token = await createToken(user.id, c.env.SECRET_KEY)
  const { hashed_password: _, ...safeUser } = user
  return c.json({ access_token: token, token_type: 'bearer', user: safeUser })
})

auth.get('/me', async (c) => {
  const user = await c.env.DB.prepare(
    'SELECT id, username, email, is_active FROM users WHERE id = ?'
  ).bind(c.get('userId')).first()
  if (!user) return c.json({ detail: 'Not found' }, 404)
  return c.json(user)
})

auth.get('/users', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT id, username, email, is_active FROM users WHERE is_active = 1'
  ).all()
  return c.json(results)
})

export default auth
