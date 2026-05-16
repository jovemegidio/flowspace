import { create } from "zustand"

interface YouTubeStore {
  videoId: string | null
  videoTitle: string
  isVisible: boolean
  isMinimized: boolean

  setVideo: (id: string, title?: string) => void
  setTitle: (title: string) => void
  setVisible: (v: boolean) => void
  setMinimized: (v: boolean) => void
  close: () => void
}

export const useYouTubeStore = create<YouTubeStore>((set) => ({
  videoId: null,
  videoTitle: "",
  isVisible: false,
  isMinimized: false,

  setVideo: (id, title = "") => set({ videoId: id, videoTitle: title, isVisible: true, isMinimized: false }),
  setTitle: (title) => set({ videoTitle: title }),
  setVisible: (v) => set({ isVisible: v }),
  setMinimized: (v) => set({ isMinimized: v }),
  close: () => set({ videoId: null, videoTitle: "", isVisible: false, isMinimized: false }),
}))

export function extractVideoId(input: string): string | null {
  input = input.trim()
  // Already a plain ID (11 chars, alphanumeric + - _)
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input
  // youtube.com/watch?v=...
  const watchMatch = input.match(/[?&]v=([a-zA-Z0-9_-]{11})/)
  if (watchMatch) return watchMatch[1]
  // youtu.be/...
  const shortMatch = input.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
  if (shortMatch) return shortMatch[1]
  // youtube.com/embed/...
  const embedMatch = input.match(/embed\/([a-zA-Z0-9_-]{11})/)
  if (embedMatch) return embedMatch[1]
  return null
}
