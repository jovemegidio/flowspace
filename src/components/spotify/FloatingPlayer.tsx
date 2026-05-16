import { useCallback, useEffect } from "react"
import { Play, Pause, SkipBack, SkipForward, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { spotify } from "@/lib/spotify"
import { useSpotifyStore } from "@/store"

export function FloatingPlayer() {
  const nowPlaying = useSpotifyStore((s) => s.nowPlaying)
  const setNowPlaying = useSpotifyStore((s) => s.setNowPlaying)

  const refresh = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 600))
    try {
      const data = await spotify.getNowPlaying()
      if (data?.item) {
        setNowPlaying({
          id: data.item.id,
          name: data.item.name,
          artist: data.item.artists.map((a: { name: string }) => a.name).join(", "),
          albumArt: data.item.album.images[0]?.url ?? "",
          uri: data.item.uri,
          durationMs: data.item.duration_ms,
          progressMs: data.progress_ms ?? 0,
          isPlaying: data.is_playing,
        })
      } else if (data === null) {
        setNowPlaying(null)
      }
    } catch {}
  }, [setNowPlaying])

  // Poll every 10s while playing, 30s while paused
  useEffect(() => {
    const interval = nowPlaying?.isPlaying ? 10_000 : 30_000
    const id = setInterval(refresh, interval)
    return () => clearInterval(id)
  }, [nowPlaying?.isPlaying, refresh])

  // Initial fetch on mount
  useEffect(() => {
    refresh()
  }, [])

  const act = useCallback(async (fn: () => Promise<unknown>) => {
    try { await fn() } catch {}
    refresh()
  }, [refresh])

  if (!nowPlaying) return null

  const progress = nowPlaying.durationMs > 0
    ? (nowPlaying.progressMs / nowPlaying.durationMs) * 100
    : 0

  return (
    <AnimatePresence>
      <motion.div
        key="fp"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
      >
        <div
          className="backdrop-blur-xl rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-4"
          style={{
            background: "rgba(16,16,20,0.96)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
            minWidth: 360,
            maxWidth: 480,
          }}
        >
          {nowPlaying.albumArt && (
            <img
              src={nowPlaying.albumArt}
              alt={nowPlaying.name}
              className={`w-11 h-11 rounded-xl object-cover shrink-0 ${nowPlaying.isPlaying ? "animate-spin-slow" : ""}`}
            />
          )}

          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-semibold truncate leading-tight">{nowPlaying.name}</p>
            <p className="text-xs truncate leading-tight mb-2" style={{ color: "#555" }}>{nowPlaying.artist}</p>
            <div
              className="h-1 rounded-full overflow-hidden cursor-pointer"
              style={{ background: "rgba(255,255,255,0.07)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, #1DB954, #1ed760)",
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={() => act(spotify.previous)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: "#555" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={() => act(nowPlaying.isPlaying ? spotify.pause : spotify.play)}
              className="w-8 h-8 flex items-center justify-center bg-white hover:bg-white/90 active:scale-90 text-black rounded-full transition-all mx-0.5"
            >
              {nowPlaying.isPlaying
                ? <Pause className="w-3.5 h-3.5" fill="black" />
                : <Play className="w-3.5 h-3.5" fill="black" />}
            </button>
            <button
              onClick={() => act(spotify.next)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: "#555" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setNowPlaying(null)}
            className="p-1 transition-colors shrink-0"
            style={{ color: "#333" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#666")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#333")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
