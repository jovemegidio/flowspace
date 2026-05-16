import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FileText, Plus, Trash2 } from "lucide-react"
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
    await notesDb.delete(id)
    setNotes((p) => p.filter((n) => n.id !== id))
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="text-[20px] font-bold text-[#efefef]">Notas</h1>
            <p className="text-[#4a4a4a] text-[12px] mt-0.5">
              {notes.length} {notes.length === 1 ? "nota" : "notas"}
            </p>
          </div>
          <button
            onClick={createNote}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 active:scale-95 text-white rounded-lg text-[13px] font-medium transition-all shadow-lg shadow-violet-600/20"
          >
            <Plus className="w-4 h-4" />
            Nova nota
          </button>
        </div>

        {/* Empty state */}
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#161616] border border-[#1e1e1e] flex items-center justify-center">
              <FileText className="w-7 h-7 text-[#2a2a2a]" />
            </div>
            <div className="text-center">
              <p className="text-[14px] text-[#555] mb-1">Nenhuma nota ainda</p>
              <p className="text-[12px] text-[#3a3a3a]">Crie uma para capturar suas ideias</p>
            </div>
            <button
              onClick={createNote}
              className="text-[13px] text-violet-400 hover:text-violet-300 transition-colors"
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
                  className="w-full text-left bg-[#141414] border border-[#1f1f1f] rounded-xl p-4 hover:border-[#2a2a2a] hover:bg-[#181818] transition-all hover:-translate-y-0.5 min-h-[120px] flex flex-col"
                >
                  <span className="text-[22px] block mb-2.5 leading-none">{n.emoji}</span>
                  <p className="font-medium text-[#e8e8e8] text-[13px] leading-snug line-clamp-2 flex-1">
                    {n.title}
                  </p>
                  {n.spotify_track_name && (
                    <p className="text-[#1DB954] text-[11px] mt-1.5 truncate">
                      ♫ {n.spotify_track_name}
                    </p>
                  )}
                  <p className="text-[#333] text-[11px] mt-2">
                    {new Date(n.updated_at).toLocaleDateString("pt-BR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </button>
                <button
                  onClick={(e) => deleteNote(n.id, e)}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-[#1e1e1e] hover:bg-red-900/30 text-[#444] hover:text-red-400 transition-all"
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
