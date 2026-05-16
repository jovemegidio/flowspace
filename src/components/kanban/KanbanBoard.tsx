import { useState, useCallback } from "react"
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  DragStartEvent, DragOverEvent, DragEndEvent, closestCorners,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable"
import { Plus } from "lucide-react"
import { columnsDb, cardsDb, Column, Card } from "@/lib/db"
import { KanbanColumn } from "./KanbanColumn"
import { KanbanCard } from "./KanbanCard"

interface Props { boardId: string; initialColumns: Column[] }

export function KanbanBoard({ boardId, initialColumns }: Props) {
  const [columns, setColumns] = useState<Column[]>(initialColumns)
  const [activeCard, setActiveCard] = useState<Card | null>(null)
  const [addingColumn, setAddingColumn] = useState(false)
  const [newColTitle, setNewColTitle] = useState("")

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const findCard = useCallback((id: string) => {
    for (const col of columns) {
      const card = col.cards.find((c) => c.id === id)
      if (card) return { card, column: col }
    }
    return null
  }, [columns])

  function onDragStart(e: DragStartEvent) {
    const found = findCard(String(e.active.id))
    if (found) setActiveCard(found.card)
  }

  function onDragOver(e: DragOverEvent) {
    const { active, over } = e
    if (!over) return
    const activeId = String(active.id)
    const overId = String(over.id)
    if (activeId === overId) return
    const activeInfo = findCard(activeId)
    if (!activeInfo) return

    setColumns((prev) => {
      const cols = prev.map((c) => ({ ...c, cards: [...c.cards] }))
      const srcColIdx = cols.findIndex((c) => c.id === activeInfo.column.id)
      const srcCardIdx = cols[srcColIdx].cards.findIndex((c) => c.id === activeId)

      const overColIdx = cols.findIndex((c) => c.id === overId)
      if (overColIdx !== -1) {
        const [moved] = cols[srcColIdx].cards.splice(srcCardIdx, 1)
        moved.column_id = overId
        cols[overColIdx].cards.push(moved)
        return cols
      }

      let dstColIdx = -1, dstCardIdx = -1
      for (let ci = 0; ci < cols.length; ci++) {
        const idx = cols[ci].cards.findIndex((c) => c.id === overId)
        if (idx !== -1) { dstColIdx = ci; dstCardIdx = idx; break }
      }
      if (dstColIdx === -1) return cols

      if (srcColIdx === dstColIdx) {
        cols[srcColIdx].cards = arrayMove(cols[srcColIdx].cards, srcCardIdx, dstCardIdx)
      } else {
        const [moved] = cols[srcColIdx].cards.splice(srcCardIdx, 1)
        moved.column_id = cols[dstColIdx].id
        cols[dstColIdx].cards.splice(dstCardIdx, 0, moved)
      }
      return cols
    })
  }

  async function onDragEnd(e: DragEndEvent) {
    setActiveCard(null)
    const cardId = String(e.active.id)
    const col = columns.find((c) => c.cards.some((ca) => ca.id === cardId))
    if (!col) return
    const idx = col.cards.findIndex((c) => c.id === cardId)
    try { await cardsDb.update(cardId, { column_id: col.id, order: idx }) } catch {}
  }

  async function addColumn() {
    const t = newColTitle.trim()
    if (!t) return
    try {
      const id = crypto.randomUUID()
      const col = await columnsDb.create({ id, title: t, order: columns.length, board_id: boardId })
      setColumns((prev) => [...prev, col])
      setNewColTitle("")
      setAddingColumn(false)
    } catch {}
  }

  function onCardAdd(colId: string, card: Card) {
    setColumns((prev) => prev.map((c) => c.id === colId ? { ...c, cards: [...c.cards, card] } : c))
  }
  function onCardUpdate(updated: Card) {
    setColumns((prev) => prev.map((c) => ({
      ...c, cards: c.cards.map((ca) => ca.id === updated.id ? updated : ca),
    })))
  }
  function onCardDelete(cardId: string) {
    setColumns((prev) => prev.map((c) => ({ ...c, cards: c.cards.filter((ca) => ca.id !== cardId) })))
  }
  async function onColumnDelete(colId: string) {
    try { await columnsDb.delete(colId) } catch {}
    setColumns((prev) => prev.filter((c) => c.id !== colId))
  }
  async function onColumnRename(colId: string, title: string) {
    try { await columnsDb.update(colId, { title }) } catch {}
    setColumns((prev) => prev.map((c) => c.id === colId ? { ...c, title } : c))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-3.5 h-full overflow-x-auto pb-4 pt-0.5 px-0.5">
        <SortableContext items={columns.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
          {columns.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              onCardAdd={onCardAdd}
              onCardUpdate={onCardUpdate}
              onCardDelete={onCardDelete}
              onDelete={onColumnDelete}
              onRename={onColumnRename}
            />
          ))}
        </SortableContext>

        {/* Add column */}
        <div className="shrink-0 w-[272px]">
          {addingColumn ? (
            <div className="bg-[#141414] border border-[#222] rounded-2xl p-3 flex flex-col gap-2">
              <input
                autoFocus
                value={newColTitle}
                onChange={(e) => setNewColTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addColumn()
                  if (e.key === "Escape") setAddingColumn(false)
                }}
                placeholder="Nome da coluna"
                className="bg-[#0f0f0f] border border-[#222] rounded-lg px-3 py-1.5 text-[13px] text-[#e8e8e8] outline-none focus:border-indigo-500/40 placeholder:text-[#3a3a3a] transition-colors"
              />
              <div className="flex gap-2">
                <button
                  onClick={addColumn}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] py-1.5 rounded-lg transition-colors font-medium"
                >
                  Adicionar
                </button>
                <button
                  onClick={() => setAddingColumn(false)}
                  className="px-3 text-[#4a4a4a] hover:text-[#888] text-[12px] py-1.5 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingColumn(true)}
              className="w-full flex items-center gap-2 px-4 py-3 rounded-2xl border border-dashed border-[#222] text-[#3a3a3a] hover:text-[#777] hover:border-[#2e2e2e] hover:bg-white/[0.02] transition-all text-[13px]"
            >
              <Plus className="w-4 h-4" />
              Adicionar coluna
            </button>
          )}
        </div>
      </div>

      <DragOverlay>
        {activeCard && <KanbanCard card={activeCard} overlay />}
      </DragOverlay>
    </DndContext>
  )
}
