import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { notesDb, type Note } from "@/lib/db"
import { NoteEditor } from "@/components/editor/NoteEditor"
import { ArrowLeft } from "lucide-react"

export function NoteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [note, setNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    notesDb.getById(id).then((n) => { setNote(n); setLoading(false) })
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-5 h-5 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-[#555]">
        <p className="text-sm">Nota não encontrada.</p>
        <button onClick={() => navigate("/notes")} className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Voltar para notas
        </button>
      </div>
    )
  }

  return <NoteEditor note={note} />
}
