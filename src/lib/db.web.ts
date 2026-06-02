// Browser fallback for @tauri-apps/plugin-sql using sql.js (SQLite compiled to WASM).
// Persists the database to localStorage so data survives reloads in the web preview.
import initSqlJs, { type Database as SqlJsDatabase, type SqlValue } from "sql.js"
// Bundle the wasm through Vite so it is served same-origin (CDN fetches are blocked in the preview).
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url"

const STORAGE_KEY = "flowspace-websql"

export interface WebQueryResult {
  rowsAffected: number
  lastInsertId?: number
}

function toBase64(bytes: Uint8Array): string {
  let binary = ""
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export class WebDatabase {
  private db: SqlJsDatabase

  private constructor(db: SqlJsDatabase) {
    this.db = db
  }

  static async load(): Promise<WebDatabase> {
    const SQL = await initSqlJs({
      locateFile: () => wasmUrl,
    })
    const saved = localStorage.getItem(STORAGE_KEY)
    const db = saved ? new SQL.Database(fromBase64(saved)) : new SQL.Database()
    return new WebDatabase(db)
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, toBase64(this.db.export()))
    } catch {
      // ignore quota/serialization errors in preview
    }
  }

  async execute(sql: string, params: unknown[] = []): Promise<WebQueryResult> {
    this.db.run(sql, params as SqlValue[])
    this.persist()
    const rowsAffected = this.db.getRowsModified()
    let lastInsertId: number | undefined
    try {
      const res = this.db.exec("SELECT last_insert_rowid() AS id")
      lastInsertId = Number(res[0]?.values?.[0]?.[0] ?? 0)
    } catch {
      lastInsertId = undefined
    }
    return { rowsAffected, lastInsertId }
  }

  async select<T>(sql: string, params: unknown[] = []): Promise<T> {
    const stmt = this.db.prepare(sql)
    stmt.bind(params as SqlValue[])
    const rows: Record<string, SqlValue>[] = []
    while (stmt.step()) rows.push(stmt.getAsObject())
    stmt.free()
    return rows as unknown as T
  }
}
