import { useEffect, useState, useRef } from "react"
import { Search, X, Play, Music2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { spotify } from "@/lib/spotify"
import { useSpotifyStore } from "@/store"

interface Track {
  id: string; name: string; uri: string
  artists: { name: string }[]
  album: { name: string; images: { url: string }[] }
  duration_ms: number
}

export function SpotifySearch() {
  const { searchOpen, searchCallback, closeSearch } = useSpotifyStore()
  const [query, setQuery] = useState("")
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchOpen) { setQuery(""); setTracks([]); setTimeout(() => inputRef.current?.focus(), 80) }
  }, [searchOpen])

  useEffect(() => {
    if (!query.trim()) { setTracks([]); return }
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await spotify.search(query)
        setTracks(data?.tracks?.items ?? [])
      } catch {} finally { setLoading(false) }
    }, 380)
    return () => clearTimeout(t)
  }, [query])

  async function select(track: Track) {
    if (searchCallback) {
      searchCallback({ id: track.id, name: track.name, artist: track.artists.map((a) => a.name).join(", "),
        albumArt: track.album.images[0]?.url ?? "", uri: track.uri,
        durationMs: track.duration_ms, progressMs: 0, isPlaying: false })
    } else {
      try { await spotify.playTrack(track.uri) } catch {}
    }
    closeSearch()
  }

  const ms = (n: number) => `${Math.floor(n / 60000)}:${String(Math.floor((n % 60000) / 1000)).padStart(2, "0")}`

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
          style={{ background: "rgba(0,0,0,0.75)" }} onClick={closeSearch}>
          <motion.div initial={{ scale: 0.95, y: -10, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-[#141414] border border-[#252525] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#222]">
              <Search className="w-4 h-4 text-[#555] shrink-0" />
              <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar músicas no Spotify..."
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-[#3a3a3a]" />
              <button onClick={closeSearch} className="p-1 text-[#444] hover:text-[#777] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto">
              {loading && <div className="flex items-center justify-center py-8 text-[#555] text-sm gap-2"><div className="w-3.5 h-3.5 border border-[#555] border-t-transparent rounded-full animate-spin" />Buscando...</div>}
              {!loading && !query && <div className="flex flex-col items-center justify-center py-10 text-[#333] gap-2"><Music2 className="w-8 h-8" /><span className="text-xs">Digite para buscar</span></div>}
              {!loading && query && tracks.length === 0 && <div className="flex flex-col items-center justify-center py-10 text-[#333] gap-2"><Music2 className="w-8 h-8" /><span className="text-xs">Nenhuma música encontrada</span></div>}
              {tracks.map((t) => (
                <button key={t.id} onClick={() => select(t)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#1e1e1e] transition-colors group">
                  <div className="relative w-10 h-10 shrink-0">
                    {t.album.images[0] && <img src={t.album.images[0].url} alt={t.name} className="w-10 h-10 rounded-lg object-cover" />}
                    <div className="absolute inset-0 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Play className="w-4 h-4 text-white" fill="white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm text-white font-medium truncate">{t.name}</p>
                    <p className="text-xs text-[#555] truncate">{t.artists.map((a) => a.name).join(", ")} · {t.album.name}</p>
                  </div>
                  <span className="text-xs text-[#444] shrink-0">{ms(t.duration_ms)}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
