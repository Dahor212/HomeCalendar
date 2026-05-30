import { Hono } from 'hono'
import { cors } from 'hono/cors'
import authRoutes  from './routes/auth'
import eventsRoutes from './routes/events'
import tasksRoutes  from './routes/tasks'
import pushRoutes   from './routes/push'
import { verifyToken } from './lib/auth'
import { checkReminders } from './lib/scheduler'

export interface Env {
  DB: D1Database
  SECRET_KEY: string
  VAPID_PRIVATE_KEY_JWK: string
  VAPID_PUBLIC_KEY: string
  VAPID_SUBJECT: string
}

export type Variables = { userId: number }

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// Auth middleware for protected routes
app.use('/api/events/*', authMiddleware)
app.use('/api/tasks/*', authMiddleware)
app.use('/api/push/subscribe', authMiddleware)
app.use('/api/push/unsubscribe', authMiddleware)
app.use('/api/auth/me', authMiddleware)
app.use('/api/auth/users', authMiddleware)

app.route('/api/auth', authRoutes)
app.route('/api/events', eventsRoutes)
app.route('/api/tasks', tasksRoutes)
app.route('/api/push', pushRoutes)

app.get('/api/health', (c) => c.json({ status: 'ok' }))

async function authMiddleware(c: any, next: () => Promise<void>) {
  const header = c.req.header('Authorization') ?? ''
  if (!header.startsWith('Bearer ')) return c.json({ detail: 'Unauthorized' }, 401)
  try {
    const payload = await verifyToken(header.slice(7), c.env.SECRET_KEY)
    c.set('userId', parseInt(payload.sub))
    await next()
  } catch {
    return c.json({ detail: 'Neplatný nebo prošlý token' }, 401)
  }
}

export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext) {
    await checkReminders(env)
  },
}
