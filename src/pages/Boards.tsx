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
      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="text-[20px] font-bold text-[#efefef]">Boards</h1>
            <p className="text-[#4a4a4a] text-[12px] mt-0.5">
              {boards.length} {boards.length === 1 ? "board" : "boards"}
            </p>
          </div>
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-lg text-[13px] font-medium transition-all shadow-lg shadow-indigo-600/20"
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
              className="bg-[#141414] border border-[#222] rounded-2xl p-5 mb-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-[#e0e0e0] text-[14px]">Criar board</h2>
                <button
                  type="button"
                  onClick={() => setCreating(false)}
                  className="text-[#3a3a3a] hover:text-[#777] transition-colors"
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
                  className="w-full bg-[#0f0f0f] border border-[#222] focus:border-indigo-500/40 text-[#e8e8e8] rounded-lg px-3 py-2.5 text-[13px] outline-none transition-colors placeholder:text-[#3a3a3a]"
                />
                <input
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Descrição (opcional)"
                  className="w-full bg-[#0f0f0f] border border-[#222] focus:border-indigo-500/40 text-[#e8e8e8] rounded-lg px-3 py-2.5 text-[13px] outline-none transition-colors placeholder:text-[#3a3a3a]"
                />
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-[#4a4a4a] uppercase tracking-wide">Cor</span>
                  <div className="flex gap-2">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className="w-5.5 h-5.5 rounded-full transition-all hover:scale-110 relative flex items-center justify-center"
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
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[13px] font-medium transition-colors"
                  >
                    Criar
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreating(false)}
                    className="px-4 py-2 text-[#4a4a4a] hover:text-[#888] text-[13px] transition-colors rounded-lg"
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
            <div className="w-16 h-16 rounded-2xl bg-[#161616] border border-[#1e1e1e] flex items-center justify-center">
              <LayoutDashboard className="w-7 h-7 text-[#2a2a2a]" />
            </div>
            <div className="text-center">
              <p className="text-[14px] text-[#555] mb-1">Nenhum board ainda</p>
              <p className="text-[12px] text-[#3a3a3a]">Crie um para organizar suas tarefas</p>
            </div>
            <button
              onClick={() => setCreating(true)}
              className="text-[13px] text-indigo-400 hover:text-indigo-300 transition-colors"
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
                  className="block bg-[#141414] border border-[#1f1f1f] rounded-xl overflow-hidden hover:border-[#2a2a2a] hover:bg-[#181818] transition-all hover:-translate-y-0.5"
                >
                  <div className="h-[3px]" style={{ background: b.color }} />
                  <div className="p-4">
                    <div
                      className="w-9 h-9 rounded-xl mb-3.5 flex items-center justify-center"
                      style={{ background: b.color + "18" }}
                    >
                      <div className="w-3.5 h-3.5 rounded" style={{ background: b.color }} />
                    </div>
                    <p className="font-semibold text-[#e8e8e8] text-[13px] truncate">{b.title}</p>
                    {b.description && (
                      <p className="text-[#4a4a4a] text-[11px] truncate mt-0.5">{b.description}</p>
                    )}
                  </div>
                </Link>
                <button
                  onClick={(e) => del(b.id, e)}
                  className="absolute top-4 right-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-[#1e1e1e] hover:bg-red-900/30 text-[#444] hover:text-red-400 transition-all"
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
