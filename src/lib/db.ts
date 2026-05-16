import Database from "@tauri-apps/plugin-sql"

let db: Database | null = null

export async function getDb(): Promise<Database> {
  if (db) return db
  db = await Database.load("sqlite:flowspace.db")
  return db
}

export async function initDb(): Promise<void> {
  const database = await getDb()
  await database.execute(`PRAGMA foreign_keys = ON;`)
  await database.execute(`
    CREATE TABLE IF NOT EXISTS boards (
      id          TEXT PRIMARY KEY,
      title       TEXT NOT NULL,
      description TEXT,
      color       TEXT NOT NULL DEFAULT '#6366f1',
      created_at  TEXT NOT NULL,
      updated_at  TEXT NOT NULL
    );
  `)
  await database.execute(`
    CREATE TABLE IF NOT EXISTS columns (
      id         TEXT PRIMARY KEY,
      title      TEXT NOT NULL,
      "order"    INTEGER NOT NULL DEFAULT 0,
      board_id   TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
    );
  `)
  await database.execute(`
    CREATE TABLE IF NOT EXISTS cards (
      id                 TEXT PRIMARY KEY,
      title              TEXT NOT NULL,
      description        TEXT,
      "order"            INTEGER NOT NULL DEFAULT 0,
      column_id          TEXT NOT NULL,
      spotify_track_id   TEXT,
      spotify_track_name TEXT,
      spotify_artist     TEXT,
      due_date           TEXT,
      labels             TEXT,
      created_at         TEXT NOT NULL,
      updated_at         TEXT NOT NULL,
      FOREIGN KEY (column_id) REFERENCES columns(id) ON DELETE CASCADE
    );
  `)
  await database.execute(`
    CREATE TABLE IF NOT EXISTS notes (
      id                 TEXT PRIMARY KEY,
      title              TEXT NOT NULL,
      content            TEXT DEFAULT '{}',
      emoji              TEXT NOT NULL DEFAULT '📝',
      spotify_track_id   TEXT,
      spotify_track_name TEXT,
      spotify_artist     TEXT,
      created_at         TEXT NOT NULL,
      updated_at         TEXT NOT NULL
    );
  `)
}

// ─── Boards ──────────────────────────────────────────────────────────────────

export interface Board {
  id: string
  title: string
  description?: string
  color: string
  created_at: string
  updated_at: string
}

export interface Column {
  id: string
  title: string
  order: number
  board_id: string
  created_at: string
  updated_at: string
  cards: Card[]
}

export interface Card {
  id: string
  title: string
  description?: string
  order: number
  column_id: string
  spotify_track_id?: string
  spotify_track_name?: string
  spotify_artist?: string
  due_date?: string
  labels?: string
  created_at: string
  updated_at: string
}

export interface Note {
  id: string
  title: string
  content?: string
  emoji: string
  spotify_track_id?: string
  spotify_track_name?: string
  spotify_artist?: string
  created_at: string
  updated_at: string
}

export const boardsDb = {
  async getAll(): Promise<Board[]> {
    const db = await getDb()
    return db.select<Board[]>("SELECT * FROM boards ORDER BY updated_at DESC")
  },

  async create(data: Omit<Board, "created_at" | "updated_at">): Promise<Board> {
    const db = await getDb()
    const t = new Date().toISOString()
    await db.execute(
      "INSERT INTO boards (id, title, description, color, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
      [data.id, data.title, data.description ?? null, data.color, t, t]
    )
    return { ...data, created_at: t, updated_at: t }
  },

  async update(id: string, data: Partial<Pick<Board, "title" | "description" | "color">>): Promise<void> {
    const db = await getDb()
    const t = new Date().toISOString()
    const sets: string[] = []
    const vals: unknown[] = []
    if (data.title !== undefined) { sets.push("title = ?"); vals.push(data.title) }
    if (data.description !== undefined) { sets.push("description = ?"); vals.push(data.description) }
    if (data.color !== undefined) { sets.push("color = ?"); vals.push(data.color) }
    sets.push("updated_at = ?"); vals.push(t)
    vals.push(id)
    await db.execute(`UPDATE boards SET ${sets.join(", ")} WHERE id = ?`, vals)
  },

  async delete(id: string): Promise<void> {
    const db = await getDb()
    await db.execute("DELETE FROM boards WHERE id = ?", [id])
  },

  async getWithColumns(id: string): Promise<(Board & { columns: Column[] }) | null> {
    const db = await getDb()
    const boards = await db.select<Board[]>("SELECT * FROM boards WHERE id = ?", [id])
    if (!boards.length) return null
    const board = boards[0]
    const columns = await db.select<Omit<Column, "cards">[]>(
      'SELECT * FROM columns WHERE board_id = ? ORDER BY "order" ASC', [id]
    )
    const cards = await db.select<Card[]>(
      `SELECT c.* FROM cards c
       JOIN columns col ON c.column_id = col.id
       WHERE col.board_id = ? ORDER BY c."order" ASC`, [id]
    )
    return {
      ...board,
      columns: columns.map((col) => ({
        ...col,
        cards: cards.filter((c) => c.column_id === col.id),
      })),
    }
  },
}

