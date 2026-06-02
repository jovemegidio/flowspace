import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FileText, Plus, Trash2, Music2 } from "lucide-react"
import { notesDb, type Note } from "@/lib/db"
import { generateId } from "@/lib/utils"

export function NotesPage() {
  const navigate = useNavigate()
  const [notes, setNotes] = useState<Note[]>([])

  useEffect(() => { notesDb.getAll().then(setNotes) }, [])

  async function createNote() {
    const note = await notesDb.create({ id: generateId(), title: "Nova nota", emoji: "📝" })
    navigate(`/notes/${note.id}`)
  }

  async function deleteNote(id: string, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    await notesDb.delete(id)
    setNotes((p) => p.filter((n) => n.id !== id))
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
              {notes.length} {notes.length === 1 ? "nota" : "notas"}
            </p>
            <h1
              className="text-[28px] font-bold tracking-tight leading-none"
              style={{ color: "var(--text-primary)" }}
            >
              Notas
            </h1>
          </div>
          <button
            onClick={createNote}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all active:scale-95 shrink-0 hover:opacity-90"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            <Plus className="w-4 h-4" />
            Nova nota
          </button>
        </div>

        {/* Empty state */}
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "var(--card-bg)", border: "1px solid var(--border-subtle)" }}
            >
              <FileText className="w-7 h-7" style={{ color: "var(--text-faint)" }} />
            </div>
            <div className="text-center">
              <p className="text-[14px] mb-1" style={{ color: "var(--text-secondary)" }}>Nenhuma nota ainda</p>
              <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>Crie uma para capturar suas ideias</p>
            </div>
            <button
              onClick={createNote}
              className="text-[13px] transition-opacity hover:opacity-80"
              style={{ color: "var(--accent)" }}
            >
              Criar primeira nota →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {notes.map((n) => (
              <div key={n.id} className="relative group">
                <button
                  onClick={() => navigate(`/notes/${n.id}`)}
                  className="w-full text-left rounded-xl p-4 transition-all hover:-translate-y-0.5 min-h-[120px] flex flex-col"
                  style={{ background: "var(--card-bg)", border: "1px solid var(--border-subtle)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.28)" }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-subtle)"; e.currentTarget.style.boxShadow = "none" }}
                >
                  <span className="text-[22px] block mb-2.5 leading-none">{n.emoji}</span>
                  <p className="font-medium text-[13px] leading-snug line-clamp-2 flex-1" style={{ color: "var(--text-primary)" }}>
                    {n.title}
                  </p>
                  {n.spotify_track_name && (
                    <p className="text-[11px] mt-1.5 truncate flex items-center gap-1" style={{ color: "#1DB954" }}>
                      <Music2 className="w-3 h-3 shrink-0" />
                      <span className="truncate">{n.spotify_track_name}</span>
                    </p>
                  )}
                  <p className="text-[11px] mt-2" style={{ color: "var(--text-faint)" }}>
                    {new Date(n.updated_at).toLocaleDateString("pt-BR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </button>
                <button
                  onClick={(e) => deleteNote(n.id, e)}
                  aria-label="Excluir nota"
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all hover:!text-red-400"
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
