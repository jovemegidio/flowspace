"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, LayoutDashboard, Trash2 } from "lucide-react"

interface Board {
  id: string
  title: string
  description?: string
  color: string
  updatedAt: string
}

const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f97316",
  "#10b981", "#06b6d4", "#f59e0b", "#ef4444",
]

export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState(COLORS[0])

  useEffect(() => {
    fetch("/api/boards")
      .then((r) => r.json())
      .then(setBoards)
      .finally(() => setLoading(false))
  }, [])

  async function createBoard(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    const res = await fetch("/api/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, color }),
    })
    const board = await res.json()
    setBoards((prev) => [board, ...prev])
    setTitle("")
    setDescription("")
    setColor(COLORS[0])
    setCreating(false)
  }

  async function deleteBoard(id: string) {
    await fetch(`/api/boards/${id}`, { method: "DELETE" })
    setBoards((prev) => prev.filter((b) => b.id !== id))
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="w-6 h-6 text-indigo-400" />
          <h1 className="text-2xl font-bold text-white">Boards</h1>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo board
        </button>
      </div>

      {creating && (
        <form
          onSubmit={createBoard}
          className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-6 mb-6"
        >
          <h2 className="font-semibold text-white mb-4">Criar board</h2>
          <div className="flex flex-col gap-3">
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nome do board"
              className="bg-[#242424] border border-[#3a3a3a] text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 w-full"
            />
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição (opcional)"
              className="bg-[#242424] border border-[#3a3a3a] text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 w-full"
            />
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                  style={{
                    background: c,
                    outline: color === c ? `2px solid white` : "none",
                    outlineOffset: "2px",
                  }}
                />
              ))}
            </div>
            <div className="flex gap-2 mt-1">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Criar
              </button>
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="px-4 py-2 bg-[#242424] hover:bg-[#2e2e2e] text-[#888] rounded-lg text-sm transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-[#555] text-sm">Carregando...</div>
      ) : boards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-[#555]">
          <LayoutDashboard className="w-12 h-12 mb-4 opacity-30" />
          <p className="text-sm">Nenhum board ainda. Crie o primeiro!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {boards.map((b) => (
            <div key={b.id} className="relative group">
              <Link
                href={`/dashboard/board/${b.id}`}
                className="block bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-5 hover:border-[#444] transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-xl mb-4"
                  style={{ background: b.color }}
                />
                <p className="font-semibold text-white text-sm mb-1">{b.title}</p>
                {b.description && (
                  <p className="text-[#666] text-xs truncate">{b.description}</p>
                )}
              </Link>
              <button
                onClick={() => deleteBoard(b.id)}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-[#242424] hover:bg-red-900/50 text-[#666] hover:text-red-400 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
