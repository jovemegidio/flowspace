import { useRef, useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { Home, LayoutDashboard, FileText, Settings, Music2, LogOut, BookOpen, FolderOpen, Youtube, Info, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { clearTokens } from "@/lib/spotify"
import { useSpotifyStore } from "@/store"
import { useThemeStore, THEMES } from "@/store/theme"
import { useLocalPlayerStore } from "@/store/localPlayer"
import { useYouTubeStore, extractVideoId } from "@/store/youtube"
import { LocalFileInput } from "@/components/music/LocalPlayer"
import { NowPlaying } from "@/components/spotify/NowPlaying"

const NAV = [
  { to: "/dashboard", label: "Início", Icon: Home, exact: true },
  { to: "/boards", label: "Boards", Icon: LayoutDashboard, exact: false },
  { to: "/notes", label: "Notas", Icon: FileText, exact: false },
  { to: "/library", label: "Biblioteca", Icon: BookOpen, exact: false },
]

export function Sidebar() {
  const navigate = useNavigate()
  const spotifyConnected = useSpotifyStore((s) => s.spotifyConnected)
  const setSpotifyConnected = useSpotifyStore((s) => s.setSpotifyConnected)
  const themeId = useThemeStore((s) => s.themeId)
  const currentTheme = THEMES.find((t) => t.id === themeId)
  const localVisible = useLocalPlayerStore((s) => s.visible)
  const localTracks = useLocalPlayerStore((s) => s.tracks)
  const localFileInputRef = useRef<HTMLInputElement>(null)
  const [ytInput, setYtInput] = useState("")
  const [ytOpen, setYtOpen] = useState(false)
  const { setVideo, isVisible: ytVisible } = useYouTubeStore()

  async function handleDisconnect() {
    await clearTokens()
    setSpotifyConnected(false)
  }

  return (
    <aside
      className="w-52 flex flex-col shrink-0"
      style={{
        background: "var(--sidebar-bg)",
        borderRight: "1px solid var(--border-subtle)",
      }}
      role="navigation"
      aria-label="Menu principal"
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-4 h-11 shrink-0"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <img src="/Icone.png" alt="" className="w-5 h-5 rounded-md object-contain shrink-0" />
        <img
          src="/Logo.png"
          alt="Flowspace"
          className="h-[18px] object-contain"
          style={{ filter: "brightness(1.05)" }}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 pt-4 space-y-0.5" role="menubar">
        <p
          className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: "var(--text-faint)" }}
        >
          Navegação
        </p>
        {NAV.map(({ to, label, Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            role="menuitem"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all focus-visible:outline-none focus-visible:ring-2 group relative",
                isActive ? "font-medium" : ""
              )
            }
            style={({ isActive }) =>
              isActive
                ? {
                    background: "var(--accent-dim)",
                    color: "var(--accent)",
                  }
                : {
                    color: "var(--text-faint)",
                  }
            }
            onMouseEnter={(e) => {
              if (!e.currentTarget.classList.contains("active")) {
                e.currentTarget.style.color = "var(--text-secondary)"
                e.currentTarget.style.background = "var(--bg-surface-1)"
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.getAttribute("aria-current")) {
                e.currentTarget.style.color = "var(--text-faint)"
                e.currentTarget.style.background = ""
              }
            }}
            aria-label={label}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div
                    className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full"
                    style={{ background: "var(--accent)" }}
                  />
                )}
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Separator */}
      <div style={{ height: 1, background: "var(--border-subtle)", margin: "0 12px" }} />

      {/* Bottom section */}
      <div className="p-2.5 pt-2.5 space-y-0.5">
        <p
          className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: "var(--text-faint)" }}
        >
          Música
        </p>
        {/* Spotify */}
        {spotifyConnected ? (
          <>
            <div className="px-1 py-1 mb-0.5">
              <NowPlaying />
            </div>
            <SidebarButton
              icon={<LogOut className="w-3.5 h-3.5 shrink-0" />}
              label="Desconectar Spotify"
              onClick={handleDisconnect}
            />
          </>
        ) : (
          <SidebarButton
            icon={<Music2 className="w-3.5 h-3.5 shrink-0" />}
            label="Conectar Spotify"
            onClick={() => navigate("/settings?tab=spotify")}
          />
        )}

        {/* Local music */}
        <LocalFileInput inputRef={localFileInputRef} />
        <SidebarButton
          icon={<FolderOpen className="w-3.5 h-3.5 shrink-0" />}
          label={localTracks.length > 0 ? `Música local (${localTracks.length})` : "Música local"}
          onClick={() => localFileInputRef.current?.click()}
          active={localVisible}
        />

        {/* YouTube */}
        <SidebarButton
          icon={<Youtube className="w-3.5 h-3.5 shrink-0" />}
          label="YouTube"
          onClick={() => setYtOpen((o) => !o)}
          active={ytVisible}
        />
        {ytOpen && (
          <div className="px-2 pb-1">
            <div className="flex gap-1">
              <input
                type="text"
                value={ytInput}
                onChange={(e) => setYtInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const id = extractVideoId(ytInput)
                    if (id) { setVideo(id); setYtInput(""); setYtOpen(false) }
                  }
                }}
                placeholder="URL ou ID do vídeo…"
                className="flex-1 rounded-lg px-2 py-1.5 text-[11px] outline-none"
                style={{
                  background: "var(--input-bg)",
                  border: "1px solid var(--input-border)",
                  color: "var(--text-primary)",
                }}
              />
              <button
                onClick={() => {
                  const id = extractVideoId(ytInput)
                  if (id) { setVideo(id); setYtInput(""); setYtOpen(false) }
                }}
                aria-label="Reproduzir vídeo"
                className="px-2.5 rounded-lg flex items-center justify-center transition-opacity hover:opacity-80"
                style={{ background: "rgba(255,0,0,0.15)", color: "#ff6666" }}
              >
                <Play className="w-3 h-3 fill-current" />
              </button>
            </div>
          </div>
        )}

        {/* Settings */}
        <SidebarButton
          icon={<Settings className="w-3.5 h-3.5 shrink-0" />}
          label="Configurações"
          onClick={() => navigate("/settings")}
          suffix={
            currentTheme && (
              <div className="flex gap-0.5 ml-auto">
                {currentTheme.preview.slice(0, 2).map((c, i) => (
                  <div key={i} className="w-2 h-2 rounded-full" style={{ background: c }} />
                ))}
              </div>
            )
          }
        />

        {/* About */}
        <SidebarButton
          icon={<Info className="w-3.5 h-3.5 shrink-0" />}
          label="Sobre o Flowspace"
          onClick={() => navigate("/about")}
        />
      </div>
    </aside>
  )
}

function SidebarButton({
  icon,
  label,
  onClick,
  active,
  suffix,
}: {
  icon: React.ReactNode
  label: string
  onClick?: () => void
  active?: boolean
  suffix?: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] w-full transition-colors"
      style={{ color: active ? "var(--accent)" : "var(--text-faint)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--bg-surface-1)"
        e.currentTarget.style.color = active ? "var(--accent)" : "var(--text-secondary)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = ""
        e.currentTarget.style.color = active ? "var(--accent)" : "var(--text-faint)"
      }}
    >
      {icon}
      <span className="flex-1 text-left truncate">{label}</span>
      {suffix}
    </button>
  )
}
