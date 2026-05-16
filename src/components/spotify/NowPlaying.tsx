import { useEffect, useRef } from "react"
import { Music2 } from "lucide-react"
import { spotify } from "@/lib/spotify"
import { useSpotifyStore } from "@/store"

export function NowPlaying() {
  const nowPlaying = useSpotifyStore((s) => s.nowPlaying)
  const setNowPlaying = useSpotifyStore((s) => s.setNowPlaying)
  const spotifyConnected = useSpotifyStore((s) => s.spotifyConnected)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!spotifyConnected) return
    async function poll() {
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
        } else {
          setNowPlaying(null)
        }
      } catch { /* offline or not playing */ }
    }
    poll()
    timerRef.current = window.setInterval(poll, 10_000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [spotifyConnected, setNowPlaying])

  if (!nowPlaying) {
    return (
      <div className="flex items-center gap-2 px-2 py-1">
        <Music2 className="w-3.5 h-3.5 text-[#2a2a2a] shrink-0" />
        <span className="text-[12px] text-[#333]">Nada tocando</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1">
      <div className="relative w-8 h-8 shrink-0">
        {nowPlaying.albumArt ? (
          <img
            src={nowPlaying.albumArt}
            alt={nowPlaying.name}
            className={`w-8 h-8 rounded-md object-cover ${nowPlaying.isPlaying ? "animate-spin-slow" : ""}`}
          />
        ) : (
          <div className="w-8 h-8 rounded-md bg-[#1DB954]/10 flex items-center justify-center">
            <Music2 className="w-4 h-4 text-[#1DB954]" />
          </div>
        )}
        {nowPlaying.isPlaying && (
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#1DB954] rounded-full border-2 border-[#0c0c0c]" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-[#d0d0d0] font-medium truncate leading-tight">{nowPlaying.name}</p>
        <p className="text-[11px] text-[#555] truncate leading-tight">{nowPlaying.artist}</p>
      </div>
    </div>
  )
}
