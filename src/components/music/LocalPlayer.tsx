import { useEffect, useRef, useCallback } from "react"
import { Play, Pause, SkipBack, SkipForward, X, Music2, FolderOpen, ListMusic } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useLocalPlayerStore } from "@/store/localPlayer"

function fmt(secs: number) {
  if (!isFinite(secs) || secs < 0) return "0:00"
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function LocalPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const store = useLocalPlayerStore()
  const current = store.tracks[store.currentIndex]

  // Load track when index changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !current) return
    audio.src = current.url
    audio.volume = store.volume
    store.setProgress(0)
    store.setDuration(0)
    if (store.isPlaying) {
      audio.play().catch(() => store.setIsPlaying(false))
    }
  }, [store.currentIndex, current?.url])

  // Sync play/pause
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !current) return
    if (store.isPlaying) {
      audio.play().catch(() => store.setIsPlaying(false))
    } else {
      audio.pause()
    }
  }, [store.isPlaying])

  // Sync volume
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = store.volume
  }, [store.volume])

  const onTimeUpdate = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    store.setProgress(audio.currentTime / audio.duration)
  }, [])

  const onLoadedMetadata = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    store.setDuration(audio.duration)
    if (store.isPlaying) audio.play().catch(() => store.setIsPlaying(false))
  }, [store.isPlaying])

  const onEnded = useCallback(() => {
    if (store.tracks.length > 1) store.next()
    else store.setIsPlaying(false)
  }, [store.tracks.length])

  const seek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    audio.currentTime = ratio * audio.duration
    store.setProgress(ratio)
  }, [])

  if (!store.visible) return null

  const progressPct = store.progress * 100
  const elapsed = fmt(store.duration * store.progress)
  const total = fmt(store.duration)

  return (
    <AnimatePresence>
      <motion.div
        key="local-player"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
      >
        <audio
          ref={audioRef}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onEnded={onEnded}
        />

        <div
          className="backdrop-blur-xl rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3"
          style={{
            background: "rgba(16,16,20,0.96)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
            minWidth: 380,
            maxWidth: 500,
          }}
        >
          {/* Icon */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(139,92,246,0.15)" }}
          >
            <Music2 className="w-5 h-5" style={{ color: "#a78bfa" }} />
          </div>

          {/* Track info + progress */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate leading-tight text-white">
              {current?.name ?? "Nenhuma faixa"}
            </p>
            <p className="text-[11px] truncate leading-tight mb-2" style={{ color: "#555" }}>
              {store.currentIndex + 1}/{store.tracks.length} • {elapsed} / {total}
            </p>
            <div
              className="h-1 rounded-full cursor-pointer overflow-hidden"
              style={{ background: "rgba(255,255,255,0.07)" }}
              onClick={seek}
            >
              <div
                className="h-full rounded-full transition-none"
                style={{
                  width: `${progressPct}%`,
                  background: "linear-gradient(90deg, #8b5cf6, #a78bfa)",
                }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={store.prev}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: "#555" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={() => store.setIsPlaying(!store.isPlaying)}
              className="w-8 h-8 flex items-center justify-center bg-white hover:bg-white/90 active:scale-90 text-black rounded-full transition-all mx-0.5"
            >
              {store.isPlaying
                ? <Pause className="w-3.5 h-3.5" fill="black" />
                : <Play className="w-3.5 h-3.5" fill="black" />}
            </button>
            <button
              onClick={store.next}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: "#555" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Volume + actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={store.clear}
              className="p-1 rounded-lg transition-colors"
              style={{ color: "#333" }}
              title="Fechar player"
              onMouseEnter={(e) => (e.currentTarget.style.color = "#666")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#333")}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export function LocalFileInput({ inputRef }: { inputRef: { current: HTMLInputElement | null } }) {
  const addTracks = useLocalPlayerStore((s) => s.addTracks)

  const handleFiles = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const tracks = files
      .filter((f) => f.type.startsWith("audio/") || /\.(mp3|flac|ogg|wav|aac|m4a|opus)$/i.test(f.name))
      .map((f) => ({
        id: crypto.randomUUID(),
        name: f.name.replace(/\.[^.]+$/, ""),
        url: URL.createObjectURL(f),
      }))
    if (tracks.length > 0) addTracks(tracks)
    e.target.value = ""
  }, [addTracks])

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type="file"
      accept="audio/*,.mp3,.flac,.ogg,.wav,.aac,.m4a,.opus"
      multiple
      className="hidden"
      onChange={handleFiles}
    />
  )
}
