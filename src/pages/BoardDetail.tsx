import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { boardsDb, type Board, type Column } from "@/lib/db"
import { KanbanBoard } from "@/components/kanban/KanbanBoard"
import { ArrowLeft } from "lucide-react"

export function BoardDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [board, setBoard] = useState<(Board & { columns: Column[] }) | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    boardsDb.getWithColumns(id).then((b) => { setBoard(b); setLoading(false) })
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!board) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-[#444]">
        <p className="text-[13px]">Board não encontrado.</p>
        <button
          onClick={() => navigate("/boards")}
          className="text-indigo-400 hover:text-indigo-300 text-[13px] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para boards
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 h-12 border-b border-[#181818] shrink-0">
        <button
          onClick={() => navigate("/boards")}
          className="p-1.5 text-[#3a3a3a] hover:text-[#aaa] hover:bg-white/5 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="h-3.5 w-[3px] rounded-full" style={{ background: board.color }} />
        <h1 className="text-[14px] font-semibold text-[#e8e8e8] truncate">{board.title}</h1>
        {board.description && (
          <span className="text-[12px] text-[#3a3a3a] truncate hidden sm:block">
            {board.description}
          </span>
        )}
      </div>

      {/* Board */}
      <div className="flex-1 overflow-hidden p-4">
        <KanbanBoard boardId={board.id} initialColumns={board.columns} />
      </div>
    </div>
  )
}
