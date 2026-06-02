import { useEffect, useState, useCallback } from "react"
import { MemoryRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom"
import { initDb } from "@/lib/db"
import { useSpotifyStore } from "@/store"
import { isConnected } from "@/lib/spotify"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { TitleBar } from "@/components/layout/TitleBar"
import { SpotifySearch } from "@/components/spotify/SpotifySearch"
import { FloatingPlayer } from "@/components/spotify/FloatingPlayer"
import { LocalPlayer } from "@/components/music/LocalPlayer"
import { YouTubePlayer } from "@/components/music/YouTubePlayer"
import { SplashScreen } from "@/components/SplashScreen"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { DashboardPage } from "@/pages/Dashboard"
import { BoardsPage } from "@/pages/Boards"
import { BoardDetailPage } from "@/pages/BoardDetail"
import { NotesPage } from "@/pages/Notes"
import { NoteDetailPage } from "@/pages/NoteDetail"
import { LibraryPage } from "@/pages/Library"
import { SettingsPage } from "@/pages/Settings"
import { AboutPage } from "@/pages/About"

export default function App() {
  const [dbReady, setDbReady] = useState(false)
  const [splashDone, setSplashDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const setSpotifyConnected = useSpotifyStore((s) => s.setSpotifyConnected)

  useEffect(() => {
    initDb()
      .then(() => setDbReady(true))
      .catch((e) => setError(String(e)))
    isConnected().then((ok) => { if (ok) setSpotifyConnected(true) })
  }, [setSpotifyConnected])

  const handleSplashDone = useCallback(() => setSplashDone(true), [])
  const ready = dbReady && splashDone

  if (error) {
    return (
      <ThemeProvider>
        <div
          className="flex items-center justify-center h-full text-sm p-8 text-center font-sans"
          style={{ background: "var(--bg-base, #0a0a0a)", color: "var(--text-primary)" }}
        >
          <div className="max-w-sm">
            <p className="text-base font-semibold mb-2" style={{ color: "#f87171" }}>
              Erro ao inicializar
            </p>
            <p className="text-xs leading-relaxed" style={{ color: "#666" }}>{error}</p>
          </div>
        </div>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      {(!splashDone || !dbReady) && <SplashScreen onDone={handleSplashDone} />}
      {ready && (
        <MemoryRouter initialEntries={["/dashboard"]}>
          <KeyboardShortcuts />
          <div className="flex flex-col h-full" style={{ background: "var(--bg-base)" }}>
            <TitleBar />
            <div className="flex-1 overflow-hidden">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/login" element={<Navigate to="/dashboard" replace />} />
                <Route path="/setup" element={<Navigate to="/settings?tab=spotify" replace />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/boards" element={<BoardsPage />} />
                  <Route path="/boards/:id" element={<BoardDetailPage />} />
                  <Route path="/notes" element={<NotesPage />} />
                  <Route path="/notes/:id" element={<NoteDetailPage />} />
                  <Route path="/library" element={<LibraryPage />} />
                </Route>
              </Routes>
            </div>
            <SpotifyPlayerWrapper />
            <LocalPlayer />
            <YouTubePlayer />
          </div>
        </MemoryRouter>
      )}
    </ThemeProvider>
  )
}

function SpotifyPlayerWrapper() {
  const spotifyConnected = useSpotifyStore((s) => s.spotifyConnected)
  return (
    <>
      {spotifyConnected && <FloatingPlayer />}
      {spotifyConnected && <SpotifySearch />}
    </>
  )
}

function KeyboardShortcuts() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (!e.ctrlKey && !e.metaKey) return
      switch (e.key) {
        case "b": e.preventDefault(); navigate("/boards"); break
        case "l": e.preventDefault(); navigate("/library"); break
        case ",": e.preventDefault(); navigate("/settings"); break
        case "n":
          if (!location.pathname.startsWith("/notes")) { e.preventDefault(); navigate("/notes") }
          break
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [navigate, location.pathname])

  return null
}
