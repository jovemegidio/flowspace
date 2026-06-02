import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Plus, LayoutDashboard, Trash2, X } from "lucide-react"
import { boardsDb, type Board } from "@/lib/db"
import { generateId } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f97316",
  "#10b981", "#06b6d4", "#f59e0b", "#ef4444",
]

export function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([])
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("")
  const [color, setColor] = useState(COLORS[0])

  useEffect(() => { boardsDb.getAll().then(setBoards) }, [])

  async function create(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    const b = await boardsDb.create({ id: generateId(), title: title.trim(), description: desc, color })
    const { columnsDb } = await import("@/lib/db")
    for (const [t, i] of [["A fazer", 0], ["Em progresso", 1], ["Concluído", 2]] as [string, number][]) {
      await columnsDb.create({ id: generateId(), title: t, order: i, board_id: b.id })
    }
    setBoards((p) => [b, ...p])
    setTitle(""); setDesc(""); setColor(COLORS[0]); setCreating(false)
  }

  async function del(id: string, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    await boardsDb.delete(id)
    setBoards((p) => p.filter((b) => b.id !== id))
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-8 py-10">
        {/* Header */}
        <div className="flex items-end justify-between mb-9 gap-4">
          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-2"
              style={{ color: "var(--accent)" }}
            >
              {boards.length} {boards.length === 1 ? "board" : "boards"}
            </p>
            <h1
              className="text-[28px] font-bold tracking-tight leading-none"
              style={{ color: "var(--text-primary)" }}
            >
              Boards
            </h1>
          </div>
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all active:scale-95 shrink-0 hover:opacity-90"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            <Plus className="w-4 h-4" />
            Novo board
          </button>
        </div>

        {/* Create form */}
        <AnimatePresence>
          {creating && (
            <motion.form
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              onSubmit={create}
              className="rounded-2xl p-5 mb-5"
              style={{ background: "var(--card-bg)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-[14px]" style={{ color: "var(--text-primary)" }}>Criar board</h2>
                <button
                  type="button"
                  onClick={() => setCreating(false)}
                  aria-label="Fechar"
                  className="transition-colors hover:opacity-70"
                  style={{ color: "var(--text-muted)" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nome do board"
                  className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none transition-colors"
                  style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--text-primary)" }}
                />
                <input
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Descrição (opcional)"
                  className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none transition-colors"
                  style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--text-primary)" }}
                />
                <div className="flex items-center gap-3">
                  <span className="text-[11px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Cor</span>
                  <div className="flex gap-2">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        aria-label={`Selecionar cor ${c}`}
                        className="rounded-full transition-all hover:scale-110 relative flex items-center justify-center"
                        style={{ background: c, width: 22, height: 22 }}
                      >
                        {color === c && (
                          <div className="w-2 h-2 rounded-full bg-white/80 shadow-sm" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-[13px] font-medium transition-opacity hover:opacity-90"
                    style={{ background: "var(--accent)", color: "#fff" }}
                  >
                    Criar
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreating(false)}
                    className="px-4 py-2 text-[13px] transition-colors rounded-lg hover:opacity-80"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {boards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "var(--card-bg)", border: "1px solid var(--border-subtle)" }}
            >
              <LayoutDashboard className="w-7 h-7" style={{ color: "var(--text-faint)" }} />
            </div>
            <div className="text-center">
              <p className="text-[14px] mb-1" style={{ color: "var(--text-secondary)" }}>Nenhum board ainda</p>
              <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>Crie um para organizar suas tarefas</p>
            </div>
            <button
              onClick={() => setCreating(true)}
              className="text-[13px] transition-opacity hover:opacity-80"
              style={{ color: "var(--accent)" }}
            >
              Criar primeiro board →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {boards.map((b) => (
              <div key={b.id} className="relative group">
                <Link
                  to={`/boards/${b.id}`}
                  className="block rounded-xl overflow-hidden transition-all hover:-translate-y-0.5"
                  style={{ background: "var(--card-bg)", border: "1px solid var(--border-subtle)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.28)" }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-subtle)"; e.currentTarget.style.boxShadow = "none" }}
                >
                  <div className="h-[3px]" style={{ background: b.color }} />
                  <div className="p-4">
                    <div
                      className="w-9 h-9 rounded-xl mb-3.5 flex items-center justify-center"
                      style={{ background: b.color + "18" }}
                    >
                      <div className="w-3.5 h-3.5 rounded" style={{ background: b.color }} />
                    </div>
                    <p className="font-semibold text-[13px] truncate" style={{ color: "var(--text-primary)" }}>{b.title}</p>
                    {b.description && (
                      <p className="text-[11px] truncate mt-0.5" style={{ color: "var(--text-muted)" }}>{b.description}</p>
                    )}
                  </div>
                </Link>
                <button
                  onClick={(e) => del(b.id, e)}
                  aria-label="Excluir board"
                  className="absolute top-4 right-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all hover:!text-red-400"
                  style={{ background: "var(--bg-surface-2)", color: "var(--text-muted)" }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
