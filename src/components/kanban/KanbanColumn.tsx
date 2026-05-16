import { useState } from "react"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Plus, Trash2, Pencil, Check, X } from "lucide-react"
import { cardsDb, Column, Card } from "@/lib/db"
import { KanbanCard } from "./KanbanCard"

interface Props {
  column: Column
  onCardAdd: (colId: string, card: Card) => void
  onCardUpdate: (card: Card) => void
  onCardDelete: (cardId: string) => void
  onDelete: (colId: string) => void
  onRename: (colId: string, title: string) => void
}

export function KanbanColumn({ column, onCardAdd, onCardUpdate, onCardDelete, onDelete, onRename }: Props) {
  const [addingCard, setAddingCard] = useState(false)
  const [newCardTitle, setNewCardTitle] = useState("")
  const [renaming, setRenaming] = useState(false)
  const [renameVal, setRenameVal] = useState(column.title)

  const { setNodeRef, transform, transition, isDragging } = useSortable({ id: column.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.35 : 1 }

  async function handleAddCard() {
    const t = newCardTitle.trim()
    if (!t) return
    try {
      const id = crypto.randomUUID()
      const card = await cardsDb.create({ id, title: t, order: column.cards.length, column_id: column.id })
      onCardAdd(column.id, card)
      setNewCardTitle("")
      setAddingCard(false)
    } catch {}
  }

  function confirmRename() {
    const t = renameVal.trim()
    if (t && t !== column.title) onRename(column.id, t)
    setRenaming(false)
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
      }}
      className="w-[272px] shrink-0 rounded-2xl flex flex-col max-h-[calc(100vh-200px)]"
      role="group"
      aria-label={`Coluna: ${column.title}`}
    >
      {/* Column header */}
      <div
        className="flex items-center justify-between px-3.5 py-2.5 shrink-0 group"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        {renaming ? (
          <div className="flex items-center gap-1 flex-1 mr-1">
            <input
              autoFocus
              value={renameVal}
              onChange={(e) => setRenameVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmRename()
                if (e.key === "Escape") setRenaming(false)
              }}
              aria-label="Renomear coluna"
              className="flex-1 text-[13px] rounded-md px-2 py-0.5 outline-none focus:outline-none"
              style={{
                background: "var(--bg-surface-2)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
              }}
            />
            <button
              onClick={confirmRename}
              aria-label="Confirmar renomear"
              className="p-1 transition-colors"
              style={{ color: "var(--accent)" }}
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setRenaming(false)}
              aria-label="Cancelar renomear"
              className="p-1 transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span
              className="font-semibold text-[13px] truncate"
              style={{ color: "var(--text-secondary)" }}
            >
              {column.title}
            </span>
            <span
              className="text-[11px] px-1.5 py-0.5 rounded-md shrink-0 font-medium"
              style={{ background: "var(--bg-surface-2)", color: "var(--text-muted)" }}
            >
              {column.cards.length}
            </span>
          </div>
        )}
        {!renaming && (
          <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => { setRenameVal(column.title); setRenaming(true) }}
              aria-label={`Renomear coluna ${column.title}`}
              className="p-1.5 rounded-md transition-colors"
              style={{ color: "var(--text-faint)" }}
            >
              <Pencil className="w-3 h-3" />
            </button>
            <button
              onClick={() => setAddingCard(true)}
              aria-label={`Adicionar card em ${column.title}`}
              className="p-1.5 rounded-md transition-colors"
              style={{ color: "var(--text-faint)" }}
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(column.id)}
              aria-label={`Excluir coluna ${column.title}`}
              className="p-1.5 rounded-md transition-colors hover:text-red-400"
              style={{ color: "var(--text-faint)" }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 min-h-[40px]">
        <SortableContext items={column.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {column.cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              onUpdate={onCardUpdate}
              onDelete={onCardDelete}
            />
          ))}
        </SortableContext>
      </div>

      {/* Add card */}
      {addingCard ? (
        <div
          className="p-2 shrink-0"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          <textarea
            autoFocus
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddCard() }
              if (e.key === "Escape") { setAddingCard(false); setNewCardTitle("") }
            }}
            placeholder="Título do card..."
            rows={2}
            aria-label="Título do novo card"
            className="w-full rounded-lg px-3 py-2 text-[13px] outline-none resize-none transition-colors"
            style={{
              background: "var(--input-bg)",
              border: "1px solid var(--input-border)",
              color: "var(--text-primary)",
            }}
          />
          <div className="flex gap-2 mt-1.5">
            <button
              onClick={handleAddCard}
              className="px-3 py-1.5 text-white rounded-lg text-[12px] font-medium transition-colors"
              style={{ background: "var(--accent)" }}
            >
              Adicionar
            </button>
            <button
              onClick={() => { setAddingCard(false); setNewCardTitle("") }}
              className="px-3 py-1.5 text-[12px] transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAddingCard(true)}
          className="flex items-center gap-2 px-3.5 py-2.5 text-[12px] transition-colors rounded-b-2xl shrink-0"
          style={{
            color: "var(--text-faint)",
            borderTop: "1px solid var(--border-subtle)",
          }}
          aria-label={`Adicionar card em ${column.title}`}
        >
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          Adicionar card
        </button>
      )}
    </div>
  )
}