export const columnsDb = {
  async create(data: { id: string; title: string; order: number; board_id: string }): Promise<Column> {
    const db = await getDb()
    const t = new Date().toISOString()
    await db.execute(
      'INSERT INTO columns (id, title, "order", board_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [data.id, data.title, data.order, data.board_id, t, t]
    )
    return { ...data, created_at: t, updated_at: t, cards: [] }
  },

  async update(id: string, data: Partial<{ title: string; order: number }>): Promise<void> {
    const db = await getDb()
    const t = new Date().toISOString()
    const sets: string[] = []
    const vals: unknown[] = []
    if (data.title !== undefined) { sets.push("title = ?"); vals.push(data.title) }
    if (data.order !== undefined) { sets.push('"order" = ?'); vals.push(data.order) }
    sets.push("updated_at = ?"); vals.push(t)
    vals.push(id)
    await db.execute(`UPDATE columns SET ${sets.join(", ")} WHERE id = ?`, vals)
  },

  async delete(id: string): Promise<void> {
    const db = await getDb()
    await db.execute("DELETE FROM columns WHERE id = ?", [id])
  },
}

export const cardsDb = {
  async create(data: { id: string; title: string; order: number; column_id: string }): Promise<Card> {
    const db = await getDb()
    const t = new Date().toISOString()
    await db.execute(
      'INSERT INTO cards (id, title, "order", column_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [data.id, data.title, data.order, data.column_id, t, t]
    )
    return { ...data, created_at: t, updated_at: t }
  },

  async update(id: string, data: Partial<Omit<Card, "id" | "created_at" | "updated_at">>): Promise<void> {
    const db = await getDb()
    const t = new Date().toISOString()
    const sets: string[] = []
    const vals: unknown[] = []
    const fields: (keyof typeof data)[] = [
      "title", "description", "order", "column_id",
      "spotify_track_id", "spotify_track_name", "spotify_artist",
      "due_date", "labels",
    ]
    for (const f of fields) {
      if (f in data) {
        const col = f === "order" ? '"order"' : f
        sets.push(`${col} = ?`)
        vals.push(data[f] ?? null)
      }
    }
    sets.push("updated_at = ?"); vals.push(t)
    vals.push(id)
    await db.execute(`UPDATE cards SET ${sets.join(", ")} WHERE id = ?`, vals)
  },

  async delete(id: string): Promise<void> {
    const db = await getDb()
    await db.execute("DELETE FROM cards WHERE id = ?", [id])
  },
}

export const notesDb = {
  async getAll(): Promise<Note[]> {
    const db = await getDb()
    return db.select<Note[]>(
      "SELECT id, title, emoji, spotify_track_name, updated_at, created_at FROM notes ORDER BY updated_at DESC"
    )
  },

  async getById(id: string): Promise<Note | null> {
    const db = await getDb()
    const rows = await db.select<Note[]>("SELECT * FROM notes WHERE id = ?", [id])
    return rows[0] ?? null
  },

  async create(data: { id: string; title: string; emoji: string }): Promise<Note> {
    const db = await getDb()
    const t = new Date().toISOString()
    await db.execute(
      "INSERT INTO notes (id, title, emoji, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
      [data.id, data.title, data.emoji, JSON.stringify({ type: "doc", content: [] }), t, t]
    )
    return { ...data, content: JSON.stringify({ type: "doc", content: [] }), created_at: t, updated_at: t }
  },

  async update(id: string, data: Partial<Omit<Note, "id" | "created_at" | "updated_at">>): Promise<void> {
    const db = await getDb()
    const t = new Date().toISOString()
    const sets: string[] = []
    const vals: unknown[] = []
    const fields: (keyof typeof data)[] = [
      "title", "content", "emoji",
      "spotify_track_id", "spotify_track_name", "spotify_artist",
    ]
    for (const f of fields) {
      if (f in data) {
        sets.push(`${f} = ?`)
        vals.push(data[f] ?? null)
      }
    }
    sets.push("updated_at = ?"); vals.push(t)
    vals.push(id)
    await db.execute(`UPDATE notes SET ${sets.join(", ")} WHERE id = ?`, vals)
  },

  async delete(id: string): Promise<void> {
    const db = await getDb()
    await db.execute("DELETE FROM notes WHERE id = ?", [id])
  },
}
