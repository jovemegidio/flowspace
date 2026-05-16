"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, FileText, Trash2 } from "lucide-react"

interface Note {
  id: string
  title: string
  emoji: string
  updatedAt: string
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/notes")
      .then((r) => r.json())
      .then(setNotes)
      .finally(() => setLoading(false))
  }, [])

  async function createNote() {
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Nova nota", emoji: "📝" }),
    })
    const note = await res.json()
    window.location.href = `/dashboard/notes/${note.id}`
  }

  async function deleteNote(id: string, e: React.MouseEvent) {
    e.preventDefault()
    await fetch(`/api/notes/${id}`, { method: "DELETE" })
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-purple-400" />
          <h1 className="text-2xl font-bold text-white">Notas</h1>
        </div>
        <button
          onClick={createNote}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova nota
        </button>
      </div>

      {loading ? (
        <div className="text-[#555] text-sm">Carregando...</div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-[#555]">
          <FileText className="w-12 h-12 mb-4 opacity-30" />
          <p className="text-sm">Nenhuma nota ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {notes.map((n) => (
            <div key={n.id} className="relative group">
              <Link
                href={`/dashboard/notes/${n.id}`}
                className="block bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-5 hover:border-[#444] transition-colors min-h-[120px]"
              >
                <span className="text-3xl mb-3 block">{n.emoji}</span>
                <p className="font-medium text-white text-sm leading-snug">{n.title}</p>
                <p className="text-[#555] text-xs mt-2">
                  {new Date(n.updatedAt).toLocaleDateString("pt-BR")}
                </p>
              </Link>
              <button
                onClick={(e) => deleteNote(n.id, e)}
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
