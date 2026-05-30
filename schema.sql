-- D1 (SQLite) schema – run: wrangler d1 execute homecalendar --file=schema.sql

CREATE TABLE IF NOT EXISTS users (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  username       TEXT    UNIQUE NOT NULL,
  email          TEXT    UNIQUE NOT NULL,
  hashed_password TEXT   NOT NULL,
  is_active      INTEGER NOT NULL DEFAULT 1,
  created_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS events (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  title            TEXT    NOT NULL,
  description      TEXT    NOT NULL DEFAULT '',
  start            TEXT    NOT NULL,
  end              TEXT,
  all_day          INTEGER NOT NULL DEFAULT 0,
  color            TEXT    NOT NULL DEFAULT '#3B82F6',
  creator_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shared           INTEGER NOT NULL DEFAULT 1,
  reminder_minutes INTEGER NOT NULL DEFAULT 30,
  reminder_sent    INTEGER NOT NULL DEFAULT 0,
  created_at       TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tasks (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  title            TEXT    NOT NULL,
  description      TEXT    NOT NULL DEFAULT '',
  due_date         TEXT,
  completed        INTEGER NOT NULL DEFAULT 0,
  completed_at     TEXT,
  priority         TEXT    NOT NULL DEFAULT 'medium',
  creator_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_to      INTEGER REFERENCES users(id) ON DELETE SET NULL,
  shared           INTEGER NOT NULL DEFAULT 1,
  reminder_minutes INTEGER NOT NULL DEFAULT 60,
  reminder_sent    INTEGER NOT NULL DEFAULT 0,
  created_at       TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint   TEXT    UNIQUE NOT NULL,
  p256dh_key TEXT    NOT NULL,
  auth_key   TEXT    NOT NULL,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);
