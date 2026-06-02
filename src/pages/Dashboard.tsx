import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { LayoutDashboard, FileText, Plus, Music2, ChevronRight, Play } from "lucide-react"
import { boardsDb, notesDb, type Board, type Note } from "@/lib/db"
import { useSpotifyStore } from "@/store"
import { useLocalPlayerStore } from "@/store/localPlayer"

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return "Bom dia"
  if (h < 18) return "Boa tarde"
  return "Boa noite"
}

function todayStr() {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date())
}

export function DashboardPage() {
  const [boards, setBoards] = useState<Board[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const nowPlaying = useSpotifyStore((s) => s.nowPlaying)
  const spotifyConnected = useSpotifyStore((s) => s.spotifyConnected)
  const localTracks = useLocalPlayerStore((s) => s.tracks)
  const localCurrentIndex = useLocalPlayerStore((s) => s.currentIndex)
  const localIsPlaying = useLocalPlayerStore((s) => s.isPlaying)
  const navigate = useNavigate()

  useEffect(() => {
    boardsDb.getAll().then(setBoards)
    notesDb.getAll().then(setNotes)
  }, [])

  const hasMusic = spotifyConnected || localTracks.length > 0
  const localCurrent = localTracks[localCurrentIndex]

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-8 py-10">

        {/* Header */}
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-2 capitalize"
              style={{ color: "var(--accent)" }}
            >
              {todayStr()}
            </p>
            <h1
              className="text-[28px] font-bold tracking-tight leading-none text-balance"
              style={{ color: "var(--text-primary)" }}
            >
              {greeting()}
            </h1>
          </div>
          <button
            onClick={() => navigate("/boards")}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium shrink-0 transition-all hover:opacity-90"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            <Plus className="w-4 h-4" />
            Novo board
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          <StatCard
            to="/boards"
            iconBg="rgba(99,102,241,0.1)"
            icon={<LayoutDashboard className="w-4 h-4" style={{ color: "#818cf8" }} />}
            label="Boards"
            value={String(boards.length)}
          />
          <StatCard
            to="/notes"
            iconBg="rgba(139,92,246,0.1)"
            icon={<FileText className="w-4 h-4" style={{ color: "#a78bfa" }} />}
            label="Notas"
            value={String(notes.length)}
          />

          {/* Music card */}
          {spotifyConnected && nowPlaying ? (
            <div
              className="rounded-xl p-5 flex flex-col"
              style={{ background: "var(--card-bg)", border: "1px solid var(--border-subtle)" }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                style={{ background: "rgba(29,185,84,0.12)" }}
              >
                <Music2 className="w-4 h-4" style={{ color: "#1DB954" }} />
              </div>
              <p className="text-[15px] font-semibold truncate leading-tight mb-1" style={{ color: "var(--text-primary)" }}>
                {nowPlaying.name}
              </p>
              <p className="text-[11px] uppercase tracking-[0.1em] font-medium truncate" style={{ color: "var(--text-muted)" }}>
                {nowPlaying.artist || "Spotify"}
              </p>
            </div>
          ) : localTracks.length > 0 ? (
            <div
              className="rounded-xl p-5 flex flex-col"
              style={{ background: "var(--card-bg)", border: "1px solid var(--border-subtle)" }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                style={{ background: "rgba(139,92,246,0.12)" }}
              >
                <Music2 className="w-4 h-4" style={{ color: "#a78bfa" }} />
              </div>
              <p className="text-[15px] font-semibold truncate leading-tight mb-1 flex items-center gap-1.5" style={{ color: "var(--text-primary)" }}>
                {localIsPlaying && <Play className="w-3 h-3 fill-current shrink-0" style={{ color: "#a78bfa" }} />}
                <span className="truncate">{localCurrent?.name ?? "—"}</span>
              </p>
              <p className="text-[11px] uppercase tracking-[0.1em] font-medium" style={{ color: "var(--text-muted)" }}>
                {localTracks.length} faixa{localTracks.length !== 1 ? "s" : ""}
              </p>
            </div>
          ) : (
            <button
              onClick={() => navigate("/settings?tab=spotify")}
              className="group rounded-xl p-5 transition-all text-left flex flex-col"
              style={{ background: "var(--card-bg)", border: "1px dashed var(--border)" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)" }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)" }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "var(--bg-surface-1)" }}>
                  <Music2 className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                </div>
                <ChevronRight
                  className="w-4 h-4 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0"
                  style={{ color: "var(--accent)" }}
                />
              </div>
              <p className="text-[15px] font-semibold leading-none mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Conectar Spotify
              </p>
              <p className="text-[11px] uppercase tracking-[0.1em] font-medium" style={{ color: "var(--text-muted)" }}>
                Música
              </p>
            </button>
          )}
        </div>

        {/* Recent Boards */}
        <section className="mb-10">
          <SectionHeader title="Boards recentes" to="/boards" linkLabel="Ver todos" />
          {boards.length === 0 ? (
            <EmptySlot to="/boards" label="Criar primeiro board" />
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {boards.slice(0, 4).map((b) => (
                <Link
                  key={b.id}
                  to={`/boards/${b.id}`}
                  className="rounded-xl overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--border-subtle)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  }}
                >
                  <div className="h-[3px]" style={{ background: b.color }} />
                  <div className="p-4">
                    <div
                      className="w-8 h-8 rounded-lg mb-3 flex items-center justify-center"
                      style={{ background: b.color + "18" }}
                    >
                      <div className="w-3 h-3 rounded" style={{ background: b.color }} />
                    </div>
                    <p className="font-semibold text-[13px] truncate" style={{ color: "var(--text-primary)" }}>
                      {b.title}
                    </p>
                    {b.description && (
                      <p className="text-[11px] truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {b.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Recent Notes */}
        <section>
          <SectionHeader title="Notas recentes" to="/notes" linkLabel="Ver todas" />
          {notes.length === 0 ? (
            <EmptySlot to="/notes" label="Criar primeira nota" />
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {notes.slice(0, 4).map((n) => (
                <Link
                  key={n.id}
                  to={`/notes/${n.id}`}
                  className="rounded-xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg flex flex-col"
                  style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--border-subtle)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  }}
                >
                  <span className="text-[22px] block mb-2.5 leading-none">{n.emoji}</span>
                  <p
                    className="font-medium text-[13px] leading-snug line-clamp-2 flex-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {n.title}
                  </p>
                  <p className="text-[11px] mt-2" style={{ color: "var(--text-faint)" }}>
                    {new Date(n.updated_at).toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function StatCard({
  to,
  iconBg,
  icon,
  label,
  value,
}: {
  to: string
  iconBg: string
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <Link
      to={to}
      className="group relative rounded-xl p-5 transition-all hover:-translate-y-0.5"
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.18)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--border)"
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.28)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border-subtle)"
        e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.18)"
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: iconBg }}
        >
          {icon}
        </div>
        <ChevronRight
          className="w-4 h-4 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0"
          style={{ color: "var(--text-muted)" }}
        />
      </div>
      <p className="text-[28px] font-bold leading-none mb-1.5 tracking-tight" style={{ color: "var(--text-primary)" }}>
        {value}
      </p>
      <p className="text-[11px] uppercase tracking-[0.1em] font-medium" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
    </Link>
  )
}

function SectionHeader({ title, to, linkLabel }: { title: string; to: string; linkLabel: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-[13px] font-semibold" style={{ color: "var(--text-secondary)" }}>
        {title}
      </h2>
      <Link
        to={to}
        className="flex items-center gap-0.5 text-[12px] transition-colors"
        style={{ color: "var(--accent)" }}
      >
        {linkLabel} <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  )
}

function EmptySlot({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center justify-center gap-2 border-dashed rounded-xl py-10 transition-colors"
      style={{ border: "1px dashed var(--border)", color: "var(--text-faint)" }}
    >
      <Plus className="w-4 h-4" />
      <span className="text-[12px]">{label}</span>
    </Link>
  )
}
