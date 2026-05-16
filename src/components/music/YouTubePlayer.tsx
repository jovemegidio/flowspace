import { useState, useCallback } from "react"
import { X, Minus, Youtube, ExternalLink } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useYouTubeStore, extractVideoId } from "@/store/youtube"

export function YouTubePlayer() {
  const { videoId, videoTitle, isVisible, isMinimized, setMinimized, close } = useYouTubeStore()

  if (!isVisible || !videoId) return null

  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`

  return (
    <AnimatePresence>
      <motion.div
        key="yt-player"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed z-50"
        style={{ bottom: 16, right: 16 }}
      >
        <div
          className="rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: "rgba(16,16,20,0.98)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.8)",
            width: isMinimized ? 280 : 340,
          }}
        >
          {/* Header bar */}
          <div
            className="flex items-center gap-2 px-3 py-2.5"
            style={{ borderBottom: isMinimized ? "none" : "1px solid rgba(255,255,255,0.06)" }}
          >
            <Youtube className="w-4 h-4 shrink-0" style={{ color: "#ff0000" }} />
            <span
              className="flex-1 text-[12px] font-medium truncate"
              style={{ color: isMinimized ? "var(--text-secondary, #888)" : "#ddd" }}
            >
              {videoTitle || "YouTube"}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <a
                href={watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded transition-colors"
                style={{ color: "#444" }}
                title="Abrir no YouTube"
                onMouseEnter={(e) => (e.currentTarget.style.color = "#888")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#444")}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setMinimized(!isMinimized)}
                className="p-1 rounded transition-colors"
                style={{ color: "#444" }}
                title={isMinimized ? "Expandir" : "Minimizar"}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#888")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#444")}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={close}
                className="p-1 rounded transition-colors"
                style={{ color: "#444" }}
                title="Fechar"
                onMouseEnter={(e) => (e.currentTarget.style.color = "#888")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#444")}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Iframe */}
          {!isMinimized && (
            <iframe
              src={embedUrl}
              width="340"
              height="191"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              style={{ display: "block", border: "none" }}
              title="YouTube player"
            />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export function YouTubeInput() {
  const [input, setInput] = useState("")
  const [error, setError] = useState(false)
  const { setVideo } = useYouTubeStore()

  const load = useCallback(() => {
    const id = extractVideoId(input)
    if (!id) {
      setError(true)
      setTimeout(() => setError(false), 2000)
      return
    }
    setVideo(id)
    setInput("")
  }, [input, setVideo])

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") load()
  }

  return (
    <div className="flex gap-1.5">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKey}
        placeholder="Cole a URL do YouTube…"
        className="flex-1 rounded-lg px-2.5 py-1.5 text-[12px] outline-none transition-colors"
        style={{
          background: error ? "rgba(239,68,68,0.1)" : "var(--input-bg)",
          border: `1px solid ${error ? "rgba(239,68,68,0.4)" : "var(--input-border)"}`,
          color: "var(--text-primary)",
        }}
      />
      <button
        onClick={load}
        className="px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors shrink-0"
        style={{ background: "rgba(255,0,0,0.15)", color: "#ff6666" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,0,0,0.25)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,0,0,0.15)")}
      >
        Tocar
      </button>
    </div>
  )
}
