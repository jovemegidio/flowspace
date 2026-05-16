import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Music2, Trash2, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cardsDb, Card } from "@/lib/db"
import { useSpotifyStore } from "@/store"

interface Props {
  card: Card
  overlay?: boolean
  onUpdate?: (card: Card) => void
  onDelete?: (cardId: string) => void
}

export function KanbanCard({ card, overlay, onUpdate, onDelete }: Props) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description ?? "")
  const openSearch = useSpotifyStore((s) => s.openSearch)
  const spotifyConnected = useSpotifyStore((s) => s.spotifyConnected)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    disabled: !!overlay,
  })

  const style = overlay
    ? { transform: "rotate(2deg)" }
    : { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.25 : 1 }

  async function saveFields(updates: Partial<Card> = {}) {
    const base = { title, description: description || undefined }
    const merged = { ...base, ...updates }
    try { await cardsDb.update(card.id, merged) } catch {}
    onUpdate?.({ ...card, ...merged })
  }

  async function attachSpotify() {
    openSearch(async (track) => {
      const updates = {
        spotify_track_id: track.id,
        spotify_track_name: track.name,
        spotify_artist: track.artist,
      }
      try { await cardsDb.update(card.id, updates) } catch {}
      onUpdate?.({ ...card, ...updates })
    })
  }

  async function removeSpotify(e: React.MouseEvent) {
    e.stopPropagation()
    const updates = {
      spotify_track_id: undefined,
      spotify_track_name: undefined,
      spotify_artist: undefined,
    }
    try { await cardsDb.update(card.id, updates) } catch {}
    onUpdate?.({ ...card, ...updates })
  }

  async function handleDelete() {
    try { await cardsDb.delete(card.id) } catch {}
    onDelete?.(card.id)
    setOpen(false)
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={{
          ...style,
          background: "var(--bg-surface-1)",
          border: `1px solid var(--border)`,
        }}
        {...attributes}
        {...listeners}
        onClick={() => !overlay && setOpen(true)}
        role="button"
        aria-label={`Card: ${card.title}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            if (!overlay) setOpen(true)
          }
        }}
        className={[
          "rounded-xl p-3 cursor-pointer transition-all group select-none",
          overlay ? "shadow-2xl rotate-2" : "hover:border-[var(--border-subtle)]",
        ].join(" ")}
      >
        <p className="text-[13px] leading-snug" style={{ color: "var(--text-primary)" }}>
          {card.title}
        </p>
        {card.description && (
          <p
            className="text-[11px] line-clamp-2 mt-1.5 leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            {card.description}
          </p>
        )}
        {card.spotify_track_name && (
          <span
            className="inline-flex items-center gap-1 text-[11px] rounded-full px-2 py-0.5 max-w-full mt-2"
            style={{ color: "#1DB954", background: "rgba(29,185,84,0.08)" }}
          >
            <Music2 className="w-3 h-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{card.spotify_track_name}</span>
            <button
              onClick={removeSpotify}
              aria-label="Remover música vinculada"
              className="ml-0.5 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 flex items-center justify-center px-4"
            style={{ background: "rgba(0,0,0,0.75)" }}
            onClick={() => { saveFields(); setOpen(false) }}
            role="dialog"
            aria-modal="true"
            aria-label={`Editar card: ${card.title}`}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 4 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="rounded-2xl w-full max-w-md p-5 shadow-2xl"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => saveFields({ title })}
                  aria-label="Título do card"
                  className="flex-1 bg-transparent font-semibold text-[15px] outline-none pb-1 mr-3 transition-colors"
                  style={{
                    color: "var(--text-primary)",
                    borderBottom: "1px solid var(--border-subtle)",
                  }}
                />
                <button
                  onClick={() => { saveFields(); setOpen(false) }}
                  aria-label="Fechar"
                  className="p-1 shrink-0 mt-0.5 transition-colors"
                  style={{ color: "var(--text-muted)" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => saveFields({ description: description || undefined })}
                placeholder="Adicionar descrição..."
                rows={4}
                aria-label="Descrição do card"
                className="w-full text-[13px] rounded-xl px-3 py-2.5 outline-none resize-none mb-4 transition-colors"
                style={{
                  background: "var(--input-bg)",
                  border: "1px solid var(--input-border)",
                  color: "var(--text-primary)",
                }}
              />

              {card.spotify_track_name && (
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4"
                  style={{ background: "rgba(29,185,84,0.08)", border: "1px solid rgba(29,185,84,0.1)" }}
                >
                  <Music2 className="w-4 h-4 shrink-0" style={{ color: "#1DB954" }} />
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium truncate" style={{ color: "#1DB954" }}>
                      {card.spotify_track_name}
                    </p>
                    {card.spotify_artist && (
                      <p className="text-[11px] truncate" style={{ color: "rgba(29,185,84,0.5)" }}>
                        {card.spotify_artist}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                {spotifyConnected && (
                  <button
                    onClick={attachSpotify}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium transition-colors"
                    style={{
                      background: "rgba(29,185,84,0.08)",
                      border: "1px solid rgba(29,185,84,0.1)",
                      color: "#1DB954",
                    }}
                  >
                    <Music2 className="w-3.5 h-3.5" aria-hidden="true" />
                    {card.spotify_track_name ? "Trocar música" : "Vincular música"}
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  aria-label="Excluir card"
                  className="ml-auto flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] transition-colors hover:text-red-400"
                  style={{ color: "var(--text-muted)" }}
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  Excluir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
